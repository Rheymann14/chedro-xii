import { Form, Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { FormActions } from '@/components/admin/form-actions';
import { CheckboxField, FormField } from '@/components/admin/form-field';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import pages from '@/routes/admin/pages';

type Props = {
    page: {
        id: number;
        title: string;
        slug: string;
        meta_description: string | null;
        body: string | null;
        is_published: boolean;
        public_url: string;
    } | null;
};

export default function PageForm({ page }: Props) {
    const title = page ? 'Edit page' : 'New page';

    return (
        <>
            <Head title={title} />
            <AdminPage
                title={title}
                actions={
                    page && (
                        <Button variant="outline" asChild>
                            <a
                                href={page.public_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="size-4" />
                                View
                            </a>
                        </Button>
                    )
                }
            >
                <Form
                    key={page?.id ?? 'new'}
                    {...(page
                        ? pages.update.form(page.id)
                        : pages.store.form())}
                    options={{ preserveScroll: true }}
                    className="max-w-4xl space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    label="Title"
                                    htmlFor="title"
                                    error={errors.title}
                                    required
                                >
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={page?.title}
                                        required
                                        maxLength={255}
                                    />
                                </FormField>
                                <FormField
                                    label="URL slug"
                                    htmlFor="slug"
                                    error={errors.slug}
                                    hint="The page address: /pages/your-slug. Leave empty to generate from the title."
                                >
                                    <Input
                                        id="slug"
                                        name="slug"
                                        defaultValue={page?.slug ?? ''}
                                        maxLength={120}
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Summary"
                                htmlFor="meta_description"
                                error={errors.meta_description}
                                hint="One or two sentences for search engines and site search."
                            >
                                <Textarea
                                    id="meta_description"
                                    name="meta_description"
                                    rows={2}
                                    maxLength={300}
                                    defaultValue={page?.meta_description ?? ''}
                                />
                            </FormField>

                            <FormField
                                label="Content"
                                htmlFor="body"
                                error={errors.body}
                            >
                                <RichTextEditor
                                    id="body"
                                    name="body"
                                    defaultValue={page?.body}
                                    invalid={Boolean(errors.body)}
                                />
                            </FormField>

                            <CheckboxField
                                name="is_published"
                                label="Published"
                                description="Unpublished pages are only visible to signed-in staff."
                                defaultChecked={page?.is_published ?? true}
                            />

                            <FormActions
                                processing={processing}
                                cancelHref={pages.index()}
                                submitLabel={
                                    page ? 'Save changes' : 'Create page'
                                }
                            />
                        </>
                    )}
                </Form>
            </AdminPage>
        </>
    );
}

PageForm.layout = {
    breadcrumbs: [{ title: 'Pages', href: pages.index() }],
};
