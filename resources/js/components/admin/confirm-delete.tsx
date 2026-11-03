import { Form } from '@inertiajs/react';
import type { RouteFormDefinition } from '@/wayfinder';
import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Delete button that asks for confirmation before submitting.
 */
export function ConfirmDelete({
    form,
    title,
    description = 'This cannot be undone.',
    trigger,
}: {
    form: RouteFormDefinition<'post'>;
    title: string;
    description?: string;
    trigger?: ReactNode;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="ghost" size="icon" aria-label="Delete">
                        <Trash2 className="size-4 text-destructive" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
                <Form {...form} options={{ preserveScroll: true }}>
                    {({ processing }) => (
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
