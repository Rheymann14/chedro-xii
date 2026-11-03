import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { Editor } from '@tiptap/react';
import type { LucideIcon } from 'lucide-react';
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    Link2,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    Underline,
    Undo2,
    Unlink,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Rich-text editor for post and page bodies. The HTML is submitted through
 * a hidden input named `name`, and sanitized again on the server.
 */
export function RichTextEditor({
    name,
    defaultValue,
    id,
    invalid = false,
}: {
    name: string;
    defaultValue?: string | null;
    id?: string;
    invalid?: boolean;
}) {
    const [html, setHtml] = useState(defaultValue ?? '');

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                code: false,
                codeBlock: false,
                link: {
                    openOnClick: false,
                    autolink: true,
                    defaultProtocol: 'https',
                    HTMLAttributes: { rel: 'noopener noreferrer' },
                },
            }),
        ],
        content: defaultValue ?? '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                ...(id ? { id } : {}),
                class: 'prose-content min-h-64 px-4 py-3 outline-none',
                'aria-multiline': 'true',
                role: 'textbox',
            },
        },
        onUpdate: ({ editor: current }) => {
            setHtml(current.isEmpty ? '' : current.getHTML());
        },
    });

    return (
        <div
            className={cn(
                'overflow-hidden rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                invalid && 'border-destructive',
            )}
        >
            {editor && <Toolbar editor={editor} />}
            <EditorContent editor={editor} />
            <input type="hidden" name={name} value={html} />
        </div>
    );
}

function Toolbar({ editor }: { editor: Editor }) {
    const state = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            bold: current.isActive('bold'),
            italic: current.isActive('italic'),
            underline: current.isActive('underline'),
            h2: current.isActive('heading', { level: 2 }),
            h3: current.isActive('heading', { level: 3 }),
            bulletList: current.isActive('bulletList'),
            orderedList: current.isActive('orderedList'),
            blockquote: current.isActive('blockquote'),
            link: current.isActive('link'),
            canUndo: current.can().undo(),
            canRedo: current.can().redo(),
        }),
    });

    const setLink = () => {
        const previous = editor.getAttributes('link').href as
            | string
            | undefined;
        const url = window.prompt(
            'Link URL (https://…)',
            previous ?? 'https://',
        );

        if (url === null) {
            return;
        }

        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url.trim(), target: '_blank' })
            .run();
    };

    const chain = () => editor.chain().focus();

    return (
        <div
            role="toolbar"
            aria-label="Formatting"
            className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 p-1"
        >
            <ToolbarButton
                icon={Bold}
                label="Bold"
                active={state.bold}
                onClick={() => chain().toggleBold().run()}
            />
            <ToolbarButton
                icon={Italic}
                label="Italic"
                active={state.italic}
                onClick={() => chain().toggleItalic().run()}
            />
            <ToolbarButton
                icon={Underline}
                label="Underline"
                active={state.underline}
                onClick={() => chain().toggleUnderline().run()}
            />
            <Divider />
            <ToolbarButton
                icon={Heading2}
                label="Heading"
                active={state.h2}
                onClick={() => chain().toggleHeading({ level: 2 }).run()}
            />
            <ToolbarButton
                icon={Heading3}
                label="Subheading"
                active={state.h3}
                onClick={() => chain().toggleHeading({ level: 3 }).run()}
            />
            <Divider />
            <ToolbarButton
                icon={List}
                label="Bulleted list"
                active={state.bulletList}
                onClick={() => chain().toggleBulletList().run()}
            />
            <ToolbarButton
                icon={ListOrdered}
                label="Numbered list"
                active={state.orderedList}
                onClick={() => chain().toggleOrderedList().run()}
            />
            <ToolbarButton
                icon={Quote}
                label="Quote"
                active={state.blockquote}
                onClick={() => chain().toggleBlockquote().run()}
            />
            <ToolbarButton
                icon={Minus}
                label="Divider line"
                onClick={() => chain().setHorizontalRule().run()}
            />
            <Divider />
            <ToolbarButton
                icon={Link2}
                label="Add link"
                active={state.link}
                onClick={setLink}
            />
            {state.link && (
                <ToolbarButton
                    icon={Unlink}
                    label="Remove link"
                    onClick={() => chain().unsetLink().run()}
                />
            )}
            <div className="ml-auto flex gap-0.5">
                <ToolbarButton
                    icon={Undo2}
                    label="Undo"
                    disabled={!state.canUndo}
                    onClick={() => chain().undo().run()}
                />
                <ToolbarButton
                    icon={Redo2}
                    label="Redo"
                    disabled={!state.canRedo}
                    onClick={() => chain().redo().run()}
                />
            </div>
        </div>
    );
}

function ToolbarButton({
    icon: Icon,
    label,
    active = false,
    disabled = false,
    onClick,
}: {
    icon: LucideIcon;
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={cn(
                'grid size-8 place-items-center rounded hover:bg-accent disabled:opacity-40',
                active && 'bg-primary/10 text-primary',
            )}
        >
            <Icon className="size-4" aria-hidden />
        </button>
    );
}

function Divider() {
    return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}
