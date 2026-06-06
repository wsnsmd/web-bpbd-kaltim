// src/app/(public)/_sections/map-preview.tsx
'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin } from 'lucide-react'

interface IncidentPoint {
  id: number
  title: string
  typeIcon: string
  typeColor: string
  status: string
  latitude: number
  longitude: number
}

interface Props {
  token: string
  centerLat: number
  centerLng: number
  incidents: IncidentPoint[]
  totalAktif: number
  totalDitangani: number
  year: number
}

const STATUS_COLOR = {
  aktif: '#e85000',
  ditangani: '#c98b00',
}

export function MapPreview({
  token,
  centerLat,
  centerLng,
  incidents,
  totalAktif,
  totalDitangani,
  year,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map())

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !token) return

    mapboxgl.accessToken = token

    // Inject pulse style
    if (!document.getElementById('map-preview-pulse')) {
      const s = document.createElement('style')
      s.id = 'map-preview-pulse'
      s.innerHTML = `@keyframes mp-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}`
      document.head.appendChild(s)
    }

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [centerLng, centerLat],
      zoom: 6.5,
      projection: 'mercator',
      interactive: true,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      // GeoJSON source
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: incidents.map((i) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [i.longitude, i.latitude] },
          properties: { id: i.id },
        })),
      }

      map.addSource('preview-incidents', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      })

      // Cluster circle
      map.addLayer({
        id: 'preview-clusters',
        type: 'circle',
        source: 'preview-incidents',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#e85000', 5, '#c98b00', 20, '#1b56a8'],
          'circle-radius': ['step', ['get', 'point_count'], 18, 5, 25, 20, 32],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      })

      // Cluster label
      map.addLayer({
        id: 'preview-cluster-count',
        type: 'symbol',
        source: 'preview-incidents',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // Invisible layer untuk deteksi unclustered
      map.addLayer({
        id: 'preview-unclustered',
        type: 'circle',
        source: 'preview-incidents',
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 0, 'circle-opacity': 0 },
      })

      // Buat marker untuk setiap titik (default hidden)
      incidents.forEach((incident) => {
        const color = STATUS_COLOR[incident.status as keyof typeof STATUS_COLOR] ?? '#6b7592'
        const isAktif = incident.status === 'aktif'

        // Wrapper luar — posisi dikendalikan Mapbox
        const el = document.createElement('div')
        el.dataset.id = String(incident.id)
        el.style.display = 'none'

        // Inner — visual marker
        const inner = document.createElement('div')
        inner.style.cssText = `
          width:32px;height:32px;border-radius:50%;
          background:${color};border:2.5px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.28);
          display:flex;align-items:center;justify-content:center;
          font-size:13px;position:relative;
        `
        inner.innerHTML = incident.typeIcon

        // Pulse ring untuk aktif
        if (isAktif) {
          const ring = document.createElement('div')
          ring.style.cssText = `
            position:absolute;inset:-7px;border-radius:50%;
            border:2px solid ${color};opacity:.6;
            animation:mp-pulse 2s ease-out infinite;
          `
          inner.appendChild(ring)
        }

        el.appendChild(inner)
        el.title = incident.title

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([incident.longitude, incident.latitude])
          .addTo(map)

        markersRef.current.set(incident.id, marker)
      })

      // Sinkronisasi marker vs cluster — sama persis dengan peta-bencana-client
      map.on('render', () => {
        if (!map.isStyleLoaded() || !map.getSource('preview-incidents')) return

        // Sembunyikan semua
        markersRef.current.forEach((marker) => {
          marker.getElement().style.display = 'none'
        })

        // Tampilkan hanya yang unclustered
        map.queryRenderedFeatures({ layers: ['preview-unclustered'] }).forEach((feature) => {
          const id = feature.properties?.id
          if (id !== undefined) {
            const marker = markersRef.current.get(Number(id))
            if (marker) marker.getElement().style.display = 'block'
          }
        })
      })

      // Klik cluster → zoom in
      map.on('click', 'preview-clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['preview-clusters'] })
        const clusterId = features[0]?.properties?.cluster_id
        if (!clusterId) return
        ;(map.getSource('preview-incidents') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err) return
            const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number]
            map.easeTo({ center: coords, zoom: (zoom ?? 12) + 0.5 })
          }
        )
      })

      map.on('mouseenter', 'preview-clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'preview-clusters', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [token])

  if (!token) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-(--navy-900)">
        <svg
          className="absolute inset-0 h-full w-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="mapgrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapgrid)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <MapPin className="h-8 w-8 text-white/40" />
          <p className="text-sm text-white/50">Peta belum dikonfigurasi</p>
          <p className="text-xs text-white/30">Admin → Pengaturan → Mapbox Token</p>
        </div>
        <StatsOverlay totalAktif={totalAktif} totalDitangani={totalDitangani} year={year} />
      </div>
    )
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl ring-1 ring-black/10">
      <div ref={containerRef} className="h-full w-full" />
      <StatsOverlay totalAktif={totalAktif} totalDitangani={totalDitangani} year={year} />
      <Link
        href="/peta-bencana"
        className="absolute inset-0 flex items-end justify-end p-4 opacity-0 transition-opacity hover:opacity-100"
      >
        <div className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm">
          <MapPin className="h-4 w-4 text-orange-600" />
          <span className="text-navy-800 text-sm font-bold">Buka Peta Interaktif</span>
        </div>
      </Link>
    </div>
  )
}

function StatsOverlay({
  totalAktif,
  totalDitangani,
  year,
}: {
  totalAktif: number
  totalDitangani: number
  year: number
}) {
  return (
    <>
      <div className="pointer-events-none absolute top-3 right-3 flex items-center rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 text-[10px] text-white/80 backdrop-blur-md">
        <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
        Live — {year}
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 flex gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <span className="text-[11px] font-bold text-white">{totalAktif} Aktif</span>
        </div>
        {totalDitangani > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/60 px-2.5 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-bold text-white">{totalDitangani} Ditangani</span>
          </div>
        )}
      </div>
    </>
  )
}
