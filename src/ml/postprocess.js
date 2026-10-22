// Pure helpers (no React Native imports) so they can be unit-tested.
import { INPUT_SIZE, scalePixel } from './config';

export function centerSquare(width, height, fraction = 1) {
  const side = Math.floor(Math.min(width, height) * fraction);
  return {
    originX: Math.floor((width - side) / 2),
    originY: Math.floor((height - side) / 2),
    width: side,
    height: side,
  };
}

// RGBA bytes (from jpeg-js) -> RGB Float32Array scaled to -1..1
export function rgbaToModelInput(rgba, size = INPUT_SIZE) {
  const out = new Float32Array(size * size * 3);
  for (let i = 0, j = 0; i < size * size; i++) {
    out[j++] = scalePixel(rgba[i * 4]);
    out[j++] = scalePixel(rgba[i * 4 + 1]);
    out[j++] = scalePixel(rgba[i * 4 + 2]);
  }
  return out;
}


export function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum);
}

// Model output -> probabilities that sum to 1.
// Handles softmax outputs, raw logits and uint8-quantized outputs.
export function toProbabilities(raw, dataType) {
  let arr = Array.from(raw, Number);
  if (dataType === 'uint8') arr = arr.map((v) => v / 255);
  const sum = arr.reduce((a, b) => a + b, 0);
  const looksLikeProbs = arr.every((v) => v >= 0 && v <= 1) && Math.abs(sum - 1) < 0.05;
  if (looksLikeProbs) return arr.map((v) => v / sum);
  return softmax(arr);
}

export function labelResult(probs, labels) {
  const byLabel = {};
  labels.forEach((l, i) => (byLabel[l] = probs[i] ?? 0));
  let best = 0;
  probs.forEach((p, i) => {
    if (p > probs[best]) best = i;
  });
  return { label: labels[best], confidence: probs[best], probs: byLabel };
}

// Model input -> the dtype the model expects.
export function castInput(floatInput, dataType) {
  if (dataType === 'uint8') {
    const u = new Uint8Array(floatInput.length);
    for (let i = 0; i < floatInput.length; i++) {
      u[i] = Math.max(0, Math.min(255, Math.round((floatInput[i] + 1) * 127.5)));
    }
    return u;
  }
  return floatInput;
}

// Fallback used ONLY when the model can't run (e.g. inside Expo Go).
// A simple redness heuristic so every screen can still be demoed.
// It is clearly labeled "demo mode" in the app — not a real diagnosis.
export function rednessEstimate(rgba) {
  let total = 0;
  let n = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    total += Math.max(0, r - (g + b) / 2) / 255;
    n++;
  }
  const redness = n ? total / n : 0; // ~0.05 calm skin … ~0.3 very red
  const t = Math.max(0, Math.min(1, (redness - 0.08) / 0.2));
  return softmax([3 * (1 - t) - 1, 1.5 - 3 * Math.abs(t - 0.5), 3 * t - 1]);
}

// Photo + quiz for acne level:
//   final = w * photo + (1 - w) * prior      (both lists sum to 1, so final does too)
// With no prior (quiz skipped), the photo result is used as-is.
export function blendWithPrior(photoProbs, prior, photoWeight) {
  if (!prior) return photoProbs;
  return photoProbs.map((p, i) => photoWeight * p + (1 - photoWeight) * prior[i]);
}

// Photo + questions: blend the skin type model's probabilities with the
// user's own answer from onboarding.
//   final = w * model + (1 - w) * answer,  answer = 0.8 on their pick, 0.1 elsewhere
export function combineSkinType(modelProbs, selfType, labels, modelWeight) {
  const model = labelResult(modelProbs, labels);
  if (!selfType || selfType === 'unsure') return { ...model, source: 'model' };
  if (selfType === 'combination') {
    // No "combination" class in the model: keep the user's answer, show the model's view.
    return { label: 'combination', confidence: null, probs: model.probs, source: 'combined' };
  }
  const answer = labels.map((l) => (l === selfType ? 0.8 : 0.2 / (labels.length - 1)));
  const blended = modelProbs.map((p, i) => modelWeight * p + (1 - modelWeight) * answer[i]);
  return { ...labelResult(blended, labels), source: 'combined', modelLabel: model.label };
}
