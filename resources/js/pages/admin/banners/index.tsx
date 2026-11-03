import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { EmptyState } from '@/components/public/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatShortDate } from '@/lib/format';
import banners from '@/routes/admin/banners';

type AdminBanner = {
    id: number;
    title: string;
    image_url: string | null;
    link_url: string | null;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    sort_order: number;
};

export default function BannersIndex({
    banners: list,
}: {
    banners: AdminBanner[];
}) {
    return (
        <>
            <Head title="Home banners" />
            <AdminPage
                title="Home banners"
                description="Slides shown in the home page carousel. Use 2048 × 800 pixel artwork for best results."
                actions={
                    <Button asChild>
                        <Link href={banners.create()}>
                            <Plus className="size-4" />
                            Add banner
                        </Link>
                    </Button>
                }
            >
                {list.length === 0 ? (
                    <EmptyState
                        title="No banners yet"
                        description="Without banners, the home page shows a standard welcome section."
                    />
                ) : (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {list.map((banner) => (
                            <li
                                key={banner.id}
                                className="overflow-hidden rounded-xl border bg-card shadow-xs"
                            >
                                {banner.image_url && (
                                    <img
                                        src={banner.image_url}
                                        alt=""
                                        loading="lazy"
                                        className="aspect-[2.56/1] w-full bg-muted object-cover"
                                    />
                                )}
                                <div className="flex items-start gap-2 p-3">
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="truncate font-medium">
                                            {banner.title}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                            <Badge
                                                variant={
                                                    banner.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {banner.is_active
                                                    ? 'Active'
                                                    : 'Hidden'}
                                            </Badge>
                                            <span>
                                                Order {banner.sort_order}
                                            </span>
                                            {(banner.starts_at ||
                                                banner.ends_at) && (
                                                <span>
                                                    {formatShortDate(
                                                        banner.starts_at,
                                                    ) || '…'}{' '}
                                                    –{' '}
                                                    {formatShortDate(
                                                        banner.ends_at,
                                                    ) || '…'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link
                                            href={banners.edit(banner.id)}
                                            aria-label="Edit"
                                        >
                                            <Pencil className="size-4" />
                                        </Link>
                                    </Button>
                                    <ConfirmDelete
                                        form={banners.destroy.form(banner.id)}
                                        title={`Delete “${banner.title}”?`}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </AdminPage>
        </>
    );
}

BannersIndex.layout = {
    breadcrumbs: [{ title: 'Home banners', href: banners.index() }],
};
