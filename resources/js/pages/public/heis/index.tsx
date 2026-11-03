import { Head } from '@inertiajs/react';
import { Building2, FileDown, FileSpreadsheet, MapPin } from 'lucide-react';
import { EmptyState } from '@/components/public/empty-state';
import { FilterBar } from '@/components/public/filter-bar';
import { PageHeader } from '@/components/public/page-header';
import { PaginationNav } from '@/components/public/pagination-nav';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exportMethod, index } from '@/routes/heis';
import type { Paginated } from '@/types';

type Institution = {
    code: string | null;
    name: string;
    type: string | null;
    province: string | null;
    city: string | null;
    address: string | null;
};

type Props = {
    institutions: Paginated<Institution>;
    available: boolean;
    filters: { q: string; type: string; province: string };
    types: string[];
    provinces: string[];
    total: number;
};

export default function HeisIndex({
    institutions,
    available,
    filters,
    types,
    provinces,
    total,
}: Props) {
    const description =
        'Directory of higher education institutions in SOCCSKSARGEN (Region XII).';
    const query = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== ''),
    );

    return (
        <>
            <Head title="Higher Education Institutions">
                <meta name="description" content={description} />
            </Head>

            <PageHeader
                title="Higher Education Institutions"
                description={description}
                breadcrumbs={[
                    { title: 'Higher Education Institutions', href: index() },
                ]}
            >
                {available && total > 0 && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportMethod.url('pdf', { query })}>
                                <FileDown className="size-4" aria-hidden />
                                PDF
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={exportMethod.url('xlsx', { query })}>
                                <FileSpreadsheet
                                    className="size-4"
                                    aria-hidden
                                />
                                Excel
                            </a>
                        </Button>
                    </div>
                )}
            </PageHeader>

            <div className="container-page space-y-6 py-8">
                {!available ? (
                    <Alert>
                        <AlertTitle>
                            Directory temporarily unavailable
                        </AlertTitle>
                        <AlertDescription>
                            We could not load the list of institutions right
                            now. Please try again later.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <>
                        <FilterBar
                            url={index.url()}
                            search={filters.q}
                            searchPlaceholder="Search institution or city…"
                            selects={[
                                {
                                    name: 'province',
                                    label: 'provinces',
                                    value: filters.province,
                                    options: provinces.map((province) => ({
                                        value: province,
                                        label: province,
                                    })),
                                },
                                {
                                    name: 'type',
                                    label: 'types',
                                    value: filters.type,
                                    options: types.map((type) => ({
                                        value: type,
                                        label: type,
                                    })),
                                },
                            ]}
                        />

                        {institutions.data.length > 0 ? (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Showing {institutions.meta.from}–
                                    {institutions.meta.to} of{' '}
                                    {institutions.meta.total} institutions
                                </p>

                                <div className="hidden overflow-hidden rounded-lg border bg-card shadow-xs md:block">
                                    <table className="w-full text-sm">
                                        <thead className="bg-brand text-left text-brand-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">
                                                    Institution
                                                </th>
                                                <th className="px-4 py-3 font-semibold">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 font-semibold">
                                                    City / Municipality
                                                </th>
                                                <th className="px-4 py-3 font-semibold">
                                                    Province
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {institutions.data.map(
                                                (institution) => (
                                                    <tr
                                                        key={`${institution.code}-${institution.name}`}
                                                        className="even:bg-muted/40"
                                                    >
                                                        <td className="px-4 py-3 font-medium">
                                                            {institution.name}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {institution.type ??
                                                                '—'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {institution.city ??
                                                                '—'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {institution.province ??
                                                                '—'}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <ul className="space-y-3 md:hidden">
                                    {institutions.data.map((institution) => (
                                        <li
                                            key={`${institution.code}-${institution.name}`}
                                            className="space-y-2 rounded-lg border bg-card p-4 shadow-xs"
                                        >
                                            <p className="font-semibold">
                                                {institution.name}
                                            </p>
                                            {institution.type && (
                                                <Badge variant="secondary">
                                                    {institution.type}
                                                </Badge>
                                            )}
                                            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                                                <MapPin
                                                    className="mt-0.5 size-4 shrink-0"
                                                    aria-hidden
                                                />
                                                {[
                                                    institution.city,
                                                    institution.province,
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ') || '—'}
                                            </p>
                                        </li>
                                    ))}
                                </ul>

                                <PaginationNav paginator={institutions} />
                            </>
                        ) : (
                            <EmptyState
                                icon={Building2}
                                title="No institutions found"
                                description="Try a different search or filter."
                            />
                        )}
                    </>
                )}
            </div>
        </>
    );
}
