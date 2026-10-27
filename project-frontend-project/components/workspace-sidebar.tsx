"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AudioLines,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Folder,
  FolderPlus,
  ImageIcon,
  Lock,
  Network,
  Pencil,
  Plus,
  Presentation,
  Settings2,
  Table2,
  Trash2,
  Upload,
} from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { useWorkspace } from "@/context/workspace-context"
import { NAV_ITEMS, Collection } from "@/lib/workspace-types"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

// Only text-based structured resources can be created blank from scratch
const CREATABLE_RESOURCE_TYPES = [
  { type: "Code", label: "Code", icon: Code2, color: "text-cyan-500" },
  { type: "Document", label: "Document", icon: FileText, color: "text-blue-500" },
  { type: "Graph", label: "Graph", icon: Network, color: "text-violet-500" },
  { type: "Presentation", label: "Presentation", icon: Presentation, color: "text-amber-500" },
  { type: "Table", label: "Table", icon: Table2, color: "text-emerald-500" },
]

// All resources supported across the workspace (including imported binary media like Image and Audio)
const ALL_SUPPORTED_RESOURCES = [
  ...CREATABLE_RESOURCE_TYPES,
  { type: "Audio", label: "Audio", icon: AudioLines, color: "text-fuchsia-500" },
  { type: "Image", label: "Image", icon: ImageIcon, color: "text-rose-500" },
]

function getResourceMeta(name: string, allResources?: Array<{ name: string; type: string }>) {
  const found = allResources?.find((r) => r.name.toLowerCase() === name.toLowerCase())
  if (found) {
    const matched = ALL_SUPPORTED_RESOURCES.find((t) => t.type.toLowerCase() === found.type.toLowerCase())
    if (matched) return { icon: matched.icon, color: matched.color }
  }

  const lower = name.toLowerCase()
  if (lower.includes("audio") || lower.includes("recording") || lower.includes("podcast") || lower.includes("voice") || lower.endsWith(".mp3") || lower.endsWith(".wav") || lower.endsWith(".m4a") || lower.endsWith(".ogg") || lower.endsWith(".flac")) {
    return { icon: AudioLines, color: "text-fuchsia-500" }
  }
  if (lower.includes("table") || lower.includes("metric") || lower.includes("sheet") || lower.endsWith(".csv") || lower.endsWith(".xlsx")) {
    return { icon: Table2, color: "text-emerald-500" }
  }
  if (lower.includes("presentation") || lower.includes("roadmap") || lower.includes("slide") || lower.endsWith(".pptx")) {
    return { icon: Presentation, color: "text-amber-500" }
  }
  if (lower.includes("graph") || lower.includes("architecture") || lower.includes("diagram") || lower.includes("network")) {
    return { icon: Network, color: "text-violet-500" }
  }
  if (lower.includes("image") || lower.includes("brand") || lower.includes("visual") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".svg")) {
    return { icon: ImageIcon, color: "text-rose-500" }
  }
  if (lower.includes("code") || lower.includes("schema") || lower.includes("spec") || lower.endsWith(".ts") || lower.endsWith(".js") || lower.endsWith(".py") || lower.endsWith(".json")) {
    return { icon: Code2, color: "text-cyan-500" }
  }
  return { icon: FileText, color: "text-blue-500" }
}

