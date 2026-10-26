
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { toByteArray } from 'base64-js';
import { INPUT_SIZE } from './config';
import { centerSquare, rgbaToModelInput } from './postprocess';

export async function imageToTensor(uri, cropFraction = 1) {
  // 1) An empty edit bakes in the phone's rotation (like ImageOps.exif_transpose)
  //    and tells us the true width/height.
  const upright = await manipulateAsync(uri, [], { format: SaveFormat.JPEG, compress: 1 });

  // 2) Center square crop + resize to 224x224
  const resized = await manipulateAsync(
    upright.uri,
    [
      { crop: centerSquare(upright.width, upright.height, cropFraction) },
      { resize: { width: INPUT_SIZE, height: INPUT_SIZE } },
    ],
    { format: SaveFormat.JPEG, compress: 1, base64: true }
  );

  // 3) Decode JPEG -> raw pixels
  const decoded = jpeg.decode(toByteArray(resized.base64), {
    useTArray: true,
    formatAsRGBA: true,
  });

  return {
    input: rgbaToModelInput(decoded.data, INPUT_SIZE),
    rgba: decoded.data,
  };
}
