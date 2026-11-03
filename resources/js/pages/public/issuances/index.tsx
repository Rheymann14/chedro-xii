import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/public/empty-state';
import { FilterBar } from '@/components/public/filter-bar';
import { IssuanceList } from '@/components/public/issuance-list';
import { PageHeader } from '@/components/public/page-header';
import { PaginationNav } from '@/components/public/pagination-nav';
import { index } from '@/routes/issuances';
import type { IssuanceItem, IssuanceTypeOption, Paginated } from '@/types';

type Props = {
    issuances: Paginated<IssuanceItem>;
    types: IssuanceTypeOption[];
    years: number[];
    filters: { q: string; type: string; year: string };
};

export default function IssuancesIndex({
    issuances,
    types,
    years,
    filters,
}: Props) {
    const description =
        'Regional memoranda, advisories, and orders issued by CHED Regional Office XII.';

    return (
        <>
            <Head title="Regional Memoranda">
                <meta name="description" content={description} />
            </Head>

            <PageHeader
                title="Regional Memoranda"
                description={description}
                breadcrumbs={[{ title: 'Regional Memoranda', href: index() }]}
            />

            <div className="container-page space-y-6 py-8">
                <FilterBar
                    url={index.url()}
                    search={filters.q}
                    searchPlaceholder="Search by title or reference number…"
                    selects={[
                        {
                            name: 'type',
                            label: 'types',
                            value: filters.type,
                            options: types.map((type) => ({
                                value: type.slug,
                                label: type.name,
                            })),
                        },
                        {
                            name: 'year',
                            label: 'years',
                            value: filters.year,
                            options: years.map((year) => ({
                                value: String(year),
                                label: String(year),
                            })),
                        },
                    ]}
                />

                {issuances.data.length > 0 ? (
                    <div className="rounded-lg border bg-card px-3 shadow-xs sm:px-4">
                        <IssuanceList issuances={issuances.data} />
                    </div>
                ) : (
                    <EmptyState
                        icon={FileText}
                        title="No issuances found"
                        description="Try a different search, type, or year."
                    />
                )}

                <PaginationNav paginator={issuances} />
            </div>
        </>
    );
}
