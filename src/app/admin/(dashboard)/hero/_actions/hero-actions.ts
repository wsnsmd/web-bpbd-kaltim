// src/app/admin/(dashboard)/hero/_actions/hero-actions.ts
'use server'

import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({
  hero_title: z.string().min(1, 'Judul wajib diisi'),
  hero_subtitle: z.string().optional(),
  hero_description: z.string().optional(),
  hero_badge: z.string().optional(),
  hero_cta_primary_label: z.string().optional(),
  hero_cta_primary_href: z.string().optional(),
  hero_cta_secondary_label: z.string().optional(),
  hero_cta_secondary_href: z.string().optional(),
  hero_bg_image: z.string().optional(),
  hero_status_text: z.string().optional(),
})

export type HeroFormValues = z.infer<typeof schema>

export async function getHeroSettingsAction(): Promise<HeroFormValues> {
  const rows = await db.select().from(siteSettings)
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? '']))
  return {
    hero_title: map.hero_title ?? 'Penanggulangan Bencana\nKalimantan Timur',
    hero_subtitle: map.hero_subtitle ?? 'Tanggap, Tangguh, Cepat',
    hero_description:
      map.hero_description ??
      'Pusat koordinasi, informasi, dan layanan kebencanaan wilayah Benua Etam untuk keselamatan masyarakat.',
    hero_badge: map.hero_badge ?? 'Portal Resmi — Pemerintah Provinsi Kalimantan Timur',
    hero_cta_primary_label: map.hero_cta_primary_label ?? 'Layanan Publik',
    hero_cta_primary_href: map.hero_cta_primary_href ?? '#layanan',
    hero_cta_secondary_label: map.hero_cta_secondary_label ?? 'Peta Bencana',
    hero_cta_secondary_href: map.hero_cta_secondary_href ?? '#peta',
    hero_bg_image: map.hero_bg_image ?? '',
    hero_status_text: map.hero_status_text ?? 'Kondisi Wilayah: Normal & Aman',
  }
}

export async function saveHeroSettingsAction(values: HeroFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = schema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  for (const [key, value] of Object.entries(parsed.data)) {
    await db
      .insert(siteSettings)
      .values({ key, value: value ?? '' })
      .onDuplicateKeyUpdate({ set: { value: value ?? '', updatedAt: new Date() } })
  }

  revalidatePath('/')
  return { success: true }
}
