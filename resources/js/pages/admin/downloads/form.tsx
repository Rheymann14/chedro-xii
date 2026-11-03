import { Form, Head, Link } from '@inertiajs/react';
import { AdminPage } from '@/components/admin/admin-page';
import { FormActions } from '@/components/admin/form-actions';
import { FormField, NativeSelect } from '@/components/admin/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import downloadCategories from '@/routes/admin/download-categories';
import downloads from '@/routes/admin/downloads';

type Props = {
    download: {
        id: number;
        download_category_id: number;
        title: string;
        description: string | null;
        sort_order: number;
        file_name: string;
        file_url: string | null;
    } | null;
    categories: { id: number; name: string }[];
};

export default function DownloadForm({ download, categories }: Props) {
    const title = download ? 'Edit file' : 'Upload file';

    return (
        <>
            <Head title={title} />
            <AdminPage title={title}>
                <Form
                    {...(download
                        ? downloads.update.form(download.id)
                        : downloads.store.form())}
                    className="max-w-2xl space-y-6"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <FormField
                                label="Title"
                                htmlFor="title"
                                error={errors.title}
                                required
                            >
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={download?.title}
                                    required
                                    maxLength={255}
                                />
                            </FormField>

                            <div className="grid gap-6 sm:grid-cols-[1fr_8rem]">
                                <FormField
                                    label="Category"
                                    htmlFor="download_category_id"
                                    error={errors.download_category_id}
                                    required
                                    hint={
                                        <Link
                                            href={downloadCategories.index()}
                                            className="text-primary hover:underline"
                                        >
                                            Manage categories
                                        </Link>
                                    }
                                >
                                    <NativeSelect
                                        id="download_category_id"
                                        name="download_category_id"
                                        defaultValue={
                                            download?.download_category_id ??
                                            categories[0]?.id
                                        }
                                        required
                                    >
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </NativeSelect>
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
                                        defaultValue={download?.sort_order ?? 0}
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label="Description"
                                htmlFor="description"
                                error={errors.description}
                            >
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    maxLength={500}
                                    defaultValue={download?.description ?? ''}
                                />
                            </FormField>

                            <FormField
                                label={download ? 'Replace file' : 'File'}
                                htmlFor="file"
                                error={errors.file}
                                required={!download}
                                hint={
                                    download?.file_url ? (
                                        <>
                                            Current file:{' '}
                                            <a
                                                href={download.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {download.file_name}
                                            </a>
                                            . PDF, Office documents, or ZIP, up
                                            to 20 MB.
                                        </>
                                    ) : (
                                        'PDF, Office documents, or ZIP, up to 20 MB.'
                                    )
                                }
                            >
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    required={!download}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
                                />
                            </FormField>

                            <FormActions
                                processing={processing}
                                progress={progress}
                                cancelHref={downloads.index()}
                                submitLabel={
                                    download ? 'Save changes' : 'Upload'
                                }
                            />
                        </>
                    )}
                </Form>
            </AdminPage>
        </>
    );
}

DownloadForm.layout = {
    breadcrumbs: [{ title: 'Downloads', href: downloads.index() }],
};
