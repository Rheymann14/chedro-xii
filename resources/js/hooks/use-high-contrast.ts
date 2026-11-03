import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'high-contrast';
const listeners = new Set<() => void>();
let enabled = false;

const readStored = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
};

const apply = (value: boolean): void => {
    document.documentElement.classList.toggle('high-contrast', value);
};

export function initializeHighContrast(): void {
    if (typeof window === 'undefined') {
        return;
    }

    enabled = readStored();
    apply(enabled);
}

export function useHighContrast(): {
    readonly isHighContrast: boolean;
    readonly toggleHighContrast: () => void;
} {
    const isHighContrast = useSyncExternalStore(
        (callback) => {
            listeners.add(callback);

            return () => listeners.delete(callback);
        },
        () => enabled,
        () => false,
    );

    const toggleHighContrast = (): void => {
        enabled = !enabled;

        try {
            localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
        } catch {
            // Storage can be unavailable (private mode); the toggle still applies.
        }

        apply(enabled);
        listeners.forEach((listener) => listener());
    };

    return { isHighContrast, toggleHighContrast } as const;
}
