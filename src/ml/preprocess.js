
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { toByteArray } from 'base64-js';
import { INPUT_SIZE } from './config';
import { centerSquare, rgbaToModelInput } from './postprocess';

export async function imageToTensor(uri) {

  const upright = await manipulateAsync(uri, [], { format: SaveFormat.JPEG, compress: 1 });

  // 2) Crop the center square and shrink it to 224 x 224.
  const resized = await manipulateAsync(
    upright.uri,
    [
      { crop: centerSquare(upright.width, upright.height) },
      { resize: { width: INPUT_SIZE, height: INPUT_SIZE } },
    ],
    { format: SaveFormat.JPEG, compress: 1, base64: true }
  );

  // 3) Unpack the image into raw pixel numbers (red, green, blue, alpha).
  const decoded = jpeg.decode(toByteArray(resized.base64), {
    useTArray: true,
    formatAsRGBA: true,
  });

  return {
    input: rgbaToModelInput(decoded.data, INPUT_SIZE), // numbers for the model
    rgba: decoded.data, // raw pixels, used only by demo mode
  };
}