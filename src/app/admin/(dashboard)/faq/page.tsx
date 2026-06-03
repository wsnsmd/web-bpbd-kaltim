// src/app/admin/(dashboard)/faq/page.tsx
import { getFaqsAction } from './_actions/faq-actions'
import { FaqPanel } from './_components/faq-panel'

export const metadata = { title: 'FAQ' }

export default async function FaqPage() {
  const items = await getFaqsAction()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-navy-800 text-2xl font-bold">FAQ</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Kelola pertanyaan yang sering diajukan di homepage
        </p>
      </div>
      <FaqPanel initialItems={items} />
    </div>
  )
}
