import { Form, Head } from '@inertiajs/react';
import { AdminPage } from '@/components/admin/admin-page';
import { FormActions } from '@/components/admin/form-actions';
import { CheckboxField, FormField } from '@/components/admin/form-field';
import { Combobox } from '@/components/combobox';
import PasswordInput from '@/components/password-input';
import { Input } from '@/components/ui/input';
import users from '@/routes/admin/users';

type Props = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        is_active: boolean;
    } | null;
    roles: { value: string; label: string }[];
};

export default function UserForm({ user, roles }: Props) {
    const title = user ? 'Edit user' : 'New user';

    return (
        <>
            <Head title={title} />
            <AdminPage title={title}>
                <Form
                    {...(user
                        ? users.update.form(user.id)
                        : users.store.form())}
                    resetOnError={['password', 'password_confirmation']}
                    className="max-w-xl space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormField
                                label="Name"
                                htmlFor="name"
                                error={errors.name}
                                required
                            >
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user?.name}
                                    required
                                    autoComplete="off"
                                />
                            </FormField>
                            <FormField
                                label="Email address"
                                htmlFor="email"
                                error={errors.email}
                                required
                            >
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={user?.email}
                                    required
                                    autoComplete="off"
                                />
                            </FormField>
                            <FormField
                                label="Role"
                                htmlFor="role"
                                error={errors.role}
                                required
                            >
                                <Combobox
                                    id="role"
                                    name="role"
                                    defaultValue={user?.role ?? 'editor'}
                                    options={roles}
                                    searchPlaceholder="Search roles…"
                                />
                            </FormField>
                            <CheckboxField
                                name="is_active"
                                label="Active"
                                description="Deactivated users cannot sign in."
                                defaultChecked={user?.is_active ?? true}
                            />
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    label={user ? 'New password' : 'Password'}
                                    htmlFor="password"
                                    error={errors.password}
                                    required={!user}
                                    hint={
                                        user
                                            ? 'Leave empty to keep the current password.'
                                            : undefined
                                    }
                                >
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required={!user}
                                        autoComplete="new-password"
                                    />
                                </FormField>
                                <FormField
                                    label="Confirm password"
                                    htmlFor="password_confirmation"
                                    error={errors.password_confirmation}
                                >
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        required={!user}
                                        autoComplete="new-password"
                                    />
                                </FormField>
                            </div>
                            <FormActions
                                processing={processing}
                                cancelHref={users.index()}
                                submitLabel={
                                    user ? 'Save changes' : 'Create user'
                                }
                            />
                        </>
                    )}
                </Form>
            </AdminPage>
        </>
    );
}

UserForm.layout = {
    breadcrumbs: [{ title: 'Users', href: users.index() }],
};
