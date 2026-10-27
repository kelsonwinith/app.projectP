"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  DEFAULT_RESOURCES,
  type Resource,
} from "@/lib/workspace-types"
import { useResourceDrafts } from "@/lib/draft-store"
import { useWorkspace } from "@/context/workspace-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { SaveModal } from "./save-modal"
import { CollabPresence } from "./collab-presence"
import { DocumentViewer } from "./document-viewer"
import { TableViewer } from "./table-viewer"
import { PresentationViewer } from "./presentation-viewer"
import { GraphViewer } from "./graph-viewer"
import { ImageViewer } from "./image-viewer"
import { CodeViewer } from "./code-viewer"
import { AudioViewer } from "./audio-viewer"
import {
  FileText,
  Table2,
  Presentation,
  Network,
  ImageIcon,
  Code2,
  AudioLines,
  X,
  ChevronRight,
  Lock,
  Pencil,
  Save,
  CheckCircle2,
  Sparkles,
} from "lucide-react"

interface ResourceViewerContainerProps {
  resourceName: string
  folderPath?: string[]
  onClose?: () => void
}

function resolveResourceType(name: string): "Document" | "Table" | "Presentation" | "Graph" | "Image" | "Code" | "Audio" {
  const match = DEFAULT_RESOURCES.find(
    (r) => r.name.toLowerCase() === name.toLowerCase()
  )
  if (match) {
    return match.type as any
  }

  const lower = name.toLowerCase()
  if (lower.startsWith("table") || lower.includes("metric") || lower.includes("sheet")) return "Table"
  if (lower.startsWith("presentation") || lower.includes("slide") || lower.includes("roadmap") || lower.includes("deck")) return "Presentation"
  if (lower.startsWith("graph") || lower.includes("architecture") || lower.includes("topology") || lower.includes("flow")) return "Graph"
  if (lower.startsWith("image") || lower.includes("brand") || lower.includes("design") || lower.includes("screen")) return "Image"
  if (lower.startsWith("audio") || lower.includes("recording") || lower.includes("podcast") || lower.includes("voice") || lower.includes("sound")) return "Audio"
  if (lower.startsWith("code") || lower.includes("schema") || lower.includes("spec") || lower.includes("api")) return "Code"

  return "Document"
}

