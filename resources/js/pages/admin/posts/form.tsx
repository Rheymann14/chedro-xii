import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    ExternalLink,
    ImagePlus,
    Trash2,
    Undo2,
} from 'lucide-react';
import { useState } from 'react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { FormField } from '@/components/admin/form-field';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Combobox } from '@/components/combobox';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import posts from '@/routes/admin/posts';
import type { PostImage } from '@/types';

type EditablePost = {
    id: number;
    type: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string | null;
    position: string | null;
    published_at: string | null;
    closing_at: string | null;
    youtube_url: string | null;
    video_url: string | null;
    images: PostImage[];
    status: 'published' | 'scheduled' | 'draft';
    public_url: string;
};

type Props = {
    post: EditablePost | null;
    defaultType: string;
    types: { value: string; label: string }[];
};

export default function PostForm({ post, defaultType, types }: Props) {
    const [type, setType] = useState(post?.type ?? defaultType);
    const formKey = post
        ? `${post.id}-${post.images.map((image) => image.id).join('.')}-${post.video_url ?? ''}`
        : 'new';

    return (
        <>
            <Head title={post ? 'Edit post' : 'New post'} />
            <AdminPage
                title={post ? 'Edit post' : 'New post'}
                description={
                    post
                        ? `Status: ${post.status}`
                        : 'Leave the publish date empty to save as a draft.'
                }
                actions={
                    post && (
                        <>
                            {post.status !== 'draft' && (
                                <Button variant="outline" asChild>
                                    <a
                                        href={post.public_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="size-4" />
                                        {post.status === 'published'
                                            ? 'View'
                                            : 'Preview'}
                                    </a>
                                </Button>
                            )}
                            <ConfirmDelete
                                form={posts.destroy.form(post.id)}
                                title="Delete this post?"
                                description="The post and all its images and video will be permanently deleted."
                                trigger={
                                    <Button variant="outline">
                                        <Trash2 className="size-4 text-destructive" />
                                        Delete
                                    </Button>
                                }
                            />
                        </>
                    )
                }
            >
                <Form
                    key={formKey}
                    {...(post
                        ? posts.update.form(post.id)
                        : posts.store.form())}
                    options={{ preserveScroll: true }}
                    className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
                >
                    {({ errors, processing, progress }) => (
                        <>
                            <div className="space-y-6">
                                <FormField
                                    label="Title"
                                    htmlFor="title"
                                    error={errors.title}
                                    required
                                >
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={post?.title}
                                        required
                                        maxLength={255}
                                    />
                                </FormField>

                                {type === 'career' && (
                                    <FormField
                                        label="Position title"
                                        htmlFor="position"
                                        error={errors.position}
                                    >
                                        <Input
                                            id="position"
                                            name="position"
                                            defaultValue={post?.position ?? ''}
                                            placeholder="e.g. Education Supervisor II"
                                            maxLength={255}
                                        />
                                    </FormField>
                                )}

                                <FormField
                                    label="Body"
                                    htmlFor="body"
                                    error={errors.body}
                                >
                                    <RichTextEditor
                                        id="body"
                                        name="body"
                                        defaultValue={post?.body}
                                        invalid={Boolean(errors.body)}
                                    />
                                </FormField>

                                <FormField
                                    label="Summary"
                                    htmlFor="excerpt"
                                    error={errors.excerpt}
                                    hint="Shown on cards and in search results. Leave empty to use the beginning of the body."
                                >
                                    <Textarea
                                        id="excerpt"
                                        name="excerpt"
                                        rows={3}
                                        maxLength={500}
                                        defaultValue={post?.excerpt ?? ''}
                                    />
                                </FormField>

                                <ImageManager
                                    images={post?.images ?? []}
                                    errors={errors}
                                />

                                <section className="space-y-4 rounded-xl border p-4">
                                    <h2 className="font-semibold">Video</h2>
                                    <FormField
                                        label="YouTube link"
                                        htmlFor="youtube_url"
                                        error={errors.youtube_url}
                                    >
                                        <Input
                                            id="youtube_url"
                                            name="youtube_url"
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=…"
                                            defaultValue={
                                                post?.youtube_url ?? ''
                                            }
                                        />
                                    </FormField>
                                    <FormField
                                        label="Or upload a video"
                                        htmlFor="video"
                                        error={errors.video}
                                        hint="MP4 or WebM, up to 100 MB. YouTube is recommended for long videos."
                                    >
                                        <Input
                                            id="video"
                                            name="video"
                                            type="file"
                                            accept="video/mp4,video/webm"
                                        />
                                    </FormField>
                                    {post?.video_url && (
                                        <div className="space-y-2">
                                            <video
                                                src={post.video_url}
                                                controls
                                                preload="metadata"
                                                className="max-h-64 rounded-md border bg-black"
                                            />
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="hidden"
                                                    name="remove_video"
                                                    value="0"
                                                />
                                                <input
                                                    type="checkbox"
                                                    name="remove_video"
                                                    value="1"
                                                    className="size-4 accent-destructive"
                                                />
                                                Remove the current video
                                            </label>
                                        </div>
                                    )}
                                </section>
                            </div>

                            <aside className="space-y-6">
                                <section className="space-y-4 rounded-xl border p-4">
                                    <h2 className="font-semibold">
                                        Publishing
                                    </h2>
                                    <FormField
                                        label="Type"
                                        htmlFor="type"
                                        error={errors.type}
                                        required
                                    >
                                        <Combobox
                                            id="type"
                                            name="type"
                                            value={type}
                                            onValueChange={setType}
                                            options={types}
                                            searchPlaceholder="Search types…"
                                        />
                                    </FormField>
                                    <FormField
                                        label="Publish date"
                                        htmlFor="published_at"
                                        error={errors.published_at}
                                        hint="Empty = draft. A future date schedules the post."
                                    >
                                        <Input
                                            id="published_at"
                                            name="published_at"
                                            type="datetime-local"
                                            defaultValue={
                                                post?.published_at ?? ''
                                            }
                                        />
                                    </FormField>
                                    {type === 'career' && (
                                        <FormField
                                            label="Application deadline"
                                            htmlFor="closing_at"
                                            error={errors.closing_at}
                                        >
                                            <Input
                                                id="closing_at"
                                                name="closing_at"
                                                type="datetime-local"
                                                defaultValue={
                                                    post?.closing_at ?? ''
                                                }
                                            />
                                        </FormField>
                                    )}
                                </section>

                                <div className="sticky bottom-4 space-y-3 rounded-xl border bg-card p-4 shadow-sm">
                                    {progress && (
                                        <progress
                                            value={progress.percentage}
                                            max={100}
                                            className="h-2 w-full accent-primary"
                                        >
                                            {progress.percentage}%
                                        </progress>
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="flex-1"
                                        >
                                            {processing && <Spinner />}
                                            {post
                                                ? 'Save changes'
                                                : 'Create post'}
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href={posts.index()}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </aside>
                        </>
                    )}
                </Form>
            </AdminPage>
        </>
    );
}

function ImageManager({
    images,
    errors,
}: {
    images: PostImage[];
    errors: Record<string, string>;
}) {
    const [order, setOrder] = useState(images);
    const [removed, setRemoved] = useState<number[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const move = (index: number, offset: number) => {
        const next = [...order];
        const target = index + offset;

        if (target < 0 || target >= next.length) {
            return;
        }

        [next[index], next[target]] = [next[target], next[index]];
        setOrder(next);
    };

    const toggleRemoved = (id: number) =>
        setRemoved((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id],
        );

    const imageErrors = Object.entries(errors)
        .filter(([key]) => key === 'images' || key.startsWith('images.'))
        .map(([, message]) => message);

    return (
        <section className="space-y-4 rounded-xl border p-4">
            <div>
                <h2 className="font-semibold">Images</h2>
                <p className="text-xs text-muted-foreground">
                    The first image is used as the cover. JPG, PNG, or WebP up
                    to 5 MB each, 10 images at most per upload.
                </p>
            </div>

            {order.length > 0 && (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {order.map((image, index) => {
                        const isRemoved = removed.includes(image.id);

                        return (
                            <li
                                key={image.id}
                                className={cn(
                                    'overflow-hidden rounded-lg border bg-muted',
                                    isRemoved && 'opacity-40',
                                )}
                            >
                                <div className="relative aspect-video">
                                    <img
                                        src={image.url}
                                        alt={image.alt ?? ''}
                                        loading="lazy"
                                        className="size-full object-cover"
                                    />
                                    {index === 0 && !isRemoved && (
                                        <Badge className="absolute top-1 left-1">
                                            Cover
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center justify-between bg-card p-1">
                                    <div className="flex">
                                        <IconButton
                                            label="Move left"
                                            onClick={() => move(index, -1)}
                                            disabled={index === 0}
                                        >
                                            <ArrowLeft className="size-4" />
                                        </IconButton>
                                        <IconButton
                                            label="Move right"
                                            onClick={() => move(index, 1)}
                                            disabled={
                                                index === order.length - 1
                                            }
                                        >
                                            <ArrowRight className="size-4" />
                                        </IconButton>
                                    </div>
                                    <IconButton
                                        label={
                                            isRemoved
                                                ? 'Keep image'
                                                : 'Remove image'
                                        }
                                        onClick={() => toggleRemoved(image.id)}
                                    >
                                        {isRemoved ? (
                                            <Undo2 className="size-4" />
                                        ) : (
                                            <Trash2 className="size-4 text-destructive" />
                                        )}
                                    </IconButton>
                                </div>
                                <input
                                    type="hidden"
                                    name="image_order[]"
                                    value={image.id}
                                />
                                {isRemoved && (
                                    <input
                                        type="hidden"
                                        name="removed_images[]"
                                        value={image.id}
                                    />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            <label
                htmlFor="images"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground hover:border-primary/50 hover:bg-accent/40"
            >
                <ImagePlus className="size-6" aria-hidden />
                <span>
                    <span className="font-medium text-primary">
                        Choose images
                    </span>{' '}
                    to add to this post
                </span>
                <input
                    id="images"
                    name="images[]"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                        previews.forEach((url) => URL.revokeObjectURL(url));
                        setPreviews(
                            Array.from(event.target.files ?? []).map((file) =>
                                URL.createObjectURL(file),
                            ),
                        );
                    }}
                />
            </label>

            {previews.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                        {previews.length} new image
                        {previews.length === 1 ? '' : 's'} will be uploaded when
                        you save:
                    </p>
                    <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {previews.map((url) => (
                            <li
                                key={url}
                                className="aspect-square overflow-hidden rounded-md border"
                            >
                                <img
                                    src={url}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {imageErrors.map((message) => (
                <InputError key={message} message={message} />
            ))}
        </section>
    );
}

function IconButton({
    label,
    onClick,
    disabled = false,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className="grid size-8 place-items-center rounded hover:bg-accent disabled:opacity-30"
        >
            {children}
        </button>
    );
}

PostForm.layout = {
    breadcrumbs: [{ title: 'Posts', href: posts.index() }],
};
