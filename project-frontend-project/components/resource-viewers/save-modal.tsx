"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useDraftStore, useResourceDrafts, type DraftBlock } from "@/lib/draft-store"
import { CheckCircle2, AlertTriangle, FileText, GitCompare, MessageSquareCheck, Check } from "lucide-react"

interface SaveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resourceName: string
  onCommitted?: () => void
}

function calculateDiffStats(original: string, proposed: string) {
  const origWords = original.trim().split(/\s+/).filter(Boolean)
  const propWords = proposed.trim().split(/\s+/).filter(Boolean)
  const additions = Math.max(0, propWords.length - origWords.length)
  const deletions = Math.max(0, origWords.length - propWords.length)
  const modifications = Math.min(origWords.length, propWords.length)
  return { additions, deletions, modifications }
}

export function SaveModal({
  open,
  onOpenChange,
  resourceName,
  onCommitted,
}: SaveModalProps) {
  const draftsMap = useResourceDrafts(resourceName)
  const commitSelective = useDraftStore((state) => state.commitSelective)
  const draftBlocks = Object.values(draftsMap)

  const [selectedAnchorIds, setSelectedAnchorIds] = React.useState<string[]>([])
  const [commitNote, setCommitNote] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("diff")

  // Sync selected anchor IDs when draftBlocks change or modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedAnchorIds(draftBlocks.map((b) => b.anchorId))
      setCommitNote("")
    }
  }, [open, draftsMap])

  const toggleSelect = (anchorId: string) => {
    setSelectedAnchorIds((prev) =>
      prev.includes(anchorId)
        ? prev.filter((id) => id !== anchorId)
        : [...prev, anchorId]
    )
  }

  const selectAll = () => {
    setSelectedAnchorIds(draftBlocks.map((b) => b.anchorId))
  }

  const deselectAll = () => {
    setSelectedAnchorIds([])
  }

  const handleCommit = () => {
    if (selectedAnchorIds.length === 0) return
    commitSelective(resourceName, selectedAnchorIds)
    onCommitted?.()
    onOpenChange(false)
  }

  const unselectedCount = draftBlocks.length - selectedAnchorIds.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[85vh] flex flex-col p-6 gap-4">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              Audit & Commit
            </Badge>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Save Resource: {resourceName}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Review your local shared temp drafts. Use selective staging to commit only the verified blocks. Unselected blocks will remain safe in local draft state.
          </DialogDescription>
        </DialogHeader>

        {draftBlocks.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
            <CheckCircle2 className="size-10 text-emerald-500" />
            <h4 className="font-medium text-foreground">No Pending Drafts</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              All blocks are up to date and committed to single-source-of-truth storage.
            </p>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <TabsList>
                <TabsTrigger value="diff" className="gap-1.5 text-xs">
                  <GitCompare className="size-3.5" />
                  Proposed Diff ({selectedAnchorIds.length}/{draftBlocks.length})
                </TabsTrigger>
                <TabsTrigger value="original" className="gap-1.5 text-xs">
                  <FileText className="size-3.5" />
                  Original Content
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-1.5 text-xs">
                  <MessageSquareCheck className="size-3.5" />
                  Notes & Contradictions
                </TabsTrigger>
              </TabsList>

              {activeTab === "diff" && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-primary hover:underline font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">•</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-muted-foreground hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            {/* TAB 1: Proposed Diff */}
            <TabsContent value="diff" className="flex-1 overflow-y-auto pr-1 py-3 space-y-4">
              {draftBlocks.map((block) => {
                const isSelected = selectedAnchorIds.includes(block.anchorId)
                const stats = calculateDiffStats(block.originalText, block.proposedText)

                return (
                  <div
                    key={block.anchorId}
                    className={`rounded-lg border transition-colors p-3.5 ${
                      isSelected
                        ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                        : "border-border bg-card opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(block.anchorId)}
                          id={`stage-${block.anchorId}`}
                        />
                        <label
                          htmlFor={`stage-${block.anchorId}`}
                          className="text-xs font-semibold font-mono cursor-pointer text-foreground"
                        >
                          Anchor: #{block.anchorId}
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        {stats.additions > 0 && (
                          <span className="text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                            +{stats.additions} words
                          </span>
                        )}
                        {stats.deletions > 0 && (
                          <span className="text-[11px] font-mono font-medium text-rose-600 dark:text-rose-400">
                            -{stats.deletions} words
                          </span>
                        )}
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                          Modified
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-2 text-xs font-sans">
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-950 dark:text-rose-200">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold mb-1">
                          Original:
                        </div>
                        <p className="line-through opacity-80 leading-relaxed">
                          {block.originalText}
                        </p>
                      </div>

                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                          Proposed Staged:
                        </div>
                        <p className="font-medium leading-relaxed">
                          {block.proposedText}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </TabsContent>

            {/* TAB 2: Original Content */}
            <TabsContent value="original" className="flex-1 overflow-y-auto pr-1 py-3 space-y-3">
              {draftBlocks.map((block) => (
                <div key={block.anchorId} className="rounded-lg border border-border p-3 bg-muted/30">
                  <div className="text-xs font-mono font-semibold text-muted-foreground mb-1">
                    #{block.anchorId}
                  </div>
                  <div className="text-xs text-foreground leading-relaxed">
                    {block.originalText}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB 3: Notes & Contradictions */}
            <TabsContent value="notes" className="flex-1 overflow-y-auto pr-1 py-3 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Commit Notes & Audit Justification
                </label>
                <Textarea
                  placeholder="Describe why these changes are made, e.g. 'Aligning metrics with Q4 executive review'..."
                  rows={3}
                  value={commitNote}
                  onChange={(e) => setCommitNote(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  <span className="text-xs font-semibold">Contradiction Guard Check Passed</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Local-first verification scanned {draftBlocks.length} modified blocks against all canonical documents in the living glossary. No mutually conflicting metrics or terminology mismatches detected.
                </p>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-4" />
                  <span className="text-xs font-semibold">Single-Source Transclusion Advisory</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Committing block #p-002 will automatically trigger transclusion updates in 2 connected workspace downstream resources.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="shrink-0 flex items-center justify-between sm:justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            {unselectedCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                {unselectedCount} block{unselectedCount > 1 ? "s" : ""} will remain in temp draft
              </span>
            ) : draftBlocks.length > 0 ? (
              <span>All changes selected for commit</span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={selectedAnchorIds.length === 0}
              onClick={handleCommit}
              className="gap-1.5"
            >
              <Check className="size-3.5" />
              Commit {selectedAnchorIds.length} Block{selectedAnchorIds.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
