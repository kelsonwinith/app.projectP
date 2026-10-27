"use client"

import * as React from "react"
import mermaid from "mermaid"
import { useTheme } from "next-themes"
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
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  FileCode,
  Layers,
  AlertCircle,
  Sparkles,
} from "lucide-react"

interface GraphViewerProps {
  resourceName: string
}

export const MERMAID_TEMPLATES: Record<
  string,
  { label: string; desc: string; type: string; code: string }
> = {
  architecture: {
    label: "System Architecture",
    desc: "Component topology & data flows",
    type: "Flowchart",
    code: `flowchart TD
    Client["Client App (Next.js 16)\\nUniversal Viewers & Explorer"]
    State["Local-First State Engine\\nZustand & Temp Draft Buffer"]
    Chat["Assistant Agent Engine\\nConflict Guard & Fact-Checker"]
    Transclusion["SSoT Transclusion Bus\\nAnchor Linking & Propagation"]
    Glossary["Canonical Living Glossary\\nSynonym Normalizer"]
    Storage[("Browser Storage & Sync\\nLocalStorage & IndexedDB")]

    Client -->|User Mutations| State
    Client -->|Prompt & Chat| Chat
    State -->|Block References| Transclusion
    State -->|Persist Drafts| Storage
    Chat -->|Query Terms| Glossary
    Transclusion -->|Anchor Sync| Storage
    Glossary -->|Index Terms| Storage`,
  },
  sequence: {
    label: "3-Tab Save Flow",
    desc: "Commit & selective staging lifecycle",
    type: "Sequence",
    code: `sequenceDiagram
    autonumber
    actor User as Workspace Author
    participant UI as 3-Tab Save Modal
    participant Store as Local-First Store
    participant Guard as Conflict Engine

    User->>UI: Clicks Save Changes
    UI->>Store: getSaveModalData()
    Store->>Guard: Run contradiction check
    Guard-->>UI: Severity & discrepancies
    User->>UI: Selects blocks [✓] & commits
    Store->>Store: Commit staged blocks to SSoT`,
  },
  state: {
    label: "Draft State Machine",
    desc: "Draft creation, blur, and SSoT commit",
    type: "State Diagram",
    code: `stateDiagram-v2
    [*] --> CommittedAuthoritative
    CommittedAuthoritative --> ActiveEditing: Direct click on block
    ActiveEditing --> ActiveEditing: User typing mutations
    ActiveEditing --> SharedTempDraft: Unfocus / blur
    ActiveEditing --> CommittedAuthoritative: Floating Cancel
    SharedTempDraft --> CommittedAuthoritative: Revert Block Action
    SharedTempDraft --> CommittedAuthoritative: 3-Tab Modal Commit
    CommittedAuthoritative --> [*]`,
  },
  erd: {
    label: "Data Model ERD",
    desc: "Collections, Resources & Draft entities",
    type: "Entity Relationship",
    code: `erDiagram
    COLLECTION ||--o{ RESOURCE : contains
    RESOURCE ||--o{ TEMP_DRAFT : "tracks uncommitted"
    RESOURCE ||--o{ TRANSCLUSION : "embeds anchor"
    GLOSSARY ||--o{ CANONICAL_TERM : defines`,
  },
}

