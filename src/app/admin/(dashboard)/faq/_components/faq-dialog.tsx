// src/app/admin/(dashboard)/faq/_components/faq-dialog.tsx
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import type { FaqItem } from '../_actions/faq-actions'
import { createFaqAction, updateFaqAction } from '../_actions/faq-actions'

const schema = z.object({
  q: z.string().min(5, 'Pertanyaan minimal 5 karakter'),
  a: z.string().min(10, 'Jawaban minimal 10 karakter'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  item?: FaqItem
  onSuccess: (item: any) => void
}

export function FaqDialog({ open, onOpenChange, item, onSuccess }: Props) {
  const isEdit = !!item

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      q: item?.q ?? '',
      a: item?.a ?? '',
      isActive: item?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        q: item?.q ?? '',
        a: item?.a ?? '',
        isActive: item?.isActive ?? true,
      })
    }
  }, [open, item, form]) // Perbaikan: form ditambahkan ke dependency array

  const { isSubmitting } = form.formState

  async function onSubmit(values: FormValues) {
    const res = isEdit ? await updateFaqAction(item.id, values) : await createFaqAction(values)

    if (res.success) {
      toast.success(isEdit ? 'FAQ diperbarui' : 'FAQ ditambahkan')
      onSuccess({ ...values, id: item?.id ?? crypto.randomUUID(), order: 0 })
      onOpenChange(false)
    } else {
      toast.error(res.error ?? 'Terjadi kesalahan')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit FAQ' : 'Tambah FAQ'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="q"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pertanyaan</FormLabel>
                  <FormControl>
                    <Input placeholder="Bagaimana cara melaporkan bencana?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="a"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jawaban</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tulis jawaban lengkap di sini..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <FormLabel>Aktif</FormLabel>
                    <FormDescription>Tampil di section FAQ homepage</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
