import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    pointerWithin,
    useDroppable,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type {
    CollisionDetection,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    UniqueIdentifier,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Form, Head, router } from '@inertiajs/react';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { CheckboxField, FormField } from '@/components/admin/form-field';
import { DragHandle, SortableItem } from '@/components/admin/sortable-list';
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

type ChildGroups = Record<number, AdminMenuItem[]>;

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

                <MenuTree
                    key={menu.value}
                    menu={menu}
                    onEdit={(item, parentId) =>
                        setEditing({ item, menu: menu.value, parentId })
                    }
                />
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

/**
 * Drag-and-drop list of a menu's links. Top-level links reorder among
 * themselves; child links can also be dragged under another top-level link.
 */
function MenuTree({
    menu,
    onEdit,
}: {
    menu: Menu;
    onEdit: (item: AdminMenuItem | null, parentId: number | null) => void;
}) {
    const id = useId();
    const canNest = menu.value === 'header';
    const [dragGroups, setDragGroups] = useState<ChildGroups | null>(null);
    const groups = dragGroups ?? childGroupsOf(menu.items);
    const topLevelIds = menu.items.map((item) => item.id);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const isTopLevel = (target: UniqueIdentifier) =>
        typeof target === 'number' && topLevelIds.includes(target);

    const collisionDetection: CollisionDetection = (args) => {
        const draggingTopLevel = isTopLevel(args.active.id);
        const droppableContainers = args.droppableContainers.filter(
            (container) => isTopLevel(container.id) === draggingTopLevel,
        );

        if (!draggingTopLevel) {
            const within = pointerWithin({ ...args, droppableContainers });
            const overLinks = within.filter(
                (collision) => typeof collision.id === 'number',
            );

            if (overLinks.length > 0) {
                return overLinks;
            }

            if (within.length > 0) {
                return within;
            }
        }

        return closestCenter({ ...args, droppableContainers });
    };

    const save = (
        item: AdminMenuItem,
        position: number,
        reorder: (items: AdminMenuItem[]) => AdminMenuItem[],
        parentId?: number,
    ) =>
        router
            .optimistic<{ menus: Menu[] }>((props) => ({
                menus: props.menus.map((candidate) =>
                    candidate.value === menu.value
                        ? { ...candidate, items: reorder(candidate.items) }
                        : candidate,
                ),
            }))
            .post(
                menuItems.move.url(item.id),
                parentId === undefined
                    ? { position }
                    : { position, parent_id: parentId },
                { preserveScroll: true },
            );

    const handleDragStart = ({ active }: DragStartEvent) => {
        if (!isTopLevel(active.id)) {
            setDragGroups(childGroupsOf(menu.items));
        }
    };

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        if (!over || !dragGroups) {
            return;
        }

        const from = parentOf(active.id, dragGroups);
        const to = parentOf(over.id, dragGroups);

        if (from === null || to === null || from === to) {
            return;
        }

        const moving = dragGroups[from].find((child) => child.id === active.id);

        if (!moving) {
            return;
        }

        const target = dragGroups[to];
        const overIndex = target.findIndex((child) => child.id === over.id);
        const insertAt = overIndex === -1 ? target.length : overIndex;

        setDragGroups({
            ...dragGroups,
            [from]: dragGroups[from].filter((child) => child.id !== active.id),
            [to]: [
                ...target.slice(0, insertAt),
                { ...moving, parent_id: to },
                ...target.slice(insertAt),
            ],
        });
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        const finalGroups = dragGroups;
        setDragGroups(null);

        if (!over) {
            return;
        }

        if (isTopLevel(active.id)) {
            const from = topLevelIds.indexOf(Number(active.id));
            const to = topLevelIds.indexOf(Number(over.id));

            if (from === -1 || to === -1 || from === to) {
                return;
            }

            const reordered = arrayMove(menu.items, from, to);
            save(menu.items[from], to, () => reordered);

            return;
        }

        if (!finalGroups) {
            return;
        }

        const parentId = parentOf(active.id, finalGroups);
        const original = menu.items
            .flatMap((item) => item.children ?? [])
            .find((child) => child.id === active.id);

        if (parentId === null || !original) {
            return;
        }

        const siblings = finalGroups[parentId];
        const from = siblings.findIndex((child) => child.id === active.id);
        const overIndex = siblings.findIndex((child) => child.id === over.id);
        const reordered =
            overIndex === -1 || overIndex === from
                ? siblings
                : arrayMove(siblings, from, overIndex);
        const position = reordered.findIndex((child) => child.id === active.id);
        const originalPosition = (
            childGroupsOf(menu.items)[original.parent_id ?? -1] ?? []
        ).findIndex((child) => child.id === original.id);

        if (original.parent_id === parentId && originalPosition === position) {
            return;
        }

        const nextGroups = { ...finalGroups, [parentId]: reordered };

        save(
            original,
            position,
            (items) =>
                items.map((item) => ({
                    ...item,
                    children: nextGroups[item.id] ?? item.children,
                })),
            parentId,
        );
    };

    return (
        <DndContext
            id={id}
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDragGroups(null)}
        >
            <SortableContext
                items={topLevelIds}
                strategy={verticalListSortingStrategy}
            >
                <ul className="space-y-3">
                    {menu.items.map((item) => {
                        const children = groups[item.id] ?? [];

                        return (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                className="rounded-xl border bg-card shadow-xs"
                            >
                                <ChildDropZone
                                    parentId={item.id}
                                    disabled={!canNest}
                                    highlight={dragGroups !== null}
                                >
                                    <MenuRow
                                        item={item}
                                        onEdit={() => onEdit(item, null)}
                                    />
                                    <SortableContext
                                        items={children.map(
                                            (child) => child.id,
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {children.length > 0 && (
                                            <ul className="divide-y border-t bg-muted/30 pl-6">
                                                {children.map((child) => (
                                                    <SortableItem
                                                        key={child.id}
                                                        id={child.id}
                                                    >
                                                        <MenuRow
                                                            item={child}
                                                            onEdit={() =>
                                                                onEdit(
                                                                    child,
                                                                    item.id,
                                                                )
                                                            }
                                                        />
                                                    </SortableItem>
                                                ))}
                                            </ul>
                                        )}
                                    </SortableContext>
                                    {canNest && (
                                        <div className="border-t px-3 py-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    onEdit(null, item.id)
                                                }
                                            >
                                                <Plus className="size-4" />
                                                Add link under “{item.label}”
                                            </Button>
                                        </div>
                                    )}
                                </ChildDropZone>
                            </SortableItem>
                        );
                    })}
                </ul>
            </SortableContext>
        </DndContext>
    );
}

