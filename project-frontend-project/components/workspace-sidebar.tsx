"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Folder,
  FolderPlus,
  ImageIcon,
  Network,
  Plus,
  Presentation,
  Settings2,
  Table2,
  Trash2,
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
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

const RESOURCE_TYPES = [
  { type: "Code", label: "Code / Spec", icon: Code2, color: "text-cyan-500" },
  { type: "Document", label: "Document", icon: FileText, color: "text-blue-500" },
  { type: "Graph", label: "Graph / Diagram", icon: Network, color: "text-violet-500" },
  { type: "Image", label: "Image / Visual", icon: ImageIcon, color: "text-rose-500" },
  { type: "Presentation", label: "Presentation", icon: Presentation, color: "text-amber-500" },
  { type: "Table", label: "Table / Sheet", icon: Table2, color: "text-emerald-500" },
]

function getResourceMeta(name: string, allResources?: Array<{ name: string; type: string }>) {
  const found = allResources?.find((r) => r.name.toLowerCase() === name.toLowerCase())
  if (found) {
    const matched = RESOURCE_TYPES.find((t) => t.type.toLowerCase() === found.type.toLowerCase())
    if (matched) return { icon: matched.icon, color: matched.color }
  }

  const lower = name.toLowerCase()
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
  const { openResourceAndChat, deleteTarget, allResources } = useWorkspace()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `file:${collectionName}:${name}`,
    data: { name, collectionName },
  })

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    zIndex: isDragging ? 50 : undefined,
  }

  const { icon: Icon, color } = getResourceMeta(name, allResources)

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={`group flex w-full items-center justify-between rounded-[9px] px-2 py-1.5 text-left text-[13px] text-[#637080] dark:text-[#90a0b2] hover:bg-[#f7f8fa] dark:hover:bg-[#1f2937]/50 hover:text-[#1c5da7] dark:hover:text-[#60a5fa] transition-colors cursor-grab active:cursor-grabbing select-none ${
            isDragging ? "opacity-30 ring-1 ring-[#1c5da7] bg-blue-50 dark:bg-blue-950/40" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => openResourceAndChat(name)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            <Icon className={`size-3.5 shrink-0 ${color}`} />
            <span className="truncate">{name}</span>
          </button>
        </div>
      </ContextMenuTrigger>

      {/* Right-click Context Menu for File */}
      <ContextMenuContent className="w-44 text-xs">
        <ContextMenuLabel className="text-[10px] uppercase font-mono tracking-wider truncate">
          {name}
        </ContextMenuLabel>
        <ContextMenuItem onClick={() => openResourceAndChat(name)}>
          <Icon className={`size-3.5 mr-2 ${color}`} />
          <span>Open Resource</span>
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
}: {
  collection: Collection
  level?: number
}) {
  const { toggleCollection, addFolder, deleteTarget, createResource } = useWorkspace()
  const folderId = collection.id || collection.name
  const { setNodeRef, isOver } = useDroppable({
    id: `folder:${folderId}`,
    data: { collectionId: folderId, collectionName: collection.name },
  })

  const folders = [...(collection.folders ?? [])].sort((a, b) => a.name.localeCompare(b.name))
  const files = [...collection.children].sort((a, b) => a.localeCompare(b))

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
              onClick={() => toggleCollection(folderId)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
            >
              <ChevronRight
                className={`size-3.5 text-[#a0aab5] transition-transform shrink-0 ${
                  collection.open ? "rotate-90" : ""
                }`}
              />
              <Folder
                className={`size-4 shrink-0 transition-colors ${
                  isOver ? "text-[#1c5da7]" : "text-[#e2a93b]"
                }`}
              />
              <span className="truncate">{collection.name}</span>
              <span className="ml-auto text-[11px] text-[#a7b0bc] dark:text-[#64748b] font-mono">
                {collection.children.length}
              </span>
            </button>
          </div>
        </ContextMenuTrigger>

        {/* Right-click Context Menu for Folder */}
        <ContextMenuContent className="w-48 text-xs">
          <ContextMenuLabel className="text-[10px] uppercase font-mono tracking-wider truncate">
            {collection.name}
          </ContextMenuLabel>
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => addFolder(folderId)}>
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
                {RESOURCE_TYPES.map((res) => {
                  const Icon = res.icon
                  return (
                    <ContextMenuItem
                      key={res.type}
                      onClick={() => createResource(res.type, folderId)}
                    >
                      <Icon className={`size-3.5 mr-2 ${res.color}`} />
                      <span>{res.label}</span>
                    </ContextMenuItem>
                  )
                })}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuGroup>
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

function RootDroppableContainer({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "folder:root",
    data: { collectionName: "root" },
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-full transition-colors rounded-lg ${
        isOver ? "bg-blue-50/60 dark:bg-blue-950/30 ring-2 ring-dashed ring-[#1c5da7]" : ""
      }`}
    >
      {children}
    </div>
  )
}

export function WorkspaceSidebar() {
  const pathname = usePathname()
  const { collections, rootFiles, addFolder, createResource, moveResource } = useWorkspace()

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

      {/* Collections Header (Topic) */}
      <div className="shrink-0 px-3 pt-4 pb-1">
        <div className="flex items-center justify-between px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a9b5] dark:text-[#64748b]">
          <span>Collections</span>
        </div>
      </div>

      {/* Collections Section: The ONLY part of the side panel allowed to scroll */}
      <div className="flex-1 min-h-0 overflow-hidden px-3 py-1">
        <ContextMenu>
          <ContextMenuTrigger className="h-full block">
            <ScrollArea className="h-full pr-1">
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <RootDroppableContainer>
                  {collections.length > 0 || (rootFiles && rootFiles.length > 0) ? (
                    <div className="flex flex-col gap-0.5 min-h-[140px]">
                      {/* Folders */}
                      {collections.map((col) => (
                        <DroppableFolderItem key={col.name} collection={col} />
                      ))}

                      {/* Root-Level Resources */}
                      {(rootFiles ?? []).map((fileName) => (
                        <DraggableFileItem
                          key={fileName}
                          name={fileName}
                          collectionName="root"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-2 text-center text-[#8a95a3] dark:text-[#64748b] min-h-[180px]">
                      <Folder className="size-7 text-[#cbd5e1] dark:text-[#334155] mb-2 stroke-[1.5]" />
                      <p className="text-[12px] font-medium text-[#475569] dark:text-[#94a3b8]">
                        No resources yet
                      </p>
                      <p className="text-[10px] text-[#94a3b8] dark:text-[#64748b] mt-0.5 leading-tight">
                        Right-click anywhere here to create a folder or resource
                      </p>
                    </div>
                  )}
                </RootDroppableContainer>
              </DndContext>
            </ScrollArea>
          </ContextMenuTrigger>

          {/* Right-click Context Menu on Folders Empty Area */}
          <ContextMenuContent className="w-48 text-xs">
            <ContextMenuItem onClick={() => addFolder()}>
              <FolderPlus className="size-3.5 mr-2" />
              <span>New Folder</span>
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <Plus className="size-3.5 mr-2" />
                <span>New Resource</span>
              </ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-44 text-xs">
                {RESOURCE_TYPES.map((res) => {
                  const Icon = res.icon
                  return (
                    <ContextMenuItem
                      key={res.type}
                      onClick={() => createResource(res.type, "root")}
                    >
                      <Icon className={`size-3.5 mr-2 ${res.color}`} />
                      <span>{res.label}</span>
                    </ContextMenuItem>
                  )
                })}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </ContextMenuContent>
        </ContextMenu>
      </div>

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
