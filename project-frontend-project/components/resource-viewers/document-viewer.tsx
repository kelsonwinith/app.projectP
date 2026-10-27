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
  Link2,
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
  const [showOutline, setShowOutline] = React.useState(true)
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
      {showOutline && (
        <aside className="w-64 border-r border-border shrink-0 hidden md:flex flex-col p-4 bg-card/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-blue-500" />
              Outline ScrollSpy
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {blocks.length}
            </Badge>
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
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Document Sub-header Toolbar */}
        <div className="h-11 border-b border-border flex items-center justify-between px-5 shrink-0 bg-card/40">
          <div className="flex items-center gap-2.5 text-xs">
            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1">
              <FileText className="size-3.5 text-blue-500" />
              Document Spec
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {blocks.length} sections
            </span>
            {blocks.some((b) => b.isDraftModified) && (
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                Temp Drafts
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showOutline ? "secondary" : "outline"}
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={() => setShowOutline(!showOutline)}
            >
              <FileText className="size-3" />
              {showOutline ? "Hide Outline" : "Show Outline"}
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
                  {/* Absolute floating Avatar centered on the corner edge with text on right */}
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
                    <div className="mt-2">
                      <textarea
                        className="w-full text-xs font-mono leading-relaxed p-3 rounded-lg border border-primary bg-background focus:outline-hidden min-h-[90px]"
                        value={currentVal}
                        onChange={(e) =>
                          setEditValues((prev) => ({ ...prev, [block.id]: e.target.value }))
                        }
                        autoFocus
                      />
                      {/* Floating bottom action group */}
                      <div className="absolute -bottom-3.5 right-4 z-30 flex items-center gap-1.5 p-1 bg-background border border-border shadow-md rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                          onClick={() => setEditingBlockId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs font-medium"
                          onClick={() => handleSaveBlock(block.id, block.originalCommitted)}
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !isPeerLocked && handleStartEdit(block.id, block.currentContent)}
                      className={`${isPeerLocked ? "cursor-not-allowed select-none opacity-90" : "cursor-pointer"} rounded-md transition-colors`}
                      title={isPeerLocked ? `${peerCollab?.name} is currently editing this block` : "Click to edit"}
                    >
                      <p className="text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {block.currentContent}
                      </p>
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
