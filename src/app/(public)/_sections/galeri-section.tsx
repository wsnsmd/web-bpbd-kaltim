// src/app/(public)/_sections/galeri-section.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Expand, Play, ArrowRight, Camera, Film, X } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { cn } from '@/lib/utils'

interface GalleryItem {
  id: number
  type: 'photo' | 'video'
  title: string
  caption: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
}

interface Props {
  photos: GalleryItem[]
  videos: GalleryItem[]
}

function toEmbedUrl(url: string | null) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`
  return url
}

// Ambil thumbnail YouTube otomatis dari URL
function getYoutubeThumbnail(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
  return null
}

export function GaleriSection({ photos, videos }: Props) {
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryItem | null>(null)
  const [lightboxVideo, setLightboxVideo] = useState<GalleryItem | null>(null)

  return (
    <section className="bg-background border-border border-b py-20">
      <div className="container-content max-w-content mx-auto">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-orange-600 uppercase">
              <span className="h-0.5 w-5 rounded-full bg-orange-500" />
              Dokumentasi Visual
            </div>
            <h2 className="text-foreground text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold tracking-tight">
              Galeri & Dokumentasi
            </h2>
          </div>
          <Button
            variant="link"
            asChild
            className="text-navy-600 hidden text-xs font-semibold sm:flex"
          >
            <Link href="/galeri">
              Lihat Semua <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="foto" className="w-full">
          <TabsList className="border-border mb-8 h-auto w-fit gap-1 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="foto"
              className="data-[state=active]:border-navy-700 data-[state=active]:bg-navy-50 data-[state=active]:text-navy-700 rounded-t-lg text-[13px] font-semibold text-(--color-faint) data-[state=active]:border-b-2"
            >
              <Camera className="mr-2 h-4 w-4" /> Foto Kegiatan
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:border-navy-700 data-[state=active]:bg-navy-50 data-[state=active]:text-navy-700 rounded-t-lg text-[13px] font-semibold text-(--color-faint) data-[state=active]:border-b-2"
            >
              <Film className="mr-2 h-4 w-4" /> Video Terbaru
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foto">
            {photos.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">Belum ada foto.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {photos.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => setLightboxPhoto(item)}
                    className="group relative aspect-16/10 cursor-pointer overflow-hidden rounded-lg border-none bg-slate-100"
                  >
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Camera className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div className="bg-navy-900/50 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <Expand className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute right-0 bottom-0 left-0 translate-y-full bg-linear-to-t from-black/80 to-transparent p-3 text-[10px] text-white transition-transform group-hover:translate-y-0">
                      {item.caption || item.title}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="video">
            {videos.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">Belum ada video.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {videos.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => setLightboxVideo(item)}
                    className="group relative aspect-16/10 cursor-pointer overflow-hidden rounded-lg border-none bg-slate-100"
                  >
                    {/* Auto-thumbnail: manual → YouTube → fallback icon */}
                    {item.thumbnailUrl || getYoutubeThumbnail(item.videoUrl) ? (
                      <Image
                        src={item.thumbnailUrl || getYoutubeThumbnail(item.videoUrl)!}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="bg-navy-100 flex h-full items-center justify-center">
                        <Film className="text-navy-400 h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-orange-500">
                        <Play className="ml-1 h-5 w-5 text-white" />
                      </div>
                      <p className="px-3 text-center text-[10px] font-medium text-white drop-shadow">
                        {item.title}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Lightbox Foto */}
      <Dialog open={!!lightboxPhoto} onOpenChange={(o) => !o && setLightboxPhoto(null)}>
        <DialogContent
          className={cn(
            'bg-navy-900/60 border-none shadow-none',
            'max-w-[90vw] sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[90vw]'
          )}
          showCloseButton={false}
        >
          <VisuallyHidden.Root>
            <DialogTitle>{lightboxPhoto?.title ?? 'Foto'}</DialogTitle>
          </VisuallyHidden.Root>
          <div className="relative flex flex-col items-center">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            {lightboxPhoto?.thumbnailUrl && (
              <div className="w-full overflow-hidden rounded-lg shadow-2xl">
                <Image
                  src={lightboxPhoto.thumbnailUrl}
                  alt={lightboxPhoto.title}
                  width={1920}
                  height={1080}
                  className="h-auto max-h-[80vh] w-full bg-black object-contain"
                  priority
                />
              </div>
            )}
            {(lightboxPhoto?.caption || lightboxPhoto?.title) && (
              <div className="mt-3 w-full rounded-lg bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-center text-sm font-medium text-white">
                  {lightboxPhoto.caption || lightboxPhoto.title}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Video */}
      <Dialog open={!!lightboxVideo} onOpenChange={(o) => !o && setLightboxVideo(null)}>
        <DialogContent
          className={cn(
            'bg-navy-900/60 border-none shadow-none',
            'max-w-[90vw] sm:max-w-[90vw] md:max-w-[90vw] lg:max-w-[90vw]'
          )}
          showCloseButton={false}
        >
          <VisuallyHidden.Root>
            <DialogTitle>{lightboxVideo?.title ?? 'Video'}</DialogTitle>
          </VisuallyHidden.Root>
          <div className="relative flex flex-col items-center">
            {/* Tombol tutup */}
            <button
              onClick={() => setLightboxVideo(null)}
              className="absolute -top-12 right-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
            {/* Video */}
            <div
              className="w-full overflow-hidden rounded-lg bg-black shadow-2xl"
              style={{ aspectRatio: '16/9' }}
            >
              {lightboxVideo?.videoUrl ? (
                <iframe
                  src={toEmbedUrl(lightboxVideo.videoUrl) ?? ''}
                  title={lightboxVideo?.title ?? 'Video'}
                  allow="autoplay; fullscreen"
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">URL video tidak tersedia</p>
                </div>
              )}
            </div>
            {/* Caption */}
            {lightboxVideo?.title && (
              <div className="mt-3 w-full rounded-lg bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-center text-sm font-medium text-white">{lightboxVideo.title}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
