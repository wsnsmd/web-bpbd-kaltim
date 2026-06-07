// src/components/layout/mobile-menu.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MenuItem {
  id: number
  label: string
  url: string
  target: string | null
  children?: MenuItem[]
}

interface Props {
  navTree: MenuItem[]
  emergencyNumber: string
}

export function MobileMenu({ navTree, emergencyNumber }: Props) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  function toggleExpand(id: number) {
    setExpanded((prev) => (prev === id ? null : id))
  }

  return (
    <>
      {/* Hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 flex h-full w-75 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header drawer */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <span className="text-navy-800 text-sm font-bold">Menu Navigasi</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {navTree.map((item) => {
              const hasChildren = item.children && item.children.length > 0
              const isExpanded = expanded === item.id

              return (
                <li key={item.id}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="text-navy-800 hover:bg-navy-50 flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            'text-muted-foreground h-4 w-4 transition-transform duration-200',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </button>
                      {/* Submenu */}
                      <div
                        className={cn(
                          'overflow-hidden transition-all duration-200',
                          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        )}
                      >
                        <ul className="mx-2 mt-0.5 rounded-lg bg-slate-50 py-1">
                          {item.children!.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={child.url}
                                target={child.target ?? '_self'}
                                onClick={() => setOpen(false)}
                                className="text-muted-foreground hover:text-navy-700 block rounded-md px-4 py-2 text-sm transition-colors hover:bg-white"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.url}
                      target={item.target ?? '_self'}
                      onClick={() => setOpen(false)}
                      className="text-navy-800 hover:bg-navy-50 block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer drawer — tombol darurat */}
        <div className="border-t p-4">
          <Button
            asChild
            className="w-full rounded-full bg-orange-500 font-bold hover:bg-orange-600"
          >
            <a href={`tel:${emergencyNumber}`} onClick={() => setOpen(false)}>
              <Phone className="mr-2 h-4 w-4" />
              {emergencyNumber} — Darurat
            </a>
          </Button>
        </div>
      </div>
    </>
  )
}
