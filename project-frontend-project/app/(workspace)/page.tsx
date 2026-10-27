"use client"

import * as React from "react"
import {
  ChevronRight,
  FileText,
  Library,
  MoreHorizontal,
  Network,
  Sparkles,
  Users,
  X,
  Bot,
} from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function WorkspacePage() {
  const { allResources, deletedResources, openResource, closeResource, openResourceAndChat } =
    useWorkspace()

  const hasResource = Boolean(openResource)
  const currentResource = allResources.find((r) => r.name === openResource)

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col px-5 py-7 sm:px-8 lg:px-10">
      {/* 1. Header greeting (when no resource is opened) */}
      {!hasResource && (
        <>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#5e8bb7] dark:text-[#93c5fd]">
                <span className="size-1.5 rounded-full bg-[#4c9f82]" />
                All systems synced <span className="text-[#a3adb9]">·</span> Updated just now
              </div>
              <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#17212b] dark:text-[#f1f5f9] sm:text-[32px]">
                Good morning, Sarah.
              </h1>
              <p className="mt-1.5 text-[14px] text-[#7a8795] dark:text-[#94a3b8]">
                Choose a resource or ask Project P about your knowledge workspace.
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Resources", value: "48", icon: Library },
              { label: "Knowledge coverage", value: "82%", icon: Network },
              { label: "Open conflicts", value: "3", icon: Sparkles },
              { label: "Team activity", value: "24", icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <Card
                key={label}
                className="rounded-xl border border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-medium text-[#84909d] dark:text-[#94a3b8]">
                    {label}
                  </div>
                  <Icon className="size-4 text-[#5b86b0] dark:text-[#60a5fa]" />
                </div>
                <div className="mt-3 text-[25px] font-semibold tracking-[-0.04em] text-[#17212b] dark:text-[#f1f5f9]">
                  {value}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* 2. Focused Resource View (when a resource is opened) */}
      {hasResource && (
        <Card className="rounded-xl border border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6d8eae] dark:text-[#93c5fd]">
                <FileText className="size-3.5 text-[#1c5da7] dark:text-[#60a5fa]" />
                <span>{currentResource?.type ?? "Resource"}</span>
              </div>
              <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#17212b] dark:text-[#f1f5f9]">
                {openResource}
              </h1>
              <p className="mt-2 text-[13px] text-[#7a8795] dark:text-[#94a3b8]">
                A focused resource view. Ask the mini chat below to summarize, compare, or update this content.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeResource}
              aria-label="Close resource"
              className="size-8 rounded-md text-[#8e9aa7] hover:bg-[#f4f6f8] dark:hover:bg-[#1f2937]"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-[#f7f9fb] dark:bg-[#1f2937]/50 p-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[#9aa5b2] dark:text-[#64748b]">
                Status
              </div>
              <div className="mt-2 text-[13px] font-semibold text-[#3f8065] dark:text-[#4ade80] flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-[#4c9f82]" />
                Synced (Single Source of Truth)
              </div>
            </div>
            <div className="rounded-lg bg-[#f7f9fb] dark:bg-[#1f2937]/50 p-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[#9aa5b2] dark:text-[#64748b]">
                Type
              </div>
              <div className="mt-2 text-[13px] font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                {currentResource?.type}
              </div>
            </div>
            <div className="rounded-lg bg-[#f7f9fb] dark:bg-[#1f2937]/50 p-4">
              <div className="text-[11px] uppercase tracking-[0.12em] text-[#9aa5b2] dark:text-[#64748b]">
                Source
              </div>
              <div className="mt-2 text-[13px] font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                Product docs
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Resources Grid Section */}
      {!hasResource && (
        <Card className="mt-7 rounded-xl border border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#edf0f3] dark:border-[#242e3a] px-5 py-4">
            <div>
              <h2 className="text-[14px] font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                Resources
              </h2>
              <p className="mt-0.5 text-[11px] text-[#8a95a3] dark:text-[#64748b]">
                Folders and resource types in Project P
              </p>
            </div>
            <MoreHorizontal className="size-4 text-[#9aa5b2]" />
          </div>

          <div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {allResources
              .filter((resource) => !deletedResources.includes(resource.name))
              .map((resource) => {
                const Icon = resource.icon || FileText
                return (
                  <button
                    key={resource.name}
                    type="button"
                    onClick={() => openResourceAndChat(resource.name)}
                    className="group flex items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-[#dbe5f0] dark:hover:border-[#334155] hover:bg-[#f8fbfe] dark:hover:bg-[#1e293b]/50"
                  >
                    <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${resource.color}`}>
                      <Icon className="size-[17px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-[#263442] dark:text-[#f1f5f9]">
                        {resource.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#9aa5b2] dark:text-[#64748b]">
                        {resource.detail}
                      </div>
                    </div>
                    <ChevronRight className="ml-auto size-3.5 text-[#b0bac5] opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )
              })}
          </div>
        </Card>
      )}

      {/* 4. Activity and Assistant Summary Footer */}
      {!hasResource && (
        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <Card className="rounded-xl border border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                  Workspace activity
                </h2>
                <p className="mt-0.5 text-[11px] text-[#8a95a3] dark:text-[#64748b]">
                  Recent changes from your team
                </p>
              </div>
              <Users className="size-4 text-[#8a95a3]" />
            </div>
            {[
              "Jordan Lee updated API Specification v2",
              "Mina Kim resolved a glossary conflict",
              "You created a new resource",
            ].map((item) => (
              <div
                key={item}
                className="border-t border-[#f0f2f5] dark:border-[#242e3a] py-3 text-[12px] text-[#697889] dark:text-[#94a3b8]"
              >
                {item}
              </div>
            ))}
          </Card>

          <Card className="rounded-xl border border-[#dbe5f0] dark:border-[#1e3a8a] bg-[#f8fbfe] dark:bg-[#172554]/20 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[14px] font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                    Project P assistant
                  </h2>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-[#deebf8] dark:bg-[#1e3a8a] text-[#4778aa] dark:text-[#93c5fd] px-2 py-0.5 text-[10px] font-medium border-none"
                  >
                    Beta
                  </Badge>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6d8195] dark:text-[#94a3b8]">
                  Ask about resources, patterns, cross-source conflict detection, or your next draft in the chat.
                </p>
              </div>
              <Bot className="size-5 text-[#5d8ab6] dark:text-[#60a5fa]" />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
