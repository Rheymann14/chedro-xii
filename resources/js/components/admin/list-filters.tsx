import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Combobox } from '@/components/combobox';
import { Input } from '@/components/ui/input';

type SelectFilter = {
    name: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
};

/**
 * Compact search and select filters for back-office listings.
 */
export function ListFilters({
    url,
    search,
    selects = [],
}: {
    url: string;
    search?: string;
    selects?: SelectFilter[];
}) {
    const [term, setTerm] = useState(search ?? '');

    const visit = (overrides: Record<string, string>) => {
        const params: Record<string, string> = {
            ...Object.fromEntries(
                selects.map((select) => [select.name, select.value]),
            ),
            ...(search !== undefined ? { q: term.trim() } : {}),
            ...overrides,
        };

        router.get(
            url,
            Object.fromEntries(
                Object.entries(params).filter(([, value]) => value !== ''),
            ),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        visit({});
    };

    return (
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
            {search !== undefined && (
                <div className="relative flex-1 sm:max-w-sm">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        value={term}
                        onChange={(event) => setTerm(event.target.value)}
                        placeholder="Search…"
                        aria-label="Search"
                        className="pl-9"
                    />
                </div>
            )}
            {selects.map((select) => (
                <Combobox
                    key={select.name}
                    value={select.value}
                    onValueChange={(value) => visit({ [select.name]: value })}
                    options={[
                        { value: '', label: `All ${select.label}` },
                        ...select.options,
                    ]}
                    searchPlaceholder={`Search ${select.label.toLowerCase()}…`}
                    aria-label={select.label}
                    className="sm:w-48"
                />
            ))}
        </form>
    );
}
