// src/app/admin/(dashboard)/media/_components/media-grid.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Upload,
  Trash2,
  Copy,
  Check,
  Loader2,
  ImageIcon,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: number
  filename: string
  originalName: string
  url: string
  size: number
  width: number | null
  height: number | null
  mimeType: string
  createdAt: Date | null
}

interface Props {
  initialItems: MediaItem[]
  onSelect?: (url: string) => void
  mode?: 'library' | 'picker'
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageType(mimeType: string) {
  return mimeType.startsWith('image/')
}

function DocIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  if (mimeType === 'application/pdf') return <FileText className={cn(className, 'text-red-500')} />
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return <FileSpreadsheet className={cn(className, 'text-green-600')} />
  if (mimeType.includes('zip')) return <FileArchive className={cn(className, 'text-yellow-600')} />
  return <File className={cn(className, 'text-navy-500')} />
}

function FileTypeBadge({ mimeType }: { mimeType: string }) {
  const map: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
    'application/zip': 'ZIP',
  }
  const label = map[mimeType]
  if (!label) return null
  return (
    <Badge className="absolute top-2 left-2 border-0 bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
      {label}
    </Badge>
  )
}

export function MediaGrid({ initialItems, onSelect, mode = 'library' }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState(initialItems)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files)
      if (!fileArr.length) return

      setUploading(true)
      let successCount = 0

      for (const file of fileArr) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (json.success) {
          setItems((prev) => [json.media, ...prev])
          successCount++
        } else toast.error(`${file.name}: ${json.error}`)
      }

      if (successCount > 0) {
        toast.success(`${successCount} file berhasil diupload`)
        router.refresh()
      }
      setUploading(false)
    },
    [router]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      uploadFiles(e.dataTransfer.files)
    },
    [uploadFiles]
  )

  async function copyUrl(item: MediaItem) {
    await navigator.clipboard.writeText(item.url)
    setCopied(item.id)
    setTimeout(() => setCopied(null), 2000)
    toast.success('URL disalin')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget.id }),
    })
    const json = await res.json()
    setDeleting(false)
    if (json.success) {
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('File dihapus')
      router.refresh()
    } else {
      toast.error(json.error ?? 'Gagal menghapus')
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
          isDragging
            ? 'border-orange-500 bg-orange-50'
            : 'border-border hover:border-navy-300 hover:bg-slate-50'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        ) : (
          <Upload className="text-muted-foreground h-8 w-8" />
        )}
        <p className="text-navy-700 mt-2 text-sm font-medium">
          {uploading ? 'Mengupload...' : 'Klik atau seret file ke sini'}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Gambar (JPG, PNG, WebP) maks. 5MB · Dokumen (PDF, DOCX, XLSX, PPT, ZIP) maks. 20MB
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{items.length} file tersimpan</p>
      </div>

      {items.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center py-16">
          <ImageIcon className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-sm">Belum ada file. Upload gambar atau dokumen pertama Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => {
            const isImg = isImageType(item.mimeType)
            return (
              <Card
                key={item.id}
                className={cn(
                  'group cursor-pointer gap-0 overflow-hidden p-0 transition-all hover:-translate-y-0.5 hover:shadow-md',
                  mode === 'picker' && 'hover:ring-2 hover:ring-orange-500'
                )}
                onClick={() => mode === 'picker' && onSelect?.(item.url)}
              >
                <div className="relative aspect-square bg-slate-100">
                  {isImg ? (
                    <Image
                      src={item.url}
                      alt={item.originalName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 16vw"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
                      <DocIcon mimeType={item.mimeType} className="h-10 w-10" />
                    </div>
                  )}
                  <FileTypeBadge mimeType={item.mimeType} />

                  {mode === 'library' && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyUrl(item)
                        }}
                        title="Salin URL"
                      >
                        {copied === item.id ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTarget(item)
                        }}
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <CardContent className="p-2">
                  <p className="text-navy-800 truncate text-xs font-medium">{item.originalName}</p>
                  <p className="text-muted-foreground text-[11px]">{formatBytes(item.size)}</p>
                  {isImg && item.width && item.height && (
                    <p className="text-muted-foreground text-[11px]">
                      {item.width}×{item.height}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus File</DialogTitle>
            <DialogDescription>
              File{' '}
              <span className="text-foreground font-semibold">"{deleteTarget?.originalName}"</span>{' '}
              akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
