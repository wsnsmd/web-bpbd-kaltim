// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { media } from '@db/schema'
import { eq } from 'drizzle-orm'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import { nanoid } from 'nanoid'

// PERBAIKAN 1: Deteksi mode produksi/standalone dan arahkan ke path absolut VPS Anda
// Ganti path absolut di bawah dengan lokasi root proyek Anda di VPS
const isProd = process.env.NODE_ENV === 'production'
const BASE_DIR = isProd ? '/var/www/web-bpbd-kaltim' : process.cwd()
const UPLOAD_DIR = path.join(BASE_DIR, 'public', 'uploads')

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
]
const ALLOWED_TYPES = [...IMAGE_TYPES, ...DOCUMENT_TYPES]

const IMAGE_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const DOCUMENT_MAX_SIZE = 20 * 1024 * 1024 // 20MB

const MIME_TO_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Format tidak didukung. Gunakan JPG, PNG, WebP, GIF, PDF, DOCX, XLSX, PPT, atau ZIP',
        },
        { status: 400 }
      )
    }

    const isImage = IMAGE_TYPES.includes(file.type)
    const maxSize = isImage ? IMAGE_MAX_SIZE : DOCUMENT_MAX_SIZE

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Ukuran file maksimal ${isImage ? '5MB' : '20MB'}` },
        { status: 400 }
      )
    }

    // Pastikan direktori ada
    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // PERBAIKAN 2: Pastikan buffer tidak kosong karena koneksi terputus
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Data file rusak atau kosong' }, { status: 400 })
    }

    let filename: string
    let mimeType = file.type
    let width: number | undefined
    let height: number | undefined

    if (isImage) {
      filename = `${nanoid(12)}.webp`
      const filepath = path.join(UPLOAD_DIR, filename)
      const image = sharp(buffer)

      // PERBAIKAN 3: Amankan pembacaan metadata
      try {
        const meta = await image.metadata()
        width = meta.width
        height = meta.height
      } catch (metaError) {
        console.warn('[SHARP META WARNING] Gagal membaca metadata, mengabaikan dimensi.', metaError)
      }

      await image
        .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath)

      mimeType = 'image/webp'
    } else {
      const ext = MIME_TO_EXT[file.type] ?? 'bin'
      filename = `${nanoid(12)}.${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)
      await fs.writeFile(filepath, buffer)
    }

    const filepath = path.join(UPLOAD_DIR, filename)
    const stat = await fs.stat(filepath)
    const url = `/uploads/${filename}`

    await db.insert(media).values({
      filename,
      originalName: file.name,
      mimeType,
      size: stat.size,
      width: width ?? null,
      height: height ?? null,
      url,
      uploadedBy: session.user.id,
    })

    const [saved] = await db.select().from(media).where(eq(media.url, url))

    return NextResponse.json({ success: true, media: saved })
  } catch (error) {
    // Tampilkan error spesifik di PM2 logs untuk kemudahan debug di VPS
    console.error('[UPLOAD ERROR DETAILED]', error)
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 })
  }
}
