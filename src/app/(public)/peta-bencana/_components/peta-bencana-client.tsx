// src/app/(public)/peta-bencana/_components/peta-bencana-client.tsx
// src/app/(public)/peta-bencana/_components/peta-bencana-client.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, X, AlertTriangle, List, Map as MapIcon, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────
interface Victim {
  id: number
  incidentId: number
  impactType: string
  ageGroup: string
  countMale: number | null
  countFemale: number | null
  countTotal: number | null
}
interface Damage {
  id: number
  incidentId: number
  assetName: string
  heavyDamage: number | null
  moderateDamage: number | null
  lightDamage: number | null
  estimatedLoss: string | null
}
interface Incident {
  id: number
  title: string
  description: string | null
  typeName: string
  typeIcon: string
  typeColor: string
  source: string | null
  occurredDate: string | null
  occurredTime: string | null
  regencyName: string | null
  districtName: string | null
  villageName: string | null
  addressDetail: string | null
  latitude: number
  longitude: number
  status: string
  currentCondition: string | null
  currentEffort: string | null
  updatedAt: string | null
  victims: Victim[]
  damages: Damage[]
}

interface Props {
  token: string
  centerLat: number
  centerLng: number
  incidents: Incident[]
  year: number
}

// ── Constants ─────────────────────────────────────────────────
const STATUS = {
  aktif: { label: 'Aktif', color: '#e85000', bg: '#fef2f2', text: '#b91c1c', pulse: true },
  ditangani: { label: 'Ditangani', color: '#c98b00', bg: '#fffbeb', text: '#92400e', pulse: false },
}

const IMPACT_LABEL: Record<string, string> = {
  meninggal: 'Meninggal',
  hilang: 'Hilang',
  luka_sakit: 'Luka/Sakit',
  menderita: 'Menderita',
  mengungsi: 'Mengungsi',
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(d))
}
function fmtShort(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(d))
}
function fmtDateTime(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(d))
}
function victimSum(victims: Victim[], type: string) {
  return victims
    .filter((v) => v.impactType === type)
    .reduce((s, v) => s + (v.countTotal ?? (v.countMale ?? 0) + (v.countFemale ?? 0)), 0)
}

