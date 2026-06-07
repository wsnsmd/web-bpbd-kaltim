// src/app/(public)/galeri/[albumId]/_components/galeri-album-client.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Camera, Film, Play, Expand, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  displayThumb: string | null
}

interface Props {
  albumType: string
  photos: GalleryItem[]
  videos: GalleryItem[]
}

interface GridProps {
  items: GalleryItem[]
  onPhotoClick?: (item: GalleryItem) => void
  onVideoClick?: (item: GalleryItem) => void
}

function toEmbedUrl(url: string | null) {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url
}

// PhotoGrid component - moved outside
function PhotoGrid({ items, onPhotoClick }: GridProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">Belum ada foto.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onPhotoClick?.(item)}
          className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-slate-100"
        >
          {item.displayThumb ? (
            <Image
              src={item.displayThumb}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Camera className="h-8 w-8 text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Expand className="h-6 w-6 text-white" />
          </div>
          {item.caption && (
            <div className="absolute right-0 bottom-0 left-0 translate-y-full bg-linear-to-t from-black/80 to-transparent p-3 text-[10px] text-white transition-transform group-hover:translate-y-0">
              {item.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// VideoGrid component - moved outside
function VideoGrid({ items, onVideoClick }: GridProps) {
  if (items.length === 0) {
    return <p className="text-muted-foreground py-12 text-center text-sm">Belum ada video.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onVideoClick?.(item)}
          className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl bg-slate-100"
        >
          {item.displayThumb ? (
            <Image
              src={item.displayThumb}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="bg-navy-50 flex h-full items-center justify-center">
              <Film className="text-navy-200 h-10 w-10" />
            </div>
          )}
          {/* Overlay play */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/30 transition-colors group-hover:bg-black/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 transition-all group-hover:bg-orange-500 group-hover:ring-orange-400">
              <Play className="ml-1 h-6 w-6 text-white" />
            </div>
            <p className="line-clamp-2 px-4 text-center text-xs font-semibold text-white drop-shadow">
              {item.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function GaleriAlbumClient({ albumType, photos, videos }: Props) {
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryItem | null>(null)
  const [lightboxVideo, setLightboxVideo] = useState<GalleryItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number>(0)

  function openPhoto(item: GalleryItem) {
    const idx = photos.findIndex((p) => p.id === item.id)
    setLightboxIndex(idx)
    setLightboxPhoto(item)
  }

  function goPrev() {
    const idx = (lightboxIndex - 1 + photos.length) % photos.length
    setLightboxIndex(idx)
    setLightboxPhoto(photos[idx])
  }

  function goNext() {
    const idx = (lightboxIndex + 1) % photos.length
    setLightboxIndex(idx)
    setLightboxPhoto(photos[idx])
  }

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxPhoto) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'Escape') setLightboxPhoto(null)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxPhoto])

  const hasPhotos = photos.length > 0

  const isMixed = albumType === 'mixed'

  return (
    <>
      {/* Konten — tabs jika mixed, langsung grid jika bukan */}
      {isMixed ? (
        <Tabs defaultValue={hasPhotos ? 'foto' : 'video'}>
          <TabsList className="border-border mb-8 h-auto w-fit gap-1 rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="foto"
              className="data-[state=active]:border-navy-700 data-[state=active]:bg-navy-50 data-[state=active]:text-navy-700 rounded-t-lg text-[13px] font-semibold data-[state=active]:border-b-2"
            >
              <Camera className="mr-2 h-4 w-4" /> Foto ({photos.length})
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:border-navy-700 data-[state=active]:bg-navy-50 data-[state=active]:text-navy-700 rounded-t-lg text-[13px] font-semibold data-[state=active]:border-b-2"
            >
              <Film className="mr-2 h-4 w-4" /> Video ({videos.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="foto">
            <PhotoGrid items={photos} onPhotoClick={openPhoto} />
          </TabsContent>
          <TabsContent value="video">
            <VideoGrid items={videos} onVideoClick={setLightboxVideo} />
          </TabsContent>
        </Tabs>
      ) : albumType === 'video' ? (
        <VideoGrid items={videos} onVideoClick={setLightboxVideo} />
      ) : (
        <PhotoGrid items={photos} onPhotoClick={openPhoto} />
      )}

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
            {/* Bar atas: counter kiri + tombol X kanan */}
            <div className="mb-3 flex w-full items-center justify-between">
              {photos.length > 1 ? (
                <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-white">{lightboxIndex + 1}</span>
                  <span className="text-xs text-white/50">/</span>
                  <span className="text-xs text-white/70">{photos.length}</span>
                </div>
              ) : (
                <div />
              )}
              <button
                onClick={() => setLightboxPhoto(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Gambar dengan prev/next overlay */}
            <div className="relative w-full">
              {lightboxPhoto?.displayThumb && (
                <div className="w-full overflow-hidden rounded-2xl shadow-2xl">
                  <Image
                    src={lightboxPhoto.displayThumb}
                    alt={lightboxPhoto.title}
                    width={1920}
                    height={1080}
                    className="h-auto max-h-[80vh] w-full bg-black object-contain"
                    priority
                  />
                </div>
              )}

              {/* Prev button */}
              {photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Next button */}
              {photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Caption */}
            {(lightboxPhoto?.caption || lightboxPhoto?.title) && (
              <div className="mt-3 w-full rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-center text-sm font-medium text-white">
                  {lightboxPhoto.caption || lightboxPhoto.title}
                </p>
              </div>
            )}

            {/* Dot indicators */}
            {photos.length > 1 && photos.length <= 20 && (
              <div className="mt-3 flex items-center gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setLightboxIndex(i)
                      setLightboxPhoto(photos[i])
                    }}
                    className={`h-1.5 rounded-full transition-all ${i === lightboxIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
                  />
                ))}
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
            <div className="mb-3 flex w-full justify-end">
              <button
                onClick={() => setLightboxVideo(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              className="w-full overflow-hidden rounded-2xl bg-black shadow-2xl"
              style={{ aspectRatio: '16/9' }}
            >
              {lightboxVideo?.videoUrl ? (
                <iframe
                  src={toEmbedUrl(lightboxVideo.videoUrl) ?? ''}
                  title={lightboxVideo.title}
                  allow="autoplay; fullscreen"
                  className="h-full w-full"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-400">URL video tidak tersedia</p>
                </div>
              )}
            </div>
            {lightboxVideo?.title && (
              <div className="mt-3 w-full rounded-xl bg-white/10 px-5 py-3 backdrop-blur-sm">
                <p className="text-center text-sm font-medium text-white">{lightboxVideo.title}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
