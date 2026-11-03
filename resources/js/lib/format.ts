const dateFormatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

export function formatDate(value: string | null | undefined): string {
    return value ? dateFormatter.format(new Date(value)) : '';
}

export function formatShortDate(value: string | null | undefined): string {
    return value ? shortDateFormatter.format(new Date(value)) : '';
}

export function formatDateTime(value: string | null | undefined): string {
    return value ? dateTimeFormatter.format(new Date(value)) : '';
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${Math.round(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Whether a career posting's closing date has passed.
 */
export function isClosed(closingAt: string | null): boolean {
    return closingAt !== null && new Date(closingAt).getTime() < Date.now();
}
