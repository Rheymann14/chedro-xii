import { Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { site } = usePage().props;

    return (
        <div className="dot-spotlight flex min-h-svh flex-col items-center justify-center bg-surface p-6">
            <div className="w-full max-w-sm space-y-6">
                <Link
                    href={home()}
                    className="flex flex-col items-center gap-3 text-center"
                >
                    <img
                        src="/images/ched-seal-sm.webp"
                        alt="Commission on Higher Education seal"
                        width={224}
                        height={224}
                        className="size-14"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                        {site.settings.office_name}
                    </span>
                </Link>

                <div className="rounded-lg border bg-card p-6 sm:p-8">
                    <div className="mb-6 space-y-1 text-center">
                        <h1 className="text-xl font-semibold text-foreground">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
