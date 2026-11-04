import { Form, Head, Link } from '@inertiajs/react';
import { Check, Copy, KeyRound, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { useClipboard } from '@/hooks/use-clipboard';
import { formatDate, formatDateTime } from '@/lib/format';
import users from '@/routes/admin/users';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'editor';
    role_label: string;
    is_active: boolean;
    is_current: boolean;
    has_temporary_password: boolean;
    password_changed_at: string | null;
    created_at: string | null;
};

export default function UsersIndex({ users: list }: { users: AdminUser[] }) {
    return (
        <>
            <Head title="Users" />
            <AdminPage
                title="Users"
                description="Administrators manage everything. Editors manage posts, memoranda, downloads, banners, and pages."
                actions={
                    <Button asChild>
                        <Link href={users.create()}>
                            <Plus className="size-4" />
                            New user
                        </Link>
                    </Button>
                }
            >
                <ul className="divide-y rounded-xl border bg-card shadow-xs">
                    {list.map((user) => (
                        <li
                            key={user.id}
                            className="flex items-center gap-3 p-3 sm:p-4"
                        >
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="font-medium">
                                    {user.name}
                                    {user.is_current && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            (you)
                                        </span>
                                    )}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="truncate">
                                        {user.email}
                                    </span>
                                    <Badge
                                        variant={
                                            user.role === 'admin'
                                                ? 'default'
                                                : 'outline'
                                        }
                                    >
                                        {user.role_label}
                                    </Badge>
                                    {!user.is_active && (
                                        <Badge variant="secondary">
                                            Deactivated
                                        </Badge>
                                    )}
                                    {user.has_temporary_password ? (
                                        <Badge
                                            className="border-transparent bg-amber-500 text-white"
                                            title="They are still using the password an administrator set."
                                        >
                                            Temporary password
                                        </Badge>
                                    ) : (
                                        user.password_changed_at && (
                                            <span
                                                title={formatDateTime(
                                                    user.password_changed_at,
                                                )}
                                            >
                                                Password updated{' '}
                                                {formatDate(
                                                    user.password_changed_at,
                                                )}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                                <Link
                                    href={users.edit(user.id)}
                                    aria-label="Edit"
                                >
                                    <Pencil className="size-4" />
                                </Link>
                            </Button>
                            {!user.is_current && <ResetPassword user={user} />}
                            {!user.is_current && (
                                <ConfirmDelete
                                    form={users.destroy.form(user.id)}
                                    title={`Delete ${user.name}?`}
                                    description="Their posts and files stay on the site. Consider deactivating the account instead."
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </AdminPage>
        </>
    );
}

/**
 * Confirms, then shows the newly generated password once so it can be handed to the user.
 */
function ResetPassword({ user }: { user: AdminUser }) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState<string | null>(null);
    const [copiedText, copy] = useClipboard();

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);

        if (!isOpen) {
            setPassword(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Reset password"
                    title="Reset password"
                >
                    <KeyRound className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                {password ? (
                    <>
                        <DialogTitle>New password for {user.name}</DialogTitle>
                        <DialogDescription>
                            Copy it now and send it to {user.email}. It will not
                            be shown again. They have been signed out of every
                            device.
                        </DialogDescription>
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={password}
                                className="font-mono"
                                onFocus={(event) => event.target.select()}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void copy(password)}
                            >
                                {copiedText === password ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-4" />
                                )}
                                {copiedText === password ? 'Copied' : 'Copy'}
                            </Button>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button">Done</Button>
                            </DialogClose>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        <DialogTitle>
                            Reset password for {user.name}?
                        </DialogTitle>
                        <DialogDescription>
                            Their current password stops working right away and
                            they will be signed out of every device. A new
                            random password will be generated for you to send
                            them.
                        </DialogDescription>
                        <Form
                            {...users.resetPassword.form(user.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={(page) => {
                                const generated = page.flash
                                    ?.generated_password as string | undefined;

                                if (generated) {
                                    setPassword(generated);
                                } else {
                                    setOpen(false);
                                }
                            }}
                        >
                            {({ processing }) => (
                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                        >
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={processing}>
                                        Reset password
                                    </Button>
                                </DialogFooter>
                            )}
                        </Form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: users.index() }],
};