/**
 * Makes a whole top-level card a drop target for child links, so a link can
 * be dropped under a parent that has no children yet.
 */
function ChildDropZone({
    parentId,
    disabled,
    highlight,
    children,
}: {
    parentId: number;
    disabled: boolean;
    highlight: boolean;
    children: ReactNode;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `parent-${parentId}`,
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'rounded-xl transition-colors',
                highlight && isOver && 'bg-primary/5 ring-2 ring-primary/30',
            )}
        >
            {children}
        </div>
    );
}

function childGroupsOf(items: AdminMenuItem[]): ChildGroups {
    return Object.fromEntries(
        items.map((item) => [item.id, item.children ?? []]),
    );
}

/**
 * The top-level link a dragged child or drop target belongs to.
 */
function parentOf(
    target: UniqueIdentifier,
    groups: ChildGroups,
): number | null {
    if (typeof target === 'string') {
        return target.startsWith('parent-')
            ? Number(target.slice('parent-'.length))
            : null;
    }

    const entry = Object.entries(groups).find(([, children]) =>
        children.some((child) => child.id === target),
    );

    return entry ? Number(entry[0]) : null;
}

function MenuRow({
    item,
    onEdit,
}: {
    item: AdminMenuItem;
    onEdit: () => void;
}) {
    return (
        <div className="flex items-center gap-2 p-2">
            <DragHandle label={`Drag to reorder “${item.label}”`} />
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
