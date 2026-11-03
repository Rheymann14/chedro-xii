import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DraggableSyntheticListeners } from '@dnd-kit/core';
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { createContext, useContext, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SortableHandle = {
    ref: (element: HTMLElement | null) => void;
    attributes: HTMLAttributes<HTMLElement>;
    listeners: DraggableSyntheticListeners;
};

const SortableHandleContext = createContext<SortableHandle | null>(null);

/**
 * A list whose items can be reordered by dragging their handle (or with the
 * keyboard: focus the handle, press Space, use the arrow keys, press Space again).
 */
export function SortableList<T extends { id: number }>({
    items,
    onReorder,
    layout = 'vertical',
    className,
    children,
}: {
    items: T[];
    onReorder: (reordered: T[], moved: { item: T; position: number }) => void;
    layout?: 'vertical' | 'grid';
    className?: string;
    children: ReactNode;
}) {
    const id = useId();
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) {
            return;
        }

        const from = items.findIndex((item) => item.id === active.id);
        const to = items.findIndex((item) => item.id === over.id);

        if (from === -1 || to === -1) {
            return;
        }

        onReorder(arrayMove(items, from, to), {
            item: items[from],
            position: to,
        });
    };

    return (
        <DndContext
            id={id}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map((item) => item.id)}
                strategy={
                    layout === 'grid'
                        ? rectSortingStrategy
                        : verticalListSortingStrategy
                }
            >
                <ul className={className}>{children}</ul>
            </SortableContext>
        </DndContext>
    );
}

export function SortableItem({
    id,
    className,
    children,
}: {
    id: number;
    className?: string;
    children: ReactNode;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn(
                className,
                isDragging &&
                    'relative z-10 bg-card shadow-lg ring-2 ring-primary/40',
            )}
        >
            <SortableHandleContext
                value={{ ref: setActivatorNodeRef, attributes, listeners }}
            >
                {children}
            </SortableHandleContext>
        </li>
    );
}

/**
 * The grip that starts a drag. Must be rendered inside a SortableItem.
 */
export function DragHandle({
    label = 'Drag to reorder',
    className,
}: {
    label?: string;
    className?: string;
}) {
    const handle = useContext(SortableHandleContext);

    if (!handle) {
        return null;
    }

    return (
        <button
            type="button"
            ref={handle.ref}
            {...handle.attributes}
            {...handle.listeners}
            aria-label={label}
            title={label}
            className={cn(
                'grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing',
                className,
            )}
        >
            <GripVertical className="size-4" />
        </button>
    );
}
