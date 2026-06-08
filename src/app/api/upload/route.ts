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

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

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

// Extension dari MIME type
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
        {
          error: `Ukuran file maksimal ${isImage ? '5MB' : '20MB'}`,
        },
        { status: 400 }
      )
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    let filename: string
    let mimeType = file.type
    let width: number | undefined
    let height: number | undefined

    if (isImage) {
      // Gambar: konversi ke WebP + optimasi
      filename = `${nanoid(12)}.webp`
      const filepath = path.join(UPLOAD_DIR, filename)
      const image = sharp(buffer)
      const meta = await image.metadata()
      width = meta.width
      height = meta.height

      await image
        .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(filepath)

      mimeType = 'image/webp'
    } else {
      // Dokumen: simpan langsung tanpa konversi
      const ext = MIME_TO_EXT[file.type] ?? 'bin'
      filename = `${nanoid(12)}.${ext}`
      const filepath = path.join(UPLOAD_DIR, filename)
      await fs.writeFile(filepath, buffer)
    }

    const filepath = path.join(UPLOAD_DIR, filename)
    const stat = await fs.stat(filepath)
    const url = `/uploads/${filename}`

    // Simpan ke DB — select by url karena MariaDB tidak support $returningId
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
    console.error('[UPLOAD ERROR]', error)
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })

    const [item] = await db.select().from(media).where(eq(media.id, id))
    if (!item) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 404 })

    const filepath = path.join(process.cwd(), 'public', item.url)
    await fs.unlink(filepath).catch(() => {})
    await db.delete(media).where(eq(media.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE ERROR]', error)
    return NextResponse.json({ error: 'Gagal menghapus file' }, { status: 500 })
  }
}
