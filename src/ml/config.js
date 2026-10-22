// Model settings. These MUST match how the models were trained in Colab.

export const INPUT_SIZE = 224; // MobileNetV2 input: 224 x 224 x 3

// Acne grading model (concerns.tflite) — Level_0/1/2 relabeled.
export const CONCERN_LABELS = ['clear', 'mild', 'moderate'];

// Skin type model (skintype.tflite), if/when it is trained.
// Keras image_dataset_from_directory sorts class folders alphabetically,
// so with folders dry/ normal/ oily/ the order is:
export const SKIN_TYPE_LABELS = ['dry', 'normal', 'oily'];

// How much of the center square each model looks at (must match training).
// concern model: whole square. skin type model (v3): middle 60% (cheeks/nose).
export const CROP_FRACTION = { concern: 1.0, skinType: 0.6 };

// Photo + questions: how much to trust the skin type model vs. the user's
// onboarding answer. The model scored low on the test set, so the user's
// answer counts for more (0.4 model / 0.6 user).
export const SKIN_MODEL_WEIGHT = 0.4;

// Photo + quiz for acne level: how much to trust the photo model vs. the
// "How often do you break out?" answer (0.7 photo / 0.3 quiz). The photo
// still decides most of it; the quiz stops one odd photo from swinging it.
export const ACNE_PHOTO_WEIGHT = 0.7;

// Pixel scaling used in training: x / 127.5 - 1  (range -1 … 1)
export const scalePixel = (v) => v / 127.5 - 1;
