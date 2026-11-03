import { Form, Head, usePage } from '@inertiajs/react';
import { Clock, Facebook, Mail, MapPin, Phone, Send } from 'lucide-react';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/public/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { show, store } from '@/routes/contact';

export default function Contact() {
    const { settings } = usePage().props.site;

    return (
        <>
            <Head title="Contact Us">
                <meta
                    name="description"
                    content="Get in touch with the Commission on Higher Education Regional Office XII."
                />
            </Head>

            <PageHeader
                title="Contact Us"
                description="Questions about scholarships, CAV, HEI concerns, or other services? Send us a message."
                breadcrumbs={[{ title: 'Contact Us', href: show() }]}
            />

            <div className="container-page grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <section className="rounded-lg border bg-card p-5 shadow-xs sm:p-8">
                    <h2 className="mb-1 text-lg font-bold">Send a message</h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                        Fields marked * are required. We usually reply within
                        three working days.
                    </p>

                    <Form
                        {...store.form()}
                        resetOnSuccess
                        options={{ preserveScroll: true }}
                        className="grid gap-5 sm:grid-cols-2"
                    >
                        {({ errors, processing }) => (
                            <>
                                <Field label="Full name *" error={errors.name}>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        autoComplete="name"
                                        maxLength={120}
                                    />
                                </Field>
                                <Field
                                    label="Email address *"
                                    error={errors.email}
                                >
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                    />
                                </Field>
                                <Field
                                    label="Phone number"
                                    error={errors.phone}
                                >
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        maxLength={50}
                                    />
                                </Field>
                                <Field label="Subject *" error={errors.subject}>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        required
                                        maxLength={200}
                                    />
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field
                                        label="Message *"
                                        error={errors.message}
                                    >
                                        <Textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={6}
                                            minLength={10}
                                            maxLength={5000}
                                        />
                                    </Field>
                                </div>

                                <div className="hidden" aria-hidden>
                                    <label htmlFor="website">Website</label>
                                    <input
                                        id="website"
                                        name="website"
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>
                                <InputError message={errors.website} />

                                <p className="text-xs text-muted-foreground sm:col-span-2">
                                    Your information is used only to respond to
                                    your inquiry, in accordance with the Data
                                    Privacy Act of 2012.
                                </p>

                                <div className="sm:col-span-2">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto"
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <Send
                                                className="size-4"
                                                aria-hidden
                                            />
                                        )}
                                        Send message
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <aside className="space-y-4">
                    <div className="space-y-4 rounded-lg border bg-card p-5 shadow-xs">
                        <h2 className="font-bold">
                            CHED {settings.office_name}
                        </h2>
                        <ContactRow icon={MapPin}>
                            {settings.office_address}
                            {settings.map_url && (
                                <a
                                    href={settings.map_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 block font-medium text-primary hover:underline"
                                >
                                    View on map
                                </a>
                            )}
                        </ContactRow>
                        <ContactRow icon={Mail}>
                            <a
                                href={`mailto:${settings.email}`}
                                className="text-primary hover:underline"
                            >
                                {settings.email}
                            </a>
                        </ContactRow>
                        {settings.phone && (
                            <ContactRow icon={Phone}>
                                {settings.phone}
                            </ContactRow>
                        )}
                        <ContactRow icon={Clock}>
                            {settings.office_hours}
                        </ContactRow>
                        {settings.facebook_url && (
                            <ContactRow icon={Facebook}>
                                <a
                                    href={settings.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Facebook page
                                </a>
                            </ContactRow>
                        )}
                    </div>

                    <div className="rounded-lg border border-l-4 border-l-gold bg-card p-5 shadow-xs">
                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                            {settings.director_position}
                        </p>
                        <p className="mt-1 font-semibold">
                            {settings.director_name}
                        </p>
                    </div>
                </aside>
            </div>
        </>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactElement<{ id: string }>;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={children.props.id}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function ContactRow({
    icon: Icon,
    children,
}: {
    icon: typeof MapPin;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 text-sm">
            <Icon
                className="mt-0.5 size-4 shrink-0 text-brand dark:text-primary"
                aria-hidden
            />
            <div>{children}</div>
        </div>
    );
}
