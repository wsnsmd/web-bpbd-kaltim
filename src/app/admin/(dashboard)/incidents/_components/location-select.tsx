// src/app/admin/(dashboard)/incidents/_components/location-select.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { getKecamatans, getKelurahans } from '../_actions/region-actions'

interface Region {
  id: string
  name: string
}

interface Props {
  kabkotas: Region[]
  kabkotaId: string
  kecamatanId: string
  villageName: string // nama kelurahan (teks) — dipakai sebagai selected value jika ada di list
  onKabkotaChange: (id: string) => void
  onKecamatanChange: (id: string) => void
  onVillageNameChange: (name: string) => void
}

export function LocationSelect({
  kabkotas,
  kabkotaId,
  kecamatanId,
  villageName,
  onKabkotaChange,
  onKecamatanChange,
  onVillageNameChange,
}: Props) {
  const [kecamatans, setKecamatans] = useState<Region[]>([])
  const [kelurahans, setKelurahans] = useState<Region[]>([])
  const [loadingKec, setLoadingKec] = useState(false)
  const [loadingKel, setLoadingKel] = useState(false)

  const initialKabkotaId = useRef<string>(kabkotaId)
  const initialKecamatanId = useRef<string>(kecamatanId)
  const mountedKabkota = useRef(false)
  const mountedKecamatan = useRef(false)

  // Load kecamatan saat kabkota berubah
  useEffect(() => {
    if (!kabkotaId) {
      setKecamatans([])
      setKelurahans([])
      return
    }

    setLoadingKec(true)
    getKecamatans(kabkotaId).then((data) => {
      setKecamatans(data)
      setLoadingKec(false)

      // Reset downstream hanya jika user yang ganti (bukan edit mode load)
      if (mountedKabkota.current && kabkotaId !== initialKabkotaId.current) {
        onKecamatanChange('')
        onVillageNameChange('')
        setKelurahans([])
        initialKabkotaId.current = kabkotaId
      }
      mountedKabkota.current = true
    })
  }, [kabkotaId, onKecamatanChange, onVillageNameChange])

  // Load kelurahan saat kecamatan berubah
  useEffect(() => {
    if (!kecamatanId) {
      setKelurahans([])
      return
    }

    setLoadingKel(true)
    getKelurahans(kecamatanId).then((data) => {
      setKelurahans(data)
      setLoadingKel(false)

      // Reset downstream hanya jika user yang ganti
      if (mountedKecamatan.current && kecamatanId !== initialKecamatanId.current) {
        onVillageNameChange('')
        initialKecamatanId.current = kecamatanId
      }
      mountedKecamatan.current = true
    })
  }, [kecamatanId, onVillageNameChange])

  const hasKelurahan = kelurahans.length > 0

  // Cari kelurahan yang cocok berdasarkan nama (untuk edit mode)
  const matchedKelurahan = kelurahans.find(
    (k) => k.name.toLowerCase() === villageName?.toLowerCase()
  )
  const kelurahanValue = matchedKelurahan?.id ?? ''

  function handleKelurahanChange(id: string) {
    const found = kelurahans.find((k) => k.id === id)
    if (found) onVillageNameChange(found.name)
  }

  return (
    <div className="space-y-4">
      {/* Baris 1: Provinsi + Kab/Kota */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Provinsi
          </Label>
          <Select value="64" disabled>
            <SelectTrigger className="mt-1.5 bg-slate-50 text-slate-500">
              <SelectValue>Kalimantan Timur</SelectValue>
            </SelectTrigger>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Kabupaten / Kota <span className="text-destructive">*</span>
          </Label>
          <Select value={kabkotaId} onValueChange={onKabkotaChange}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Pilih Kab/Kota..." />
            </SelectTrigger>
            <SelectContent>
              {kabkotas.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Baris 2: Kecamatan + Kelurahan/Desa */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Kecamatan
          </Label>
          <div className="relative mt-1.5">
            {loadingKec && (
              <Loader2 className="text-muted-foreground absolute top-1/2 right-3 z-10 h-3.5 w-3.5 -translate-y-1/2 animate-spin" />
            )}
            <Select
              value={kecamatanId}
              onValueChange={onKecamatanChange}
              disabled={!kabkotaId || loadingKec}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={kabkotaId ? 'Pilih Kecamatan...' : '— pilih Kab/Kota dulu —'}
                />
              </SelectTrigger>
              <SelectContent>
                {kecamatans.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Kelurahan / Desa
          </Label>
          <div className="relative mt-1.5">
            {loadingKel && (
              <Loader2 className="text-muted-foreground absolute top-1/2 right-3 z-10 h-3.5 w-3.5 -translate-y-1/2 animate-spin" />
            )}
            {hasKelurahan ? (
              // Dropdown jika ada data kelurahan di DB
              // value pakai ID yang cocok dengan villageName (edit mode)
              <Select
                value={kelurahanValue}
                onValueChange={handleKelurahanChange}
                disabled={!kecamatanId || loadingKel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kelurahan..." />
                </SelectTrigger>
                <SelectContent>
                  {kelurahans.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // Input teks bebas jika tidak ada data (kabupaten)
              <Input
                placeholder={
                  kecamatanId
                    ? loadingKel
                      ? 'Memuat...'
                      : 'Ketik nama desa/kelurahan...'
                    : '— pilih Kecamatan dulu —'
                }
                disabled={!kecamatanId || loadingKel}
                value={villageName ?? ''}
                onChange={(e) => onVillageNameChange(e.target.value)}
              />
            )}
          </div>
          {kecamatanId && !hasKelurahan && !loadingKel && (
            <p className="text-muted-foreground mt-1 text-[11px]">
              Input nama desa/kelurahan secara manual.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
