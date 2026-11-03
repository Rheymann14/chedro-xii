import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { optimizeImage } from '@/lib/optimize-image';

const PENDING_MESSAGE = 'Please wait while the images are being optimized.';

/**
 * Change handler for an image file input that swaps the chosen files for
 * resized, compressed copies before the form is submitted. The input reports
 * itself invalid while it works, so the browser holds back submission.
 */
export function useOptimizedImageInput(
    longestEdge: number,
    onOptimized?: (files: File[]) => void,
) {
    const [optimizing, setOptimizing] = useState(false);
    const latestSelection = useRef(0);

    const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const selection = ++latestSelection.current;
        const files = Array.from(input.files ?? []);

        if (files.length === 0) {
            input.setCustomValidity('');
            setOptimizing(false);
            onOptimized?.([]);

            return;
        }

        setOptimizing(true);
        input.setCustomValidity(PENDING_MESSAGE);

        const optimized = await Promise.all(
            files.map((file) => optimizeImage(file, longestEdge)),
        );

        if (selection !== latestSelection.current) {
            return;
        }

        const transfer = new DataTransfer();
        optimized.forEach((file) => transfer.items.add(file));
        input.files = transfer.files;
        input.setCustomValidity('');
        setOptimizing(false);
        onOptimized?.(optimized);
    };

    return { optimizing, onChange };
}
