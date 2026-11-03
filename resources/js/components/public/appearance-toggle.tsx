import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const modes: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light mode' },
    { value: 'dark', icon: Moon, label: 'Dark mode' },
    { value: 'system', icon: Monitor, label: 'Use system setting' },
];

/**
 * Compact icon-only light / dark / system switch for the public header,
 * sharing the same stored preference as the appearance settings page.
 */
export function AppearanceToggle({ className }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div
            role="group"
            aria-label="Color theme"
            className={cn(
                'inline-flex items-center gap-0.5 rounded-full border p-0.5',
                className,
            )}
        >
            {modes.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => updateAppearance(value)}
                    aria-pressed={appearance === value}
                    aria-label={label}
                    title={label}
                    className={cn(
                        'grid size-6 place-items-center rounded-full transition-colors',
                        appearance === value
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-primary',
                    )}
                >
                    <Icon className="size-3.5" aria-hidden />
                </button>
            ))}
        </div>
    );
}
