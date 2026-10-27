"use client"

import * as React from "react"
import { INITIAL_CODE_SPEC, type CodeSpecData } from "@/lib/resource-data"
import {
  useDraftStore,
  useResourceDrafts,
  useResourceOverrides,
} from "@/lib/draft-store"
import { useCollabStore, useCurrentUser } from "@/lib/collab-store"
import { UserEditingBadge } from "./user-editing-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Code as CodeIcon,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ListTree,
} from "lucide-react"

interface CodeViewerProps {
  resourceName: string
}

export function CodeViewer({ resourceName }: CodeViewerProps) {
  const drafts = useResourceDrafts(resourceName)
  const committedOverrides = useResourceOverrides(resourceName)
  const saveTempBlock = useDraftStore((state) => state.saveTempBlock)
  const revertTempBlock = useDraftStore((state) => state.revertTempBlock)
  const peerLocks = useCollabStore((state) => state.peerLocks)
  const collaborators = useCollabStore((state) => state.collaborators)
  const currentUser = useCurrentUser()

  const [copied, setCopied] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)
  const [activeLine, setActiveLine] = React.useState<number | null>(null)

  const anchorId = "code-content"
  const codeLock = peerLocks[`${resourceName}:${anchorId}`]
  const codeCollab = codeLock ? collaborators.find((c) => c.id === codeLock.collaboratorId) : null
  const activeCodeEditor = (codeLock && codeCollab) ? codeCollab : isEditing ? currentUser : null

  const draft = drafts[anchorId]
  const override = committedOverrides[anchorId]
  const effectiveCode = draft?.proposedText ?? override ?? INITIAL_CODE_SPEC.code
  const isDraftModified = !!draft

  const [codeEdit, setCodeEdit] = React.useState(effectiveCode)

  React.useEffect(() => {
    setCodeEdit(effectiveCode)
  }, [effectiveCode])

  const lines = effectiveCode.split("\n")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(effectiveCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveCode = () => {
    saveTempBlock(resourceName, anchorId, INITIAL_CODE_SPEC.code, codeEdit)
    setIsEditing(false)
  }

  const jumpToLine = (lineNum: number) => {
    setActiveLine(lineNum)
    const el = document.getElementById(`line-${lineNum}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Code Editor / Viewer Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Unified Sub-header Toolbar */}
        <div className="h-11 border-b border-border flex items-center justify-between px-5 bg-card/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1">
              <CodeIcon className="size-3.5 text-blue-500" />
              {INITIAL_CODE_SPEC.filename}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {lines.length} lines • {INITIAL_CODE_SPEC.language}
            </span>
            {isDraftModified && (
              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                Temp Draft
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs font-mono"
              onClick={handleCopy}
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy Code"}
            </Button>

            {isDraftModified && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => revertTempBlock(resourceName, anchorId)}
              >
                <RotateCcw className="size-3 mr-1" />
                Revert
              </Button>
            )}
          </div>
        </div>

        {/* Code Content */}
        <div
          className={`flex-1 overflow-auto bg-slate-950 text-slate-100 p-4 font-mono text-xs relative ${
            activeCodeEditor
              ? `${activeCodeEditor.borderColor} ring-2 ${activeCodeEditor.ringColor}`
              : ""
          }`}
        >
          {/* Floating at Top Right Corner of that block being edited with text on right */}
          {activeCodeEditor && (
            <div className="absolute top-0 left-full -translate-y-1/2 -translate-x-3 z-20 pointer-events-auto">
              <UserEditingBadge collaborator={activeCodeEditor} textPosition="right" />
            </div>
          )}

          {/* Floating bottom action group when editing */}
          {isEditing && (
            <div className="absolute bottom-4 right-6 z-30 flex items-center gap-1.5 p-1 bg-slate-900/95 backdrop-blur-xs border border-slate-700 shadow-xl rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => {
                  setCodeEdit(effectiveCode)
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-6 px-2 text-xs font-medium"
                onClick={handleSaveCode}
              >
                Confirm
              </Button>
            </div>
          )}

          {isEditing ? (
            <textarea
              className="w-full h-full bg-transparent text-emerald-300 font-mono text-xs p-2 outline-none resize-none leading-relaxed"
              value={codeEdit}
              onChange={(e) => setCodeEdit(e.target.value)}
              spellCheck={false}
              autoFocus
            />
          ) : (
            <div
              className={`divide-y divide-slate-800/40 ${!codeLock ? "cursor-pointer group/code" : ""}`}
              onClick={() => {
                if (!codeLock && !isEditing) setIsEditing(true)
              }}
              title={!codeLock ? "Click to edit code" : undefined}
            >
              {lines.map((line, idx) => {
                const lineNum = idx + 1
                const isHighlighted = activeLine === lineNum
                return (
                  <div
                    key={lineNum}
                    id={`line-${lineNum}`}
                    className={`flex items-start leading-6 hover:bg-slate-900 transition-colors ${
                      isHighlighted ? "bg-slate-800/80 ring-1 ring-blue-400/50" : ""
                    }`}
                  >
                    <span className="w-12 select-none text-right pr-4 text-slate-600 font-mono text-[11px]">
                      {lineNum}
                    </span>
                    <span className="flex-1 whitespace-pre pl-2 text-slate-200">
                      {line || " "}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Symbol Tree Navigator */}
      <aside className="w-72 border-l border-border bg-card p-5 shrink-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ListTree className="size-3.5" />
              Symbol Outline
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              AST
            </Badge>
          </div>

          <div className="space-y-1.5">
            {INITIAL_CODE_SPEC.symbols.map((sym) => (
              <button
                key={sym.name}
                type="button"
                onClick={() => jumpToLine(sym.line)}
                className={`w-full text-left p-2 rounded-lg border transition-colors flex items-center justify-between text-xs font-mono ${
                  activeLine === sym.line
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border/60 hover:bg-muted text-foreground"
                }`}
              >
                <div className="truncate flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-blue-500" />
                  <span className="truncate">{sym.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                  L{sym.line}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground">
          <div className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
            <Sparkles className="size-3 text-primary" />
            Code Grounding
          </div>
          All symbol definitions are cross-referenced with architectural contracts in the ubiquitous language glossary.
        </div>
      </aside>
    </div>
  )
}
