import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Clock, Facebook, Link2 } from 'lucide-react';
import { ImageGallery } from '@/components/public/image-gallery';
import { PageHeader } from '@/components/public/page-header';
import { PostCard } from '@/components/public/post-card';
import { SafeHtml } from '@/components/public/safe-html';
import { SectionHeading } from '@/components/public/section-heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { formatDate, isClosed } from '@/lib/format';
import type { PostDetail, PostSummary } from '@/types';

type Props = {
    post: PostDetail;
    related: PostSummary[];
    listing: { label: string; url: string };
    isPreview: boolean;
};

export default function PostShow({ post, related, listing, isPreview }: Props) {
    const [copiedText, copy] = useClipboard();
    const shareUrl = typeof window === 'undefined' ? '' : window.location.href;
    const description = post.excerpt ?? post.title;

    return (
        <>
            <Head title={post.title}>
                <meta name="description" content={description} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={description} />
                {post.cover && (
                    <meta property="og:image" content={post.cover.url} />
                )}
            </Head>

            <PageHeader
                title={post.title}
                breadcrumbs={[
                    { title: listing.label, href: listing.url },
                    { title: post.title, href: '#' },
                ]}
            >
                <Badge className="w-fit bg-gold text-gold-foreground hover:bg-gold">
                    {post.type_label}
                </Badge>
            </PageHeader>

            <div className="container-page grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <article className="min-w-0 space-y-6">
                    {isPreview && (
                        <Alert>
                            <AlertDescription>
                                Preview — this post is not yet published and is
                                only visible to staff.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        {post.published_at && (
                            <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="size-4" aria-hidden />
                                <time dateTime={post.published_at}>
                                    {formatDate(post.published_at)}
                                </time>
                            </span>
                        )}
                        {post.closing_at && (
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="size-4" aria-hidden />
                                {isClosed(post.closing_at)
                                    ? `Closed on ${formatDate(post.closing_at)}`
                                    : `Applications until ${formatDate(post.closing_at)}`}
                            </span>
                        )}
                    </div>

                    {post.position && (
                        <p className="text-lg font-semibold text-brand dark:text-primary">
                            Position: {post.position}
                        </p>
                    )}

                    <ImageGallery images={post.images} title={post.title} />

                    <SafeHtml html={post.body} />

                    {post.youtube_id && (
                        <div className="aspect-video overflow-hidden rounded-lg border">
                            <iframe
                                src={`https://www.youtube-nocookie.com/embed/${post.youtube_id}`}
                                title={`${post.title} video`}
                                loading="lazy"
                                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="size-full"
                            />
                        </div>
                    )}

                    {post.video_url && (
                        <video
                            src={post.video_url}
                            controls
                            preload="metadata"
                            className="w-full rounded-lg border bg-black"
                        />
                    )}

                    <div className="flex flex-wrap items-center gap-2 border-t pt-6">
                        <span className="text-sm font-medium">Share:</span>
                        <Button variant="outline" size="sm" asChild>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Facebook className="size-4" aria-hidden />
                                Facebook
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void copy(shareUrl)}
                        >
                            <Link2 className="size-4" aria-hidden />
                            {copiedText ? 'Link copied' : 'Copy link'}
                        </Button>
                    </div>

                    <Link
                        href={listing.url}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        Back to {listing.label}
                    </Link>
                </article>

                {related.length > 0 && (
                    <aside aria-label={`More ${listing.label}`}>
                        <SectionHeading title="More posts" />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            {related.map((item) => (
                                <PostCard key={item.id} post={item} />
                            ))}
                        </div>
                    </aside>
                )}
            </div>
        </>
    );
}
