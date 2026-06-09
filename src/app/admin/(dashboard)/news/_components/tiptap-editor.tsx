// src/app/admin/(dashboard)/news/_components/tiptap-editor.tsx
'use client'

import { useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
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
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Peta align label → CSS justify-content ───────────────────
const JUSTIFY: Record<string, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}

// ── Custom Node: ResizableImage ───────────────────────────────
// Bukan extend TiptapImage — Node baru agar full kontrol renderHTML
const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      title: { default: null },
      // '100%' | '75%' | '50%' | '25%'
      width: { default: '100%' },
      // 'left' | 'center' | 'right'
      align: { default: 'left' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="resizable-image"]',
        getAttrs: (el) => {
          const div = el as HTMLElement
          const img = div.querySelector('img')
          return {
            src: img?.getAttribute('src') ?? null,
            alt: img?.getAttribute('alt') ?? '',
            title: img?.getAttribute('title') ?? null,
            width: img?.style.width || '100%',
            align: div.dataset.align || 'left',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, width, align } = HTMLAttributes
    const justify = JUSTIFY[align as string] ?? 'flex-start'

    const wrapperStyle = `display:flex; justify-content:${justify}; width:100%; margin:8px 0;`
    const imgStyle = `width:${width ?? '100%'}; height:auto; border-radius:8px; display:block;`

    return [
      'div',
      {
        style: wrapperStyle,
        'data-type': 'resizable-image',
        'data-align': align ?? 'left',
      },
      ['img', mergeAttributes({ src, alt, title }, { style: imgStyle })],
    ]
  },
})

// ──────────────────────────────────────────────────────────────

interface Props {
  value: string
  onChange: (value: string) => void
}

const IMAGE_SIZES = [
  { label: '100%', value: '100%' },
  { label: '75%', value: '75%' },
  { label: '50%', value: '50%' },
  { label: '25%', value: '25%' },
] as const

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Kiri' },
  { value: 'center', label: 'Tengah' },
  { value: 'right', label: 'Kanan' },
] as const

type AlignVal = 'left' | 'center' | 'right'
type SizeVal = '100%' | '75%' | '50%' | '25%'

export function TiptapEditor({ value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)
  const [selAlign, setSelAlign] = useState<AlignVal>('left')
  const [selSize, setSelSize] = useState<SizeVal>('100%')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Tulis konten di sini...' }),
      CharacterCount,
      ResizableImage,
      Link.configure({ openOnClick: false, autolink: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
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

  function handleImageSelected(url: string) {
    if (!url) return
    setPendingUrl(url)
    setSelAlign('left')
    setSelSize('100%')
    setShowPicker(false)
  }

  // Sisipkan node ResizableImage ke editor
  const doInsert = useCallback(() => {
    if (!editor || !pendingUrl) return
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'resizableImage',
        attrs: { src: pendingUrl, width: selSize, align: selAlign },
      })
      .run()
    setPendingUrl(null)
  }, [editor, pendingUrl, selSize, selAlign])

  if (!editor) return null

  type ToolItem = {
    icon: React.FC<{ className?: string }>
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
      group: 'align',
      items: [
        {
          icon: AlignLeft,
          action: () => editor.chain().focus().setTextAlign('left').run(),
          active: editor.isActive({ textAlign: 'left' }),
          title: 'Rata Kiri',
        },
        {
          icon: AlignCenter,
          action: () => editor.chain().focus().setTextAlign('center').run(),
          active: editor.isActive({ textAlign: 'center' }),
          title: 'Rata Tengah',
        },
        {
          icon: AlignRight,
          action: () => editor.chain().focus().setTextAlign('right').run(),
          active: editor.isActive({ textAlign: 'right' }),
          title: 'Rata Kanan',
        },
        {
          icon: AlignJustify,
          action: () => editor.chain().focus().setTextAlign('justify').run(),
          active: editor.isActive({ textAlign: 'justify' }),
          title: 'Rata Kanan-Kiri',
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
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Insert Gambar"
          onClick={() => setShowPicker(true)}
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Area editor */}
      <EditorContent editor={editor} className="bg-background" />

      {/* Character count */}
      <div className="border-border bg-muted/40 border-t px-4 py-1.5 text-right">
        <span className="text-muted-foreground text-xs">
          {editor.storage.characterCount.characters()} karakter ·{' '}
          {editor.storage.characterCount.words()} kata
        </span>
      </div>

      {/* Media picker */}
      <MediaPicker
        open={showPicker}
        onOpenChange={setShowPicker}
        value=""
        onChange={handleImageSelected}
        imageOnly
      />

      {/* ── Modal konfigurasi gambar ── */}
      {pendingUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setPendingUrl(null)}
        >
          <div
            className="w-80 overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
              <p className="text-navy-800 text-sm font-semibold">Pengaturan Gambar</p>
            </div>

            <div className="space-y-5 p-5">
              {/* Preview live */}
              <div
                className="flex min-h-[80px] overflow-hidden rounded-xl bg-slate-100 p-2"
                style={{ justifyContent: JUSTIFY[selAlign] }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingUrl}
                  alt="preview"
                  style={{
                    width: selSize,
                    height: 'auto',
                    maxHeight: 120,
                    borderRadius: 6,
                    display: 'block',
                  }}
                />
              </div>

              {/* Posisi */}
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  Posisi
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {ALIGN_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelAlign(value)}
                      className={cn(
                        'rounded-xl border py-2.5 text-xs font-semibold transition',
                        selAlign === value
                          ? 'border-orange-400 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ukuran */}
              <div>
                <p className="mb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  Ukuran
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {IMAGE_SIZES.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelSize(value)}
                      className={cn(
                        'rounded-xl border py-2.5 text-xs font-semibold transition',
                        selSize === value
                          ? 'border-orange-400 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPendingUrl(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={doInsert}
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Sisipkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
