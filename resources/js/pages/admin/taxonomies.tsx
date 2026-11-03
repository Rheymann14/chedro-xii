import { Form, Head } from '@inertiajs/react';
import { Check, Pencil, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import downloadCategories from '@/routes/admin/download-categories';
import issuanceTypes from '@/routes/admin/issuance-types';

type Item = {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    items_count: number;
};

type Props = {
    title: string;
    description: string;
    resource: 'issuance-types' | 'download-categories';
    items: Item[];
};

/**
 * Shared page for simple name + order lists (issuance types and download
 * categories).
 */
export default function Taxonomies({
    title,
    description,
    resource,
    items,
}: Props) {
    const routes =
        resource === 'issuance-types' ? issuanceTypes : downloadCategories;
    const [editing, setEditing] = useState<number | null>(null);

    return (
        <>
            <Head title={title} />
            <AdminPage
                title={title}
                description={description}
                className="max-w-3xl"
            >
                <Form
                    {...routes.store.form()}
                    resetOnSuccess
                    options={{ preserveScroll: true }}
                    className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs sm:flex-row sm:items-start"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="flex-1 space-y-1">
                                <Input
                                    name="name"
                                    placeholder="Name"
                                    aria-label="Name"
                                    required
                                    maxLength={100}
                                />
                                <InputError
                                    message={errors.name ?? errors.slug}
                                />
                            </div>
                            <Input
                                name="sort_order"
                                type="number"
                                min={0}
                                placeholder="Order"
                                aria-label="Display order"
                                className="sm:w-24"
                            />
                            <Button type="submit" disabled={processing}>
                                <Plus className="size-4" />
                                Add
                            </Button>
                        </>
                    )}
                </Form>

                <ul className="divide-y rounded-xl border bg-card shadow-xs">
                    {items.length === 0 && (
                        <li className="p-6 text-center text-sm text-muted-foreground">
                            Nothing here yet.
                        </li>
                    )}
                    {items.map((item) =>
                        editing === item.id ? (
                            <li key={item.id} className="p-3">
                                <Form
                                    {...routes.update.form(item.id)}
                                    options={{ preserveScroll: true }}
                                    onSuccess={() => setEditing(null)}
                                    className="flex flex-col gap-2 sm:flex-row sm:items-start"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="flex-1 space-y-1">
                                                <Input
                                                    name="name"
                                                    defaultValue={item.name}
                                                    aria-label="Name"
                                                    required
                                                    autoFocus
                                                />
                                                <InputError
                                                    message={
                                                        errors.name ??
                                                        errors.slug
                                                    }
                                                />
                                            </div>
                                            <Input
                                                name="sort_order"
                                                type="number"
                                                min={0}
                                                defaultValue={item.sort_order}
                                                aria-label="Display order"
                                                className="sm:w-24"
                                            />
                                            <div className="flex gap-1">
                                                <Button
                                                    type="submit"
                                                    size="icon"
                                                    disabled={processing}
                                                    aria-label="Save"
                                                >
                                                    <Check className="size-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setEditing(null)
                                                    }
                                                    aria-label="Cancel"
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </li>
                        ) : (
                            <li
                                key={item.id}
                                className="flex items-center gap-3 p-3 pl-4"
                            >
                                <span className="flex-1 font-medium">
                                    {item.name}
                                </span>
                                <Badge variant="secondary">
                                    {item.items_count} items
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditing(item.id)}
                                    aria-label="Edit"
                                >
                                    <Pencil className="size-4" />
                                </Button>
                                <ConfirmDelete
                                    form={routes.destroy.form(item.id)}
                                    title={`Delete “${item.name}”?`}
                                    description={
                                        item.items_count > 0
                                            ? 'This entry still has items and cannot be deleted until they are moved or removed.'
                                            : 'This cannot be undone.'
                                    }
                                />
                            </li>
                        ),
                    )}
                </ul>
            </AdminPage>
        </>
    );
}
