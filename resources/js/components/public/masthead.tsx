import { Form, Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Mail, Phone, Search } from 'lucide-react';
import { AppearanceToggle } from '@/components/public/appearance-toggle';
import { PhilippineTime } from '@/components/public/ph-time';
import { home, search } from '@/routes';
import { dashboard } from '@/routes/admin';

/**
 * White agency header in the style of ched.gov.ph: seal and serif lockup on
 * the left; contact details, site search, and government seals on the right.
 */
export function Masthead() {
    const { auth, site } = usePage().props;

    return (
        <div className="border-b bg-background">
            <div className="container-page flex items-center justify-between gap-6 py-3">
                <Link href={home()} className="min-w-0 shrink">
                    <img
                        src="/images/logo-banner.webp"
                        alt="Commission on Higher Education Regional Office XII, Office of the President, Republic of the Philippines"
                        width={698}
                        height={173}
                        fetchPriority="high"
                        className="h-12 w-auto max-w-full sm:h-16 dark:hidden"
                    />
                    <img
                        src="/images/logo-banner-dark.webp"
                        alt="Commission on Higher Education Regional Office XII, Office of the President, Republic of the Philippines"
                        width={698}
                        height={173}
                        loading="lazy"
                        className="hidden h-12 w-auto max-w-full sm:h-16 dark:block"
                    />
                </Link>

                <div className="hidden flex-col items-end gap-2 lg:flex">
                    <div className="flex items-center gap-5 text-xs font-medium text-foreground">
                        <PhilippineTime className="text-muted-foreground" />
                        {site.settings.phone && (
                            <span className="inline-flex items-center gap-1.5">
                                <Phone className="size-3.5" aria-hidden />
                                {site.settings.phone}
                            </span>
                        )}
                        <a
                            href={`mailto:${site.settings.email}`}
                            className="inline-flex items-center gap-1.5 hover:text-primary"
                        >
                            <Mail className="size-3.5" aria-hidden />
                            {site.settings.email}
                        </a>
                        <AppearanceToggle />
                        {auth.user && (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-1.5 hover:text-primary"
                            >
                                <LayoutDashboard
                                    className="size-3.5"
                                    aria-hidden
                                />
                                Dashboard
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Form
                            action={search.url()}
                            method="get"
                            role="search"
                            className="relative"
                        >
                            <input
                                type="search"
                                name="q"
                                placeholder="Search"
                                aria-label="Search the site"
                                className="h-10 w-60 rounded-md border border-input bg-background pr-10 pl-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
                            />
                            <button
                                type="submit"
                                aria-label="Search"
                                className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center text-muted-foreground hover:text-primary"
                            >
                                <Search className="size-4" />
                            </button>
                        </Form>
                        <Link
                            href="/pages/transparency-seal"
                            title="Transparency Seal"
                        >
                            <img
                                src="/images/transparency-seal.png"
                                alt="Transparency Seal"
                                width={160}
                                height={160}
                                className="size-12"
                            />
                        </Link>
                        <a
                            href="https://www.foi.gov.ph/agencies/ched"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Freedom of Information"
                        >
                            <img
                                src="/images/fip.webp"
                                alt="Freedom of Information Philippines"
                                width={224}
                                height={224}
                                className="size-12 rounded-full"
                            />
                        </a>
                        <img
                            src="/images/bagong-pilipinas-emblem.webp"
                            alt="Bagong Pilipinas"
                            width={224}
                            height={224}
                            className="size-12"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
