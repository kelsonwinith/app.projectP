"use client"

import * as React from "react"
import { INITIAL_IMAGE_ANNOTATIONS, type ImageAnnotation } from "@/lib/resource-data"
import {
  useDraftStore,
  useResourceDrafts,
  useResourceOverrides,
} from "@/lib/draft-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Image as ImageIcon,
  MapPin,
  Plus,
  RotateCcw,
  Tag,
} from "lucide-react"

interface ImageViewerProps {
  resourceName: string
}

export function ImageViewer({ resourceName }: ImageViewerProps) {
  const drafts = useResourceDrafts(resourceName)
  const committedOverrides = useResourceOverrides(resourceName)
  const saveTempBlock = useDraftStore((state) => state.saveTempBlock)
  const revertTempBlock = useDraftStore((state) => state.revertTempBlock)

  const [activeTag, setActiveTag] = React.useState<string>("All")
  const [selectedPinId, setSelectedPinId] = React.useState<string>("ann-1")
  const [isAddingPin, setIsAddingPin] = React.useState(false)
  const [newPinCoords, setNewPinCoords] = React.useState<{ x: number; y: number } | null>(null)
  const [newPinLabel, setNewPinLabel] = React.useState("")
  const [newPinComment, setNewPinComment] = React.useState("")
  const [isEditingComment, setIsEditingComment] = React.useState(false)
  const [commentEdit, setCommentEdit] = React.useState("")

  // Annotations list combining baseline and drafts
  const annotations = React.useMemo(() => {
    const base = INITIAL_IMAGE_ANNOTATIONS.map((ann) => {
      const draft = drafts[`comment-${ann.id}`]
      const override = committedOverrides[`comment-${ann.id}`]
      const effectiveComment = draft?.proposedText ?? override ?? ann.comment
      return {
        ...ann,
        comment: effectiveComment,
        isDraft: !!draft,
      }
    })
    // Check if new pins exist in drafts
    Object.keys(drafts).forEach((key) => {
      if (key.startsWith("ann-new-")) {
        try {
          const parsed = JSON.parse(drafts[key].proposedText)
          base.push({ ...parsed, isDraft: true })
        } catch {
          // ignore
        }
      }
    })
    return base
  }, [drafts, committedOverrides])

  const filteredAnnotations = annotations.filter(
    (a) => activeTag === "All" || a.tag === activeTag
  )

  const selectedAnnotation = annotations.find((a) => a.id === selectedPinId) || annotations[0]

  React.useEffect(() => {
    if (selectedAnnotation) {
      setCommentEdit(selectedAnnotation.comment)
      setIsEditingComment(false)
    }
  }, [selectedAnnotation?.id])

  const handleSaveComment = () => {
    if (!selectedAnnotation) return
    const orig = INITIAL_IMAGE_ANNOTATIONS.find((a) => a.id === selectedAnnotation.id)
    saveTempBlock(
      resourceName,
      `comment-${selectedAnnotation.id}`,
      orig?.comment || selectedAnnotation.comment,
      commentEdit
    )
    setIsEditingComment(false)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    setNewPinCoords({ x, y })
  }

  const handleCreatePin = () => {
    if (!newPinCoords || !newPinLabel) return
    const newId = `ann-new-${Date.now()}`
    const pinData: ImageAnnotation = {
      id: newId,
      x: newPinCoords.x,
      y: newPinCoords.y,
      label: newPinLabel,
      comment: newPinComment,
      tag: "Layout",
    }
    saveTempBlock(resourceName, newId, "", JSON.stringify(pinData))
    setSelectedPinId(newId)
    setIsAddingPin(false)
    setNewPinCoords(null)
    setNewPinLabel("")
    setNewPinComment("")
  }

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Main Visual Arena */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Unified Sub-header Toolbar */}
        <div className="h-11 border-b border-border flex items-center justify-between px-5 bg-card/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1">
              <ImageIcon className="size-3.5 text-rose-500" />
              Vision Annotations
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {annotations.length} pins
            </span>

            <div className="flex items-center gap-1 ml-2">
              {["All", "Accessibility", "Brand", "Layout"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    activeTag === tag
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant={isAddingPin ? "secondary" : "outline"}
            size="sm"
            className="h-7 gap-1.5 text-xs font-medium"
            onClick={() => {
              setIsAddingPin(!isAddingPin)
              setNewPinCoords(null)
            }}
          >
            <Plus className="size-3" />
            {isAddingPin ? "Cancel Pin Dropper" : "Add Spatial Pin"}
          </Button>
        </div>

        {/* Image Canvas with Spatial Pins */}
        <div className="flex-1 overflow-auto bg-muted/15 flex items-center justify-center p-8">
          <div
            onClick={handleCanvasClick}
            className={`relative max-w-2xl w-full aspect-16/10 rounded-2xl border border-border shadow-lg overflow-hidden bg-radial from-slate-900 to-slate-950 flex flex-col items-center justify-center select-none ${
              isAddingPin ? "cursor-crosshair ring-2 ring-primary ring-offset-2" : ""
            }`}
          >
            {/* Geometric Placeholder Graphic */}
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-80 pointer-events-none">
              <div className="size-32 rounded-3xl border-4 border-primary/40 flex items-center justify-center rotate-6 backdrop-blur-xs shadow-2xl">
                <span className="text-5xl font-black tracking-tighter text-white">P</span>
              </div>
              <div className="mt-4 font-mono text-xs text-white/60 tracking-widest uppercase">
                Design Identity & Design System Specification
              </div>
            </div>

            {/* Pins */}
            {filteredAnnotations.map((pin) => {
              const isSelected = selectedPinId === pin.id
              return (
                <div
                  key={pin.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPinId(pin.id)
                  }}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 group ${
                    isSelected ? "scale-125 z-20" : "hover:scale-110 z-10"
                  }`}
                >
                  <div
                    className={`size-7 rounded-full flex items-center justify-center shadow-md transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/30"
                        : "bg-white text-slate-900 hover:bg-primary hover:text-white"
                    }`}
                  >
                    <MapPin className="size-3.5" />
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/95 backdrop-blur-xs text-foreground px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap border border-border shadow-md pointer-events-none">
                    {pin.label}
                  </div>
                </div>
              )
            })}

            {/* Pending New Pin Indicator */}
            {newPinCoords && (
              <div
                style={{ left: `${newPinCoords.x}%`, top: `${newPinCoords.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 size-7 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-bounce z-30 ring-4 ring-emerald-500/30"
              >
                <Plus className="size-4" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Annotation Sidebar */}
      <aside className="w-80 border-l border-border bg-card p-5 shrink-0 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Annotation Inspector
            </span>
            {selectedAnnotation && (
              <Badge variant="outline" className="text-[10px] font-mono">
                {selectedAnnotation.tag}
              </Badge>
            )}
          </div>

          {newPinCoords ? (
            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="text-xs font-semibold text-foreground">
                Drop New Pin at ({newPinCoords.x}%, {newPinCoords.y}%)
              </div>
              <Input
                placeholder="Annotation title..."
                className="text-xs"
                value={newPinLabel}
                onChange={(e) => setNewPinLabel(e.target.value)}
                autoFocus
              />
              <Textarea
                placeholder="Comment or design rationale..."
                rows={3}
                className="text-xs"
                value={newPinComment}
                onChange={(e) => setNewPinComment(e.target.value)}
              />
              <div className="flex justify-end gap-1.5 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium"
                  onClick={() => setNewPinCoords(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium"
                  disabled={!newPinLabel}
                  onClick={handleCreatePin}
                >
                  Confirm
                </Button>
              </div>
            </div>
          ) : selectedAnnotation ? (
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-mono text-muted-foreground">Spatial Target</div>
                <div className="text-sm font-bold text-foreground mt-0.5">
                  {selectedAnnotation.label}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono text-muted-foreground mb-1">
                  Design Verification Comment
                </div>
                {isEditingComment ? (
                  <div className="relative">
                    <Textarea
                      rows={3}
                      className="text-xs"
                      value={commentEdit}
                      onChange={(e) => setCommentEdit(e.target.value)}
                      autoFocus
                    />
                    {/* Floating bottom action group */}
                    <div className="absolute -bottom-3.5 right-2 z-30 flex items-center gap-1.5 p-1 bg-background border border-border shadow-md rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setCommentEdit(selectedAnnotation.comment)
                          setIsEditingComment(false)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs font-medium"
                        onClick={handleSaveComment}
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => setIsEditingComment(true)}
                    className="text-xs text-foreground/90 p-3 rounded-lg bg-muted/40 border border-border leading-relaxed cursor-pointer hover:border-primary/50 transition-colors"
                    title="Click to edit comment"
                  >
                    {selectedAnnotation.comment}
                  </p>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-muted/20 border border-border text-[11px] font-mono text-muted-foreground">
                Location: X {selectedAnnotation.x}% • Y {selectedAnnotation.y}%
              </div>

              {selectedAnnotation.id.startsWith("ann-new-") && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
                  <span>Temp draft pin</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-amber-700 dark:text-amber-300"
                    onClick={() => revertTempBlock(resourceName, selectedAnnotation.id)}
                  >
                    <RotateCcw className="size-3 mr-1" /> Revert
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center py-8">
              Click a pin on the image to view specifications
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
