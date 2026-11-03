import { router } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Combobox } from '@/components/combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type FilterSelect = {
    name: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
};

/**
 * Search box plus optional select filters that update the query string of
 * the current page while preserving scroll and state.
 */
export function FilterBar({
    url,
    search,
    searchPlaceholder = 'Search…',
    selects = [],
}: {
    url: string;
    search: string;
    searchPlaceholder?: string;
    selects?: FilterSelect[];
}) {
    const [term, setTerm] = useState(search);

    const current = (): Record<string, string> =>
        Object.fromEntries(
            selects
                .filter((select) => select.value !== '')
                .map((select) => [select.name, select.value]),
        );

    const visit = (params: Record<string, string>) => {
        const query = Object.fromEntries(
            Object.entries(params).filter(([, value]) => value !== ''),
        );

        router.get(url, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        visit({ ...current(), q: term.trim() });
    };

    const hasFilters =
        search !== '' || selects.some((select) => select.value !== '');

    return (
        <form
            onSubmit={submit}
            role="search"
            className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs sm:flex-row sm:flex-wrap sm:items-center"
        >
            <div className="relative min-w-0 flex-1 sm:min-w-64">
                <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                />
                <Input
                    type="search"
                    value={term}
                    onChange={(event) => setTerm(event.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="pl-9"
                />
            </div>

            {selects.map((select) => (
                <Combobox
                    key={select.name}
                    value={select.value}
                    onValueChange={(value) =>
                        visit({
                            ...current(),
                            q: term.trim(),
                            [select.name]: value,
                        })
                    }
                    options={[
                        { value: '', label: `All ${select.label}` },
                        ...select.options,
                    ]}
                    searchPlaceholder={`Search ${select.label.toLowerCase()}…`}
                    aria-label={select.label}
                    className="sm:w-48"
                />
            ))}

            <div className="flex gap-2">
                <Button type="submit" className="flex-1 sm:flex-none">
                    Search
                </Button>
                {hasFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setTerm('');
                            visit({});
                        }}
                    >
                        <X className="size-4" aria-hidden />
                        Clear
                    </Button>
                )}
            </div>
        </form>
    );
}
