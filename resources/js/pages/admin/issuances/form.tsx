import { Form, Head, Link } from '@inertiajs/react';
import { AdminPage } from '@/components/admin/admin-page';
import { FormActions } from '@/components/admin/form-actions';
import { FormField } from '@/components/admin/form-field';
import { Combobox } from '@/components/combobox';
import { Input } from '@/components/ui/input';
import issuanceTypes from '@/routes/admin/issuance-types';
import issuances from '@/routes/admin/issuances';

type Props = {
    issuance: {
        id: number;
        issuance_type_id: number;
        title: string;
        reference_no: string | null;
        issued_on: string;
        visibility: string;
        file_name: string;
        file_url: string;
    } | null;
    types: { id: number; name: string }[];
    visibilities: { value: string; label: string }[];
};

export default function IssuanceForm({ issuance, types, visibilities }: Props) {
    const title = issuance ? 'Edit issuance' : 'New issuance';

    return (
        <>
            <Head title={title} />
            <AdminPage title={title}>
                <Form
                    {...(issuance
                        ? issuances.update.form(issuance.id)
                        : issuances.store.form())}
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
                                    defaultValue={issuance?.title}
                                    required
                                    maxLength={255}
                                />
                            </FormField>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    label="Type"
                                    htmlFor="issuance_type_id"
                                    error={errors.issuance_type_id}
                                    required
                                    hint={
                                        <Link
                                            href={issuanceTypes.index()}
                                            className="text-primary hover:underline"
                                        >
                                            Manage types
                                        </Link>
                                    }
                                >
                                    <Combobox
                                        id="issuance_type_id"
                                        name="issuance_type_id"
                                        defaultValue={
                                            issuance?.issuance_type_id ??
                                            types[0]?.id
                                        }
                                        options={types.map((type) => ({
                                            value: String(type.id),
                                            label: type.name,
                                        }))}
                                        placeholder="Select a type"
                                        searchPlaceholder="Search types…"
                                    />
                                </FormField>
                                <FormField
                                    label="Reference number"
                                    htmlFor="reference_no"
                                    error={errors.reference_no}
                                >
                                    <Input
                                        id="reference_no"
                                        name="reference_no"
                                        defaultValue={
                                            issuance?.reference_no ?? ''
                                        }
                                        placeholder="e.g. RM No. 12, s. 2026"
                                        maxLength={100}
                                    />
                                </FormField>
                                <FormField
                                    label="Date issued"
                                    htmlFor="issued_on"
                                    error={errors.issued_on}
                                    required
                                >
                                    <Input
                                        id="issued_on"
                                        name="issued_on"
                                        type="date"
                                        defaultValue={
                                            issuance?.issued_on ??
                                            new Date()
                                                .toISOString()
                                                .slice(0, 10)
                                        }
                                        required
                                    />
                                </FormField>
                                <FormField
                                    label="Visibility"
                                    htmlFor="visibility"
                                    error={errors.visibility}
                                    required
                                >
                                    <Combobox
                                        id="visibility"
                                        name="visibility"
                                        defaultValue={
                                            issuance?.visibility ?? 'public'
                                        }
                                        options={visibilities}
                                        searchPlaceholder="Search visibility…"
                                    />
                                </FormField>
                            </div>

                            <FormField
                                label={issuance ? 'Replace file' : 'File'}
                                htmlFor="file"
                                error={errors.file}
                                required={!issuance}
                                hint={
                                    issuance ? (
                                        <>
                                            Current file:{' '}
                                            <a
                                                href={issuance.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {issuance.file_name}
                                            </a>
                                            . PDF, Word, Excel, or image, up to
                                            20 MB.
                                        </>
                                    ) : (
                                        'PDF, Word, Excel, or image, up to 20 MB.'
                                    )
                                }
                            >
                                <Input
                                    id="file"
                                    name="file"
                                    type="file"
                                    required={!issuance}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                />
                            </FormField>

                            <FormActions
                                processing={processing}
                                progress={progress}
                                cancelHref={issuances.index()}
                                submitLabel={
                                    issuance
                                        ? 'Save changes'
                                        : 'Publish issuance'
                                }
                            />
                        </>
                    )}
                </Form>
            </AdminPage>
        </>
    );
}

IssuanceForm.layout = {
    breadcrumbs: [{ title: 'Regional Memoranda', href: issuances.index() }],
};
