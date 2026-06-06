// src/app/admin/(dashboard)/news/_components/tiptap-editor.tsx
'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { MediaPicker } from '@/app/admin/(dashboard)/media/_components/media-picker'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function TiptapEditor({ value, onChange }: Props) {
  const [showImagePicker, setShowImagePicker] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Tulis konten di sini...' }),
      CharacterCount,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[320px] px-4 py-3 focus:outline-none',
      },
    },
    immediatelyRender: false,
  })

  if (!editor) return null

  function handleInsertImage(url: string) {
    if (!url) return
    editor?.chain().focus().setImage({ src: url }).run()
    setShowImagePicker(false)
  }

  type ToolItem = {
    icon: React.FC<any>
    action: () => void
    active?: boolean
    disabled?: boolean
    title: string
  }

  const tools: { group: string; items: ToolItem[] }[] = [
    {
      group: 'history',
      items: [
        {
          icon: Undo,
          action: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
          title: 'Undo',
        },
        {
          icon: Redo,
          action: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
          title: 'Redo',
        },
      ],
    },
    {
      group: 'format',
      items: [
        {
          icon: Heading2,
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          active: editor.isActive('heading', { level: 2 }),
          title: 'Heading 2',
        },
        {
          icon: Heading3,
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          active: editor.isActive('heading', { level: 3 }),
          title: 'Heading 3',
        },
        {
          icon: Bold,
          action: () => editor.chain().focus().toggleBold().run(),
          active: editor.isActive('bold'),
          title: 'Bold',
        },
        {
          icon: Italic,
          action: () => editor.chain().focus().toggleItalic().run(),
          active: editor.isActive('italic'),
          title: 'Italic',
        },
        {
          icon: Strikethrough,
          action: () => editor.chain().focus().toggleStrike().run(),
          active: editor.isActive('strike'),
          title: 'Strikethrough',
        },
        {
          icon: Code,
          action: () => editor.chain().focus().toggleCode().run(),
          active: editor.isActive('code'),
          title: 'Code',
        },
      ],
    },
    {
      group: 'list',
      items: [
        {
          icon: List,
          action: () => editor.chain().focus().toggleBulletList().run(),
          active: editor.isActive('bulletList'),
          title: 'Bullet List',
        },
        {
          icon: ListOrdered,
          action: () => editor.chain().focus().toggleOrderedList().run(),
          active: editor.isActive('orderedList'),
          title: 'Ordered List',
        },
        {
          icon: Quote,
          action: () => editor.chain().focus().toggleBlockquote().run(),
          active: editor.isActive('blockquote'),
          title: 'Blockquote',
        },
      ],
    },
    {
      group: 'media',
      items: [
        {
          icon: ImageIcon,
          action: () => setShowImagePicker(true),
          title: 'Insert Gambar',
        },
      ],
    },
  ]

  return (
    <div className="border-border overflow-hidden rounded-lg border">
      {/* Toolbar */}
      <div className="border-border bg-muted/40 flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5">
        {tools.map((group, gi) => (
          <div key={group.group} className="flex items-center gap-0.5">
            {gi > 0 && <Separator orientation="vertical" className="mx-1 h-5" />}
            {group.items.map(({ icon: Icon, action, active, disabled, title }) => (
              <Button
                key={title}
                type="button"
                variant="ghost"
                size="icon-sm"
                title={title}
                disabled={disabled}
                onClick={action}
                className={cn(active && 'bg-background text-navy-700 shadow-sm')}
              >
                <Icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} className="bg-background" />

      {/* Character count */}
      <div className="border-border bg-muted/40 border-t px-4 py-1.5 text-right">
        <span className="text-muted-foreground text-xs">
          {editor.storage.characterCount.characters()} karakter ·{' '}
          {editor.storage.characterCount.words()} kata
        </span>
      </div>

      {/* Media picker modal untuk insert gambar */}
      <MediaPicker
        open={showImagePicker}
        onOpenChange={setShowImagePicker}
        value=""
        onChange={handleInsertImage}
        imageOnly
      />
    </div>
  )
}
