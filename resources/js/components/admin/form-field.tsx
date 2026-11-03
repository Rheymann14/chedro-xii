import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function FormField({
    label,
    htmlFor,
    error,
    hint,
    required = false,
    className,
    children,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: ReactNode;
    required?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn('grid gap-2', className)}>
            <Label htmlFor={htmlFor}>
                {label}
                {required && (
                    <span className="text-destructive" aria-hidden>
                        *
                    </span>
                )}
            </Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <InputError message={error} />
        </div>
    );
}

/**
 * Native checkbox that always submits a value: "0" when unchecked and "1"
 * when checked, so boolean validation works with plain form submissions.
 */
export function CheckboxField({
    name,
    label,
    description,
    defaultChecked = false,
}: {
    name: string;
    label: string;
    description?: string;
    defaultChecked?: boolean;
}) {
    return (
        <label className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-accent/50">
            <input type="hidden" name={name} value="0" />
            <input
                type="checkbox"
                name={name}
                value="1"
                defaultChecked={defaultChecked}
                className="mt-0.5 size-4 accent-primary"
            />
            <span className="grid gap-0.5">
                <span className="text-sm font-medium">{label}</span>
                {description && (
                    <span className="text-xs text-muted-foreground">
                        {description}
                    </span>
                )}
            </span>
        </label>
    );
}
