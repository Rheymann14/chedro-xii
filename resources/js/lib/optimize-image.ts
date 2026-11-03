const QUALITY = 0.8;

/**
 * Scale an image down to fit the longest edge and re-encode it as WebP (or
 * JPEG where the browser cannot encode WebP) so uploads stay small. Returns
 * the original file when it cannot be decoded or would not get smaller. The
 * server optimizes every image again, so this step only saves upload time.
 */
export async function optimizeImage(
    file: File,
    longestEdge: number,
): Promise<File> {
    if (!file.type.startsWith('image/')) {
        return file;
    }

    let bitmap: ImageBitmap;

    try {
        bitmap = await createImageBitmap(file);
    } catch {
        return file;
    }

    const scale = Math.min(
        1,
        longestEdge / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext('2d');

    if (!context) {
        bitmap.close();

        return file;
    }

    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let blob = await toBlob(canvas, 'image/webp');

    if (blob?.type !== 'image/webp') {
        // JPEG has no transparency, so PNGs are left for the server to convert.
        blob =
            file.type === 'image/png'
                ? null
                : await toBlob(canvas, 'image/jpeg');
    }

    if (!blob || (scale === 1 && blob.size >= file.size)) {
        return file;
    }

    const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';

    return new File(
        [blob],
        `${file.name.replace(/\.[^.]+$/, '')}.${extension}`,
        { type: blob.type, lastModified: file.lastModified },
    );
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}
