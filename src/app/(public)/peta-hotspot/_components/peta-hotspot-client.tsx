// src/app/(public)/peta-hotspot/_components/peta-hotspot-client.tsx

'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Flame, RefreshCw, MapPin, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HotspotPoint {
  provinsi: string
  kabkota: string
  kecamatan: string
  desa: string
  tanggal: string
  waktu: string
  satelit: string
  confidence: string
  latitude: number
  longitude: number
}

interface Props {
  mapToken: string
  centerLat: number
  centerLng: number
}

const CONFIDENCE_CONFIG = {
  high: { label: 'High', color: '#dc2626', size: 10 },
  medium: { label: 'Medium', color: '#f97316', size: 8 },
  low: { label: 'Low', color: '#fbbf24', size: 6 },
}

function getConf(c: string) {
  const key = c.toLowerCase() as keyof typeof CONFIDENCE_CONFIG
  return CONFIDENCE_CONFIG[key] ?? CONFIDENCE_CONFIG.medium
}

export function PetaHotspotClient({ mapToken, centerLat, centerLng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const [points, setPoints] = useState<HotspotPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map')
  const [filterKab, setFilterKab] = useState('all')
  const [filterConf, setFilterConf] = useState('all')
  const [selected, setSelected] = useState<HotspotPoint | null>(null)

  // PERBAIKAN 1: Tambahkan state penanda map sudah load
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/hotspot')
      const data = await res.json()
      if (data.error && !data.points?.length) {
        setError(data.error)
      } else {
        setPoints(data.points ?? [])
        setLastUpdate(
          new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter
  const filtered = points.filter((p) => {
    if (filterKab !== 'all' && p.kabkota !== filterKab) return false
    if (filterConf !== 'all' && p.confidence.toLowerCase() !== filterConf) return false
    return true
  })

  const kabList = [...new Set(points.map((p) => p.kabkota))].sort()

  // Init Mapbox
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !mapToken) return

    mapboxgl.accessToken = mapToken
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [centerLng, centerLat],
      zoom: 6.5,
      projection: 'mercator',
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // PERBAIKAN 2: Beritahu state jika style map sudah selesai diload
    map.on('load', () => {
      setIsMapLoaded(true)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      setIsMapLoaded(false)
    }
  }, [mapToken, centerLat, centerLng])

  // Update markers saat data/filter berubah ATAU map selesai diload
  useEffect(() => {
    const map = mapRef.current

    // PERBAIKAN 3: Gunakan state isMapLoaded sebagai ganti isStyleLoaded()
    if (!map || !isMapLoaded || filtered.length === 0) return

    const sourceId = 'hotspot-src'

    // Remove existing layers and source
    if (map.getLayer('hotspot-heat')) map.removeLayer('hotspot-heat')
    if (map.getLayer('hotspot-circle')) map.removeLayer('hotspot-circle')
    if (map.getLayer('hotspot-label')) map.removeLayer('hotspot-label')
    if (map.getSource(sourceId)) map.removeSource(sourceId)

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: filtered.map((p, i) => ({
        type: 'Feature',
        id: i,
        geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
        properties: {
          confidence: p.confidence.toLowerCase(),
          kabkota: p.kabkota,
          kecamatan: p.kecamatan,
          desa: p.desa,
          tanggal: p.tanggal,
          waktu: p.waktu,
          satelit: p.satelit,
          idx: i,
        },
      })),
    }

    map.addSource(sourceId, { type: 'geojson', data: geojson })

    // Heatmap layer (zoom rendah)
    map.addLayer({
      id: 'hotspot-heat',
      type: 'heatmap',
      source: sourceId,
      maxzoom: 11,
      paint: {
        'heatmap-weight': ['match', ['get', 'confidence'], 'high', 1, 'medium', 0.7, 0.4],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 9, 2],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0,
          'rgba(254,243,199,0)',
          0.2,
          'rgba(253,186,116,0.5)',
          0.4,
          'rgba(249,115,22,0.7)',
          0.6,
          'rgba(239,68,68,0.85)',
          0.8,
          'rgba(185,28,28,0.9)',
          1,
          'rgba(127,29,29,1)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 8, 9, 25],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 8, 1, 11, 0],
      },
    })

    // Circle layer (zoom tinggi)
    map.addLayer({
      id: 'hotspot-circle',
      type: 'circle',
      source: sourceId,
      minzoom: 9,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 4, 14, 10],
        'circle-color': [
          'match',
          ['get', 'confidence'],
          'high',
          '#dc2626',
          'medium',
          '#f97316',
          'low',
          '#fbbf24',
          '#f97316',
        ],
        'circle-opacity': 0.85,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff',
      },
    })

    // Event handler untuk klik marker
    const handleCircleClick = (e: mapboxgl.MapLayerMouseEvent) => {
      const props = e.features?.[0]?.properties
      if (!props) return
      const idx = props.idx
      const point = filtered[idx]
      if (point) {
        setSelected(point)
        setMobileTab('map')
      }
    }

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
    }

    map.on('click', 'hotspot-circle', handleCircleClick)
    map.on('mouseenter', 'hotspot-circle', handleMouseEnter)
    map.on('mouseleave', 'hotspot-circle', handleMouseLeave)

    return () => {
      try {
        if (map && map.getLayer('hotspot-circle')) {
          map.off('click', 'hotspot-circle', handleCircleClick)
          map.off('mouseenter', 'hotspot-circle', handleMouseEnter)
          map.off('mouseleave', 'hotspot-circle', handleMouseLeave)
        }
      } catch {
        // Map sudah di-remove saat navigasi, abaikan
      }
    }
  }, [filtered, isMapLoaded]) // PERBAIKAN 4: Tambahkan isMapLoaded ke dependency array

  const totalHigh = filtered.filter((p) => p.confidence.toLowerCase() === 'high').length
  const totalMedium = filtered.filter((p) => p.confidence.toLowerCase() === 'medium').length
  const totalLow = filtered.filter((p) => p.confidence.toLowerCase() === 'low').length

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar kiri */}
      <div
        className={cn(
          'flex w-80 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white',
          mobileTab === 'list' ? 'flex' : 'hidden md:flex'
        )}
      >
        {/* Stats & Refresh */}
        <div className="shrink-0 space-y-2 border-b bg-slate-50 px-4 py-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Memuat data hotspot...
            </div>
          ) : error ? (
            <div className="flex items-center gap-1.5 text-xs text-red-500">
              <AlertTriangle className="h-3.5 w-3.5" /> {error}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">🔥 {filtered.length} Titik Api</p>
                <button
                  onClick={fetchData}
                  className="flex items-center gap-1 text-[10px] text-slate-400 transition hover:text-slate-600"
                >
                  <RefreshCw className="h-2.5 w-2.5" /> {lastUpdate}
                </button>
              </div>
              <div className="flex gap-1.5">
                {[
                  { label: 'High', val: totalHigh, color: 'bg-red-100 text-red-700' },
                  { label: 'Medium', val: totalMedium, color: 'bg-orange-100 text-orange-700' },
                  { label: 'Low', val: totalLow, color: 'bg-yellow-100 text-yellow-700' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-center ${s.color}`}
                  >
                    <p className="text-base leading-none font-black">{s.val}</p>
                    <p className="mt-0.5 text-[9px] font-bold uppercase">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Filter */}
        <div className="shrink-0 space-y-2 border-b px-3 py-2.5">
          <select
            value={filterKab}
            onChange={(e) => setFilterKab(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:ring-1 focus:ring-orange-300 focus:outline-none"
          >
            <option value="all">Semua Kab/Kota ({points.length})</option>
            {kabList.map((k) => (
              <option key={k} value={k}>
                {k} ({points.filter((p) => p.kabkota === k).length})
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {['all', 'high', 'medium', 'low'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterConf(c)}
                className={cn(
                  'flex-1 rounded-lg px-1.5 py-1 text-[10px] font-bold uppercase transition',
                  filterConf === c
                    ? 'bg-navy-800 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                )}
              >
                {c === 'all' ? 'Semua' : c}
              </button>
            ))}
          </div>
        </div>

        {/* List Hotspot */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Flame className="h-7 w-7 text-slate-200" />
              <p className="text-xs text-slate-400">Tidak ada hotspot</p>
            </div>
          ) : (
            filtered.map((p, i) => {
              const conf = getConf(p.confidence)
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelected(p)
                    setMobileTab('map')
                    mapRef.current?.flyTo({
                      center: [p.longitude, p.latitude],
                      zoom: 13,
                      duration: 600,
                    })
                  }}
                  className={cn(
                    'w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50',
                    selected?.latitude === p.latitude && selected?.longitude === p.longitude
                      ? 'border-l-2 border-l-orange-500 bg-orange-50'
                      : ''
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: conf.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-xs font-semibold text-slate-700">
                        {p.desa}, {p.kecamatan}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{p.kabkota}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>
                          {p.tanggal} {p.waktu}
                        </span>
                        <span className="font-medium" style={{ color: conf.color }}>
                          {p.confidence}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Map Container */}
      <div
        className={cn(
          'relative flex-1 overflow-hidden',
          mobileTab === 'list' ? 'hidden md:flex' : 'flex'
        )}
      >
        {!mapToken ? (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-center">
            <div>
              <MapPin className="mx-auto mb-3 h-12 w-12 text-slate-300" />
              <p className="font-medium text-slate-500">Peta tidak tersedia</p>
              <p className="mt-1 text-sm text-slate-400">Admin → Pengaturan → Mapbox Token</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="h-full w-full" />
        )}

        {/* Mobile tab toggle */}
        <div className="absolute top-3 left-3 z-10 flex overflow-hidden rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm md:hidden">
          {(['map', 'list'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMobileTab(t)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-xs font-semibold',
                mobileTab === t ? 'bg-white/20 text-white' : 'text-white/60'
              )}
            >
              {t === 'map' ? '🗺️ Peta' : '📋 List'}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div
          className="absolute z-10 space-y-2 rounded-lg border border-orange-400 bg-black/70 p-3 text-xs backdrop-blur-sm"
          style={{ top: '8px', right: '50px' }}
        >
          <p className="mb-2 text-[10px] font-bold tracking-wider text-white/70 uppercase">
            Tingkat Kepercayaan
          </p>
          {Object.entries(CONFIDENCE_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: cfg.color }} />
              <span className="text-white/80">{cfg.label}</span>
            </div>
          ))}
          <div className="mt-1 border-t border-white/20 pt-2 text-[10px] text-white/50">
            Zoom masuk untuk detail titik
          </div>
        </div>

        {/* Popup detail */}
        {selected && (
          <div className="absolute top-2 left-1/2 z-10 w-72 -translate-x-1/2 rounded-2xl bg-white p-4 shadow-2xl md:left-4 md:translate-x-0">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <div className="mb-1 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-slate-700">Titik Api Terdeteksi</span>
                </div>
                <p className="text-navy-800 text-sm font-bold">{selected.desa}</p>
                <p className="text-xs text-slate-500">
                  {selected.kecamatan}, {selected.kabkota}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                <p className="text-[10px] text-slate-400">Kepercayaan</p>
                <p
                  className="mt-0.5 font-bold"
                  style={{ color: getConf(selected.confidence).color }}
                >
                  {selected.confidence}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                <p className="text-[10px] text-slate-400">Satelit</p>
                <p className="mt-0.5 text-[11px] font-bold text-slate-700">{selected.satelit}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                <p className="text-[10px] text-slate-400">Tanggal</p>
                <p className="mt-0.5 font-bold text-slate-700">{selected.tanggal}</p>
              </div>
              <div className="rounded-lg bg-slate-50 px-2.5 py-2">
                <p className="text-[10px] text-slate-400">Waktu</p>
                <p className="mt-0.5 font-bold text-slate-700">{selected.waktu}</p>
              </div>
            </div>
            <p className="mt-2 text-center font-mono text-[10px] text-slate-300">
              {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
