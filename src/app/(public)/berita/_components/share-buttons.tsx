// src/app/(public)/berita/[slug]/_components/share-buttons.tsx
'use client'

import { useState } from 'react'
import { Link2, Share2, Check } from 'lucide-react'
import { SiFacebook, SiX, SiWhatsapp } from 'react-icons/si'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  url: string
}

export function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const platforms = [
    {
      label: 'Facebook',
      icon: SiFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      style: 'hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2]',
    },
    {
      label: 'X',
      icon: SiX,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      style: 'hover:bg-black hover:text-white hover:border-black',
    },
    {
      label: 'WhatsApp',
      icon: SiWhatsapp,
      href: `https://wa.me/?text=${encodedTitle}%20${encoded}`,
      style: 'hover:bg-[#25d366] hover:text-white hover:border-[#25d366]',
    },
  ]

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground mr-1 flex items-center gap-1.5 text-xs font-semibold">
        <Share2 className="h-3.5 w-3.5" /> Bagikan:
      </span>

      {platforms.map((p) => (
        <a
          key={p.label}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Bagikan ke ${p.label}`}
          className={cn(
            'border-border flex items-center gap-1.5 rounded-lg border px-3 py-1.5',
            'text-muted-foreground text-xs font-medium transition-all duration-200',
            p.style
          )}
        >
          <p.icon className="h-3.5 w-3.5" />
          {p.label}
        </a>
      ))}

      <button
        onClick={handleCopy}
        title="Salin link"
        className={cn(
          'flex items-center gap-1.5 rounded-lg border px-3 py-1.5',
          'text-xs font-medium transition-all duration-200',
          copied
            ? 'border-green-500 bg-green-50 text-green-600'
            : 'border-border text-muted-foreground hover:border-slate-400 hover:bg-slate-50'
        )}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" /> Disalin!
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" /> Salin Link
          </>
        )}
      </button>
    </div>
  )
}
