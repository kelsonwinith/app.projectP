"use client"

import * as React from "react"
import { INITIAL_GRAPH_NODES, type GraphNode } from "@/lib/resource-data"
import {
  useDraftStore,
  useResourceDrafts,
  useResourceOverrides,
} from "@/lib/draft-store"
import { useCollabStore, useCurrentUser } from "@/lib/collab-store"
import { UserEditingBadge } from "./user-editing-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  Edit2,
  Check,
} from "lucide-react"

interface GraphViewerProps {
  resourceName: string
}

export function GraphViewer({ resourceName }: GraphViewerProps) {
  const drafts = useResourceDrafts(resourceName)
  const committedOverrides = useResourceOverrides(resourceName)
  const saveTempBlock = useDraftStore((state) => state.saveTempBlock)
  const revertTempBlock = useDraftStore((state) => state.revertTempBlock)
  const peerLocks = useCollabStore((state) => state.peerLocks)
  const collaborators = useCollabStore((state) => state.collaborators)
  const currentUser = useCurrentUser()

  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>("node-state")
  const [zoomLevel, setZoomLevel] = React.useState(1)
  const [isEditingRole, setIsEditingRole] = React.useState(false)
  const [roleInput, setRoleInput] = React.useState("")

  // Compute nodes with drafts
  const nodes = React.useMemo(() => {
    return INITIAL_GRAPH_NODES.map((node) => {
      const anchorId = `graph-${node.id}`
      const draft = drafts[anchorId]
      const override = committedOverrides[anchorId]
      const effectiveRole = draft?.proposedText ?? override ?? node.role
      return {
        ...node,
        role: effectiveRole,
        isDraftModified: !!draft,
      }
    })
  }, [drafts, committedOverrides])

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0]

  React.useEffect(() => {
    if (selectedNode) {
      setRoleInput(selectedNode.role)
      setIsEditingRole(false)
    }
  }, [selectedNode?.id])

  const categories = ["All", "State Layer", "Controller", "Data Store", "UI Layer"]

  const filteredNodes = React.useMemo(() => {
    if (selectedCategory === "All") return nodes
    return nodes.filter((n) => n.category === selectedCategory)
  }, [nodes, selectedCategory])

  const handleSaveRoleDraft = () => {
    if (!selectedNode) return
    const origNode = INITIAL_GRAPH_NODES.find((n) => n.id === selectedNode.id)
    saveTempBlock(
      resourceName,
      `graph-${selectedNode.id}`,
      origNode?.role || "",
      roleInput
    )
    setIsEditingRole(false)
  }

  const selectedNodeLock = peerLocks[`${resourceName}:graph-${selectedNode.id}`]
  const selectedNodeCollab = selectedNodeLock
    ? collaborators.find((c) => c.id === selectedNodeLock.collaboratorId)
    : null
  const isSelectedNodeLocked = Boolean(selectedNodeLock && selectedNodeCollab)

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Graph Canvas Arena */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Canvas Toolbar */}
        <div className="h-12 border-b border-border flex items-center justify-between px-6 bg-card/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground mr-1">Filter:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-medium shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border border-border rounded-md overflow-hidden bg-background">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </button>
              <span className="text-[11px] font-mono px-2 text-muted-foreground select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="size-3.5" />
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => {
                setSelectedCategory("All")
                setZoomLevel(1)
              }}
            >
              <RotateCcw className="size-3.5" />
              Reset View
            </Button>
          </div>
        </div>

        {/* Visual Graph Nodes Grid */}
        <div className="flex-1 p-8 overflow-auto flex items-center justify-center bg-muted/10 relative">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
          >
            {filteredNodes.map((node) => {
              const isSelected = selectedNode.id === node.id
              const nodeLock = peerLocks[`${resourceName}:graph-${node.id}`]
              const nodeCollab = nodeLock
                ? collaborators.find((c) => c.id === nodeLock.collaboratorId)
                : null
              const isNodeLocked = Boolean(nodeLock && nodeCollab)

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                    isNodeLocked && nodeCollab
                      ? `${nodeCollab.borderColor} ${nodeCollab.bgLight} ring-2 ${nodeCollab.ringColor} shadow-md`
                      : isSelected
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : "border-border bg-card/60 hover:border-primary/50 hover:shadow-xs"
                  }`}
                >
                  {/* Floating Top Right Corner Status */}
                  {isNodeLocked && nodeCollab && (
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-2 z-10 pointer-events-auto">
                      <UserEditingBadge collaborator={nodeCollab} size="xs" textPosition="left" />
                    </div>
                  )}

                  <div className={`flex items-center justify-between gap-2 mb-3 ${isNodeLocked ? "pr-24" : ""}`}>
                    <span className="font-semibold text-sm text-foreground">
                      {node.label}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {node.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {node.role}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Node Inspector Sidebar */}
      <aside className="w-80 border-l border-border bg-card p-5 shrink-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5" />
              Node Inspector
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {selectedNode.category}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-mono text-muted-foreground">Node Label</div>
              <div className="text-sm font-bold text-foreground mt-0.5">
                {selectedNode.label}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono text-muted-foreground">Architectural Role</span>
                <div className="flex items-center gap-2">
                  {isSelectedNodeLocked && selectedNodeCollab ? (
                    <UserEditingBadge collaborator={selectedNodeCollab} size="xs" />
                  ) : isEditingRole ? (
                    <UserEditingBadge collaborator={currentUser} size="xs" />
                  ) : null}
                  {!isEditingRole && !isSelectedNodeLocked ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingRole(true)}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="size-2.5" /> Edit
                    </button>
                  ) : null}
                </div>
              </div>

              {isEditingRole ? (
                <div className="space-y-2">
                  <Input
                    className="text-xs"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[11px]"
                      onClick={() => setIsEditingRole(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 text-[11px] gap-1"
                      onClick={handleSaveRoleDraft}
                    >
                      <Check className="size-3" /> Save Draft
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-foreground/90 p-2.5 rounded-lg bg-muted/40 border border-border">
                  {selectedNode.role}
                </p>
              )}
            </div>

            <div>
              <div className="text-[11px] font-mono text-muted-foreground mb-1.5">Outbound Connections</div>
              <div className="space-y-1">
                {selectedNode.connections.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Terminal sink node</span>
                ) : (
                  selectedNode.connections.map((targetId) => {
                    const target = nodes.find((n) => n.id === targetId)
                    return (
                      <div
                        key={targetId}
                        onClick={() => setSelectedNodeId(targetId)}
                        className="text-xs p-2 rounded border border-border/60 hover:border-primary cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <span className="font-medium text-foreground">{target?.label || targetId}</span>
                        <Badge variant="secondary" className="text-[9px] font-mono">
                          {target?.category}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {selectedNode.isDraftModified && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                <span>Temp draft active</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-amber-700 dark:text-amber-300"
                  onClick={() => revertTempBlock(resourceName, `graph-${selectedNode.id}`)}
                >
                  <RotateCcw className="size-3 mr-1" /> Revert
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-[11px] text-muted-foreground leading-relaxed">
            <div className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <Sparkles className="size-3 text-primary" />
              Graph SSoT
            </div>
            Node roles are linked to canonical glossary terms. Edits create temporary drafts.
          </div>
        </div>
      </aside>
    </div>
  )
}