// Draggable File Item in File Explorer
function DraggableFileItem({
  name,
  collectionName,
}: {
  name: string
  collectionName: string
}) {
  const [isMounted, setIsMounted] = React.useState(false)
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState(name)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (isRenaming) {
      setRenameValue(name)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [isRenaming, name])

  const { openResourceAndChat, deleteTarget, renameResource, allResources } = useWorkspace()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `file:${collectionName}:${name}`,
    data: { name, collectionName },
    disabled: isRenaming,
  })

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 50 : undefined,
  }

  const { icon: Icon, color } = getResourceMeta(name, allResources)

  const commitRename = () => {
    setIsRenaming(false)
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== name) {
      renameResource(name, trimmed)
    } else {
      setRenameValue(name)
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          {...(isMounted && !isRenaming ? attributes : {})}
          {...(isMounted && !isRenaming ? listeners : {})}
          suppressHydrationWarning
          className={`group flex w-full items-center justify-between rounded-[9px] px-2 py-1.5 text-left text-[13px] text-[#637080] dark:text-[#90a0b2] hover:bg-[#f7f8fa] dark:hover:bg-[#1f2937]/50 hover:text-[#1c5da7] dark:hover:text-[#60a5fa] transition-colors select-none ${
            isRenaming ? "bg-[#eef3f9] dark:bg-[#1c2736]" : "cursor-grab active:cursor-grabbing"
          } ${
            isDragging ? "opacity-30 ring-1 ring-[#1c5da7] bg-blue-50 dark:bg-blue-950/40" : ""
          }`}
        >
          {isRenaming ? (
            <div
              className="flex items-center gap-2 flex-1 min-w-0"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Icon className={`size-3.5 shrink-0 ${color}`} />
              <input
                ref={inputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    commitRename()
                  } else if (e.key === "Escape") {
                    e.preventDefault()
                    setIsRenaming(false)
                    setRenameValue(name)
                  }
                }}
                onBlur={commitRename}
                className="h-6 w-full rounded border border-[#1c5da7] bg-white dark:bg-[#161c24] px-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#1c5da7]"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openResourceAndChat(name)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
            >
              <Icon className={`size-3.5 shrink-0 ${color}`} />
              <span className="truncate">{name}</span>
            </button>
          )}
        </div>
      </ContextMenuTrigger>

      {/* Right-click Context Menu for File */}
      <ContextMenuContent className="w-36 text-xs">
        <ContextMenuItem onClick={() => setIsRenaming(true)}>
          <Pencil className="size-3.5 mr-2" />
          <span>Rename</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => deleteTarget(name, "resource")}
          variant="destructive"
        >
          <Trash2 className="size-3.5 mr-2" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// Droppable Folder in File Explorer
