"use client"

import * as React from "react"
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Filter,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import { PageShell, PageHeader } from "@/components/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { WorkspaceRule } from "@/lib/workspace-types"

const CATEGORIES: Array<WorkspaceRule["category"]> = ["Safety", "Behavior", "Style", "Knowledge"]

export default function RulesPage() {
  const { rules, activeRules, toggleRule, addRule, deleteRule } = useWorkspace()

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<"all" | "do" | "avoid">("all")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")

  // Create Modal State
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<"do" | "avoid">("do")
  const [category, setCategory] = React.useState<WorkspaceRule["category"]>("Behavior")
  const [description, setDescription] = React.useState("")
  const [systemDirective, setSystemDirective] = React.useState("")
  const [examplesText, setExamplesText] = React.useState("")

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim() || !systemDirective.trim()) return

    const examples = examplesText
      .split("\n")
      .map((ex) => ex.trim())
      .filter((ex) => ex.length > 0)

    addRule({
      title: title.trim(),
      type,
      category,
      description: description.trim(),
      systemDirective: systemDirective.trim(),
      examples: examples.length > 0 ? examples : [description.trim()],
      enabled: true,
    })

    setTitle("")
    setDescription("")
    setSystemDirective("")
    setExamplesText("")
    setDialogOpen(false)
  }

  // Filtered Rules
  const filteredRules = React.useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        searchQuery === "" ||
        rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.systemDirective.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = typeFilter === "all" || rule.type === typeFilter
      const matchesCategory = categoryFilter === "all" || rule.category === categoryFilter

      return matchesSearch && matchesType && matchesCategory
    })
  }, [rules, searchQuery, typeFilter, categoryFilter])

  const doCount = rules.filter((r) => r.type === "do").length
  const avoidCount = rules.filter((r) => r.type === "avoid").length

  return (
    <PageShell>
      {/* Page Header */}
      <PageHeader
        tag={
          <>
            <ShieldCheck className="size-3.5 text-[#10b981]" />
            Overall Project Agent Skills <span className="text-[#a3adb9]">·</span> Active Guardrails
          </>
        }
        title="Workspace Rules"
        description="Configure overall project agent skills and behavioral guardrails. Define explicit directives for what the AI assistant must DO and what it must AVOID across synthesis, code generation, and chat responses."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="flex items-center gap-2 bg-[#1c5da7] hover:bg-[#164b87] text-white shadow-xs">
                  <Plus className="size-4" />
                  <span>Add Rule</span>
                </Button>
              }
            />
            <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white dark:bg-[#161c24] border-[#e4e8ee] dark:border-[#242e3a] rounded-2xl shadow-xl">
              <DialogHeader className="pb-4 border-b border-[#edf0f3] dark:border-[#242e3a]">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-[#eef4fb] dark:bg-[#1a293f] text-[#1c5da7] dark:text-[#60a5fa] shrink-0">
                    <Shield className="size-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                      Add Project Agent Rule
                    </DialogTitle>
                    <DialogDescription className="text-xs text-[#64748b] dark:text-[#94a3b8] mt-0.5">
                      Define behavioral guardrails and agent skills that govern AI synthesis and assistant interactions across the workspace.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleCreateRule} className="space-y-6 pt-5 pb-2">
                {/* Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                      Rule Title
                    </label>
                    <span className="text-[11px] text-[#94a3b8]">Required</span>
                  </div>
                  <Input
                    placeholder="e.g. Always include rollback scripts with schema changes"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-10 text-xs sm:text-sm bg-white dark:bg-[#0f172a] border-[#e2e8f0] dark:border-[#242e3a] focus-visible:ring-1 focus-visible:ring-[#1c5da7]"
                  />
                </div>

                {/* Directive Type (DO vs AVOID) & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Directive Polarity */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                      Directive Polarity
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setType("do")}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                          type === "do"
                            ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/50 shadow-xs"
                            : "border-[#e2e8f0] dark:border-[#242e3a] bg-white dark:bg-[#0f172a] text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]"
                        }`}
                      >
                        <CheckCircle2 className={`size-4 ${type === "do" ? "text-emerald-600 dark:text-emerald-400" : "text-[#94a3b8]"}`} />
                        <span>DO (Skill)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setType("avoid")}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-all ${
                          type === "avoid"
                            ? "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-semibold ring-1 ring-rose-500/50 shadow-xs"
                            : "border-[#e2e8f0] dark:border-[#242e3a] bg-white dark:bg-[#0f172a] text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]"
                        }`}
                      >
                        <Ban className={`size-4 ${type === "avoid" ? "text-rose-600 dark:text-rose-400" : "text-[#94a3b8]"}`} />
                        <span>AVOID (Guard)</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                      {type === "do"
                        ? "Proactive skill: guides AI to perform positive actions."
                        : "Defensive guardrail: restricts AI from unsafe actions."}
                    </p>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                      Category Domain
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as WorkspaceRule["category"])}
                      className="w-full h-10 rounded-xl border border-[#e2e8f0] dark:border-[#242e3a] bg-white dark:bg-[#0f172a] px-3.5 text-xs sm:text-sm text-[#17212b] dark:text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-[#1c5da7] transition-colors"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
                      Groups the rule into workspace filter domains.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                    Description & Rationale
                  </label>
                  <Textarea
                    placeholder="Explain the background reasoning, intention, and expected outcomes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    className="text-xs sm:text-sm bg-white dark:bg-[#0f172a] border-[#e2e8f0] dark:border-[#242e3a] leading-relaxed p-3 focus-visible:ring-1 focus-visible:ring-[#1c5da7]"
                  />
                </div>

                {/* System Directive */}
                <div className="rounded-xl border border-[#dbe5f0] dark:border-[#1e293b] bg-[#f8fafc] dark:bg-[#0d1624] p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-[#1c5da7] dark:text-[#60a5fa]" />
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#1e293b] dark:text-[#e2e8f0]">
                        Agent System Directive
                      </label>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-white dark:bg-[#161c24] border-[#cbd5e1] dark:border-[#334155] text-[#1c5da7] dark:text-[#60a5fa]">
                      Injected into LLM Prompt
                    </Badge>
                  </div>
                  <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] leading-normal">
                    This exact directive will be injected into the AI system prompt when evaluating queries and generating resources.
                  </p>
                  <Textarea
                    placeholder="e.g. Always generate rollback migrations alongside any SQL expansion queries."
                    value={systemDirective}
                    onChange={(e) => setSystemDirective(e.target.value)}
                    required
                    rows={3}
                    className="text-xs font-mono bg-white dark:bg-[#080d15] border-[#cbd5e1] dark:border-[#1f293d] text-[#0f172a] dark:text-[#93c5fd] leading-relaxed p-3 focus-visible:ring-1 focus-visible:ring-[#1c5da7]"
                  />
                </div>

                {/* Examples */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-[#cbd5e1]">
                      Concrete Examples
                    </label>
                    <span className="text-[11px] text-[#94a3b8]">One per line</span>
                  </div>
                  <Textarea
                    placeholder="e.g. Include down migration scripts&#10;Verify backward compatibility&#10;Test rollback on staging database"
                    value={examplesText}
                    onChange={(e) => setExamplesText(e.target.value)}
                    rows={3}
                    className="text-xs sm:text-sm bg-white dark:bg-[#0f172a] border-[#e2e8f0] dark:border-[#242e3a] leading-relaxed p-3 focus-visible:ring-1 focus-visible:ring-[#1c5da7]"
                  />
                </div>

                <DialogFooter className="pt-4 border-t border-[#edf0f3] dark:border-[#242e3a] flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="h-10 px-4 text-xs font-medium border-[#d2d9e2] dark:border-[#242e3a]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 px-5 text-xs font-medium bg-[#1c5da7] hover:bg-[#164b87] text-white shadow-xs gap-1.5"
                  >
                    <Plus className="size-4" />
                    <span>Create Project Rule</span>
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Summary KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-[#edf0f3] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
              Total Rules
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-[#17212b] dark:text-[#f1f5f9]">
              {rules.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
              Skill repository count
            </span>
          </CardContent>
        </Card>

        <Card className="border-[#edf0f3] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
              Active Enforced
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeRules.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">
              Live in prompt evaluation
            </span>
          </CardContent>
        </Card>

        <Card className="border-[#edf0f3] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
              Do Directives
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-[#1c5da7] dark:text-[#60a5fa]">
              {doCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
              Proactive skills to do
            </span>
          </CardContent>
        </Card>

        <Card className="border-[#edf0f3] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium text-[#64748b] dark:text-[#94a3b8]">
              Avoid Directives
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {avoidCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <span className="text-[11px] text-[#64748b] dark:text-[#94a3b8]">
              Defensive safety guardrails
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-y border-[#edf0f3] dark:border-[#242e3a] py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-[#94a3b8]" />
            <Input
              placeholder="Search rules, directives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8.5 pl-8 text-xs bg-white dark:bg-[#161c24] border-[#e2e8f0] dark:border-[#242e3a]"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center rounded-lg border border-[#e2e8f0] dark:border-[#242e3a] p-0.5 bg-[#f8fafc] dark:bg-[#0f172a]">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                typeFilter === "all"
                  ? "bg-white dark:bg-[#1e293b] text-[#17212b] dark:text-[#f1f5f9] shadow-xs"
                  : "text-[#64748b] hover:text-[#17212b] dark:hover:text-[#f1f5f9]"
              }`}
            >
              All ({rules.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("do")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                typeFilter === "do"
                  ? "bg-white dark:bg-[#1e293b] text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-[#64748b] hover:text-emerald-600"
              }`}
            >
              <CheckCircle2 className="size-3" />
              Do&apos;s ({doCount})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("avoid")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                typeFilter === "avoid"
                  ? "bg-white dark:bg-[#1e293b] text-rose-700 dark:text-rose-400 shadow-xs"
                  : "text-[#64748b] hover:text-rose-600"
              }`}
            >
              <Ban className="size-3" />
              Avoids ({avoidCount})
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-[#64748b] dark:text-[#94a3b8] mr-1 flex items-center gap-1">
            <Filter className="size-3" />
            Category:
          </span>
          {["all", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-[#1c5da7] text-white"
                  : "border border-[#e2e8f0] dark:border-[#242e3a] bg-white dark:bg-[#161c24] text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      {filteredRules.length === 0 ? (
        <Card className="border-dashed border-[#d2d9e2] dark:border-[#242e3a] bg-[#fafbfc] dark:bg-[#161c24]/50 py-12 text-center">
          <CardContent className="space-y-3">
            <ShieldAlert className="size-10 text-[#94a3b8] mx-auto" />
            <h3 className="text-sm font-semibold text-[#17212b] dark:text-[#f1f5f9]">
              No workspace rules found
            </h3>
            <p className="text-xs text-[#64748b] dark:text-[#94a3b8] max-w-sm mx-auto">
              No rules match your active search and category filters. Try resetting your filters or create a new rule.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setTypeFilter("all")
                setCategoryFilter("all")
              }}
              className="text-xs gap-1.5 mt-2"
            >
              <RotateCcw className="size-3" />
              Reset filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule) => {
            const isDo = rule.type === "do"
            return (
              <div
                key={rule.id}
                className={`flex flex-col justify-between rounded-xl border bg-white dark:bg-[#161c24] p-5 shadow-xs transition-all ${
                  rule.enabled
                    ? isDo
                      ? "border-emerald-100 dark:border-emerald-950/60 hover:border-emerald-300 dark:hover:border-emerald-800"
                      : "border-rose-100 dark:border-rose-950/60 hover:border-rose-300 dark:hover:border-rose-800"
                    : "opacity-60 border-[#edf0f3] dark:border-[#242e3a] hover:opacity-100"
                }`}
              >
                <div>
                  {/* Top Bar: Badges + Switch + Delete */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isDo ? (
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold gap-1 py-0.5">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          DO
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-semibold gap-1 py-0.5">
                          <Ban className="size-3 text-rose-600" />
                          AVOID
                        </Badge>
                      )}

                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium bg-[#f1f5f9] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] border-none"
                      >
                        {rule.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#64748b] dark:text-[#94a3b8]">
                          {rule.enabled ? "Active" : "Off"}
                        </span>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                          aria-label={`Toggle rule ${rule.title}`}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteRule(rule.id)}
                        title="Delete rule"
                        aria-label={`Delete rule ${rule.title}`}
                        className="text-[#94a3b8] hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-semibold text-[#17212b] dark:text-[#f1f5f9] mb-1.5 leading-snug">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-relaxed mb-3">
                    {rule.description}
                  </p>

                  {/* System Directive Injected Box */}
                  <div className="rounded-lg border border-[#e2e8f0] dark:border-[#242e3a] bg-[#f8fafc] dark:bg-[#0f172a] p-2.5 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#64748b] dark:text-[#94a3b8]">
                        Agent Skill Directive
                      </span>
                      <Sparkles className="size-2.5 text-[#1c5da7] dark:text-[#60a5fa]" />
                    </div>
                    <p className="text-[11px] font-mono text-[#1e293b] dark:text-[#93c5fd] leading-normal break-words">
                      &quot;{rule.systemDirective}&quot;
                    </p>
                  </div>

                  {/* Concrete Examples */}
                  {rule.examples && rule.examples.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-[#64748b] dark:text-[#94a3b8]">
                        Enforcement examples:
                      </span>
                      <ul className="space-y-1">
                        {rule.examples.map((example, i) => (
                          <li
                            key={i}
                            className="text-[11px] text-[#475569] dark:text-[#cbd5e1] flex items-start gap-1.5"
                          >
                            <span
                              className={`size-1 rounded-full mt-1.5 shrink-0 ${
                                isDo ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Status */}
                <div className="mt-4 pt-3 border-t border-[#edf0f3] dark:border-[#242e3a] flex items-center justify-between text-[10px]">
                  <span
                    className={
                      rule.enabled
                        ? "text-emerald-600 dark:text-emerald-400 font-medium"
                        : "text-[#94a3b8]"
                    }
                  >
                    {rule.enabled
                      ? "● Guardrail active in AI synthesis"
                      : "○ Paused — bypassed during prompt build"}
                  </span>
                  <span className="text-[#94a3b8]">ID: {rule.id}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
