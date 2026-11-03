import { Form, Head, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { CheckboxField, FormField } from '@/components/admin/form-field';
import { Combobox } from '@/components/combobox';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import menuItems from '@/routes/admin/menu-items';

type AdminMenuItem = {
    id: number;
    menu: string;
    parent_id: number | null;
    label: string;
    url: string;
    description: string | null;
    opens_in_new_tab: boolean;
    children?: AdminMenuItem[];
};

type Menu = {
    value: string;
    label: string;
    items: AdminMenuItem[];
};

type Editing = {
    item: AdminMenuItem | null;
    menu: string;
    parentId: number | null;
};

export default function MenusIndex({ menus }: { menus: Menu[] }) {
    const [active, setActive] = useState(menus[0]?.value ?? 'header');
    const [editing, setEditing] = useState<Editing | null>(null);
    const menu =
        menus.find((candidate) => candidate.value === active) ?? menus[0];

    const move = (item: AdminMenuItem, direction: 'up' | 'down') =>
        router.post(
            menuItems.move.url(item.id),
            { direction },
            { preserveScroll: true },
        );

    return (
        <>
            <Head title="Menus" />
            <AdminPage
                title="Menus"
                description="Links in the main navigation, quick links, and footer. Children of About, Online Services, HEMIS, and Resources also appear as cards on those landing pages."
                actions={
                    <Button
                        onClick={() =>
                            setEditing({
                                item: null,
                                menu: menu.value,
                                parentId: null,
                            })
                        }
                    >
                        <Plus className="size-4" />
                        Add link
                    </Button>
                }
            >
                <div
                    role="tablist"
                    className="flex flex-wrap gap-1 rounded-lg bg-muted p-1"
                >
                    {menus.map((candidate) => (
                        <button
                            key={candidate.value}
                            type="button"
                            role="tab"
                            aria-selected={candidate.value === active}
                            onClick={() => setActive(candidate.value)}
                            className={cn(
                                'rounded-md px-3 py-1.5 text-sm font-medium',
                                candidate.value === active
                                    ? 'bg-background shadow-xs'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {candidate.label}
                        </button>
                    ))}
                </div>

                <ul className="space-y-3">
                    {menu.items.map((item, index) => (
                        <li
                            key={item.id}
                            className="rounded-xl border bg-card shadow-xs"
                        >
                            <MenuRow
                                item={item}
                                isFirst={index === 0}
                                isLast={index === menu.items.length - 1}
                                onMove={move}
                                onEdit={() =>
                                    setEditing({
                                        item,
                                        menu: menu.value,
                                        parentId: null,
                                    })
                                }
                            />
                            {(item.children ?? []).length > 0 && (
                                <ul className="divide-y border-t bg-muted/30 pl-6">
                                    {(item.children ?? []).map(
                                        (child, childIndex, children) => (
                                            <li key={child.id}>
                                                <MenuRow
                                                    item={child}
                                                    isFirst={childIndex === 0}
                                                    isLast={
                                                        childIndex ===
                                                        children.length - 1
                                                    }
                                                    onMove={move}
                                                    onEdit={() =>
                                                        setEditing({
                                                            item: child,
                                                            menu: menu.value,
                                                            parentId: item.id,
                                                        })
                                                    }
                                                />
                                            </li>
                                        ),
                                    )}
                                </ul>
                            )}
                            {menu.value === 'header' && (
                                <div className="border-t px-3 py-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setEditing({
                                                item: null,
                                                menu: menu.value,
                                                parentId: item.id,
                                            })
                                        }
                                    >
                                        <Plus className="size-4" />
                                        Add link under “{item.label}”
                                    </Button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </AdminPage>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent className="sm:max-w-lg">
                    {editing && (
                        <MenuItemForm
                            editing={editing}
                            parents={
                                menus.find(
                                    (candidate) =>
                                        candidate.value === editing.menu,
                                )?.items ?? []
                            }
                            onDone={() => setEditing(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

function MenuRow({
    item,
    isFirst,
    isLast,
    onMove,
    onEdit,
}: {
    item: AdminMenuItem;
    isFirst: boolean;
    isLast: boolean;
    onMove: (item: AdminMenuItem, direction: 'up' | 'down') => void;
    onEdit: () => void;
}) {
    return (
        <div className="flex items-center gap-2 p-2 pl-4">
            <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                    {item.label}
                    {item.opens_in_new_tab && (
                        <ExternalLink
                            className="size-3.5 text-muted-foreground"
                            aria-label="Opens in new tab"
                        />
                    )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                    {item.url}
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                disabled={isFirst}
                onClick={() => onMove(item, 'up')}
                aria-label="Move up"
            >
                <ArrowUp className="size-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                disabled={isLast}
                onClick={() => onMove(item, 'down')}
                aria-label="Move down"
            >
                <ArrowDown className="size-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                aria-label="Edit"
            >
                <Pencil className="size-4" />
            </Button>
            <ConfirmDelete
                form={menuItems.destroy.form(item.id)}
                title={`Delete “${item.label}”?`}
                description={
                    (item.children ?? []).length > 0
                        ? 'Its child links will be deleted too.'
                        : 'This cannot be undone.'
                }
            />
        </div>
    );
}

function MenuItemForm({
    editing,
    parents,
    onDone,
}: {
    editing: Editing;
    parents: AdminMenuItem[];
    onDone: () => void;
}) {
    const { item, menu, parentId } = editing;
    const canNest = menu === 'header' && !(item?.children ?? []).length;

    return (
        <Form
            {...(item
                ? menuItems.update.form(item.id)
                : menuItems.store.form())}
            options={{ preserveScroll: true }}
            onSuccess={onDone}
            className="space-y-4"
        >
            {({ errors, processing }) => (
                <>
                    <DialogTitle>{item ? 'Edit link' : 'Add link'}</DialogTitle>
                    <DialogDescription>
                        Use a site path like /announcements or a full https://
                        address.
                    </DialogDescription>

                    <input type="hidden" name="menu" value={menu} />

                    {canNest ? (
                        <FormField
                            label="Parent"
                            htmlFor="parent_id"
                            error={errors.parent_id}
                        >
                            <Combobox
                                id="parent_id"
                                name="parent_id"
                                defaultValue={parentId}
                                options={[
                                    { value: '', label: '— Top level —' },
                                    ...parents
                                        .filter(
                                            (parent) => parent.id !== item?.id,
                                        )
                                        .map((parent) => ({
                                            value: String(parent.id),
                                            label: parent.label,
                                        })),
                                ]}
                                searchPlaceholder="Search links…"
                            />
                        </FormField>
                    ) : (
                        <input
                            type="hidden"
                            name="parent_id"
                            value={parentId ?? ''}
                        />
                    )}

                    <FormField
                        label="Label"
                        htmlFor="label"
                        error={errors.label}
                        required
                    >
                        <Input
                            id="label"
                            name="label"
                            defaultValue={item?.label}
                            required
                            maxLength={100}
                            autoFocus
                        />
                    </FormField>
                    <FormField
                        label="Link"
                        htmlFor="url"
                        error={errors.url}
                        required
                    >
                        <Input
                            id="url"
                            name="url"
                            defaultValue={item?.url}
                            required
                            maxLength={255}
                            placeholder="/pages/mandate"
                        />
                    </FormField>
                    <FormField
                        label="Description"
                        htmlFor="description"
                        error={errors.description}
                        hint="Shown on landing-page cards."
                    >
                        <Textarea
                            id="description"
                            name="description"
                            rows={2}
                            maxLength={300}
                            defaultValue={item?.description ?? ''}
                        />
                    </FormField>
                    <CheckboxField
                        name="opens_in_new_tab"
                        label="Open in a new tab"
                        defaultChecked={item?.opens_in_new_tab ?? false}
                    />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onDone}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {item ? 'Save' : 'Add link'}
                        </Button>
                    </DialogFooter>
                </>
            )}
        </Form>
    );
}

MenusIndex.layout = {
    breadcrumbs: [{ title: 'Menus', href: menuItems.index() }],
};
