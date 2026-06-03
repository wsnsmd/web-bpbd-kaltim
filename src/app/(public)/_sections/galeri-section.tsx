// src/app/(public)/_sections/galeri-section.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Expand, Play, ArrowRight, Camera, Film } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
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

// Konversi YouTube URL ke embed URL
function toEmbedUrl(url: string | null) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1`
  return url
}

export function GaleriSection({ photos, videos }: Props) {
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryItem | null>(null)
  const [lightboxVideo, setLightboxVideo] = useState<GalleryItem | null>(null)

  return (
    <section className="bg-background border-border border-b py-20">
      <div className="container-content max-w-content mx-auto">
        {/* Header */}
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

          {/* ── Foto ── */}
          <TabsContent value="foto">
            {photos.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">Belum ada foto.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {photos.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => setLightboxPhoto(item)}
                    className="group relative aspect-16/10 cursor-pointer overflow-hidden rounded-xl border-none bg-slate-100"
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

          {/* ── Video ── */}
          <TabsContent value="video">
            {videos.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">Belum ada video.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {videos.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => setLightboxVideo(item)}
                    className="group relative aspect-16/10 cursor-pointer overflow-hidden rounded-xl border-none bg-slate-100"
                  >
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
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
        <DialogContent className="max-w-3xl overflow-hidden p-0" showCloseButton>
          {lightboxPhoto?.thumbnailUrl && (
            <div className="relative aspect-video w-full">
              <Image
                src={lightboxPhoto.thumbnailUrl}
                alt={lightboxPhoto.title}
                fill
                className="object-contain"
              />
            </div>
          )}
          {(lightboxPhoto?.caption || lightboxPhoto?.title) && (
            <div className="text-muted-foreground px-6 py-3 text-sm">
              {lightboxPhoto.caption || lightboxPhoto.title}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox Video */}
      <Dialog open={!!lightboxVideo} onOpenChange={(o) => !o && setLightboxVideo(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0" showCloseButton>
          {lightboxVideo?.videoUrl ? (
            <div className="relative aspect-video w-full">
              <iframe
                src={toEmbedUrl(lightboxVideo.videoUrl) ?? ''}
                title={lightboxVideo.title}
                allow="autoplay; fullscreen"
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="bg-navy-900 flex aspect-video items-center justify-center">
              <p className="text-navy-400 text-sm">URL video tidak tersedia</p>
            </div>
          )}
          {lightboxVideo?.title && (
            <div className="text-muted-foreground px-6 py-3 text-sm">{lightboxVideo.title}</div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
