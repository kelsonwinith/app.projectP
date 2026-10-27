"use client"

import * as React from "react"
import type { Collaborator } from "@/lib/collab-store"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UserEditingBadgeProps {
  collaborator: Collaborator
  size?: "xs" | "sm" | "md"
  showText?: boolean
  textPosition?: "left" | "right"
  className?: string
}

export function UserEditingBadge({
  collaborator,
  size = "sm",
  showText = true,
  textPosition = "right",
  className = "",
}: UserEditingBadgeProps) {
  const avatarSize =
    size === "xs"
      ? "size-4 text-[8px]"
      : size === "md"
      ? "size-7 text-[11px]"
      : "size-6 text-[10px]"

  const avatarElement = (
    <Tooltip>
      <TooltipTrigger
        className={`cursor-pointer rounded-full flex items-center justify-center font-bold shadow-xs transition-transform hover:scale-110 shrink-0 ${collaborator.color} ${avatarSize}`}
      >
        {collaborator.initials}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="z-50 bg-white dark:bg-[#1a222d] text-foreground border border-border shadow-xl p-3 rounded-lg flex items-center gap-3 min-w-[210px] animate-in fade-in-0 zoom-in-95"
      >
        <div
          className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${collaborator.color}`}
        >
          {collaborator.initials}
        </div>
        <div className="flex flex-col min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-foreground truncate">
              {collaborator.name}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              ({collaborator.role})
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground truncate font-mono">
            {collaborator.email}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  )

  const textElement = showText ? (
    <span
      className={`text-[11px] font-medium tracking-tight animate-pulse shrink-0 ${collaborator.textColor}`}
    >
      Editing...
    </span>
  ) : null

  return (
    <TooltipProvider delay={100}>
      <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
        {textPosition === "left" && textElement}
        {avatarElement}
        {textPosition === "right" && textElement}
      </div>
    </TooltipProvider>
  )
}
