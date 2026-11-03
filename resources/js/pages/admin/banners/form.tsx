import { Form, Head } from '@inertiajs/react';
import { AdminPage } from '@/components/admin/admin-page';
import { FormActions } from '@/components/admin/form-actions';
import { CheckboxField, FormField } from '@/components/admin/form-field';
import { Input } from '@/components/ui/input';
import banners from '@/routes/admin/banners';

type Props = {
    banner: {
        id: number;
        title: string;
        alt: string | null;
        link_url: string | null;
        sort_order: number;
        is_active: boolean;
        starts_at: string | null;
        ends_at: string | null;
        image_url: string | null;
    } | null;
};

export default function BannerForm({ banner }: Props) {
    const title = banner ? 'Edit banner' : 'Add banner';

    return (
        <>
            <Head title={title} />
            <AdminPage title={title}>
                <Form
                    {...(banner
                        ? banners.update.form(banner.id)
                        : banners.store.form())}
                    className="max-w-2xl space-y-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            {banner?.image_url && (
                                <img
                                    src={banner.image_url}
                                    alt=""
                                    className="aspect-[2.56/1] w-full rounded-lg border object-cover"
                                />
                            )}

                            <FormField
                                label={banner ? 'Replace image' : 'Image'}
                                htmlFor="image"
                                error={errors.image}
                                required={!banner}
                                hint="JPG, PNG, or WebP, at least 1200 pixels wide (2048 × 800 recommended), up to 5 MB."
                            >
                                <Input
                                    id="image"
                                    name="image"
                                    type="file"
                                    required={!banner}
                                    accept="image/jpeg,image/png,image/webp"
                                />
                            </FormField>

                            <FormField
                                label="Title"
                                htmlFor="title"
                                error={errors.title}
                                required
                                hint="For your reference; not shown on the banner."
                            >
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={banner?.title}
                                    required
                                    maxLength={255}
                                />
                            </FormField>

                            <FormField
                                label="Alternative text"
                                htmlFor="alt"
                                error={errors.alt}
                                hint="Describe the banner's message for screen readers."
                            >
                                <Input
                                    id="alt"
                                    name="alt"
                                    defaultValue={banner?.alt ?? ''}
                                    maxLength={255}
                                />
                            </FormField>

                            <FormField
                                label="Link"
                                htmlFor="link_url"
                                error={errors.link_url}
                                hint="Optional. A full URL (https://…) or a site path such as /announcements."
                            >
                                <Input
                                    id="link_url"
                                    name="link_url"
                                    defaultValue={banner?.link_url ?? ''}
                                    maxLength={255}
                                />
                            </FormField>

                            <div className="grid gap-6 sm:grid-cols-3">
                                <FormField
                                    label="Show from"
                                    htmlFor="starts_at"
                                    error={errors.starts_at}
                                >
                                    <Input
                                        id="starts_at"
                                        name="starts_at"
                                        type="datetime-local"
                                        defaultValue={banner?.starts_at ?? ''}
                                    />
                                </FormField>
                                <FormField
                                    label="Show until"
                                    htmlFor="ends_at"
                                    error={errors.ends_at}
                                >
                                    <Input
                                        id="ends_at"
                                        name="ends_at"
                                        type="datetime-local"
                                        defaultValue={banner?.ends_at ?? ''}
                                    />
                                </FormField>
                                <FormField
                                    label="Order"
                                    htmlFor="sort_order"
                                    error={errors.sort_order}
                                >
                                    <Input
                                        id="sort_order"
                                        name="sort_order"
                                        type="number"
                                        min={0}
                                        defaultValue={banner?.sort_order ?? 0}
                                    />
                                </FormField>
                            </div>

                            <CheckboxField
                                name="is_active"
                                label="Active"
                                description="Uncheck to hide this banner without deleting it."
                                defaultChecked={banner?.is_active ?? true}
                            />

                            <FormActions
                                processing={processing}
                                progress={progress}
                                cancelHref={banners.index()}
                                submitLabel={
                                    banner ? 'Save changes' : 'Add banner'
                                }
                            />
                        </>
                    )}
                </Form>
            </AdminPage>
        </>
    );
}

BannerForm.layout = {
    breadcrumbs: [{ title: 'Home banners', href: banners.index() }],
};
