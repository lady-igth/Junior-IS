// Runs the trained MobileNetV2 models on-device with react-native-fast-tflite.
// If the native module isn't available (Expo Go), it falls back to a
// clearly-labeled demo estimate so the rest of the app still works.
import { CONCERN_LABELS, SKIN_TYPE_LABELS, CROP_FRACTION, SKIN_MODEL_WEIGHT, ACNE_PHOTO_WEIGHT } from './config';
import { imageToTensor } from './preprocess';
import { toProbabilities, labelResult, castInput, rednessEstimate, combineSkinType, blendWithPrior } from './postprocess';
import { scoreQuiz } from '../logic/quiz';

// Put your exported models in assets/models/.
const MODEL_FILES = {
  concern: require('../../assets/models/concerns.tflite'),
  // Skin type model: OFF. Four experiments (v1-v4) scored near chance on
  // held-out photos (best honest result: 40% vs ~34-43% baseline), so the app
  // uses the user's own answer instead. To turn a future model on, put
  // skintype.tflite in assets/models/ and uncomment the next line.
  // skinType: require('../../assets/models/skintype.tflite'),
};

let tflite = null;
try {
  tflite = require('react-native-fast-tflite');
} catch (e) {
  tflite = null;
}

const cache = {};

async function loadModel(key) {
  if (key in cache) return cache[key];
  cache[key] = null;
  if (!tflite || !MODEL_FILES[key]) return null;
  try {
    cache[key] = await tflite.loadTensorflowModel(MODEL_FILES[key]);
  } catch (e) {
    console.warn(`[classifier] Could not load ${key} model:`, e?.message ?? e);
    cache[key] = null;
  }
  return cache[key];
}

function runModel(model, input) {
  const inType = model.inputs?.[0]?.dataType;
  const outType = model.outputs?.[0]?.dataType;
  const outputs = model.runSync([castInput(input, inType)]);
  return toProbabilities(outputs[0], outType);
}

export function hasSkinTypeModel() {
  return Boolean(MODEL_FILES.skinType);
}

/**
 * Analyze a photo together with the Skin Quiz answers.
 * The photo itself is never stored: only these results are.
 * @param {string} uri      photo from the camera or library
 * @param {object} profile  { selfSkinType, quiz: { questionId: optionKey } }
 */
export async function analyzePhoto(uri, profile = {}) {
  const quiz = scoreQuiz(profile.quiz);
  const { input, rgba } = await imageToTensor(uri, CROP_FRACTION.concern);

  // --- Acne / concern level: photo (70%) + breakout answer (30%) ---
  const concernModel = await loadModel('concern');
  let mode = 'model';
  let photoProbs;
  if (concernModel) {
    photoProbs = runModel(concernModel, input);
  } else {
    mode = 'demo';
    photoProbs = rednessEstimate(rgba);
  }
  const concern = {
    ...labelResult(blendWithPrior(photoProbs, quiz.acnePrior, ACNE_PHOTO_WEIGHT), CONCERN_LABELS),
    photoOnly: labelResult(photoProbs, CONCERN_LABELS), // kept so the app can show "photo said X"
    usedQuiz: Boolean(quiz.acnePrior),
  };

  // --- Skin type: from the quiz (a photo model is used only if one is turned on) ---
  let skinType;
  const typeModel = await loadModel('skinType');
  const selfType = quiz.skinType?.label || profile.selfSkinType;
  if (typeModel) {
    // Skin type model looks at the zoomed-in middle of the photo, like in training
    const zoomed = await imageToTensor(uri, CROP_FRACTION.skinType);
    const modelProbs = runModel(typeModel, zoomed.input);
    skinType = combineSkinType(modelProbs, selfType, SKIN_TYPE_LABELS, SKIN_MODEL_WEIGHT);
  } else if (quiz.skinType) {
    skinType = quiz.skinType;
  } else {
    const label = selfType && selfType !== 'unsure' ? selfType : 'normal';
    skinType = { label, confidence: null, probs: null, source: 'you' };
  }

  return {
    id: String(Date.now()),
    date: new Date().toISOString(),
    mode,
    concern,
    skinType,
  };
}