export function PetaBencanaClient({ token, centerLat, centerLng, incidents, year }: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<number, mapboxgl.Marker>>(new Map())

  const [selected, setSelected] = useState<Incident | null>(null)
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filtered = incidents.filter((i) => filterStatus === 'all' || i.status === filterStatus)

  const stats = {
    total: incidents.length,
    aktif: incidents.filter((i) => i.status === 'aktif').length,
    ditangani: incidents.filter((i) => i.status === 'ditangani').length,
  }

  // ── Fungsi addCustomMarker dipindahkan ke atas sebelum digunakan ──
  function addCustomMarker(map: mapboxgl.Map, incident: Incident) {
    const st = STATUS[incident.status as keyof typeof STATUS] ?? STATUS.aktif

    // Wrapper luar
    const el = document.createElement('div')
    el.dataset.id = String(incident.id)
    el.style.display = 'none' // Default DIBUAT SEMBUNYI hingga diverifikasi unclustered

    // Wrapper dalam untuk styling visual dan animasi scaling
    const innerEl = document.createElement('div')
    innerEl.id = `marker-inner-${incident.id}`
    innerEl.style.cssText = `
      width:36px;height:36px;border-radius:50%;
      background:${st.color};border:3px solid white;
      box-shadow:0 2px 10px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:15px;cursor:pointer;
      transition:transform 0.2s ease-in-out;
      position:relative;
    `
    innerEl.innerHTML = incident.typeIcon

    if (st.pulse) {
      if (!document.getElementById('peta-pulse-style')) {
        const s = document.createElement('style')
        s.id = 'peta-pulse-style'
        s.innerHTML = `@keyframes pulse-ring{0%{transform:scale(1);opacity:.6}100%{transform:scale(2);opacity:0}}`
        document.head.appendChild(s)
      }
      const ring = document.createElement('div')
      ring.style.cssText = `
        position:absolute;inset:-6px;border-radius:50%;
        border:2px solid ${st.color};opacity:.6;
        animation:pulse-ring 2s ease-out infinite;
      `
      innerEl.appendChild(ring)
    }

    el.appendChild(innerEl)

    el.addEventListener('click', () => {
      const found = incidents.find((i) => i.id === incident.id)
      if (found) setSelected(found)
    })

    // Tambahkan anchor: 'center' secara presisi
    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([incident.longitude, incident.latitude])
      .addTo(map)

    markersRef.current.set(incident.id, marker)
  }

  // ── Init Mapbox dengan Clustering ─────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !token) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [centerLng, centerLat],
      zoom: 7,
      projection: 'mercator',
    })
    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Simpan currentMarkers untuk cleanup
    const currentMarkers = markersRef.current

    map.on('load', () => {
      // ── GeoJSON source dengan clustering ──
      const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: incidents.map((i) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [i.longitude, i.latitude] },
          properties: {
            id: i.id,
            title: i.title,
            typeIcon: i.typeIcon,
            typeColor: i.typeColor,
            status: i.status,
          },
        })),
      }

      map.addSource('incidents', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 12,
        clusterRadius: 50,
      })

      // Cluster circle layer
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'incidents',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#e85000', 5, '#c98b00', 20, '#1b56a8'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 5, 28, 20, 36],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      })

      // Cluster count label layer
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'incidents',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 13,
        },
        paint: { 'text-color': '#ffffff' },
      })

      // Layer invisible untuk mendeteksi marker tak ter-cluster
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'incidents',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 0,
          'circle-opacity': 0,
        },
      })

      // Individual marker — buat HTML element untuk semua (default tersembunyi)
      incidents.forEach((incident) => {
        if (!map.getSource('incidents')) return
        addCustomMarker(map, incident)
      })

      // Sinkronisasi Tampilan Marker vs Cluster saat dirender
      map.on('render', () => {
        if (!map.isStyleLoaded() || !map.getSource('incidents')) return

        // 1. Sembunyikan SEMUA custom HTML marker setiap frame digerakkan
        currentMarkers.forEach((marker) => {
          marker.getElement().style.display = 'none'
        })

        // 2. Tanya Mapbox: Feature apa saja yang sedang tampil tanpa cluster
        const unclusteredFeatures = map.queryRenderedFeatures({
          layers: ['unclustered-point'],
        })

        // 3. Tampilkan hanya marker-marker yang terdeteksi berdiri sendiri
        unclusteredFeatures.forEach((feature) => {
          const id = feature.properties?.id
          if (id !== undefined) {
            const marker = currentMarkers.get(Number(id))
            if (marker) {
              marker.getElement().style.display = 'block'
            }
          }
        })
      })

      // Klik cluster → zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        const clusterId = features[0].properties?.cluster_id
        const source = map.getSource('incidents') as mapboxgl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          const coords = (features[0].geometry as GeoJSON.Point).coordinates as [number, number]
          map.easeTo({ center: coords, zoom: zoom ?? 12 })
        })
      })

      map.on('mouseenter', 'clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'clusters', () => {
        map.getCanvas().style.cursor = ''
      })
    })

    return () => {
      currentMarkers.forEach((marker) => marker.remove())
      currentMarkers.clear()
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, centerLat, centerLng, incidents])

  // Fly to + highlight saat selected
  useEffect(() => {
    if (!selected || !mapRef.current) return
    mapRef.current.flyTo({
      center: [selected.longitude, selected.latitude],
      zoom: 13,
      duration: 800,
    })

    markersRef.current.forEach((m, id) => {
      const el = m.getElement()
      el.style.zIndex = id === selected.id ? '10' : '1'

      // Target elemen DIV bagian dalam (inner)
      const inner = el.querySelector(`#marker-inner-${id}`) as HTMLDivElement
      if (inner) {
        inner.style.transform = id === selected.id ? 'scale(1.35)' : 'scale(1)'
      }
    })
  }, [selected])

  return (
    // ... rest of the component (sama seperti sebelumnya)
    <div className="flex h-screen flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="bg-navy-900 border-navy-800 z-10 flex shrink-0 items-center gap-3 border-b px-4 py-2.5">
        <Link
          href="/"
          className="text-navy-400 flex items-center gap-1 text-xs transition hover:text-white"
        >
          ← Beranda
        </Link>
        <div className="bg-navy-700 h-4 w-px" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          <span className="text-sm font-bold text-white">Peta Kejadian Bencana</span>
          <span className="text-navy-400 text-xs">Tahun {year}</span>
        </div>

        {/* Stats */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {[
            { label: 'Aktif', val: stats.aktif, color: 'text-red-400', bg: 'bg-red-900/30' },
            {
              label: 'Ditangani',
              val: stats.ditangani,
              color: 'text-amber-400',
              bg: 'bg-amber-900/30',
            },
            { label: 'Total', val: stats.total, color: 'text-white', bg: 'bg-white/10' },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${s.bg}`}
            >
              <span className={`text-base font-black ${s.color}`}>{s.val}</span>
              <span className="text-navy-400 text-[11px]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Mobile toggle */}
        <div className="border-navy-700 ml-auto flex overflow-hidden rounded-lg border md:hidden">
          {(['map', 'list'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setMobileTab(t)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 text-xs font-semibold',
                mobileTab === t ? 'bg-navy-700 text-white' : 'text-navy-400'
              )}
            >
              {t === 'map' ? (
                <>
                  <MapIcon className="h-3.5 w-3.5" /> Peta
                </>
              ) : (
                <>
                  <List className="h-3.5 w-3.5" /> List
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar kiri - sama seperti sebelumnya */}
        <div
          className={cn(
            'flex w-80 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white',
            mobileTab === 'list' ? 'flex' : 'hidden md:flex'
          )}
        >
          <div className="shrink-0 border-b bg-slate-50 px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-slate-500">Filter Status</p>
            <div className="flex gap-1">
              {[
                { val: 'all', label: 'Semua', count: stats.total },
                { val: 'aktif', label: 'Aktif', count: stats.aktif },
                { val: 'ditangani', label: 'Ditangani', count: stats.ditangani },
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => setFilterStatus(f.val)}
                  className={cn(
                    'flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition',
                    filterStatus === f.val
                      ? 'bg-navy-800 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <AlertTriangle className="h-8 w-8 text-slate-300" />
                <p className="text-muted-foreground text-sm">Tidak ada kejadian</p>
              </div>
            ) : (
              filtered.map((incident) => {
                const st = STATUS[incident.status as keyof typeof STATUS] ?? STATUS.aktif
                const isActive = selected?.id === incident.id
                return (
                  <button
                    key={incident.id}
                    onClick={() => {
                      setSelected(incident)
                      setMobileTab('map')
                    }}
                    className={cn(
                      'w-full border-b border-slate-100 px-4 py-3.5 text-left transition-colors',
                      isActive ? 'bg-navy-50 border-l-navy-700 border-l-2' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
                        style={{ background: `${incident.typeColor}18` }}
                      >
                        {incident.typeIcon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-navy-800 line-clamp-1 text-sm leading-snug font-semibold">
                          {incident.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{ background: st.bg, color: st.text }}
                          >
                            {st.pulse && (
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                            )}
                            {st.label}
                          </span>
                          <span className="truncate text-[10px] text-slate-400">
                            {incident.typeName}
                          </span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-400">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />
                          {[incident.villageName, incident.districtName, incident.regencyName]
                            .filter(Boolean)
                            .join(', ') || '—'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {fmtShort(incident.occurredDate)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Peta */}
        <div
          className={cn(
            'relative flex-1 overflow-hidden',
            mobileTab === 'list' ? 'hidden md:flex' : 'flex'
          )}
        >
          {!token ? (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-center">
              <div>
                <MapPin className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                <p className="font-medium text-slate-500">Peta tidak tersedia</p>
                <p className="mt-1 text-sm text-slate-400">
                  Mapbox token belum dikonfigurasi.
                  <br />
                  Admin → Pengaturan → Kontak & Sosial
                </p>
              </div>
            </div>
          ) : (
            <div ref={containerRef} className="h-full w-full" />
          )}

          {/* Darurat badge */}
          <a
            href="tel:112"
            className="absolute bottom-6 left-4 z-10 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-white shadow-lg transition hover:bg-red-700"
          >
            <Phone className="h-4 w-4" />
            <div>
              <p className="text-[10px] font-bold tracking-wider uppercase opacity-80">Darurat</p>
              <p className="text-lg leading-none font-black">112</p>
            </div>
          </a>

          {/* Legend */}
          <div className="absolute right-4 bottom-6 z-10 space-y-1.5 rounded-xl bg-white p-3 text-xs shadow-lg">
            <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
              Status
            </p>
            {Object.entries(STATUS).map(([key, s]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                <span className="text-slate-600">{s.label}</span>
              </div>
            ))}
            <div className="mt-1.5 border-t border-slate-100 pt-1.5">
              <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                Cluster
              </p>
              <div className="flex items-center gap-2">
                <span className="bg-navy-600 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white">
                  N
                </span>
                <span className="text-slate-500">Beberapa kejadian</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel detail kanan */}
        {selected && (
          <div
            className={cn(
              'flex w-96 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white',
              'fixed inset-y-0 right-0 z-20 shadow-2xl md:relative md:z-auto md:shadow-none'
            )}
          >
            <div className="bg-navy-800 shrink-0 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{selected.typeIcon}</span>
                  <div>
                    <p className="text-sm leading-snug font-bold text-white">{selected.title}</p>
                    <p className="text-navy-300 mt-0.5 text-[11px]">{selected.typeName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                {(() => {
                  const st = STATUS[selected.status as keyof typeof STATUS] ?? STATUS.aktif
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                      style={{ background: st.bg, color: st.text }}
                    >
                      {st.pulse && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                      )}
                      {st.label}
                    </span>
                  )
                })()}
                <span className="text-navy-300 text-[11px]">
                  {fmt(selected.occurredDate)}
                  {selected.occurredTime && ` · ${selected.occurredTime.slice(0, 5)} WITA`}
                </span>
              </div>
            </div>

            <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
              {/* Lokasi */}
              <div className="space-y-1.5 px-5 py-4">
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Lokasi
                </p>
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <p>
                    {[selected.villageName, selected.districtName, selected.regencyName]
                      .filter(Boolean)
                      .join(', ') || 'Kalimantan Timur'}
                    {selected.addressDetail && (
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {selected.addressDetail}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Daerah terdampak */}
              <div className="px-5 py-4">
                <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  🏘️ Daerah Terdampak
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Desa/Kel', val: selected.villageName ?? '—' },
                    { label: 'Kecamatan', val: selected.districtName ?? '—' },
                    { label: 'Kab/Kota', val: selected.regencyName ?? '—' },
                    { label: 'Provinsi', val: 'Kalimantan Timur' },
                  ].map(({ label, val }) => (
                    <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] text-slate-400">{label}</p>
                      <p className="text-navy-800 truncate text-xs font-semibold">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Korban */}
              {selected.victims.length > 0 && (
                <div className="px-5 py-4">
                  <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    👥 Korban Jiwa
                  </p>
                  <div className="space-y-1.5">
                    {['meninggal', 'hilang', 'luka_sakit', 'menderita', 'mengungsi'].map((type) => {
                      const total = victimSum(selected.victims, type)
                      if (total === 0) return null
                      const laki = selected.victims
                        .filter((v) => v.impactType === type)
                        .reduce((s, v) => s + (v.countMale ?? 0), 0)
                      const prp = selected.victims
                        .filter((v) => v.impactType === type)
                        .reduce((s, v) => s + (v.countFemale ?? 0), 0)
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between border-b border-slate-50 py-1.5 last:border-0"
                        >
                          <span className="text-sm text-slate-600">{IMPACT_LABEL[type]}</span>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>
                              {laki}L / {prp}P
                            </span>
                            <span className="text-navy-800 font-bold">{total} Jiwa</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Kerugian material */}
              {selected.damages.length > 0 && (
                <div className="px-5 py-4">
                  <p className="mb-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    🏚️ Kerugian & Kerusakan
                  </p>
                  <div className="space-y-2">
                    {selected.damages.map((d) => (
                      <div key={d.id} className="rounded-lg border border-slate-100 p-3">
                        <p className="text-navy-800 mb-1.5 text-xs font-semibold">{d.assetName}</p>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {[
                            ['Berat', d.heavyDamage],
                            ['Sedang', d.moderateDamage],
                            ['Ringan', d.lightDamage],
                          ].map(([l, v]) => (
                            <div key={l as string} className="text-center">
                              <p className="text-slate-400">{l}</p>
                              <p className="text-navy-800 font-bold">{v ?? 0}</p>
                            </div>
                          ))}
                        </div>
                        {d.estimatedLoss && parseFloat(d.estimatedLoss) > 0 && (
                          <p className="mt-1.5 text-right text-[10px] text-slate-400">
                            Rp {parseFloat(d.estimatedLoss).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kronologis */}
              {selected.description && (
                <div className="px-5 py-4">
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    📋 Kronologis
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">{selected.description}</p>
                </div>
              )}

              {/* Upaya */}
              {selected.currentEffort && (
                <div className="px-5 py-4">
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    🚒 Upaya Penanggulangan
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">{selected.currentEffort}</p>
                </div>
              )}

              {/* Kondisi terkini */}
              {selected.currentCondition && (
                <div className="px-5 py-4">
                  <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                    🔄 Kondisi Terkini
                  </p>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                    <p className="text-xs font-medium text-amber-800">
                      {selected.currentCondition}
                    </p>
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="space-y-1 bg-slate-50 px-5 py-4 text-[11px] text-slate-400">
                {selected.source && <p>📡 {selected.source}</p>}
                {selected.updatedAt && <p>🕐 Update: {fmtDateTime(selected.updatedAt)}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
