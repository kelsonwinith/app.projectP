"use client"

import * as React from "react"
import { INITIAL_DOCUMENT_BLOCKS, type DocumentBlock } from "@/lib/resource-data"
import {
  useDraftStore,
  useResourceDrafts,
  useResourceOverrides,
  useImportedDocument,
} from "@/lib/draft-store"
import { useCollabStore, useCurrentUser } from "@/lib/collab-store"
import { UserEditingBadge } from "./user-editing-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  RotateCcw,
  Sparkles,
  Link2,
  Check,
  Columns,
  Eye,
  Edit3,
  Lock,
} from "lucide-react"

interface DocumentViewerProps {
  resourceName: string
}

export function DocumentViewer({ resourceName }: DocumentViewerProps) {
  const drafts = useResourceDrafts(resourceName)
  const committedOverrides = useResourceOverrides(resourceName)
  const peerLocks = useCollabStore((state) => state.peerLocks)
  const collaborators = useCollabStore((state) => state.collaborators)
  const currentUser = useCurrentUser()

  const saveTempBlock = useDraftStore((state) => state.saveTempBlock)
  const revertTempBlock = useDraftStore((state) => state.revertTempBlock)

  const [activeAnchor, setActiveAnchor] = React.useState<string>("p-001")
  const [viewMode, setViewMode] = React.useState<"wysiwyg" | "markdown" | "split">("split")
  const [editingBlockId, setEditingBlockId] = React.useState<string | null>(null)
  const [editValues, setEditValues] = React.useState<Record<string, string>>({})

  const importedBlocks = useImportedDocument(resourceName)
  const baseBlocks = importedBlocks.length > 0 ? importedBlocks : INITIAL_DOCUMENT_BLOCKS

  // Compute final effective blocks
  const blocks = React.useMemo(() => {
    return baseBlocks.map((origBlock) => {
      const committedText = committedOverrides[origBlock.id] ?? origBlock.content
      const draft = drafts[origBlock.id]
      const currentContent = draft ? draft.proposedText : committedText
      const isDraftModified = !!draft
      return {
        ...origBlock,
        originalCommitted: committedText,
        currentContent,
        isDraftModified,
      }
    })
  }, [baseBlocks, drafts, committedOverrides])

  // ScrollSpy observer
  React.useEffect(() => {
    const handleScroll = () => {
      for (const block of blocks) {
        const el = document.getElementById(`section-${block.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 200 && rect.bottom >= 100) {
            setActiveAnchor(block.id)
            break
          }
        }
      }
    }
    window.addEventListener("scroll", handleScroll, true)
    return () => window.removeEventListener("scroll", handleScroll, true)
  }, [blocks])

  const scrollToAnchor = (id: string) => {
    setActiveAnchor(id)
    const el = document.getElementById(`section-${id}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const handleStartEdit = (id: string, text: string) => {
    const lockKey = `${resourceName}:${id}`
    const peerLock = peerLocks[lockKey]
    if (peerLock) {
      return // Block editing if peer holds the lock
    }
    setEditingBlockId(id)
    setEditValues((prev) => ({ ...prev, [id]: text }))
  }

  const handleSaveBlock = (id: string, origText: string) => {
    const newVal = editValues[id]
    if (newVal !== undefined) {
      saveTempBlock(resourceName, id, origText, newVal)
    }
    setEditingBlockId(null)
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Table of Contents / Outline ScrollSpy Sidebar */}
      <aside className="w-64 border-r border-border shrink-0 hidden md:flex flex-col p-4 bg-muted/20">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <FileText className="size-3.5" />
          <span>Outline ScrollSpy</span>
        </div>
        <nav className="space-y-1 text-xs">
          {blocks.map((block) => {
            const isActive = activeAnchor === block.id
            return (
              <button
                key={block.id}
                type="button"
                onClick={() => scrollToAnchor(block.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-md transition-all flex items-center justify-between group ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="truncate">{block.title}</span>
                {block.isDraftModified && (
                  <span className="size-1.5 rounded-full bg-amber-400 shrink-0 ml-1.5 animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-[11px] text-muted-foreground leading-relaxed">
            <div className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <Sparkles className="size-3 text-primary" />
              Local-First Grounding
            </div>
            Edits are auto-saved to temporary drafts on blur. Click &apos;Save Resource&apos; in header to audit and commit.
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Document Sub-header Toolbar */}
        <div className="h-11 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card/50">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="outline" className="font-mono text-[10px]">
              Document SSoT
            </Badge>
            <span className="text-muted-foreground text-xs">•</span>
            <span className="text-muted-foreground text-xs">
              {blocks.filter((b) => b.isDraftModified).length} uncommitted draft block(s)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-md text-xs">
            <Button
              variant={viewMode === "split" ? "secondary" : "ghost"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setViewMode("split")}
            >
              <Columns className="size-3 mr-1" />
              Split
            </Button>
            <Button
              variant={viewMode === "wysiwyg" ? "secondary" : "ghost"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setViewMode("wysiwyg")}
            >
              <Eye className="size-3 mr-1" />
              WYSIWYG
            </Button>
            <Button
              variant={viewMode === "markdown" ? "secondary" : "ghost"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setViewMode("markdown")}
            >
              <Edit3 className="size-3 mr-1" />
              Raw Markdown
            </Button>
          </div>
        </div>

        {/* Content Scroll Container */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="pb-4 border-b border-border">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {resourceName}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Authoritative System Specification & Architectural Reference
              </p>
            </div>

            {blocks.map((block) => {
              const isEditing = editingBlockId === block.id
              const currentVal = editValues[block.id] ?? block.currentContent

              const lockKey = `${resourceName}:${block.id}`
              const peerLock = peerLocks[lockKey]
              const peerCollab = peerLock
                ? collaborators.find((c) => c.id === peerLock.collaboratorId)
                : null

              const isPeerLocked = !!(peerLock && peerCollab)
              const activeEditor = isPeerLocked ? peerCollab : isEditing ? currentUser : null

              return (
                <section
                  key={block.id}
                  id={`section-${block.id}`}
                  className={`relative rounded-xl border transition-all p-5 ${
                    activeEditor
                      ? `${activeEditor.borderColor} ${activeEditor.bgLight} shadow-sm ring-1 ${activeEditor.ringColor}`
                      : block.isDraftModified
                      ? "border-amber-400/50 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs ring-1 ring-amber-400/30"
                      : "border-border bg-card/40 hover:border-border/80"
                  }`}
                >
                  {/* Floating Avatar centered on the edge of the top right corner with text on right */}
                  {activeEditor && (
                    <div className="absolute top-0 left-full -translate-y-1/2 -translate-x-3 z-20 pointer-events-auto">
                      <UserEditingBadge collaborator={activeEditor} textPosition="right" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
                      <span>{block.title}</span>
                      <span className="text-[10px] font-mono text-muted-foreground font-normal">
                        #{block.id}
                      </span>
                    </h3>

                    <div className="flex items-center gap-2">
                      {block.isTranscluded && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono gap-1 text-primary bg-primary/10 border-primary/20"
                        >
                          <Link2 className="size-2.5" />
                          Transcluded ({block.transclusionSource})
                        </Badge>
                      )}

                      {block.isDraftModified && (
                        <div className="flex items-center gap-1">
                          <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                            Temp Draft
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                            onClick={() => revertTempBlock(resourceName, block.id)}
                            title="Revert this block to original committed content"
                          >
                            <RotateCcw className="size-3 mr-1" />
                            Revert
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2.5 mt-3">
                      <textarea
                        className="w-full text-xs font-mono leading-relaxed p-3 rounded-lg border border-primary bg-background focus:outline-hidden min-h-[90px]"
                        value={currentVal}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, [block.id]: e.target.value }))
                        }
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setEditingBlockId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => handleSaveBlock(block.id, block.originalCommitted)}
                        >
                          <Check className="size-3" />
                          Save Draft
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !isPeerLocked && handleStartEdit(block.id, block.currentContent)}
                      className={`${isPeerLocked ? "cursor-not-allowed select-none opacity-90" : "cursor-pointer group/content"} rounded-md transition-colors`}
                      title={isPeerLocked ? `${peerCollab?.name} is currently editing this block` : "Click block to edit"}
                    >
                      {viewMode === "markdown" ? (
                        <pre className="text-xs font-mono p-3 bg-muted/40 rounded-md overflow-x-auto whitespace-pre-wrap text-foreground">
                          {block.currentContent}
                        </pre>
                      ) : viewMode === "split" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                          <div className="p-3 bg-muted/30 rounded-md font-mono text-[11px] text-muted-foreground">
                            {block.currentContent}
                          </div>
                          <div className="p-3 bg-background rounded-md border border-border/40 text-foreground">
                            {block.currentContent}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed text-foreground/90 group-hover/content:text-foreground">
                          {block.currentContent}
                        </p>
                      )}
                      <div className="text-[10px] text-muted-foreground opacity-0 group-hover/content:opacity-100 transition-opacity mt-1.5 flex items-center gap-1">
                        <Edit3 className="size-2.5" />
                        Click anywhere on this block to edit in-place
                      </div>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
