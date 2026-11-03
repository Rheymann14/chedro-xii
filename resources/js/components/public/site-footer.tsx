import { usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { FacebookIcon } from '@/components/public/facebook-icon';
import { SmartLink } from '@/components/public/smart-link';
import { formatDate } from '@/lib/format';
import type { MenuLink } from '@/types';

const governmentLinks: [string, string][] = [
    ['GOV.PH', 'https://www.gov.ph'],
    ['Open Data Portal', 'https://data.gov.ph'],
    ['Official Gazette', 'https://www.officialgazette.gov.ph'],
    ['CHED Central Office', 'https://ched.gov.ph'],
    ['Freedom of Information', 'https://www.foi.gov.ph'],
];

const numberFormatter = new Intl.NumberFormat('en-PH');

/**
 * Footer in the style of ched.gov.ph: a white band with the seals and the
 * visitor count, followed by a dark navy block with agency links.
 */
export function SiteFooter() {
    const { site } = usePage().props;
    const { settings, menus, visitors } = site;

    return (
        <footer className="mt-auto">
            <div className="border-t bg-background">
                <div className="container-page flex flex-col items-center justify-center gap-8 py-10 sm:flex-row sm:gap-12">
                    <div className="flex items-center gap-4">
                        <img
                            src="/images/ched-seal-sm.webp"
                            alt="Commission on Higher Education seal"
                            width={224}
                            height={224}
                            loading="lazy"
                            className="size-24 sm:size-28"
                        />
                        <img
                            src="/images/bagong-pilipinas-emblem.webp"
                            alt="Bagong Pilipinas"
                            width={224}
                            height={224}
                            loading="lazy"
                            className="size-24 sm:size-28"
                        />
                    </div>
                    <div className="text-center sm:text-left">
                        <p className="text-2xl font-bold text-foreground">
                            Visitor Count
                        </p>
                        {visitors.since && (
                            <p className="text-sm text-muted-foreground">
                                since {formatDate(visitors.since)}
                            </p>
                        )}
                        <span
                            className="mx-auto my-3 block h-1 w-12 bg-flag-red sm:mx-0"
                            aria-hidden
                        />
                        <p className="text-xl font-bold text-foreground tabular-nums">
                            {numberFormatter.format(visitors.count)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-navy text-sm text-navy-foreground/75">
                <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[auto_minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
                    <img
                        src="/images/republika.png"
                        alt="Seal of the Republic of the Philippines"
                        width={320}
                        height={352}
                        loading="lazy"
                        className="hidden h-32 w-auto lg:block"
                    />

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/ched-seal-sm.webp"
                                alt=""
                                width={224}
                                height={224}
                                loading="lazy"
                                className="size-12"
                            />
                            <img
                                src="/images/bagong-pilipinas-emblem.webp"
                                alt=""
                                width={224}
                                height={224}
                                loading="lazy"
                                className="size-12"
                            />
                        </div>
                        <p className="font-semibold text-white">
                            Commission on Higher Education
                            <br />
                            {settings.office_name}
                        </p>
                        <ul className="space-y-2">
                            <ContactLine icon={MapPin}>
                                {settings.office_address}
                            </ContactLine>
                            <ContactLine icon={Mail}>
                                <a
                                    href={`mailto:${settings.email}`}
                                    className="hover:text-white"
                                >
                                    {settings.email}
                                </a>
                            </ContactLine>
                            {settings.phone && (
                                <ContactLine icon={Phone}>
                                    {settings.phone}
                                </ContactLine>
                            )}
                        </ul>
                    </div>

                    <LinkColumn
                        title="Government"
                        links={governmentLinks.map(([label, url], index) => ({
                            id: index,
                            label,
                            url,
                            description: null,
                            opens_in_new_tab: true,
                            children: [],
                        }))}
                    />
                    <LinkColumn title="Quick Links" links={menus.quick_links} />

                    <div className="space-y-4">
                        <h2 className="text-xs font-bold tracking-wider text-white uppercase">
                            Follow Us
                        </h2>
                        <div className="flex gap-3">
                            {settings.facebook_url && (
                                <SocialLink
                                    href={settings.facebook_url}
                                    label="CHED Rehiyon Dose on Facebook"
                                >
                                    <FacebookIcon className="size-4" />
                                </SocialLink>
                            )}
                            <SocialLink
                                href={`mailto:${settings.email}`}
                                label="Email"
                            >
                                <Mail className="size-4" />
                            </SocialLink>
                        </div>
                        {menus.footer.length > 0 && (
                            <ul className="space-y-2 pt-2">
                                {menus.footer.map((link) => (
                                    <li key={link.id}>
                                        <SmartLink
                                            href={link.url}
                                            newTab={link.opens_in_new_tab}
                                            className="hover:text-white"
                                        >
                                            {link.label}
                                        </SmartLink>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="container-page flex flex-col gap-1 py-4 text-xs sm:flex-row sm:justify-between">
                        <p>
                            Copyright &copy; {new Date().getFullYear()} CHED
                            Regional Office XII. All rights reserved.
                        </p>
                        {/* <p>
                            All content is in the public domain unless otherwise
                            stated.
                        </p> */}
                    </div>
                </div>
            </div>
        </footer>
    );
}

function LinkColumn({ title, links }: { title: string; links: MenuLink[] }) {
    if (links.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xs font-bold tracking-wider text-white uppercase">
                {title}
            </h2>
            <ul className="space-y-2">
                {links.map((link) => (
                    <li key={link.id}>
                        <SmartLink
                            href={link.url}
                            newTab={link.opens_in_new_tab}
                            className="hover:text-white"
                        >
                            {link.label}
                        </SmartLink>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function ContactLine({
    icon: Icon,
    children,
}: {
    icon: typeof MapPin;
    children: React.ReactNode;
}) {
    return (
        <li className="flex items-start gap-2">
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{children}</span>
        </li>
    );
}

function SocialLink({
    href,
    label,
    children,
}: {
    href: string;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target={href.startsWith('mailto:') ? undefined : '_blank'}
            rel="noopener noreferrer"
            aria-label={label}
            className="grid size-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
            {children}
        </a>
    );
}
