# The Skincare Guide: An AI-Powered Skincare Recommendation App

Junior IS · Lady Paris Asante · The College of Wooster

A React Native (Expo) mobile app. The user takes a short **Skin Quiz** and a photo of their skin. A fine-tuned **MobileNetV2** model classifies the acne level (clear / mild / moderate) on the phone, and a **content-based matching algorithm** recommends products from a local database and builds an AM/PM routine.

Photos are analyzed on the device and never saved or uploaded.

## How to run

```
npm install
npx expo start --go
```
Scan the QR code with the iPhone Camera to open the app in Expo Go. Expo Go can't load TensorFlow Lite, so the scan shows a labeled **demo mode** estimate. To run the real model, make a development build with `npx expo run:ios --device` (needs Xcode).

## How it works

1. **Skin Quiz.** 6 questions are scored into a skin type, sensitivity and a breakout estimate (`src/logic/quiz.js`).
2. **Photo.** The photo is taken or chosen in `src/screens/ScanScreen.js`.
3. **Preprocessing.** The photo is made upright, center-cropped, resized to 224×224 and scaled to −1…1, the same as in training (`src/ml/preprocess.js`).
4. **Model.** `assets/models/concerns.tflite` runs on the device (`src/ml/classifier.js`).
5. **Photo + quiz.** Final acne level = 70% photo + 30% quiz (`blendWithPrior` in `src/ml/postprocess.js`).
6. **Matching.** Each product is scored on skin type, acne level, ingredients and sensitivity, then ranked with reasons (`src/logic/matching.js`).
7. **Storage.** Results, routine and settings are saved on the phone with AsyncStorage (`src/state/AppContext.js`).

## Project structure

```
App.js                      Bottom-tab navigation
src/screens/                Onboarding, Scan, Profile, Products, Routine screens
src/ml/                     Preprocessing, model loading, probabilities, settings
src/logic/quiz.js           Skin Quiz questions and scoring
src/logic/matching.js       Product recommendation algorithm
src/data/products.js        Product database (25 products, 6 categories)
src/state/AppContext.js     App state, saved on the device
src/notifications.js        Daily AM/PM routine reminders
src/components/UI.js        Shared buttons, cards, confidence bars
assets/models/              Trained TFLite model
```

## Skin type: why the app uses a quiz

I trained four photo models for skin type (dry / normal / oily). After I removed duplicate photos that were in both the training and test sets, every version scored close to the majority-class baseline (best: 40% test accuracy against a 34–43% baseline). So the photo model is off, and the app uses the Skin Quiz for skin type.

## Feature calendar

### Done
| Feature | Issue |
|---|---|
| Skin Scan, Profile, and Products screens | [#1](https://github.com/lady-igth/Junior-IS/issues/1) |
| Onboarding screen | [#2](https://github.com/lady-igth/Junior-IS/issues/2) |
| Skin Scan screen | [#3](https://github.com/lady-igth/Junior-IS/issues/3) |
| Buttons (take photo / choose / analyze) | [#4](https://github.com/lady-igth/Junior-IS/issues/4) |
| Select a photo from the library | [#5](https://github.com/lady-igth/Junior-IS/issues/5) |
| Photo capture | [#6](https://github.com/lady-igth/Junior-IS/issues/6) |
| Pre-trained image classification model (MobileNetV2) | [#7](https://github.com/lady-igth/Junior-IS/issues/7) |
| Fine-tuned acne classifier | [#8](https://github.com/lady-igth/Junior-IS/issues/8) |
| Skin Quiz, product matching, routine, reminders, progress history | — |

### Remaining
| Task | Target |
|---|---|
| Native build so the real model runs on the iPhone | Oct 29 |
| Test the Skin Quiz accuracy against labelled skin types | Nov 12 |
| Fairness test: acne model accuracy across skin tones | Nov 19 |
| Skin type photo model v5 with more diverse data | Dec 3 |
| Progress photo comparison over time | Dec 10 |

See all tasks on the [Issues page](https://github.com/lady-igth/Junior-IS/issues).

*General skincare information, not medical advice.*
