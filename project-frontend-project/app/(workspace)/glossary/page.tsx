"use client"

import * as React from "react"
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  Filter,
  Plus,
  Search,
  Sparkles,
  Tag,
  Check,
} from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PageShell, PageHeader } from "@/components/page-shell"

interface CanonicalTerm {
  canonical: string
  aliases: string[]
  mentions: number
  definition: string
  category: "Architecture" | "State & Sync" | "AI & Trust" | "Data"
  linkedResources: string[]
}

const INITIAL_TERMS: CanonicalTerm[] = [
  {
    canonical: "Kubernetes",
    aliases: ["K8s", "k8s", "Kubernetes Cluster", "kube-system"],
    mentions: 28,
    category: "Architecture",
    definition:
      "Automated container orchestration platform for deploying, scaling, and managing cloud-native microservices with health checks.",
    linkedResources: ["System Architecture", "API Specification v2"],
  },
  {
    canonical: "Shared Temp Draft",
    aliases: ["Temp Draft", "Ephemeral Draft", "Shared Scratchpad", "Collaborative Temp State"],
    mentions: 21,
    category: "State & Sync",
    definition:
      "Centralized real-time draft state synchronized via Redis memory store so peers see pending edits without committing to main branch.",
    linkedResources: ["System Architecture", "Clinical Trial Metrics"],
  },
  {
    canonical: "Transclusion",
    aliases: [
      "Single-Source-of-Truth Transclusion",
      "SSoT Live Embed",
      "Dynamic Block Pointer",
      "Transcluded Block",
    ],
    mentions: 34,
    category: "State & Sync",
    definition:
      "Mechanism for embedding modular content blocks from a primary source into multiple destination documents by live reference.",
    linkedResources: ["Product Roadmap", "API Specification v2"],
  },
  {
    canonical: "Faithfulness Score",
    aliases: ["Grounding Score", "Hallucination Guard", "Fact-Check Metric"],
    mentions: 16,
    category: "AI & Trust",
    definition:
      "Verification score measuring adherence of generated text to verified workspace resource claims, preventing false hallucinated assertions.",
    linkedResources: ["API Specification v2"],
  },
  {
    canonical: "pgvector",
    aliases: ["Vector Store", "Postgres Vector Extension", "Embedding DB"],
    mentions: 24,
    category: "Data",
    definition:
      "Open-source vector similarity search extension for PostgreSQL 16 utilizing HNSW indexes for sub-10ms nearest neighbor queries.",
    linkedResources: ["System Architecture"],
  },
  {
    canonical: "Cell-Level Table Locking",
    aliases: ["Cell Locking", "Row Lock", "Fine-Grained Concurrency"],
    mentions: 12,
    category: "State & Sync",
    definition:
      "Multi-user concurrent table editing protocol that places locks strictly on targeted cell coordinates rather than entire sheets.",
    linkedResources: ["Clinical Trial Metrics"],
  },
]

