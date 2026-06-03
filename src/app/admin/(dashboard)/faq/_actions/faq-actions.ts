// src/app/admin/(dashboard)/faq/_actions/faq-actions.ts
'use server'

import { db } from '@/lib/db'
import { siteSettings } from '@db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export interface FaqItem {
  id: string
  q: string
  a: string
  isActive: boolean
  order: number
}

const faqSchema = z.object({
  q: z.string().min(5, 'Pertanyaan minimal 5 karakter'),
  a: z.string().min(10, 'Jawaban minimal 10 karakter'),
  isActive: z.boolean(),
})

export type FaqFormValues = z.infer<typeof faqSchema>

async function loadFaqs(): Promise<FaqItem[]> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, 'faq_items'))
  if (!row?.value) return []
  try {
    return JSON.parse(row.value)
  } catch {
    return []
  }
}

async function saveFaqs(items: FaqItem[]) {
  await db
    .insert(siteSettings)
    .values({ key: 'faq_items', value: JSON.stringify(items) })
    .onDuplicateKeyUpdate({ set: { value: JSON.stringify(items), updatedAt: new Date() } })
}

export async function getFaqsAction(): Promise<FaqItem[]> {
  return loadFaqs()
}

export async function createFaqAction(values: FaqFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = faqSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const items = await loadFaqs()
  const newItem: FaqItem = {
    id: crypto.randomUUID(),
    q: parsed.data.q,
    a: parsed.data.a,
    isActive: parsed.data.isActive,
    order: items.length + 1,
  }
  await saveFaqs([...items, newItem])
  revalidatePath('/')
  revalidatePath('/admin/faq')
  return { success: true }
}

export async function updateFaqAction(id: string, values: FaqFormValues) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const parsed = faqSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const items = await loadFaqs()
  const updated = items.map((i) => (i.id === id ? { ...i, ...parsed.data } : i))
  await saveFaqs(updated)
  revalidatePath('/')
  revalidatePath('/admin/faq')
  return { success: true }
}

export async function deleteFaqAction(id: string) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const items = await loadFaqs()
  await saveFaqs(items.filter((i) => i.id !== id))
  revalidatePath('/')
  revalidatePath('/admin/faq')
  return { success: true }
}

export async function reorderFaqsAction(orderedIds: string[]) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const items = await loadFaqs()
  const reordered = orderedIds
    .map((id, idx) => {
      const item = items.find((i) => i.id === id)
      return item ? { ...item, order: idx + 1 } : null
    })
    .filter(Boolean) as FaqItem[]
  await saveFaqs(reordered)
  revalidatePath('/')
  revalidatePath('/admin/faq')
  return { success: true }
}

export async function toggleFaqAction(id: string, isActive: boolean) {
  const session = await auth()
  if (!session) return { success: false, error: 'Unauthorized' }

  const items = await loadFaqs()
  const updated = items.map((i) => (i.id === id ? { ...i, isActive } : i))
  await saveFaqs(updated)
  revalidatePath('/')
  revalidatePath('/admin/faq')
  return { success: true }
}
