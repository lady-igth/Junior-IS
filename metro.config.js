// Lets the app bundle .tflite model files as assets.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('tflite');

module.exports = config;
