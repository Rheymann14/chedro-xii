import { Link } from '@inertiajs/react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SmartLink } from '@/components/public/smart-link';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { show as showPost } from '@/routes/posts';
import type { BannerSlide, PostSummary } from '@/types';

export type ContentSlide = {
    id: string;
    title: string;
    description: string;
    href: string;
    cta: string;
    icon: LucideIcon;
};

type Slide = { key: string } & (
    | ({ kind: 'image'; contain: boolean } & BannerSlide)
    | ({ kind: 'content' } & ContentSlide)
);

/**
 * Full-width hero carousel: a caption strip links the current slide, and a
 * pause button sits in the corner. Uploaded banners come first,
 * followed by the main image of each given post, shown whole over a blurred
 * copy since post photos rarely match the banner's shape. Without either,
 * built-in content slides are used.
 */
export function BannerCarousel({
    banners,
    posts = [],
    fallback,
}: {
    banners: BannerSlide[];
    posts?: PostSummary[];
    fallback: ContentSlide[];
}) {
    const imageSlides: Slide[] = [
        ...banners.map((banner) => ({
            key: `banner-${banner.id}`,
            kind: 'image' as const,
            contain: false,
            ...banner,
        })),
        ...posts.flatMap((post) =>
            post.cover
                ? [
                      {
                          key: `post-${post.id}`,
                          kind: 'image' as const,
                          contain: true,
                          id: post.id,
                          title: post.title,
                          image_url: post.cover.url,
                          link_url: showPost.url(post.slug),
                          alt: post.cover.alt,
                      },
                  ]
                : [],
        ),
    ];
    const slides: Slide[] =
        imageSlides.length > 0
            ? imageSlides
            : fallback.map((slide) => ({
                  key: `content-${slide.id}`,
                  kind: 'content',
                  ...slide,
              }));

    const [autoplay] = useState(() =>
        Autoplay({
            delay: 7000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
        }),
    );
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: slides.length > 1, align: 'center' },
        slides.length > 1 ? [autoplay] : [],
    );
    const [selected, setSelected] = useState(0);
    const [playing, setPlaying] = useState(true);

    useEffect(() => {
        if (!emblaApi) {
            return;
        }

        const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
        emblaApi.on('select', onSelect);

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);

    const togglePlay = useCallback(() => {
        if (autoplay.isPlaying()) {
            autoplay.stop();
            setPlaying(false);
        } else {
            autoplay.play();
            setPlaying(true);
        }
    }, [autoplay]);

    const current = slides[selected] ?? slides[0];
    const currentHref =
        current.kind === 'image' ? current.link_url : current.href;

    return (
        <section
            aria-roledescription="carousel"
            aria-label="Featured"
            className="relative overflow-hidden bg-navy"
        >
            <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.key}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${index + 1} of ${slides.length}`}
                            aria-hidden={index !== selected}
                            className="relative min-w-0 shrink-0 grow-0 basis-full"
                        >
                            {slide.kind === 'image' ? (
                                <ImageSlideView
                                    slide={slide}
                                    eager={index === 0}
                                />
                            ) : (
                                <ContentSlideView slide={slide} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Covers the carousel with a spinner until Embla is ready. */}
            <div
                className={cn(
                    'absolute inset-0 z-10 grid place-items-center bg-navy transition-opacity duration-300',
                    emblaApi ? 'pointer-events-none opacity-0' : 'opacity-100',
                )}
                aria-hidden={emblaApi !== undefined}
            >
                <Spinner className="size-10 text-white/70" />
            </div>

            {slides.length > 1 && (
                <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                    className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border border-foreground/20 bg-background/80 text-foreground hover:bg-background"
                >
                    {playing ? (
                        <Pause className="size-4" />
                    ) : (
                        <Play className="size-4" />
                    )}
                </button>
            )}

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-navy/70 px-4 py-2.5 text-white sm:px-6">
                {currentHref ? (
                    <SmartLink
                        href={currentHref}
                        className="truncate text-sm font-semibold underline underline-offset-4 hover:text-gold"
                    >
                        {current.title}
                    </SmartLink>
                ) : (
                    <span className="truncate text-sm font-semibold">
                        {current.title}
                    </span>
                )}

                {slides.length > 1 && (
                    <div className="flex shrink-0 items-center gap-2">
                        <ArrowButton
                            label="Previous slide"
                            onClick={() => emblaApi?.scrollPrev()}
                        >
                            <ChevronLeft className="size-4" />
                        </ArrowButton>
                        <div className="hidden gap-1.5 sm:flex">
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.key}
                                    type="button"
                                    onClick={() => emblaApi?.scrollTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={selected === index}
                                    className={cn(
                                        'h-1.5 rounded-full transition-all',
                                        selected === index
                                            ? 'w-6 bg-gold'
                                            : 'w-1.5 bg-white/60 hover:bg-white',
                                    )}
                                />
                            ))}
                        </div>
                        <ArrowButton
                            label="Next slide"
                            onClick={() => emblaApi?.scrollNext()}
                        >
                            <ChevronRight className="size-4" />
                        </ArrowButton>
                    </div>
                )}
            </div>
        </section>
    );
}

/**
 * Banner or post photo with a loader underneath it. The loader sits behind
 * the image rather than hiding it, so a server-rendered first slide paints
 * as soon as it downloads, and is removed once the image loads or fails.
 */
function ImageSlideView({
    slide,
    eager,
}: {
    slide: Extract<Slide, { kind: 'image' }>;
    eager: boolean;
}) {
    const [loaded, setLoaded] = useState(false);
    const markLoaded = () => setLoaded(true);
    // Images that finished before hydration never fire onLoad.
    const checkAlreadyLoaded = (image: HTMLImageElement | null) => {
        if (image?.complete) {
            setLoaded(true);
        }
    };

    const loader = !loaded && (
        <div className="absolute inset-0 grid place-items-center bg-navy">
            <Spinner className="size-8 text-white/60" />
        </div>
    );

    // Banners fill the frame, but once the height cap kicks in on wide screens they are shown whole over the blurred copy instead of being cropped.
    return (
        <div className="relative aspect-[16/9] max-h-[36rem] w-full overflow-hidden bg-navy sm:aspect-[2.56/1]">
            {loader}
            <img
                src={slide.image_url}
                alt=""
                aria-hidden
                loading={eager ? 'eager' : 'lazy'}
                decoding="async"
                className={cn(
                    'absolute inset-0 size-full scale-110 object-cover opacity-60 blur-2xl',
                    !slide.contain && 'hidden xl:block',
                )}
            />
            <img
                ref={checkAlreadyLoaded}
                src={slide.image_url}
                alt={slide.alt ?? slide.title}
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : 'auto'}
                decoding="async"
                onLoad={markLoaded}
                onError={markLoaded}
                className={cn(
                    'relative size-full',
                    slide.contain
                        ? 'object-contain'
                        : 'object-cover xl:object-contain',
                )}
            />
        </div>
    );
}

/**
 * Text slide on a light dotted background, with logos, a headline, a short
 * description, and a large ringed icon on the right.
 */
function ContentSlideView({ slide }: { slide: ContentSlide }) {
    const Icon = slide.icon;

    return (
        <div className="relative flex min-h-[26rem] w-full items-center bg-surface slide-pattern py-10 sm:aspect-[2.56/1] sm:max-h-[36rem] sm:py-0">
            <div className="grid w-full items-center gap-8 px-6 pb-16 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-12 sm:pb-12 lg:px-16">
                <div className="max-w-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/ched-seal-sm.webp"
                            alt=""
                            width={224}
                            height={224}
                            className="size-11 sm:size-14"
                        />
                        <img
                            src="/images/bagong-pilipinas-emblem.webp"
                            alt=""
                            width={224}
                            height={224}
                            className="size-11 sm:size-14"
                        />
                    </div>
                    <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-foreground sm:text-5xl">
                        {slide.title}
                    </h2>
                    <p className="text-base text-foreground/80 sm:text-lg">
                        {slide.description}
                    </p>
                    <Link
                        href={slide.href}
                        className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                        {slide.cta}
                    </Link>
                </div>
                <div className="relative mx-auto hidden size-56 place-items-center sm:grid lg:size-72">
                    <span className="absolute inset-0 rounded-full border-[10px] border-navy" />
                    <span className="absolute -top-3 left-6 size-5 rounded-full bg-navy" />
                    <span className="absolute top-10 -right-6 size-9 rounded-full bg-navy" />
                    <span className="absolute -bottom-4 left-10 size-8 rounded-full bg-navy" />
                    <span className="absolute bottom-12 -left-8 size-6 rounded-full bg-navy" />
                    <span className="absolute -right-2 bottom-4 size-4 rounded-full bg-navy" />
                    <span className="grid size-[82%] place-items-center rounded-full bg-background">
                        <Icon
                            className="size-1/2 text-primary"
                            strokeWidth={1.25}
                            aria-hidden
                        />
                    </span>
                </div>
            </div>
        </div>
    );
}

function ArrowButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="grid size-8 place-items-center rounded-full border border-white/30 hover:bg-white/15"
        >
            {children}
        </button>
    );
}
