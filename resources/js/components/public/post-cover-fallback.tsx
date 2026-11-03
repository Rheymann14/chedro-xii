/**
 * Stands in for the cover of a post without images: the CHED seal centered
 * on a soft background, filling whatever frame the caller gives it.
 */
export function PostCoverFallback() {
    return (
        <div className="relative size-full bg-accent">
            <img
                src="/images/ched-seal-sm.webp"
                alt=""
                width={224}
                height={224}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 m-auto aspect-square h-3/5 w-auto opacity-90 transition-transform duration-300 group-hover:scale-105"
            />
        </div>
    );
}