function getTypeIcon(type: string) {
  switch (type) {
    case "Table":
      return { icon: Table2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" }
    case "Presentation":
      return { icon: Presentation, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" }
    case "Graph":
      return { icon: Network, color: "text-violet-500 bg-violet-500/10 border-violet-500/20" }
    case "Image":
      return { icon: ImageIcon, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" }
    case "Audio":
      return { icon: AudioLines, color: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20" }
    case "Code":
      return { icon: Code2, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" }
    case "Document":
    default:
      return { icon: FileText, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" }
  }
}

export function ResourceViewerContainer({
  resourceName,
  folderPath = [],
  onClose,
}: ResourceViewerContainerProps) {
  const router = useRouter()
  const { closeResource, isResourcePrivate, renameResource } = useWorkspace()
  const [saveModalOpen, setSaveModalOpen] = React.useState(false)
  const [justCommitted, setJustCommitted] = React.useState(false)
  const [isRenamingTitle, setIsRenamingTitle] = React.useState(false)
  const [titleValue, setTitleValue] = React.useState(resourceName)
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setTitleValue(resourceName)
    setIsRenamingTitle(false)
  }, [resourceName])

  React.useEffect(() => {
    if (isRenamingTitle) {
      setTimeout(() => {
        titleInputRef.current?.focus()
        titleInputRef.current?.select()
      }, 50)
    }
  }, [isRenamingTitle])

  const commitTitleRename = () => {
    setIsRenamingTitle(false)
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== resourceName) {
      renameResource(resourceName, trimmed)
    } else {
      setTitleValue(resourceName)
    }
  }

  const isPrivate = isResourcePrivate(resourceName) || folderPath.includes("Private")

  const draftsMap = useResourceDrafts(resourceName)
  const draftCount = Object.keys(draftsMap).length

  const resourceType = resolveResourceType(resourceName)
  const typeMeta = getTypeIcon(resourceType)
  const IconComponent = typeMeta.icon

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      closeResource()
      router.push("/")
    }
  }

  const handleCommitted = () => {
    setJustCommitted(true)
    setTimeout(() => setJustCommitted(false), 3000)
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Top Universal Resource Header */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-xs flex items-center justify-between px-5 shrink-0 z-10">
        {/* Left: Breadcrumbs & Resource Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 hidden sm:flex">
            {isPrivate ? (
              <span className="font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Lock className="size-3" />
                Private
              </span>
            ) : (
              <span className="font-medium text-foreground/80">Collections</span>
            )}
            {folderPath
              .filter((f) => f !== "Private")
              .map((folder, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="size-3 text-muted-foreground/60" />
                  <span className="truncate max-w-[120px]">{folder}</span>
                </React.Fragment>
              ))}
            <ChevronRight className="size-3 text-muted-foreground/60" />
          </div>

          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`size-8 rounded-lg border flex items-center justify-center shrink-0 ${typeMeta.color}`}
            >
              <IconComponent className="size-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isRenamingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        commitTitleRename()
                      } else if (e.key === "Escape") {
                        e.preventDefault()
                        setIsRenamingTitle(false)
                        setTitleValue(resourceName)
                      }
                    }}
                    onBlur={commitTitleRename}
                    className="h-6 rounded border border-primary bg-background px-1.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <h2
                        className="text-sm font-semibold tracking-tight text-foreground truncate cursor-pointer hover:underline"
                        onDoubleClick={() => setIsRenamingTitle(true)}
                        title="Double-click or right-click to rename"
                      >
                        {resourceName}
                      </h2>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-36 text-xs">
                      <ContextMenuItem onClick={() => setIsRenamingTitle(true)}>
                        <Pencil className="size-3.5 mr-2" />
                        <span>Rename</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )}
                <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                  {resourceType}
                </Badge>
                {isPrivate && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 gap-1 shrink-0"
                  >
                    <Lock className="size-2.5" />
                    Personal
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions (Save Resource & Close) */}
        <div className="flex items-center gap-3 shrink-0">
          {isPrivate ? (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-2 py-1 rounded bg-muted/50 border border-border/50">
              <Lock className="size-3 text-amber-500" />
              <span className="hidden md:inline">Personal File · Isolated</span>
            </div>
          ) : (
            <CollabPresence resourceName={resourceName} />
          )}

          {justCommitted ? (
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="size-3.5" />
              {isPrivate ? "Saved to Personal Storage" : "Committed to SSoT"}
            </div>
          ) : draftCount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-600 dark:text-amber-400 font-mono hidden md:inline">
                {draftCount} pending draft{draftCount > 1 ? "s" : ""}
              </span>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs font-medium shadow-xs"
                onClick={() => setSaveModalOpen(true)}
              >
                <Save className="size-3.5" />
                {isPrivate ? "Save Personal" : "Save Resource"}
                <span className="ml-0.5 size-4 rounded-full bg-primary-foreground text-primary text-[10px] font-bold inline-flex items-center justify-center">
                  {draftCount}
                </span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={() => setSaveModalOpen(true)}
            >
              <Save className="size-3.5" />
              {isPrivate ? "Save Personal" : "Save Resource"}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleClose}
            title="Close resource viewer"
          >
            <X className="size-4" />
          </Button>
        </div>
      </header>

      {/* Main Viewer Body */}
      <main className="flex-1 min-h-0 overflow-hidden relative">
        {resourceType === "Table" && <TableViewer resourceName={resourceName} />}
        {resourceType === "Presentation" && <PresentationViewer resourceName={resourceName} />}
        {resourceType === "Graph" && <GraphViewer resourceName={resourceName} />}
        {resourceType === "Image" && <ImageViewer resourceName={resourceName} />}
        {resourceType === "Audio" && <AudioViewer resourceName={resourceName} />}
        {resourceType === "Code" && <CodeViewer resourceName={resourceName} />}
        {resourceType === "Document" && <DocumentViewer resourceName={resourceName} />}
      </main>

      {/* 3-Tab Save Modal */}
      <SaveModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        resourceName={resourceName}
        onCommitted={handleCommitted}
      />
    </div>
  )
}
