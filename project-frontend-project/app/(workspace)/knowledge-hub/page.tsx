"use client"

import * as React from "react"
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  FileText,
  Filter,
  Layers,
  Network,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface KnowledgeGap {
  id: string
  term: string
  mentions: number
  sourceDocs: string[]
  reason: string
  suggestedType: "Document" | "Graph" | "Table"
  previewSummary: string
}

const INITIAL_GAPS: KnowledgeGap[] = [
  {
    id: "gap-1",
    term: "Cell-Level Table Locking",
    mentions: 5,
    sourceDocs: ["Clinical Trial Metrics", "Product Roadmap"],
    reason: "Mentioned 5 times across sheets and roadmap without a dedicated spec or architectural definition.",
    suggestedType: "Document",
    previewSummary:
      "Granular concurrency control mechanism in tabular resources that locks specific coordinates (row/cell) rather than entire sheets.",
  },
  {
    id: "gap-2",
    term: "pgvector Hybrid Indexing",
    mentions: 4,
    sourceDocs: ["System Architecture", "API Specification v2"],
    reason: "Referenced as retrieval backbone but missing explicit indexing configuration and vector distance metrics.",
    suggestedType: "Document",
    previewSummary:
      "Hybrid vector and inverted search setup using HNSW index and pg_trgm for exact code and semantic similarity search.",
  },
  {
    id: "gap-3",
    term: "Selective Staging State",
    mentions: 3,
    sourceDocs: ["System Architecture", "PRD"],
    reason: "Referenced in 3-tab save modal architecture without formal state-machine transition specifications.",
    suggestedType: "Graph",
    previewSummary:
      "Client-server synchronization model partitioning draft mutations into staging buckets prior to permanent commit.",
  },
]

interface TransclusionNode {
  sourceDoc: string
  blockId: string
  contentSnippet: string
  referencedBy: string[]
  status: "Synced" | "Pending Draft"
}

const TRANSCLUSIONS: TransclusionNode[] = [
  {
    sourceDoc: "API Specification v2",
    blockId: "#gateway-spec",
    contentSnippet: "FastAPI gateway handling async WebSockets and SSE claim validation streams.",
    referencedBy: ["System Architecture", "Product Roadmap"],
    status: "Synced",
  },
  {
    sourceDoc: "System Architecture",
    blockId: "#redis-scratchpad",
    contentSnippet: "Redis cluster maintaining shared temp draft buffers with sub-15ms roundtrip.",
    referencedBy: ["API Specification v2"],
    status: "Synced",
  },
  {
    sourceDoc: "Product Roadmap",
    blockId: "#q4-milestones",
    contentSnippet: "Q4 2026: Universal multi-format exporter and offline conflict resolution.",
    referencedBy: ["Brand direction", "Clinical Trial Metrics"],
    status: "Pending Draft",
  },
]

