import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback } from 'react';

interface TiptapEditorProps {
    content: JSONContent | string;
    onChange: (content: JSONContent) => void;
    placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: TiptapEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'editor-link',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Start writing your content...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
            },
        },
    });

    const addImage = useCallback(() => {
        const url = window.prompt('Enter image URL:');
        if (url && editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    const setLink = useCallback(() => {
        const url = window.prompt('Enter URL:');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="tiptap-editor">
            {/* Toolbar */}
            <div className="editor-toolbar">
                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'is-active' : ''}
                        title="Bold"
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'is-active' : ''}
                        title="Italic"
                    >
                        <em>I</em>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={editor.isActive('strike') ? 'is-active' : ''}
                        title="Strikethrough"
                    >
                        <s>S</s>
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                        title="Heading 1"
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                        title="Heading 2"
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                        title="Heading 3"
                    >
                        H3
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'is-active' : ''}
                        title="Bullet List"
                    >
                        • List
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'is-active' : ''}
                        title="Numbered List"
                    >
                        1. List
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={editor.isActive('codeBlock') ? 'is-active' : ''}
                        title="Code Block"
                    >
                        {'</>'}
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button type="button" onClick={setLink} title="Add Link">
                        🔗 Link
                    </button>
                    <button type="button" onClick={addImage} title="Add Image">
                        🖼️ Image
                    </button>
                </div>

                <div className="toolbar-divider" />

                <div className="toolbar-group">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo"
                    >
                        ↶ Undo
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo"
                    >
                        ↷ Redo
                    </button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="editor-content">
                <EditorContent editor={editor} />
            </div>

            <style jsx>{`
        .tiptap-editor {
          border: 2px solid var(--color-primary);
          border-radius: 8px;
          overflow: hidden;
          background: white;
        }

        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px;
          background: #fafafa;
          border-bottom: 2px solid var(--color-primary);
        }

        .toolbar-group {
          display: flex;
          gap: 4px;
        }

        .toolbar-divider {
          width: 1px;
          background: #ddd;
          margin: 0 4px;
        }

        .editor-toolbar button {
          padding: 6px 12px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 14px;
          transition: all 0.2s;
        }

        .editor-toolbar button:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: var(--color-text);
        }

        .editor-toolbar button.is-active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: var(--color-text);
          font-weight: bold;
        }

        .editor-toolbar button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .editor-content {
          padding: 20px;
          min-height: 400px;
          max-height: 600px;
          overflow-y: auto;
        }

        .editor-content :global(.ProseMirror) {
          outline: none;
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.6;
          color: var(--color-primary);
        }

        .editor-content :global(.ProseMirror p.is-editor-empty:first-child::before) {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .editor-content :global(.ProseMirror h1) {
          font-family: var(--font-heading);
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .editor-content :global(.ProseMirror h2) {
          font-family: var(--font-heading);
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .editor-content :global(.ProseMirror h3) {
          font-family: var(--font-heading);
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .editor-content :global(.ProseMirror img) {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1em 0;
        }

        .editor-content :global(.ProseMirror iframe) {
          max-width: 100%;
          margin: 1em 0;
          border-radius: 4px;
        }

        .editor-content :global(.ProseMirror a) {
          color: var(--color-primary);
          text-decoration: underline;
        }

        .editor-content :global(.ProseMirror pre) {
          background: #f5f5f5;
          padding: 1em;
          border-radius: 4px;
          overflow-x: auto;
          font-family: 'Courier New', monospace;
        }

        .editor-content :global(.ProseMirror code) {
          background: #f5f5f5;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }

        .editor-content :global(.ProseMirror ul),
        .editor-content :global(.ProseMirror ol) {
          padding-left: 2em;
          margin: 0.5em 0;
        }

        .editor-content :global(.ProseMirror li) {
          margin: 0.25em 0;
        }
      `}</style>
        </div>
    );
}
