"use client"

import * as React from "react"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  GitCommit,
  GitPullRequest,
  Lock,
  MessageSquare,
  Network,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Unlock,
  Zap,
} from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PageShell, PageHeader } from "@/components/page-shell"

type ActivityType = "commit" | "conflict" | "lock" | "transclusion"

interface ActivityEvent {
  id: string
  type: ActivityType
  title: string
  description: string
  author: {
    name: string
    initials: string
    color: string
  }
  resource: string
  timestamp: string
  diffStats?: { added: number; removed: number; blocks: number }
  conflictDetails?: { resolved: boolean; conflictingWith: string }
}

const EVENTS: ActivityEvent[] = [
  {
    id: "act-1",
    type: "commit",
    title: "Committed 2 staged blocks to official specification",
    description: "Added WebSocket heartbeat ping interval (15s) and reconnect retry policy.",
    author: { name: "Sarah Wong", initials: "SW", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" },
    resource: "API Specification v2",
    timestamp: "12 minutes ago",
    diffStats: { added: 84, removed: 12, blocks: 2 },
  },
  {
    id: "act-2",
    type: "conflict",
    title: "Conflict Detected on Generate & Auto-Resolved",
    description: "Drafted database schema claimed Redis cache TTL of 3600s, which conflicted with System Architecture (300s). AI reconciled to 300s standard.",
    author: { name: "Project P AI", initials: "AI", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300" },
    resource: "Database schema",
    timestamp: "45 minutes ago",
    conflictDetails: { resolved: true, conflictingWith: "System Architecture" },
  },
  {
    id: "act-3",
    type: "lock",
    title: "Cell Lock released on Clinical Trial Table",
    description: "Cell B4 (Dosage Level 3) unlocked after value validation and temp state push.",
    author: { name: "Alex Rivera", initials: "AR", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300" },
    resource: "Clinical Trial Metrics",
    timestamp: "1 hour ago",
  },
  {
    id: "act-4",
    type: "transclusion",
    title: "Transclusion Propagated to 2 Documents",
    description: "Block #gateway-spec update synced to System Architecture and Product Roadmap automatically.",
    author: { name: "Project P SSoT Engine", initials: "SS", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300" },
    resource: "API Specification v2",
    timestamp: "2 hours ago",
  },
  {
    id: "act-5",
    type: "commit",
    title: "Selective Commit: Approved Block 1 & 3",
    description: "Committed executive roadmap milestone dates for Q4 2026. Block 2 remains in shared temp draft.",
    author: { name: "Jordan Lee", initials: "JL", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300" },
    resource: "Product Roadmap",
    timestamp: "Yesterday at 17:40",
    diffStats: { added: 140, removed: 45, blocks: 2 },
  },
  {
    id: "act-6",
    type: "lock",
    title: "Cell Lock acquired on Table Row 4",
    description: "Alex Rivera initiated live edit on cell coordinates (Row 4, Col 2).",
    author: { name: "Alex Rivera", initials: "AR", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300" },
    resource: "Clinical Trial Metrics",
    timestamp: "Yesterday at 16:15",
  },
]

export default function ActivityPage() {
  const { openResourceAndChat } = useWorkspace()
  const [filter, setFilter] = React.useState<"all" | ActivityType>("all")

  const filteredEvents = EVENTS.filter(
    (e) => filter === "all" || e.type === filter
  )

  const getEventIcon = (type: ActivityType) => {
    switch (type) {
      case "commit":
        return <GitCommit className="size-4 text-blue-600 dark:text-blue-400" />
      case "conflict":
        return <ShieldAlert className="size-4 text-amber-600 dark:text-amber-400" />
      case "lock":
        return <Lock className="size-4 text-emerald-600 dark:text-emerald-400" />
      case "transclusion":
        return <Network className="size-4 text-violet-600 dark:text-violet-400" />
    }
  }

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        tag={
          <>
            <span className="size-1.5 rounded-full bg-[#4c9f82]" />
            Live audit log <span className="text-[#a3adb9]">·</span> Real-time workspace events
          </>
        }
        title="Workspace Activity & Audit Feed"
        description="Track selective commits, fact-checking conflict resolutions, cell locking, and live transclusion syncs."
      />

      {/* 3 Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                  Selective Commits
                </span>
                <span className="grid size-7 place-items-center rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <GitCommit className="size-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#17212b] dark:text-[#f1f5f9]">38</div>
              <div className="mt-1 text-xs text-[#637080] dark:text-[#90a0b2]">
                This week · Zero merge conflicts
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                  Conflicts Prevented
                </span>
                <span className="grid size-7 place-items-center rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <ShieldAlert className="size-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#17212b] dark:text-[#f1f5f9]">12</div>
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Flagged & verified across resources
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                  Shared Temp Drafts
                </span>
                <span className="grid size-7 place-items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Clock className="size-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#17212b] dark:text-[#f1f5f9]">4</div>
              <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Synchronized via Redis scratchpad
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 border-b border-[#e4e8ee] dark:border-[#242e3a] pb-3">
          {(
            [
              { id: "all", label: "All Events" },
              { id: "commit", label: "Selective Commits" },
              { id: "conflict", label: "Conflict Checks" },
              { id: "lock", label: "Cell Locks" },
              { id: "transclusion", label: "Transclusions" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === tab.id
                  ? "bg-[#1c5da7] text-white"
                  : "bg-white dark:bg-[#161c24] text-[#637080] dark:text-[#90a0b2] border border-[#e4e8ee] dark:border-[#242e3a] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Event Timeline */}
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs hover:border-[#cbd5e1] dark:hover:border-[#374151] transition-all"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3.5">
                  <Avatar className={`size-8 text-xs font-semibold shrink-0 ${event.author.color}`}>
                    <AvatarFallback className="bg-transparent">{event.author.initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                          {event.author.name}
                        </span>
                        <span className="text-xs text-[#637080] dark:text-[#90a0b2] truncate">
                          {event.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#a0a9b5] dark:text-[#64748b] shrink-0 font-mono">
                        {event.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#4b5563] dark:text-[#94a3b8] leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Resource Tag */}
                      <button
                        type="button"
                        onClick={() => openResourceAndChat(event.resource)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#f1f5f9] dark:bg-[#1f2937] px-2 py-0.5 text-[11px] font-medium text-[#1c5da7] dark:text-[#60a5fa] hover:underline"
                      >
                        <span>{event.resource}</span>
                      </button>

                      {/* Diff Stats if any */}
                      {event.diffStats && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            +{event.diffStats.added}
                          </span>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">
                            -{event.diffStats.removed}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            ({event.diffStats.blocks} blocks committed)
                          </span>
                        </div>
                      )}

                      {/* Conflict details if any */}
                      {event.conflictDetails && (
                        <Badge
                          variant="outline"
                          className="border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[10px]"
                        >
                          Checked vs {event.conflictDetails.conflictingWith}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
    </PageShell>
  )
}
