// Runs the acne-severity model (MobileNetV2) on-device with react-native-fast-tflite.
// Skin type comes from the Skin Quiz: four photo-based skin-type models (v1-v4)
// scored near chance, so the app asks the user instead.
// If the native module isn't available (Expo Go), it falls back to a
// clearly-labeled demo estimate so the rest of the app still works.
import { CONCERN_LABELS, ACNE_PHOTO_WEIGHT } from './config';
import { imageToTensor } from './preprocess';
import { toProbabilities, labelResult, rednessEstimate, blendWithPrior } from './postprocess';
import { scoreQuiz } from '../logic/quiz';

const MODEL_FILE = require('../../assets/models/concerns.tflite');

let tflite = null;
try {
  tflite = require('react-native-fast-tflite');
} catch (e) {
  tflite = null;
}

let model; // undefined = not loaded yet, null = unavailable

async function loadModel() {
  if (model !== undefined) return model;
  model = null;
  if (!tflite) return model;
  try {
    model = await tflite.loadTensorflowModel(MODEL_FILE);
  } catch (e) {
    console.warn('[classifier] Could not load acne model:', e?.message ?? e);
  }
  return model;
}

/**
 * Analyze a photo together with the Skin Quiz answers.
 * The photo itself is never stored: only these results are.
 * @param {string} uri      photo from the camera or library
 * @param {object} profile  { selfSkinType, quiz: { questionId: optionKey } }
 */
export async function analyzePhoto(uri, profile = {}) {
  const quiz = scoreQuiz(profile.quiz);
  const { input, rgba } = await imageToTensor(uri);

  // --- Acne level: photo (70%) + breakout answer (30%) ---
  const acneModel = await loadModel();
  const mode = acneModel ? 'model' : 'demo';
  const photoProbs = acneModel
    ? toProbabilities(acneModel.runSync([input])[0])
    : rednessEstimate(rgba);

  const concern = {
    ...labelResult(blendWithPrior(photoProbs, quiz.acnePrior, ACNE_PHOTO_WEIGHT), CONCERN_LABELS),
    photoOnly: labelResult(photoProbs, CONCERN_LABELS), // so the app can show "photo said X"
    usedQuiz: Boolean(quiz.acnePrior),
  };

  // --- Skin type: from the quiz, or the answer given during setup ---
  let skinType = quiz.skinType;
  if (!skinType) {
    const self = profile.selfSkinType;
    const label = self && self !== 'unsure' ? self : 'normal';
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