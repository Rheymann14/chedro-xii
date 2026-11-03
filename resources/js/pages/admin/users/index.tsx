import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import users from '@/routes/admin/users';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'editor';
    role_label: string;
    is_active: boolean;
    is_current: boolean;
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

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: users.index() }],
};
