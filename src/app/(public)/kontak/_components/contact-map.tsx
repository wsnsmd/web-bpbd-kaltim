// src/app/(public)/kontak/_components/contact-map.tsx
'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Props {
  token: string
  latitude: number
  longitude: number
  zoom: number
  popupName: string
  popupAddress: string
}

export function ContactMap({ token, latitude, longitude, zoom, popupName, popupAddress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !token) return

    mapboxgl.accessToken = token

    const coords: [number, number] = [longitude, latitude]

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: coords,
      zoom,
    })

    mapRef.current = map

    // Custom marker
    const el = document.createElement('div')
    el.style.cssText = `
      width: 40px; height: 40px; border-radius: 50%;
      background: #e85000; border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    `
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`

    const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, maxWidth: '240px' })
      .setHTML(`
        <div style="padding:8px 4px">
          <p style="font-weight:700;font-size:13px;color:#0a1628;margin:0 0 4px">${popupName}</p>
          <p style="font-size:11px;color:#6b7592;margin:0">${popupAddress}</p>
        </div>
      `)

    new mapboxgl.Marker({ element: el }).setLngLat(coords).setPopup(popup).addTo(map)

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.FullscreenControl())

    map.on('load', () => popup.addTo(map).setLngLat(coords))

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [token, latitude, longitude, zoom])

  if (!token) {
    return (
      <div className="flex h-80 w-full items-center justify-center bg-slate-100 text-sm text-slate-400">
        Mapbox token belum dikonfigurasi di Pengaturan → Kontak & Sosial
      </div>
    )
  }

  return <div ref={containerRef} className="h-80 w-full" />
}
