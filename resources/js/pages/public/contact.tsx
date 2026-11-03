import { Head, usePage } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { FacebookIcon } from '@/components/public/facebook-icon';
import { PageHeader } from '@/components/public/page-header';
import { show } from '@/routes/contact';

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
                description="Questions about scholarships, CAV, HEI concerns, or other services? Reach us through the details below."
                breadcrumbs={[{ title: 'Contact Us', href: show() }]}
            />

            <div className="container-page grid items-start gap-6 py-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className="space-y-4 rounded-lg border bg-card p-5 shadow-xs">
                    <h2 className="font-bold">CHED {settings.office_name}</h2>
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
                        <ContactRow icon={Phone}>{settings.phone}</ContactRow>
                    )}
                    <ContactRow icon={Clock}>
                        {settings.office_hours}
                    </ContactRow>
                    {settings.facebook_url && (
                        <ContactRow icon={FacebookIcon}>
                            <a
                                href={settings.facebook_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                            >
                                CHED Rehiyon Dose
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
            </div>
        </>
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
