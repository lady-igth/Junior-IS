
import { INPUT_SIZE, scalePixel } from './config';

export function centerSquare(width, height) {
  const side = Math.min(width, height); // the square's side = the photo's shorter edge
  return {
    originX: Math.floor((width - side) / 2), // where the square starts, from the left
    originY: Math.floor((height - side) / 2), // where the square starts, from the top
    width: side,
    height: side,
  };
}

export function rgbaToModelInput(rgba, size = INPUT_SIZE) {
  const pixels = size * size; // 224 x 224 = 50,176 pixels
  const out = new Float32Array(pixels * 3); // 3 numbers per pixel
  for (let p = 0; p < pixels; p++) {
    out[p * 3] = scalePixel(rgba[p * 4]); // red
    out[p * 3 + 1] = scalePixel(rgba[p * 4 + 1]); // green
    out[p * 3 + 2] = scalePixel(rgba[p * 4 + 2]); // blue
    // rgba[p * 4 + 3] is alpha (transparency); the model doesn't use it
  }
  return out;
}


export function softmax(scores) {
  const max = Math.max(...scores); // subtracting the max keeps the numbers small (safer math)
  const exps = scores.map((s) => Math.exp(s - max)); // e^score: bigger score -> much bigger number
  const total = exps.reduce((sum, e) => sum + e, 0);
  return exps.map((e) => e / total); // divide by the total so they add up to 1
}


export function toProbabilities(raw) {
  const values = Array.from(raw, Number);
  const total = values.reduce((sum, v) => sum + v, 0);
  const alreadyProbs = values.every((v) => v >= 0 && v <= 1) && Math.abs(total - 1) < 0.05;
  if (alreadyProbs) return values.map((v) => v / total);
  return softmax(values);
}


export function labelResult(probs, labels) {
  const byLabel = {};
  labels.forEach((name, i) => (byLabel[name] = probs[i] ?? 0));
  let best = 0; // position of the highest probability so far
  probs.forEach((p, i) => {
    if (p > probs[best]) best = i;
  });
  return { label: labels[best], confidence: probs[best], probs: byLabel };
}


export function rednessEstimate(rgba) {
  let total = 0;
  let count = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    total += Math.max(0, r - (g + b) / 2) / 255; // how much redder than green/blue
    count++;
  }
  const redness = count ? total / count : 0; // about 0.05 = calm skin ... 0.3 = very red
  const t = Math.max(0, Math.min(1, (redness - 0.08) / 0.2)); // squeeze into 0..1
  return softmax([3 * (1 - t) - 1, 1.5 - 3 * Math.abs(t - 0.5), 3 * t - 1]); // clear, mild, moderate
}

export function blendWithPrior(photoProbs, prior, photoWeight) {
  if (!prior) return photoProbs;
  return photoProbs.map((p, i) => photoWeight * p + (1 - photoWeight) * prior[i]);
}