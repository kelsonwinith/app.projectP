"use client"

import * as React from "react"
import { cn } from "cn"

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  fullWidth?: boolean
}

export function PageShell({
  children,
  className,
  fullWidth = false,
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col px-5 py-7 sm:px-8 lg:px-10 pb-28 space-y-7",
        fullWidth ? "max-w-none" : "max-w-[1440px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps {
  tag?: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  tag,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-5 md:flex-row md:items-end",
        className
      )}
    >
      <div>
        {tag && (
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#5e8bb7] dark:text-[#93c5fd]">
            {tag}
          </div>
        )}
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#17212b] dark:text-[#f1f5f9] sm:text-[32px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-[14px] text-[#7a8795] dark:text-[#94a3b8]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  )
}
