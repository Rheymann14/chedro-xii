import { Head, Link } from '@inertiajs/react';
import { Lock, Pencil, Plus } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { ListFilters } from '@/components/admin/list-filters';
import { EmptyState } from '@/components/public/empty-state';
import { PaginationNav } from '@/components/public/pagination-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/lib/format';
import issuances from '@/routes/admin/issuances';
import type { Paginated } from '@/types';

type AdminIssuance = {
    id: number;
    title: string;
    reference_no: string | null;
    issued_on: string;
    type: string;
    is_internal: boolean;
    file_url: string;
    file_name: string;
};

type Props = {
    issuances: Paginated<AdminIssuance>;
    filters: { q: string; type: string };
    types: { id: number; name: string }[];
};

export default function IssuancesIndex({
    issuances: list,
    filters,
    types,
}: Props) {
    return (
        <>
            <Head title="Regional Memoranda" />
            <AdminPage
                title="Regional Memoranda"
                description="Memoranda, advisories, and orders. Internal issuances are visible to signed-in staff only."
                actions={
                    <Button asChild>
                        <Link href={issuances.create()}>
                            <Plus className="size-4" />
                            New issuance
                        </Link>
                    </Button>
                }
            >
                <ListFilters
                    url={issuances.index.url()}
                    search={filters.q}
                    selects={[
                        {
                            name: 'type',
                            label: 'types',
                            value: filters.type,
                            options: types.map((type) => ({
                                value: String(type.id),
                                label: type.name,
                            })),
                        },
                    ]}
                />

                {list.data.length === 0 ? (
                    <EmptyState title="No issuances found" />
                ) : (
                    <div className="overflow-x-auto rounded-xl border bg-card shadow-xs">
                        <table className="w-full min-w-[40rem] text-sm">
                            <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Title
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Issued
                                    </th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {list.data.map((issuance) => (
                                    <tr key={issuance.id}>
                                        <td className="px-4 py-3">
                                            <a
                                                href={issuance.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:text-primary hover:underline"
                                            >
                                                {issuance.title}
                                            </a>
                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                {issuance.reference_no && (
                                                    <span>
                                                        {issuance.reference_no}
                                                    </span>
                                                )}
                                                {issuance.is_internal && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1"
                                                    >
                                                        <Lock className="size-3" />
                                                        Internal
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {issuance.type}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                            {formatShortDate(
                                                issuance.issued_on,
                                            )}
                                        </td>
                                        <td className="px-2 py-3">
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link
                                                        href={issuances.edit(
                                                            issuance.id,
                                                        )}
                                                        aria-label="Edit"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <ConfirmDelete
                                                    form={issuances.destroy.form(
                                                        issuance.id,
                                                    )}
                                                    title={`Delete “${issuance.title}”?`}
                                                    description="The issuance and its file will be permanently deleted."
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <PaginationNav paginator={list} />
            </AdminPage>
        </>
    );
}

IssuancesIndex.layout = {
    breadcrumbs: [{ title: 'Regional Memoranda', href: issuances.index() }],
};
