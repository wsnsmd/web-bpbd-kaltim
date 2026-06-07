// src/components/ui/file-upload-input.tsx
'use client'

import { useRef, useState } from 'react'
import { Upload, X, FileText, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  value?: string
  fileSize?: string
  onChange: (url: string, size: string, type: string, originalName: string) => void
  accept?: string
  label?: string
}

const MIME_TO_LABEL: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/zip': 'ZIP',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadInput({ value, fileSize, onChange, accept, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [filename, setFilename] = useState<string>('')

  async function handleFile(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success) {
        const sizeStr = formatBytes(json.media.size)
        const typeStr = MIME_TO_LABEL[file.type] ?? file.type.split('/')[1].toUpperCase()
        setFilename(file.name)
        onChange(json.media.url, sizeStr, typeStr, file.name)
        toast.success('File berhasil diupload')
      } else {
        toast.error(json.error ?? 'Gagal upload')
      }
    } catch {
      toast.error('Gagal upload file')
    } finally {
      setUploading(false)
    }
  }

  function handleClear() {
    onChange('', '', '', '')
    setFilename('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept ?? 'application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip'}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {value ? (
        <div className="border-border overflow-hidden rounded-lg border bg-slate-50">
          {/* Baris nama file — truncate ketat */}
          <div className="flex items-center gap-2 px-3 py-2.5">
            <FileText className="text-navy-600 h-4 w-4 shrink-0" />
            <div className="flex-1 overflow-hidden">
              <p className="text-navy-800 w-full truncate text-sm font-medium">
                {filename || value.split('/').pop()}
              </p>
              {fileSize && <p className="text-muted-foreground text-xs">{fileSize}</p>}
            </div>
          </div>
          {/* Baris aksi — lebar penuh, tidak bisa keluar */}
          <div className="border-border flex items-center border-t bg-white px-2 py-1">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-600 inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-slate-100"
            >
              <ExternalLink className="h-3 w-3" /> Lihat
            </a>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-navy-600 inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-slate-100 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" /> Mengupload...
                </>
              ) : (
                <>
                  <Upload className="h-3 w-3" /> Ganti
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
            >
              <X className="h-3 w-3" /> Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-6 transition-colors',
            uploading
              ? 'border-orange-300 bg-orange-50'
              : 'border-border hover:border-navy-300 hover:bg-slate-50'
          )}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          ) : (
            <Upload className="text-muted-foreground h-6 w-6" />
          )}
          <p className="text-navy-700 mt-2 text-sm font-medium">
            {uploading ? 'Mengupload...' : (label ?? 'Klik untuk upload file')}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            PDF, DOCX, XLSX, PPT, ZIP — maks. 20MB
          </p>
        </div>
      )}
    </div>
  )
}
