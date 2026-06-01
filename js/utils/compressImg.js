export async function compressImage(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const MAX_DIMENSION = 2000;

  const ratio = Math.min(
    MAX_DIMENSION / img.width,
    MAX_DIMENSION / img.height,
    1,
  );

  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  const QUALITY_LEVELS = [0.85, 0.8, 0.75, 0.7];

  for (const quality of QUALITY_LEVELS) {
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/webp", quality);
    });

    if (blob) return blob;
  }

  return null;
}
