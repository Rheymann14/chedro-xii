import { Form, Head } from '@inertiajs/react';
import { AdminPage } from '@/components/admin/admin-page';
import { FormField } from '@/components/admin/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import settingsRoutes from '@/routes/admin/settings';
import type { SiteSettings } from '@/types';

export default function Settings({ settings }: { settings: SiteSettings }) {
    return (
        <>
            <Head title="Office information" />
            <AdminPage
                title="Office information"
                description="Contact details shown in the footer, contact page, and home page."
            >
                <Form
                    {...settingsRoutes.update.form()}
                    options={{ preserveScroll: true }}
                    className="max-w-2xl space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <FormField
                                label="Office name"
                                htmlFor="office_name"
                                error={errors.office_name}
                                required
                            >
                                <Input
                                    id="office_name"
                                    name="office_name"
                                    defaultValue={settings.office_name}
                                    required
                                />
                            </FormField>
                            <FormField
                                label="Address"
                                htmlFor="office_address"
                                error={errors.office_address}
                                required
                            >
                                <Textarea
                                    id="office_address"
                                    name="office_address"
                                    rows={2}
                                    defaultValue={settings.office_address}
                                    required
                                />
                            </FormField>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    label="Email"
                                    htmlFor="email"
                                    error={errors.email}
                                    required
                                >
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={settings.email}
                                        required
                                    />
                                </FormField>
                                <FormField
                                    label="Phone"
                                    htmlFor="phone"
                                    error={errors.phone}
                                >
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={settings.phone ?? ''}
                                    />
                                </FormField>
                            </div>
                            <FormField
                                label="Office hours"
                                htmlFor="office_hours"
                                error={errors.office_hours}
                                required
                            >
                                <Input
                                    id="office_hours"
                                    name="office_hours"
                                    defaultValue={settings.office_hours}
                                    required
                                />
                            </FormField>
                            <FormField
                                label="Facebook page link"
                                htmlFor="facebook_url"
                                error={errors.facebook_url}
                            >
                                <Input
                                    id="facebook_url"
                                    name="facebook_url"
                                    type="url"
                                    placeholder="https://www.facebook.com/…"
                                    defaultValue={settings.facebook_url ?? ''}
                                />
                            </FormField>
                            <FormField
                                label="Map link"
                                htmlFor="map_url"
                                error={errors.map_url}
                                hint="A Google Maps share link to the office."
                            >
                                <Input
                                    id="map_url"
                                    name="map_url"
                                    type="url"
                                    defaultValue={settings.map_url ?? ''}
                                />
                            </FormField>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    label="Regional Director"
                                    htmlFor="director_name"
                                    error={errors.director_name}
                                    required
                                >
                                    <Input
                                        id="director_name"
                                        name="director_name"
                                        defaultValue={settings.director_name}
                                        required
                                    />
                                </FormField>
                                <FormField
                                    label="Director's title"
                                    htmlFor="director_position"
                                    error={errors.director_position}
                                    required
                                >
                                    <Input
                                        id="director_position"
                                        name="director_position"
                                        defaultValue={
                                            settings.director_position
                                        }
                                        required
                                    />
                                </FormField>
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing && <Spinner />}
                                Save
                            </Button>
                        </>
                    )}
                </Form>
            </AdminPage>
        </>
    );
}

Settings.layout = {
    breadcrumbs: [{ title: 'Office information', href: settingsRoutes.edit() }],
};
