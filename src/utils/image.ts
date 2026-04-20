const MAX_DIM = 960;

export async function resizeImageFile(file: File | Blob): Promise<Blob> {
  if (typeof window === 'undefined') return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error('Failed to encode image'));
        else resolve(blob);
      },
      'image/jpeg',
      0.82,
    );
  });
}

const urlCache = new WeakMap<Blob, string>();
export function blobUrl(blob?: Blob): string | undefined {
  if (!blob) return undefined;
  const cached = urlCache.get(blob);
  if (cached) return cached;
  const url = URL.createObjectURL(blob);
  urlCache.set(blob, url);
  return url;
}
