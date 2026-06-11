// src/app/admin/login/_components/login-form.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})
type FormValues = z.infer<typeof schema>

// Extend window untuk Turnstile SDK
declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: object) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
    }
  }
}

interface Props {
  siteKey: string
}

export function LoginForm({ siteKey }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin'

  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tsToken, setTsToken] = useState<string | null>(null)
  const [tsReady, setTsReady] = useState(false)
  const [tsError, setTsError] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoaded = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // Render widget Turnstile
  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return
    // Hapus widget lama jika ada
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {}
    }
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: 'light',
      size: 'normal',
      callback: (token: string) => {
        setTsToken(token)
        setTsReady(true)
        setTsError(false)
      },
      'error-callback': () => {
        setTsToken(null)
        setTsReady(false)
        setTsError(true)
      },
      'expired-callback': () => {
        setTsToken(null)
        setTsReady(false)
      },
    })
  }, [siteKey])

  // Load Turnstile script
  useEffect(() => {
    if (!siteKey || scriptLoaded.current) return

    // Jika script sudah ada di DOM (SSR/hot reload)
    if (window.turnstile) {
      renderWidget()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => {
      scriptLoaded.current = true
      // Tunggu sebentar agar SDK siap
      setTimeout(renderWidget, 100)
    }
    document.head.appendChild(script)

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {}
      }
    }
  }, [siteKey, renderWidget])

  async function onSubmit(values: FormValues) {
    setError(null)

    // Validasi token Turnstile
    if (siteKey && !tsToken) {
      setError('Selesaikan verifikasi keamanan terlebih dahulu.')
      return
    }

    const res = await signIn('credentials', {
      email: values.email,
      password: values.password,
      turnstileToken: tsToken ?? '',
      redirect: false,
      callbackUrl,
    })

    if (res?.error) {
      setError('Email atau password salah. Silakan coba lagi.')
      // Reset Turnstile setelah gagal
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
        setTsToken(null)
        setTsReady(false)
      }
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  const canSubmit = !isSubmitting && (!siteKey || tsReady)

  return (
    // eslint-disable-next-line react-hooks/refs
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[11px] font-black tracking-[0.12em] text-slate-400 uppercase"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="nama@bpbd.kaltimprov.go.id"
          autoComplete="email"
          className="h-12 w-full border-2 border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-800 transition-all outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-400/10"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[11px] font-black tracking-[0.12em] text-slate-400 uppercase"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-12 w-full border-2 border-slate-100 bg-slate-50 px-4 pr-12 text-sm font-medium text-slate-800 transition-all outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-400/10"
            {...register('password')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-300 transition hover:text-slate-500"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* ── Turnstile widget ── */}
      {siteKey && (
        <div>
          {/* Container widget — Cloudflare akan render iframe di sini */}
          <div ref={containerRef} className="min-h-[65px]" />

          {/* State feedback */}
          {tsError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
              <AlertCircle className="h-3.5 w-3.5" />
              Verifikasi gagal. Coba refresh halaman.
            </p>
          )}
          {tsReady && !tsError && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-green-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verifikasi berhasil
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="group relative flex h-12 w-full items-center justify-center overflow-hidden bg-orange-500 text-sm font-black text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ letterSpacing: '0.04em' }}
      >
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-500 group-hover:translate-x-full"
          aria-hidden
        />
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            MASUK
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </span>
        )}
      </button>
    </form>
  )
}
