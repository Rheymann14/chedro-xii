import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    FileCheck2,
    FileText,
    GraduationCap,
    Landmark,
    Mail,
    UserRound,
} from 'lucide-react';
import { BannerCarousel } from '@/components/public/banner-carousel';
import type { ContentSlide } from '@/components/public/banner-carousel';
import { EmptyState } from '@/components/public/empty-state';
import { IssuanceList } from '@/components/public/issuance-list';
import { PaginationNav } from '@/components/public/pagination-nav';
import { PostCalendar } from '@/components/public/post-calendar';
import { PostTimeline } from '@/components/public/post-timeline';
import { SectionHeading } from '@/components/public/section-heading';
import { SidebarBox } from '@/components/public/sidebar-box';
import { SmartLink } from '@/components/public/smart-link';
import { Button } from '@/components/ui/button';
import { cavApplication } from '@/routes';
import { index as announcementsIndex } from '@/routes/announcements';
import { index as careersIndex } from '@/routes/careers';
import { show as contactShow } from '@/routes/contact';
import { index as heisIndex } from '@/routes/heis';
import { show as hubShow } from '@/routes/hubs';
import { index as issuancesIndex } from '@/routes/issuances';
import type {
    BannerSlide,
    IssuanceItem,
    Paginated,
    PostSummary,
} from '@/types';

type Props = {
    banners: BannerSlide[];
    timeline: Paginated<PostSummary>;
    issuances?: IssuanceItem[];
};

const fallbackSlides: ContentSlide[] = [
    {
        id: 'welcome',
        title: 'CHED Regional Office XII',
        description:
            'Advancing relevant, quality, and accessible higher education across SOCCSKSARGEN.',
        href: hubShow.url('about'),
        cta: 'Learn about us',
        icon: Landmark,
    },
    {
        id: 'cav',
        title: 'CAV Application',
        description:
            'Apply online for Certification, Authentication, and Verification of your academic records through the eCAV portal.',
        href: cavApplication.url(),
        cta: 'See how to apply',
        icon: FileCheck2,
    },
    {
        id: 'careers',
        title: 'Career Opportunities',
        description:
            'Join CHED Regional Office XII. View open positions and application deadlines.',
        href: careersIndex.url(),
        cta: 'View openings',
        icon: GraduationCap,
    },
];

const services = [
    {
        title: 'eCAV Application',
        description: 'Certification, Authentication & Verification',
        href: cavApplication(),
        icon: FileCheck2,
    },
    {
        title: 'Regional Memoranda',
        description: 'Latest issuances and advisories',
        href: issuancesIndex(),
        icon: FileText,
    },
    {
        title: 'Recognized HEIs',
        description: 'Higher education institutions in Region XII',
        href: heisIndex(),
        icon: Building2,
    },
    {
        title: 'Contact Us',
        description: 'Send an inquiry to the office',
        href: contactShow(),
        icon: Mail,
    },
];

