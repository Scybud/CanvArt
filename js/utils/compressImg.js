export async function compressImage(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  const MAX_SIZE = 200 * 1024; // 200KB

  let width = img.width;
  let height = img.height;

  const MAX_DIMENSION = 500;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);

    width *= ratio;
    height *= ratio;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.9;

  while (quality >= 0.3) {
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (blob && blob.size <= MAX_SIZE) {
      return blob;
    }

    quality -= 0.1;
  }

  return null;
}