export default function GlossaryPage() {
  const { openResourceAndChat, isResourcePrivate } = useWorkspace()
  const [search, setSearch] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")
  const [terms, setTerms] = React.useState<CanonicalTerm[]>(INITIAL_TERMS)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Form State for new term
  const [newCanonical, setNewCanonical] = React.useState("")
  const [newAliases, setNewAliases] = React.useState("")
  const [newDefinition, setNewDefinition] = React.useState("")
  const [newCategory, setNewCategory] = React.useState<CanonicalTerm["category"]>("Architecture")

  const categories = ["All", "Architecture", "State & Sync", "AI & Trust", "Data"]

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCanonical.trim() || !newDefinition.trim()) return

    const aliasList = newAliases
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)

    const newTermObj: CanonicalTerm = {
      canonical: newCanonical.trim(),
      aliases: aliasList.length ? aliasList : [newCanonical.trim()],
      mentions: 1,
      category: newCategory,
      definition: newDefinition.trim(),
      linkedResources: ["System Architecture"],
    }

    setTerms((prev) => [newTermObj, ...prev])
    setNewCanonical("")
    setNewAliases("")
    setNewDefinition("")
    setDialogOpen(false)
  }

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      term.canonical.toLowerCase().includes(search.toLowerCase()) ||
      term.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      term.definition.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === "All" || term.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        tag={
          <>
            <span className="size-1.5 rounded-full bg-[#4c9f82]" />
            Ubiquitous language <span className="text-[#a3adb9]">·</span> Term standardization
          </>
        }
        title="Living Glossary"
        description="Canonical Term Standardization engine that collapses acronyms and synonyms into single verified knowledge nodes."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="flex items-center gap-2 bg-[#1c5da7] hover:bg-[#164b87] text-white shadow-xs">
                  <Plus className="size-4" />
                  <span>Standardize Term</span>
                </Button>
              }
            />
            <DialogContent className="max-w-md bg-white dark:bg-[#161c24] border-[#e4e8ee] dark:border-[#242e3a]">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                  Add Canonical Term
                </DialogTitle>
                <DialogDescription className="text-xs text-[#637080] dark:text-[#90a0b2]">
                  Establish an authoritative primary term and associate its colloquial aliases.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateTerm} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212b] dark:text-[#e8edf2]">
                    Canonical Term (Standard)
                  </label>
                  <Input
                    placeholder="e.g. Kubernetes"
                    value={newCanonical}
                    onChange={(e) => setNewCanonical(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212b] dark:text-[#e8edf2]">
                    Aliases & Synonyms (comma separated)
                  </label>
                  <Input
                    placeholder="e.g. K8s, k8s, Kubernetes Cluster"
                    value={newAliases}
                    onChange={(e) => setNewAliases(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212b] dark:text-[#e8edf2]">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["Architecture", "State & Sync", "AI & Trust", "Data"] as const).map(
                      (cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewCategory(cat)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                            newCategory === cat
                              ? "bg-[#1c5da7] text-white border-[#1c5da7]"
                              : "border-[#e4e8ee] dark:border-[#242e3a] text-[#637080] dark:text-[#90a0b2]"
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#17212b] dark:text-[#e8edf2]">
                    Authoritative Definition
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Clear semantic definition for hover cards and graph nodes..."
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    required
                    className="w-full rounded-md border border-[#e4e8ee] dark:border-[#242e3a] bg-transparent p-2 text-xs text-[#17212b] dark:text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-[#1c5da7]"
                  />
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1c5da7] hover:bg-[#164b87] text-white"
                  >
                    Standardize Term
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#1c5da7] text-white"
                    : "bg-white dark:bg-[#161c24] text-[#637080] dark:text-[#90a0b2] border border-[#e4e8ee] dark:border-[#242e3a] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search canonical terms & aliases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs bg-white dark:bg-[#161c24] border-[#e4e8ee] dark:border-[#242e3a]"
            />
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((term) => (
            <Card
              key={term.canonical}
              className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs hover:border-[#cbd5e1] dark:hover:border-[#374151] transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-[#17212b] dark:text-[#f1f5f9]">
                        {term.canonical}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium bg-[#eef3f9] dark:bg-[#1c2736] text-[#1c5da7] dark:text-[#60a5fa] border-none"
                      >
                        {term.category}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-[#637080] dark:text-[#90a0b2]">
                      {term.mentions} occurrences in workspace
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-xs text-[#374151] dark:text-[#cbd5e1] leading-relaxed">
                  {term.definition}
                </p>

                {/* Aliases Badges */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                    Recognized Aliases & Acronyms
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {term.aliases.map((alias) => (
                      <Badge
                        key={alias}
                        variant="outline"
                        className="text-[11px] font-mono bg-[#f8fafc] dark:bg-[#121820] border-[#e4e8ee] dark:border-[#242e3a] text-[#4b5563] dark:text-[#94a3b8]"
                      >
                        {alias}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Linked Resources */}
                <div className="pt-2 border-t border-[#edf0f3] dark:border-[#242e3a] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#637080] dark:text-[#90a0b2]">
                    Referenced in:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {term.linkedResources
                      .filter((res) => !isResourcePrivate(res))
                      .map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => openResourceAndChat(res)}
                          className="text-[11px] font-medium text-[#1c5da7] dark:text-[#60a5fa] hover:underline"
                        >
                          {res}
                        </button>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
    </PageShell>
  )
}
