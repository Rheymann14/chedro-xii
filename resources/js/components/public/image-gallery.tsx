import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PostImage } from '@/types';

/**
 * Lead image with a thumbnail strip; any image opens in a lightbox.
 */
export function ImageGallery({
    images,
    title,
}: {
    images: PostImage[];
    title: string;
}) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    if (images.length === 0) {
        return null;
    }

    const show = (next: number) => {
        setIndex((next + images.length) % images.length);
        setOpen(true);
    };

    const current = images[index];

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => show(0)}
                className="block w-full overflow-hidden rounded-lg border bg-muted"
                aria-label="View image full size"
            >
                <img
                    src={images[0].url}
                    alt={images[0].alt ?? title}
                    width={images[0].width ?? undefined}
                    height={images[0].height ?? undefined}
                    fetchPriority="high"
                    className="max-h-[32rem] w-full object-contain"
                />
            </button>

            {images.length > 1 && (
                <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {images.map((image, imageIndex) => (
                        <li key={image.id}>
                            <button
                                type="button"
                                onClick={() => show(imageIndex)}
                                className="block aspect-square w-full overflow-hidden rounded-md border bg-muted hover:opacity-80"
                                aria-label={`View image ${imageIndex + 1} of ${images.length}`}
                            >
                                <img
                                    src={image.url}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-[calc(100%-1rem)] gap-2 border-0 bg-black/95 p-2 sm:max-w-5xl">
                    <DialogTitle className="sr-only">{title}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Image {index + 1} of {images.length}
                    </DialogDescription>
                    <div className="relative flex items-center justify-center">
                        <img
                            src={current.url}
                            alt={current.alt ?? title}
                            className="max-h-[85vh] w-auto object-contain"
                        />
                        {images.length > 1 && (
                            <>
                                <LightboxButton
                                    label="Previous image"
                                    className="left-2"
                                    onClick={() => show(index - 1)}
                                >
                                    <ChevronLeft className="size-5" />
                                </LightboxButton>
                                <LightboxButton
                                    label="Next image"
                                    className="right-2"
                                    onClick={() => show(index + 1)}
                                >
                                    <ChevronRight className="size-5" />
                                </LightboxButton>
                            </>
                        )}
                    </div>
                    <p className="text-center text-xs text-white/70">
                        {index + 1} / {images.length}
                    </p>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function LightboxButton({
    label,
    className,
    onClick,
    children,
}: {
    label: string;
    className: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={cn(
                'absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30',
                className,
            )}
        >
            {children}
        </button>
    );
}
