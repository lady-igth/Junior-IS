

export const INPUT_SIZE = 224; // MobileNetV2 input: 224 x 224 x 3

// Acne grading model (concerns.tflite) — Level_0/1/2 relabeled.
export const CONCERN_LABELS = ['clear', 'mild', 'moderate'];


export const SKIN_TYPE_LABELS = ['dry', 'normal', 'oily'];


export const CROP_FRACTION = { concern: 1.0, skinType: 0.6 };


export const SKIN_MODEL_WEIGHT = 0.4;


export const ACNE_PHOTO_WEIGHT = 0.7;


export const scalePixel = (v) => v / 127.5 - 1;