function DroppableFolderItem({
  collection,
  level = 0,
  isPrivate = false,
  onTriggerImport,
}: {
  collection: Collection
  level?: number
  isPrivate?: boolean
  onTriggerImport?: (target: string, isPrivate?: boolean) => void
}) {
  const { toggleCollection, addFolder, deleteTarget, createResource, renameFolder } = useWorkspace()
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState(collection.name)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (isRenaming) {
      setRenameValue(collection.name)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [isRenaming, collection.name])

  const folderId = collection.id || collection.name
  const { setNodeRef, isOver } = useDroppable({
    id: `folder:${folderId}`,
    data: { collectionId: folderId, collectionName: collection.name },
  })

  const folders = [...(collection.folders ?? [])].sort((a, b) => a.name.localeCompare(b.name))
  const files = [...collection.children].sort((a, b) => a.localeCompare(b))

  const commitRename = () => {
    setIsRenaming(false)
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== collection.name) {
      renameFolder(folderId, trimmed)
    } else {
      setRenameValue(collection.name)
    }
  }

  return (
    <div key={`${folderId}-${level}`}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={setNodeRef}
            className={`group flex w-full items-center gap-2 rounded-[9px] px-2 py-1.5 text-left text-[13px] text-[#637080] dark:text-[#90a0b2] hover:bg-[#f7f8fa] dark:hover:bg-[#1f2937]/50 transition-all select-none ${
              isOver
                ? "bg-blue-100/70 dark:bg-blue-900/40 ring-2 ring-[#1c5da7] text-[#1c5da7]"
                : ""
            }`}
          >
            <button
              type="button"
              onClick={() => !isRenaming && toggleCollection(folderId)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
            >
              <ChevronRight
                className={`size-3.5 text-[#a0aab5] transition-transform shrink-0 ${
                  collection.open ? "rotate-90" : ""
                }`}
              />
              <Folder
                className={`size-4 shrink-0 transition-colors ${
                  isOver
                    ? "text-[#1c5da7]"
                    : isPrivate
                    ? "text-amber-500/90 dark:text-amber-400/90"
                    : "text-[#e2a93b]"
                }`}
              />
              {isRenaming ? (
                <div
                  className="flex-1 min-w-0"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        commitRename()
                      } else if (e.key === "Escape") {
                        e.preventDefault()
                        setIsRenaming(false)
                        setRenameValue(collection.name)
                      }
                    }}
                    onBlur={commitRename}
                    className="h-6 w-full rounded border border-[#1c5da7] bg-white dark:bg-[#161c24] px-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#1c5da7]"
                  />
                </div>
              ) : (
                <>
                  <span className="truncate">{collection.name}</span>
                  <span className="ml-auto text-[11px] text-[#a7b0bc] dark:text-[#64748b] font-mono">
                    {collection.children.length}
                  </span>
                </>
              )}
            </button>
          </div>
        </ContextMenuTrigger>

        {/* Right-click Context Menu for Folder */}
        <ContextMenuContent className="w-48 text-xs">
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => addFolder(folderId, isPrivate)}>
              <FolderPlus className="size-3.5 mr-2" />
              <span>New Folder</span>
            </ContextMenuItem>

            {/* Submenu on Right-Click */}
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Plus className="size-3.5 mr-2" />
                <span>New Resource</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-44 text-xs">
                {CREATABLE_RESOURCE_TYPES.map((res) => {
                  const Icon = res.icon
                  return (
                    <ContextMenuItem
                      key={res.type}
                      onClick={() => createResource(res.type, folderId, isPrivate)}
                    >
                      <Icon className={`size-3.5 mr-2 ${res.color}`} />
                      <span>{res.label}</span>
                    </ContextMenuItem>
                  )
                })}
              </ContextMenuSubContent>
            </ContextMenuSub>

            <ContextMenuItem onClick={() => setIsRenaming(true)}>
              <Pencil className="size-3.5 mr-2" />
              <span>Rename Folder</span>
            </ContextMenuItem>
          </ContextMenuGroup>

          <ContextMenuSeparator />

          {/* Direct Import Button to Open Finder / File Explorer */}
          <ContextMenuItem onClick={() => onTriggerImport?.(folderId, isPrivate)}>
            <Upload className="size-3.5 mr-2" />
            <span>Import...</span>
          </ContextMenuItem>

          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => deleteTarget(folderId, "collection")}
            variant="destructive"
          >
            <Trash2 className="size-3.5 mr-2" />
            <span>Delete Folder</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Children Tree (Subfolders & Files) */}
      {collection.open && (
        <div className="ml-3 flex flex-col gap-0.5 border-l border-[#edf0f3] dark:border-[#242e3a] pl-2">
          {folders.map((folder) => (
            <DroppableFolderItem
              key={folder.id || folder.name}
              collection={folder}
              level={level + 1}
              isPrivate={isPrivate}
              onTriggerImport={onTriggerImport}
            />
          ))}
          {files.map((fileName) => (
            <DraggableFileItem
              key={fileName}
              name={fileName}
              collectionName={folderId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DroppableContainer({
  id = "folder:root",
  collectionName = "root",
  children,
}: {
  id?: string
  collectionName?: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { collectionName },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-full transition-colors rounded-lg flex flex-col ${
        isOver ? "bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-dashed ring-[#1c5da7]" : ""
      }`}
    >
      {children}
    </div>
  )
}

export function WorkspaceSidebar() {
  const pathname = usePathname()
  const {
    collections,
    rootFiles,
    privateCollections,
    privateRootFiles,
    addFolder,
    createResource,
    moveResource,
    importFiles,
  } = useWorkspace()

  // File input ref for import functionality (Finder / File Explorer)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [importTarget, setImportTarget] = React.useState<string>("root")
  const [importIsPrivate, setImportIsPrivate] = React.useState<boolean>(false)

  const triggerImport = (target: string = "root", isPrivate: boolean = false) => {
    setImportTarget(target)
    setImportIsPrivate(isPrivate)
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importFiles(e.target.files, importTarget, importIsPrivate)
      e.target.value = "" // Reset so same file can be imported again if needed
    }
  }

  // Configure pointer sensor for dnd-kit with slight activation threshold to avoid intercepting clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current as { name: string; collectionName: string } | undefined
    const overData = over.data.current as { collectionId?: string; collectionName: string } | undefined

    const targetId = overData?.collectionId || overData?.collectionName
    if (activeData && targetId && activeData.collectionName !== targetId) {
      moveResource(activeData.name, targetId)
    }
  }

  return (
    <aside className="hidden h-screen max-h-screen w-[248px] shrink-0 overflow-hidden border-r border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] lg:flex lg:flex-col">
      {/* Brand Header */}
      <div className="flex h-[72px] items-center gap-3 border-b border-[#edf0f3] dark:border-[#242e3a] px-6 shrink-0">
        <div className="grid size-8 place-items-center rounded-[10px] bg-[#111827] dark:bg-white text-white dark:text-[#111827] shadow-sm">
          <span className="text-sm font-bold">P</span>
        </div>
        <div className="text-[15px] font-semibold tracking-[-0.02em] text-[#17212b] dark:text-[#e8edf2]">
          Project P
        </div>
      </div>

      {/* Main Navigation (Fixed height, never scrolls) */}
      <div className="shrink-0 px-3 pt-5 pb-2">
        <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a9b5] dark:text-[#64748b]">
          Workspace
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[9px] px-3 py-2 text-left text-[13px] transition-colors ${
                  isActive
                    ? "bg-[#eef3f9] dark:bg-[#1c2736] font-semibold text-[#1c5da7] dark:text-[#60a5fa]"
                    : "text-[#637080] dark:text-[#90a0b2] hover:bg-[#f7f8fa] dark:hover:bg-[#1f2937]/50"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="ml-auto rounded-full bg-[#fff1cc] dark:bg-[#3d2f0f] text-[#9b7016] dark:text-[#fcd34d] px-1.5 py-0.2 text-[10px] font-semibold border-none"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Collections & Private Scrollable Area: The ONLY part of the side panel allowed to scroll */}
      <div className="flex-1 min-h-0 overflow-hidden px-3 py-1">
        <ScrollArea className="h-full pr-1">
          <DndContext id="workspace-sidebar-dnd" sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex flex-col min-h-full">
              {/* 1. Public Collections Section */}
              <div className="mb-1 shrink-0">
                <ContextMenu>
                  <ContextMenuTrigger className="block w-full">
                    <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a9b5] dark:text-[#64748b]">
                      <span>Collections</span>
                    </div>

                    <DroppableContainer id="folder:root" collectionName="root">
                      {collections.length > 0 || (rootFiles && rootFiles.length > 0) ? (
                        <div className="flex flex-col gap-0.5 min-h-[40px]">
                          {/* Public Folders */}
                          {collections.map((col) => (
                            <DroppableFolderItem
                              key={col.id || col.name}
                              collection={col}
                              onTriggerImport={(target) => triggerImport(target, false)}
                            />
                          ))}

                          {/* Public Root-Level Resources */}
                          {(rootFiles ?? []).map((fileName) => (
                            <DraggableFileItem
                              key={fileName}
                              name={fileName}
                              collectionName="root"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 px-2 text-center text-[#8a95a3] dark:text-[#64748b]">
                          <Folder className="size-6 text-[#cbd5e1] dark:text-[#334155] mb-1.5 stroke-[1.5]" />
                          <p className="text-[11px] font-medium text-[#475569] dark:text-[#94a3b8]">
                            No resources yet
                          </p>
                          <p className="text-[9px] text-[#94a3b8] dark:text-[#64748b] mt-0.5 leading-tight">
                            Right-click to create
                          </p>
                        </div>
                      )}
                    </DroppableContainer>
                  </ContextMenuTrigger>

                  {/* Right-click Context Menu on Public Empty Area */}
                  <ContextMenuContent className="w-48 text-xs">
                    <ContextMenuItem onClick={() => addFolder(undefined, false)}>
                      <FolderPlus className="size-3.5 mr-2" />
                      <span>New Folder</span>
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <Plus className="size-3.5 mr-2" />
                        <span>New Resource</span>
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-44 text-xs">
                        {CREATABLE_RESOURCE_TYPES.map((res) => {
                          const Icon = res.icon
                          return (
                            <ContextMenuItem
                              key={res.type}
                              onClick={() => createResource(res.type, "root", false)}
                            >
                              <Icon className={`size-3.5 mr-2 ${res.color}`} />
                              <span>{res.label}</span>
                            </ContextMenuItem>
                          )
                        })}
                      </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSeparator />

                    <ContextMenuItem onClick={() => triggerImport("root", false)}>
                      <Upload className="size-3.5 mr-2" />
                      <span>Import...</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>

              {/* Divider */}
              <div className="my-2 border-t border-[#edf0f3] dark:border-[#242e3a] shrink-0" />

              {/* 2. Private Section (Belong to user only, excluded from knowledge) */}
              <div className="flex-1 flex flex-col min-h-[220px]">
                <ContextMenu>
                  <ContextMenuTrigger className="flex-1 flex flex-col min-h-[220px] w-full block">
                    <div className="flex items-center justify-between px-2 pt-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a9b5] dark:text-[#64748b]">
                      <span className="flex items-center gap-1.5 text-amber-600/90 dark:text-amber-500/90 font-medium">
                        <Lock className="size-3" />
                        Private
                      </span>
                      <span className="text-[9px] font-normal normal-case text-muted-foreground/70">Personal only</span>
                    </div>

                    <DroppableContainer id="folder:private:root" collectionName="private:root">
                      {privateCollections.length > 0 || (privateRootFiles && privateRootFiles.length > 0) ? (
                        <div className="flex flex-col gap-0.5 flex-1 min-h-[40px]">
                          {/* Private Folders */}
                          {privateCollections.map((col) => (
                            <DroppableFolderItem
                              key={col.id || col.name}
                              collection={col}
                              isPrivate
                              onTriggerImport={(target) => triggerImport(target, true)}
                            />
                          ))}

                          {/* Private Root-Level Resources */}
                          {(privateRootFiles ?? []).map((fileName) => (
                            <DraggableFileItem
                              key={fileName}
                              name={fileName}
                              collectionName="private:root"
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 px-2 text-center text-[#8a95a3] dark:text-[#64748b] rounded-lg border border-dashed border-[#e2e8f0] dark:border-[#242e3a] bg-amber-500/5 my-1">
                          <Lock className="size-4 text-amber-500/70 mb-1 stroke-[1.5]" />
                          <p className="text-[11px] font-medium text-[#475569] dark:text-[#94a3b8]">
                            No private resources
                          </p>
                          <p className="text-[9px] text-[#94a3b8] dark:text-[#64748b] mt-0.5 leading-tight max-w-[170px]">
                            Personal files isolated from team knowledge. Right-click to create.
                          </p>
                        </div>
                      )}
                    </DroppableContainer>
                  </ContextMenuTrigger>

                  {/* Right-click Context Menu on Private Area */}
                  <ContextMenuContent className="w-48 text-xs">
                    <ContextMenuItem onClick={() => addFolder(undefined, true)}>
                      <FolderPlus className="size-3.5 mr-2 text-amber-600 dark:text-amber-400" />
                      <span>New Private Folder</span>
                    </ContextMenuItem>
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <Plus className="size-3.5 mr-2 text-amber-600 dark:text-amber-400" />
                        <span>New Private Resource</span>
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent className="w-44 text-xs">
                        {CREATABLE_RESOURCE_TYPES.map((res) => {
                          const Icon = res.icon
                          return (
                            <ContextMenuItem
                              key={res.type}
                              onClick={() => createResource(res.type, "private:root", true)}
                            >
                              <Icon className={`size-3.5 mr-2 ${res.color}`} />
                              <span>{res.label}</span>
                            </ContextMenuItem>
                          )
                        })}
                      </ContextMenuSubContent>
                    </ContextMenuSub>

                    <ContextMenuSeparator />

                    <ContextMenuItem onClick={() => triggerImport("private:root", true)}>
                      <Upload className="size-3.5 mr-2 text-amber-600 dark:text-amber-400" />
                      <span>Import Private...</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
            </div>
          </DndContext>
        </ScrollArea>
      </div>

      {/* Hidden File Input for Import (allows single or multiple file selection in Finder / File Explorer) */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Footer Profile & Settings Link (Pinned to bottom, never scrolls) */}
      <div className="border-t border-[#edf0f3] dark:border-[#242e3a] p-3 shrink-0">
        <Link
          href="/settings"
          className={`flex w-full items-center gap-3 rounded-[9px] px-3 py-2 text-left text-[13px] transition-colors ${
            pathname === "/settings"
              ? "bg-[#eef3f9] dark:bg-[#1c2736] font-semibold text-[#1c5da7] dark:text-[#60a5fa]"
              : "text-[#637080] dark:text-[#90a0b2] hover:bg-[#f7f8fa] dark:hover:bg-[#1f2937]/50"
          }`}
        >
          <Settings2 className="size-4" />
          <span>Settings</span>
        </Link>

        {/* User Card */}
        <div className="mt-3 flex items-center gap-2 rounded-[9px] bg-[#f8fafc] dark:bg-[#1e2530] px-3 py-2.5">
          <Avatar size="sm" className="bg-[#dbeafe] dark:bg-[#1e3a8a] text-[#25558c] dark:text-[#93c5fd]">
            <AvatarFallback className="text-[11px] font-semibold bg-transparent">SW</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-semibold text-[#17212b] dark:text-[#e8edf2]">
              Sarah Wong
            </div>
            <div className="truncate text-[10px] text-[#8a95a3] dark:text-[#64748b]">
              Product team
            </div>
          </div>
          <ChevronDown className="size-3.5 text-[#9aa5b2]" />
        </div>
      </div>
    </aside>
  )
}
