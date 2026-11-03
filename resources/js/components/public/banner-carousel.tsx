import { Link } from '@inertiajs/react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { SmartLink } from '@/components/public/smart-link';
import { cn } from '@/lib/utils';
import type { BannerSlide } from '@/types';

export type ContentSlide = {
    id: string;
    title: string;
    description: string;
    href: string;
    cta: string;
    icon: LucideIcon;
};

type Slide =
    | ({ kind: 'image' } & BannerSlide)
    | ({ kind: 'content' } & ContentSlide);

/**
 * Hero carousel in the style of ched.gov.ph: the active slide is centered
 * with its neighbours peeking in dimmed, a caption strip links the current
 * slide, and a pause button sits in the corner. Uploaded banners are shown
 * as images; without banners, built-in content slides are used.
 */
export function BannerCarousel({
    banners,
    fallback,
}: {
    banners: BannerSlide[];
    fallback: ContentSlide[];
}) {
    const slides: Slide[] =
        banners.length > 0
            ? banners.map((banner) => ({ kind: 'image', ...banner }))
            : fallback.map((slide) => ({ kind: 'content', ...slide }));

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
            className="relative overflow-hidden bg-muted"
        >
            <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                    {slides.map((slide, index) => (
                        <div
                            key={`${slide.kind}-${slide.id}`}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${index + 1} of ${slides.length}`}
                            aria-hidden={index !== selected}
                            className="relative min-w-0 shrink-0 grow-0 basis-full xl:basis-[78%]"
                        >
                            {slide.kind === 'image' ? (
                                <img
                                    src={slide.image_url}
                                    alt={slide.alt ?? slide.title}
                                    width={2048}
                                    height={800}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    fetchPriority={
                                        index === 0 ? 'high' : 'auto'
                                    }
                                    decoding="async"
                                    className="aspect-[16/9] w-full object-cover sm:aspect-[2.56/1]"
                                />
                            ) : (
                                <ContentSlideView slide={slide} />
                            )}
                            <div
                                className={cn(
                                    'pointer-events-none absolute inset-0 bg-navy/55 transition-opacity duration-500',
                                    index === selected
                                        ? 'opacity-0'
                                        : 'opacity-100',
                                )}
                                aria-hidden
                            />
                        </div>
                    ))}
                </div>
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
                                    key={`${slide.kind}-${slide.id}`}
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
 * Text slide on a light dotted background, with logos, a headline, a short
 * description, and a large ringed icon on the right.
 */
function ContentSlideView({ slide }: { slide: ContentSlide }) {
    const Icon = slide.icon;

    return (
        <div className="relative flex min-h-[26rem] w-full items-center bg-surface slide-pattern py-10 sm:aspect-[2.56/1] sm:py-0">
            <div className="grid w-full items-center gap-8 px-6 pb-16 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-12 sm:pb-12 lg:px-16">
                <div className="max-w-2xl space-y-4">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/ched-seal.webp"
                            alt=""
                            width={162}
                            height={160}
                            className="size-11 rounded-full sm:size-14"
                        />
                        <img
                            src="/images/bagong-pilipinas.webp"
                            alt=""
                            width={256}
                            height={239}
                            className="h-11 w-auto sm:h-14"
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