export default function KnowledgeHubPage() {
  const { createResource, sendMessage, openResourceAndChat } = useWorkspace()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("gaps")
  const [gaps, setGaps] = React.useState<KnowledgeGap[]>(INITIAL_GAPS)
  const [draftedGaps, setDraftedGaps] = React.useState<string[]>([])

  const handleDraftForGap = (gap: KnowledgeGap) => {
    // 1. Create a new resource for this gap
    createResource(gap.suggestedType, "Product docs")
    // 2. Mark as drafted
    setDraftedGaps((prev) => [...prev, gap.id])
    // 3. Populate chat prompt to generate the spec
    sendMessage(
      `Please draft a comprehensive resource explaining "${gap.term}" with definitions, architectural context, and cross-references.`
    )
  }

  const filteredGaps = gaps.filter(
    (g) =>
      g.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.reason.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17212b] dark:text-[#f1f5f9]">
              Knowledge Hub
            </h1>
            <p className="mt-1 text-sm text-[#637080] dark:text-[#90a0b2]">
              Global semantic index, single-source-of-truth transclusions, and orphan knowledge detection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white dark:bg-[#161c24] border-[#e4e8ee] dark:border-[#242e3a]"
              />
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                  Faithfulness Score
                </span>
                <span className="grid size-7 place-items-center rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#17212b] dark:text-[#f1f5f9]">98.4%</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3" />
                <span>Zero hallucinated claims</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                  Knowledge Gaps
                </span>
                <span className="grid size-7 place-items-center rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#17212b] dark:text-[#f1f5f9]">
                {gaps.length - draftedGaps.length} <span className="text-xs font-normal text-muted-foreground">orphans</span>
              </div>
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Action recommended
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                  Live Transclusions
                </span>
                <span className="grid size-7 place-items-center rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Network className="size-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#17212b] dark:text-[#f1f5f9]">14</div>
              <div className="mt-1 text-xs text-[#637080] dark:text-[#90a0b2]">
                Synced across 6 resources
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                  Living Entities
                </span>
                <span className="grid size-7 place-items-center rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
                  <BookOpen className="size-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-[#17212b] dark:text-[#f1f5f9]">142</div>
              <div className="mt-1 text-xs text-[#637080] dark:text-[#90a0b2]">
                Indexed in semantic graph
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Knowledge Gaps & Transclusion Network */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#e4e8ee] dark:border-[#242e3a] pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("gaps")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "gaps"
                    ? "bg-[#1c5da7] text-white"
                    : "text-[#637080] dark:text-[#90a0b2] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <FileQuestion className="size-3.5" />
                <span>🔍 ช่องว่างความรู้ (Knowledge Gaps)</span>
                <Badge
                  variant="secondary"
                  className={`ml-1 text-[10px] px-1.5 py-0 border-none ${
                    activeTab === "gaps" ? "bg-white/20 text-white" : ""
                  }`}
                >
                  {gaps.length - draftedGaps.length}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transclusions")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "transclusions"
                    ? "bg-[#1c5da7] text-white"
                    : "text-[#637080] dark:text-[#90a0b2] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Network className="size-3.5" />
                <span>Single Source of Truth Transclusions</span>
                <Badge
                  variant="secondary"
                  className={`ml-1 text-[10px] px-1.5 py-0 border-none ${
                    activeTab === "transclusions" ? "bg-white/20 text-white" : ""
                  }`}
                >
                  {TRANSCLUSIONS.length}
                </Badge>
              </button>
            </div>
          </div>

          {/* Tab 1: Knowledge Gaps */}
          {activeTab === "gaps" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="font-semibold">
                      Orphan Concepts Detected by Living Knowledge Engine
                    </div>
                    <div>
                      These terms are referenced repeatedly in project resources without a primary defining document. Creating official resources for these topics closes knowledge gaps and raises synthesis accuracy.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredGaps.map((gap) => {
                  const isDrafted = draftedGaps.includes(gap.id)
                  return (
                    <Card
                      key={gap.id}
                      className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs hover:border-[#cbd5e1] dark:hover:border-[#374151] transition-all"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                              <FileText className="size-4" />
                            </span>
                            <div>
                              <CardTitle className="text-base font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                                {gap.term}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800">
                                  {gap.mentions} mentions
                                </Badge>
                                <span className="text-[11px] text-[#637080] dark:text-[#90a0b2]">
                                  Cited in: {gap.sourceDocs.join(", ")}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isDrafted ? (
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 py-1 px-3">
                              <CheckCircle2 className="size-3.5 mr-1" />
                              Draft created in workspace
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleDraftForGap(gap)}
                              size="sm"
                              className="bg-[#1c5da7] hover:bg-[#164b87] text-white text-xs flex items-center gap-1.5 shadow-xs"
                            >
                              <Sparkles className="size-3.5" />
                              <span>✨ สั่ง AI ร่างเอกสาร (Draft Doc)</span>
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        <p className="text-xs text-[#637080] dark:text-[#90a0b2]">{gap.reason}</p>
                        <div className="rounded-lg bg-[#f8fafc] dark:bg-[#121820] p-3 text-xs text-[#4b5563] dark:text-[#94a3b8] border border-[#edf0f3] dark:border-[#242e3a]">
                          <span className="font-semibold text-[#17212b] dark:text-[#e8edf2]">
                            Suggested Outline:{" "}
                          </span>
                          {gap.previewSummary}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Transclusions */}
          {activeTab === "transclusions" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/20 p-4">
                <div className="flex items-start gap-3">
                  <Network className="size-5 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                    <div className="font-semibold">
                      Live Single-Source-of-Truth (SSoT) Transclusion Map
                    </div>
                    <div>
                      Blocks tagged with transclusion IDs stay synchronized across all target resources. Updating the original source automatically refreshes all embedding targets without manual copy-pasting.
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {TRANSCLUSIONS.map((t, index) => (
                  <Card
                    key={index}
                    className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {t.blockId}
                          </Badge>
                          <span className="text-xs font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                            Origin: {t.sourceDoc}
                          </span>
                        </div>
                        <Badge
                          variant={t.status === "Synced" ? "outline" : "secondary"}
                          className={
                            t.status === "Synced"
                              ? "border-emerald-200 text-emerald-700 dark:border-emerald-900 dark:text-emerald-400"
                              : "border-amber-200 text-amber-700 dark:border-amber-900 dark:text-amber-400"
                          }
                        >
                          {t.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      <div className="rounded-md border-l-2 border-[#1c5da7] bg-[#f8fafc] dark:bg-[#121820] p-3 text-xs italic text-[#4b5563] dark:text-[#94a3b8]">
                        &ldquo;{t.contentSnippet}&rdquo;
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#637080] dark:text-[#90a0b2]">
                        <span className="font-medium text-[#17212b] dark:text-[#e8edf2]">
                          Transcluded into:
                        </span>
                        {t.referencedBy.map((ref) => (
                          <Badge
                            key={ref}
                            variant="secondary"
                            onClick={() => openResourceAndChat(ref)}
                            className="cursor-pointer hover:bg-primary/20 text-[10px]"
                          >
                            {ref}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