export default function Home({ banners, timeline, issuances }: Props) {
    const { site } = usePage().props;

    return (
        <>
            <Head title="Home">
                <meta
                    name="description"
                    content="Official website of the Commission on Higher Education Regional Office XII: announcements, regional memoranda, and services for higher education in SOCCSKSARGEN."
                />
            </Head>

            {/* Keyed by page so the slideshow restarts with that timeline page's posts. */}
            <BannerCarousel
                key={timeline.meta.current_page}
                banners={banners}
                posts={timeline.data}
                fallback={fallbackSlides}
            />

            <section className="border-b bg-background">
                <div className="container-page grid items-center gap-10 py-14 md:grid-cols-2 lg:py-20">
                    <div className="flex justify-center">
                        <img
                            src="/images/building-800.webp"
                            alt="CHED Regional Office XII building"
                            width={800}
                            height={800}
                            loading="lazy"
                            className="aspect-square w-full max-w-sm rounded-2xl object-cover shadow-sm"
                        />
                    </div>
                    <div className="space-y-5">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Our Mandate
                        </h2>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            Pursuant to Republic Act 7722, CHED Regional Office
                            XII promotes relevant and quality higher education,
                            ensures that it is accessible to all who seek it,
                            protects academic freedom, and upholds transparency
                            and accountability among the higher education
                            institutions of SOCCSKSARGEN.
                        </p>
                        <Button size="lg" asChild>
                            <Link href={hubShow('about')}>
                                Learn more
                                <ArrowRight className="size-4" aria-hidden />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <section aria-label="Online services" className="bg-surface">
                <div className="container-page grid grid-cols-2 gap-4 py-10 lg:grid-cols-4">
                    {services.map((service) => (
                        <Link
                            key={service.title}
                            href={service.href}
                            prefetch
                            className="group flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <span className="grid size-11 place-items-center rounded-md bg-accent text-primary">
                                <service.icon className="size-5" aria-hidden />
                            </span>
                            <span>
                                <span className="block font-semibold text-foreground group-hover:text-primary">
                                    {service.title}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">
                                    {service.description}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="bg-background">
                <div className="container-page grid gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
                    <div>
                        <SectionHeading
                            title="Latest Updates"
                            description="Announcements, career opportunities, and recognitions."
                            href={announcementsIndex()}
                        />
                        {timeline.data.length > 0 ? (
                            <>
                                <PostTimeline posts={timeline.data} />
                                <PaginationNav
                                    paginator={timeline}
                                    only={['timeline']}
                                    className="mt-6"
                                />
                            </>
                        ) : (
                            <EmptyState
                                title="No updates yet"
                                description="Check back soon for news and advisories."
                            />
                        )}
                    </div>

                    <aside className="space-y-6" aria-label="Sidebar">
                        <SidebarBox title="Post Calendar">
                            <PostCalendar />
                        </SidebarBox>

                        <SidebarBox title="Latest Memoranda">
                            {issuances === undefined ? (
                                <div className="animate-pulse space-y-4">
                                    {[0, 1, 2].map((key) => (
                                        <div key={key} className="flex gap-3">
                                            <div className="size-8 rounded bg-muted" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 rounded bg-muted" />
                                                <div className="h-3 w-1/2 rounded bg-muted" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : issuances.length > 0 ? (
                                <>
                                    <IssuanceList
                                        issuances={issuances}
                                        compact
                                    />
                                    <Link
                                        href={issuancesIndex()}
                                        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                                    >
                                        All memoranda
                                        <ArrowRight
                                            className="size-4"
                                            aria-hidden
                                        />
                                    </Link>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No memoranda published yet.
                                </p>
                            )}
                        </SidebarBox>

                        {site.menus.quick_links.length > 0 && (
                            <SidebarBox title="Quick Links">
                                <ul className="-my-1 divide-y">
                                    {site.menus.quick_links.map((link) => (
                                        <li key={link.id}>
                                            <SmartLink
                                                href={link.url}
                                                newTab={link.opens_in_new_tab}
                                                className="flex items-center justify-between gap-2 py-2.5 text-sm font-medium hover:text-primary"
                                            >
                                                {link.label}
                                                <ArrowRight
                                                    className="size-4 shrink-0 text-muted-foreground"
                                                    aria-hidden
                                                />
                                            </SmartLink>
                                        </li>
                                    ))}
                                </ul>
                            </SidebarBox>
                        )}

                        <SidebarBox title="Regional Director">
                            <div className="flex items-center gap-3">
                                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent">
                                    <UserRound
                                        className="size-6 text-primary"
                                        aria-hidden
                                    />
                                </span>
                                <div>
                                    <p className="leading-tight font-semibold">
                                        {site.settings.director_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {site.settings.director_position}
                                    </p>
                                </div>
                            </div>
                        </SidebarBox>
                    </aside>
                </div>
            </section>
        </>
    );
}
