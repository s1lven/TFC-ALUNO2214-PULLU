'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Code,
  Quote
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [, setForceUpdate] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      setForceUpdate(prev => prev + 1); // Force toolbar update
    },
    onSelectionUpdate: ({ editor }) => {
      // Update toolbar when cursor moves
      setForceUpdate(prev => prev + 1);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none text-gray-900',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (editor) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  }, [editor, imageUrl]);

  // Update link URL when cursor moves to a link
  useEffect(() => {
    if (editor && editor.isActive('link')) {
      const { href } = editor.getAttributes('link');
      if (href && href !== linkUrl) {
        setLinkUrl(href);
      }
    }
  }, [editor, editor?.state.selection]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 flex-wrap">
        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('underline') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Underline"
        >
          <UnderlineIcon size={18} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Text Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Align Right"
        >
          <AlignRight size={18} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Additional Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('codeBlock') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Code Block"
        >
          <Code size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
          }`}
          type="button"
          title="Blockquote"
        >
          <Quote size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link */}
        <div className="relative">
          <button
            onClick={() => {
              if (editor.isActive('link')) {
                removeLink();
              } else {
                setShowLinkInput(!showLinkInput);
              }
            }}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('link') ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
            }`}
            type="button"
            title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
          >
            <LinkIcon size={18} />
          </button>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 w-64">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLink();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={addLink}
                  className="flex-1 bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700"
                  type="button"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded hover:bg-gray-300"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <button
            onClick={() => setShowImageInput(!showImageInput)}
            className={`p-2 rounded hover:bg-gray-200 transition-colors ${
              showImageInput ? 'bg-gray-300 text-gray-900' : 'text-gray-600'
            }`}
            type="button"
            title="Add Image"
          >
            <ImageIcon size={18} />
          </button>
          {showImageInput && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-10 w-64">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={addImage}
                  className="flex-1 bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700"
                  type="button"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowImageInput(false);
                    setImageUrl('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded hover:bg-gray-300"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          type="button"
          title="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          type="button"
          title="Redo"
        >
          <Redo size={18} />
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white text-gray-900 max-h-[400px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      
      <style jsx global>{`
        .ProseMirror {
          min-height: 200px;
          padding: 1rem;
          line-height: 1.6;
          color: #111827;
        }
        .ProseMirror:focus {
          outline: none;
        }
        
        /* Paragraphs */
        .ProseMirror p {
          margin: 0 0 1em 0;
          line-height: 1.6;
        }
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        /* Headings - Make them visually distinct */
        .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1.5rem 0 1rem 0;
          color: #111827;
          letter-spacing: -0.025em;
        }
        .ProseMirror h1:first-child {
          margin-top: 0;
        }
        .ProseMirror h2 {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 1.25rem 0 0.75rem 0;
          color: #111827;
          letter-spacing: -0.025em;
        }
        .ProseMirror h2:first-child {
          margin-top: 0;
        }
        .ProseMirror h3 {
          font-size: 1.375rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem 0;
          color: #111827;
        }
        .ProseMirror h3:first-child {
          margin-top: 0;
        }
        
        /* Lists */
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1em 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1em 0;
        }
        .ProseMirror li {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        .ProseMirror li p {
          margin: 0.25em 0;
        }
        
        /* Nested lists */
        .ProseMirror ul ul,
        .ProseMirror ol ul {
          list-style-type: circle;
          margin: 0.25em 0;
        }
        .ProseMirror ol ol,
        .ProseMirror ul ol {
          list-style-type: lower-alpha;
          margin: 0.25em 0;
        }
        
        /* Text formatting */
        .ProseMirror strong {
          font-weight: 700;
          color: #111827;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
        
        /* Links */
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
          transition: color 0.2s;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        /* Images */
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          display: block;
        }
        
        /* Code */
        .ProseMirror code {
          background-color: #f3f4f6;
          color: #e11d48;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        
        /* Code blocks */
        .ProseMirror pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          line-height: 1.5;
        }
        .ProseMirror pre code {
          background-color: transparent;
          color: #f3f4f6;
          padding: 0;
          font-size: 0.875rem;
        }
        
        /* Blockquotes */
        .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .ProseMirror blockquote p {
          margin: 0.5em 0;
        }
        
        /* Horizontal rule */
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2rem 0;
        }
        
        /* Selection */
        .ProseMirror::selection {
          background-color: #bfdbfe;
        }
        
        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
