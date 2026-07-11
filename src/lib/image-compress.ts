import imageCompression from 'browser-image-compression'

export async function compressForUpload(file: File): Promise<File> {
  let compressed = await imageCompression(file, {
    maxSizeMB: 0.08,          // 80KB target
    maxWidthOrHeight: 900,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.72,
  })

  // If still over 150KB, compress again at lower quality
  if (compressed.size > 150 * 1024) {
    compressed = await imageCompression(compressed, {
      maxSizeMB: 0.08,
      maxWidthOrHeight: 900,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: 0.6,
    })
  }

  return compressed
}
