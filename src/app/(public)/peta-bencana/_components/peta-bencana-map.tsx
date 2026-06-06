// src/app/(public)/peta-bencana/_components/peta-bencana-map.tsx
'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface IncidentPoint {
  id: number
  title: string
  typeName: string
  typeIcon: string
  typeColor: string
  source: string | null
  occurredDate: string | null
  regencyName: string | null
  districtId: string | null
  villageName: string | null
  latitude: number
  longitude: number
  status: string
  currentCondition: string | null
}

interface Props {
  token: string
  centerLat: number
  centerLng: number
  incidents: IncidentPoint[]
}

const STATUS_COLOR = {
  aktif: '#e85000',
  ditangani: '#c98b00',
  selesai: '#22c55e',
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function PusdalopsMap({ token, centerLat, centerLng, incidents }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !token) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [centerLng, centerLat],
      zoom: 7.5,
    })

    mapRef.current = map

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.FullscreenControl())

    map.on('load', () => {
      incidents.forEach((incident) => {
        const statusColor = STATUS_COLOR[incident.status as keyof typeof STATUS_COLOR] ?? '#6b7592'
        const isActive = incident.status === 'aktif'

        // Custom marker
        const el = document.createElement('div')
        el.style.cssText = `
          width: 38px; height: 38px; border-radius: 50%;
          background: ${statusColor}; border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer; position: relative;
        `
        el.innerHTML = incident.typeIcon ?? '⚠️'
        el.title = incident.title

        // Pulse ring untuk kejadian aktif
        if (isActive) {
          const pulse = document.createElement('div')
          pulse.style.cssText = `
            position: absolute; inset: -6px; border-radius: 50%;
            border: 2px solid ${statusColor}; opacity: 0.5;
            animation: pulse-ring 2s ease-out infinite;
          `
          el.appendChild(pulse)

          if (!document.getElementById('pusdalops-pulse-style')) {
            const style = document.createElement('style')
            style.id = 'pusdalops-pulse-style'
            style.innerHTML = `
              @keyframes pulse-ring {
                0% { transform: scale(1); opacity: 0.5; }
                100% { transform: scale(1.8); opacity: 0; }
              }
            `
            document.head.appendChild(style)
          }
        }

        // Lokasi string
        const lokasi = [incident.villageName, incident.districtId, incident.regencyName]
          .filter(Boolean)
          .join(', ')

        const statusLabel =
          { aktif: 'Aktif', ditangani: 'Ditangani', selesai: 'Selesai' }[incident.status] ??
          incident.status
        const statusBg =
          { aktif: '#fef2f2', ditangani: '#fffbeb', selesai: '#f0fdf4' }[incident.status] ??
          '#f8fafc'
        const statusText =
          { aktif: '#b91c1c', ditangani: '#92400e', selesai: '#166534' }[incident.status] ??
          '#374151'

        const popup = new mapboxgl.Popup({
          offset: 20,
          closeButton: true,
          maxWidth: '280px',
        }).setHTML(`
          <div style="font-family:system-ui,sans-serif;padding:4px 0">
            <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
              <span style="font-size:22px;line-height:1">${incident.typeIcon}</span>
              <div style="flex:1;min-width:0">
                <p style="font-weight:700;font-size:13px;color:#0a1628;margin:0 0 4px;line-height:1.3">
                  ${incident.title}
                </p>
                <div style="display:flex;flex-wrap:wrap;gap:4px">
                  <span style="display:inline-flex;align-items:center;gap:3px;background:${statusBg};color:${statusText};border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700">
                    ${statusLabel}
                  </span>
                  <span style="background:#f1f5f9;color:#475569;border-radius:999px;padding:2px 8px;font-size:10px;font-weight:600">
                    ${incident.typeName}
                  </span>
                </div>
              </div>
            </div>
            ${lokasi ? `<p style="font-size:11px;color:#64748b;margin:3px 0;display:flex;align-items:center;gap:4px">📍 ${lokasi}</p>` : ''}
            <p style="font-size:11px;color:#64748b;margin:3px 0">🗓️ ${formatDate(incident.occurredDate)}</p>
            ${incident.source ? `<p style="font-size:11px;color:#64748b;margin:3px 0">📡 ${incident.source}</p>` : ''}
            ${incident.currentCondition ? `<p style="font-size:11px;color:#64748b;margin-top:6px;padding-top:6px;border-top:1px solid #f1f5f9;font-style:italic">${incident.currentCondition}</p>` : ''}
          </div>
        `)

        new mapboxgl.Marker({ element: el })
          .setLngLat([incident.longitude, incident.latitude])
          .setPopup(popup)
          .addTo(map)
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [token, centerLat, centerLng, incidents])

  if (!token) {
    return (
      <div className="flex h-125 w-full items-center justify-center bg-slate-100 text-center">
        <div>
          <p className="text-sm font-medium text-slate-500">Peta tidak tersedia</p>
          <p className="mt-1 text-xs text-slate-400">
            Mapbox token belum dikonfigurasi.
            <br />
            Admin → Pengaturan → Kontak & Sosial
          </p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className="h-125 w-full" />
}