export function GraphViewer({ resourceName }: GraphViewerProps) {
  const { resolvedTheme } = useTheme()
  const drafts = useResourceDrafts(resourceName)
  const committedOverrides = useResourceOverrides(resourceName)
  const saveTempBlock = useDraftStore((state) => state.saveTempBlock)
  const revertTempBlock = useDraftStore((state) => state.revertTempBlock)
  const peerLocks = useCollabStore((state) => state.peerLocks)
  const collaborators = useCollabStore((state) => state.collaborators)
  const currentUser = useCurrentUser()

  const anchorId = "mermaid-diagram"
  const draft = drafts[anchorId]
  const override = committedOverrides[anchorId]
  const effectiveCode =
    draft?.proposedText ?? override ?? MERMAID_TEMPLATES.architecture.code
  const isDraftModified = !!draft

  const [activeTemplate, setActiveTemplate] = React.useState<string>("architecture")
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isEditing, setIsEditing] = React.useState(false)
  const [codeEdit, setCodeEdit] = React.useState(effectiveCode)
  const [svgContent, setSvgContent] = React.useState<string>("")
  const [renderError, setRenderError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  // Sync draft state to edit buffer
  React.useEffect(() => {
    setCodeEdit(effectiveCode)
  }, [effectiveCode])

  // Initialize Mermaid configuration
  React.useEffect(() => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === "dark" ? "dark" : "neutral",
        securityLevel: "loose",
        fontFamily: "inherit",
        themeVariables: {
          darkMode: resolvedTheme === "dark",
          primaryColor: resolvedTheme === "dark" ? "#818cf8" : "#6366f1",
          primaryTextColor: resolvedTheme === "dark" ? "#f8fafc" : "#0f172a",
          primaryBorderColor: resolvedTheme === "dark" ? "#4f46e5" : "#4338ca",
          lineColor: resolvedTheme === "dark" ? "#94a3b8" : "#64748b",
          secondaryColor: resolvedTheme === "dark" ? "#1e293b" : "#f1f5f9",
          tertiaryColor: resolvedTheme === "dark" ? "#0f172a" : "#ffffff",
        },
      })
    } catch {
      // initialization error fallback
    }
  }, [resolvedTheme])

  // Active code displayed on canvas
  const codeToRender = isEditing ? codeEdit : effectiveCode

  // Render diagram to SVG
  React.useEffect(() => {
    let isMounted = true
    const renderSvg = async () => {
      if (!codeToRender.trim()) {
        setSvgContent("")
        setRenderError(null)
        return
      }
      try {
        const uniqueId = `mermaid-canvas-${Math.random().toString(36).slice(2, 9)}`
        const { svg } = await mermaid.render(uniqueId, codeToRender)
        if (isMounted) {
          setSvgContent(svg)
          setRenderError(null)
        }
      } catch (err: any) {
        if (isMounted) {
          setRenderError(err?.message || "Invalid Mermaid syntax")
        }
      }
    }

    renderSvg()
    return () => {
      isMounted = false
    }
  }, [codeToRender, resolvedTheme])

  // Peer lock detection
  const lockKey = `${resourceName}:${anchorId}`
  const peerLock = peerLocks[lockKey]
  const peerCollab = peerLock
    ? collaborators.find((c) => c.id === peerLock.collaboratorId)
    : null
  const isPeerLocked = Boolean(peerLock && peerCollab)
  const activeEditor = isPeerLocked
    ? peerCollab
    : isEditing
    ? currentUser
    : null

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(codeToRender)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmEdit = () => {
    saveTempBlock(
      resourceName,
      anchorId,
      MERMAID_TEMPLATES[activeTemplate]?.code || MERMAID_TEMPLATES.architecture.code,
      codeEdit
    )
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setCodeEdit(effectiveCode)
    setIsEditing(false)
  }

  const handleSelectTemplate = (key: string) => {
    setActiveTemplate(key)
    const newCode = MERMAID_TEMPLATES[key].code
    setCodeEdit(newCode)
    saveTempBlock(
      resourceName,
      anchorId,
      MERMAID_TEMPLATES.architecture.code,
      newCode
    )
  }

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Main Mermaid Canvas Arena */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Unified Sub-header Toolbar */}
        <div className="h-11 border-b border-border flex items-center justify-between px-5 bg-card/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1">
              <Network className="size-3.5 text-violet-500" />
              Mermaid Diagram
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {MERMAID_TEMPLATES[activeTemplate]?.type || "Flowchart"}
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
              onClick={handleCopyCode}
            >
              {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy Source"}
            </Button>

            <div className="flex items-center border border-border rounded-md overflow-hidden bg-background h-7">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.1).toFixed(1))))}
                className="px-2 h-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="size-3" />
              </button>
              <span className="text-[11px] font-mono px-2 text-muted-foreground select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2, Number((z + 0.1).toFixed(1))))}
                className="px-2 h-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="size-3" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs font-medium"
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom to 100%"
            >
              <RotateCcw className="size-3" />
              Reset View
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

        {/* Visual Mermaid Canvas */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col bg-muted/10 relative">
          <div
            className={`flex-1 rounded-2xl border transition-all relative flex flex-col overflow-hidden ${
              activeEditor
                ? `${activeEditor.borderColor} ${activeEditor.bgLight} ring-2 ${activeEditor.ringColor} shadow-md`
                : "border-border bg-card/60 shadow-xs"
            }`}
          >
            {/* Absolute floating Avatar centered on the corner edge with text on right */}
            {activeEditor && (
              <div className="absolute top-0 left-full -translate-y-1/2 -translate-x-3 z-20 pointer-events-auto">
                <UserEditingBadge collaborator={activeEditor} textPosition="right" />
              </div>
            )}

            {isEditing ? (
              /* In-Place Mermaid Code Editor with Live Side-by-Side Preview */
              <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Source Code Input */}
                <div className="w-full md:w-1/2 flex flex-col p-4 bg-slate-950 text-slate-100">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <FileCode className="size-3.5 text-blue-400" />
                      Mermaid Definition Source
                    </span>
                    <span className="text-[10px] text-slate-500">Live preview active</span>
                  </div>
                  <textarea
                    className="flex-1 w-full bg-transparent text-emerald-400 font-mono text-xs p-1 outline-none resize-none leading-relaxed selection:bg-blue-500/30"
                    value={codeEdit}
                    onChange={(e) => setCodeEdit(e.target.value)}
                    spellCheck={false}
                    autoFocus
                  />
                  {renderError && (
                    <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono flex items-center gap-1.5 shrink-0">
                      <AlertCircle className="size-3 shrink-0" />
                      <span className="truncate">Syntax Warning: Live preview paused</span>
                    </div>
                  )}
                </div>

                {/* Real-time Render Preview */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-card/40 relative">
                  <div
                    className="flex items-center justify-center transition-transform duration-150"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                </div>

                {/* Floating bottom action group when editing */}
                <div className="absolute -bottom-3.5 right-6 z-30 flex items-center gap-1.5 p-1 bg-background border border-border shadow-md rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs font-medium"
                    onClick={handleConfirmEdit}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            ) : (
              /* Non-Editing Click-to-Edit Diagram Viewer */
              <div
                onClick={() => !isPeerLocked && setIsEditing(true)}
                className={`flex-1 overflow-auto flex items-center justify-center p-8 transition-colors ${
                  !isPeerLocked ? "cursor-pointer group hover:bg-card/80" : "cursor-not-allowed"
                }`}
                title={!isPeerLocked ? "Click diagram to edit Mermaid definition" : undefined}
              >
                {svgContent ? (
                  <div
                    className="flex items-center justify-center transition-transform duration-200 pointer-events-none select-none max-w-full"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="size-4 text-amber-500" />
                    <span>Rendering Mermaid diagram...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mermaid Diagram Sidebar: Templates & Topology Selector */}
      <aside className="w-80 border-l border-border bg-card p-5 shrink-0 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5" />
              Diagram Templates
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Mermaid.js
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono text-muted-foreground">Select Topology</div>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(MERMAID_TEMPLATES).map(([key, tpl]) => {
                const isSelected = activeTemplate === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectTemplate(key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                        : "border-border/70 hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {tpl.label}
                      </span>
                      <Badge variant="secondary" className="text-[9px] font-mono">
                        {tpl.type}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      {tpl.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-[11px] font-mono text-muted-foreground mb-2">Mermaid Cheatsheet</div>
            <div className="space-y-1.5 text-[11px] font-mono text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border">
              <div><code>A --&gt; B</code> : Simple Arrow</div>
              <div><code>A -- Text --&gt; B</code> : Arrow with Label</div>
              <div><code>A[(Database)]</code> : Storage Node</div>
              <div><code>A &gt;Flag]</code> : Asymmetric Shape</div>
              <div><code>subgraph Name ... end</code> : Cluster Box</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
