// src/components/shared/page-header.tsx
import Link from 'next/link'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@components/ui/breadcrumb'
import { cn } from '@lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  className?: string
}

export function PageHeader({ title, description, breadcrumbs, className }: PageHeaderProps) {
  return (
    <div className={cn('bg-navy-800 px-6 py-10 text-white', className)}>
      <div className="mx-auto max-w-6xl">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-navy-300 text-xs hover:text-white">
                    Beranda
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <BreadcrumbSeparator className="text-navy-500" />
                  <BreadcrumbItem>
                    {crumb.href && i < breadcrumbs.length - 1 ? (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="text-navy-300 text-xs hover:text-white">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="text-xs font-medium text-white">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && <p className="text-navy-300 mt-2 max-w-2xl text-sm">{description}</p>}
      </div>
    </div>
  )
}
