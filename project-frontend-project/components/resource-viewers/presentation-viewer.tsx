"use client"

import * as React from "react"
import { INITIAL_SLIDES, type SlideData } from "@/lib/resource-data"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  FileText,
  RotateCcw,
  Sparkles,
  Presentation,
} from "lucide-react"

interface PresentationViewerProps {
  resourceName: string
}

export function PresentationViewer({ resourceName }: PresentationViewerProps) {
  const drafts = useResourceDrafts(resourceName)
  const committedOverrides = useResourceOverrides(resourceName)
  const peerLocks = useCollabStore((state) => state.peerLocks)
  const collaborators = useCollabStore((state) => state.collaborators)
  const currentUser = useCurrentUser()

  const saveTempBlock = useDraftStore((state) => state.saveTempBlock)
  const revertTempBlock = useDraftStore((state) => state.revertTempBlock)

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [showGridSorter, setShowGridSorter] = React.useState(false)
  const [showNotes, setShowNotes] = React.useState(true)
  const [isEditing, setIsEditing] = React.useState(false)

  // Current slides with draft overlays
  const slides: Array<SlideData & { isDraftModified: boolean }> = React.useMemo(() => {
    return INITIAL_SLIDES.map((slide) => {
      const anchorId = `slide-${slide.id}`
      const draft = drafts[anchorId]
      const override = committedOverrides[anchorId]

      if (draft) {
        try {
          const parsed = JSON.parse(draft.proposedText) as Partial<SlideData>
          return { ...slide, ...parsed, isDraftModified: true }
        } catch {
          return { ...slide, isDraftModified: true }
        }
      } else if (override) {
        try {
          const parsed = JSON.parse(override) as Partial<SlideData>
          return { ...slide, ...parsed, isDraftModified: false }
        } catch {
          return { ...slide, isDraftModified: false }
        }
      }
      return { ...slide, isDraftModified: false }
    })
  }, [drafts, committedOverrides])

  const currentSlide = slides[currentIndex] || slides[0]

  // Form edit states
  const [titleEdit, setTitleEdit] = React.useState(currentSlide.title)
  const [subEdit, setSubEdit] = React.useState(currentSlide.subtitle)
  const [bulletsEdit, setBulletsEdit] = React.useState(currentSlide.bullets.join("\n"))

  React.useEffect(() => {
    setTitleEdit(currentSlide.title)
    setSubEdit(currentSlide.subtitle)
    setBulletsEdit(currentSlide.bullets.join("\n"))
    setIsEditing(false)
  }, [currentIndex, currentSlide])

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditing) return
      if (e.key === "ArrowRight" || e.key === "Space") {
        setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1))
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(0, prev - 1))
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isEditing, slides.length])

  const handleSaveSlideDraft = () => {
    const anchorId = `slide-${currentSlide.id}`
    const originalJson = JSON.stringify({
      title: INITIAL_SLIDES[currentIndex].title,
      subtitle: INITIAL_SLIDES[currentIndex].subtitle,
      bullets: INITIAL_SLIDES[currentIndex].bullets,
    })
    const proposedJson = JSON.stringify({
      title: titleEdit,
      subtitle: subEdit,
      bullets: bulletsEdit.split("\n").filter(Boolean),
    })
    saveTempBlock(resourceName, anchorId, originalJson, proposedJson)
    setIsEditing(false)
  }

  const currentSlideLockKey = `${resourceName}:slide-${currentSlide.id}`
  const currentSlidePeerLock = peerLocks[currentSlideLockKey]
  const currentSlideCollab = currentSlidePeerLock
    ? collaborators.find((c) => c.id === currentSlidePeerLock.collaboratorId)
    : null
  const activeSlideEditor = (currentSlidePeerLock && currentSlideCollab) ? currentSlideCollab : isEditing ? currentUser : null

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-11 border-b border-border flex items-center justify-between px-5 bg-card/40 shrink-0">
        <div className="flex items-center gap-2.5">
          <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1">
            <Presentation className="size-3.5 text-amber-500" />
            Slide Deck
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            Slide {currentIndex + 1} of {slides.length}
          </span>
          {currentSlide.isDraftModified && (
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
              Temp Draft
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs font-medium"
            onClick={() => setShowGridSorter(true)}
          >
            <LayoutGrid className="size-3" />
            Slide Sorter
          </Button>
          <Button
            variant={showNotes ? "secondary" : "outline"}
            size="sm"
            className="h-7 gap-1.5 text-xs font-medium"
            onClick={() => setShowNotes(!showNotes)}
          >
            <FileText className="size-3" />
            Speaker Notes
          </Button>
          {currentSlide.isDraftModified && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => revertTempBlock(resourceName, `slide-${currentSlide.id}`)}
            >
              <RotateCcw className="size-3 mr-1" />
              Revert
            </Button>
          )}
        </div>
      </div>

      {/* Main Slide Viewer Arena */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Slide Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20 relative">
          <div
            className={`w-full max-w-4xl aspect-16/9 rounded-2xl border shadow-md flex flex-col justify-between p-10 md:p-14 relative transition-all ${
              activeSlideEditor
                ? `${activeSlideEditor.borderColor} ${activeSlideEditor.bgLight} ring-2 ${activeSlideEditor.ringColor}`
                : "bg-card border-border"
            }`}
          >
            {/* Absolute floating Avatar centered on the corner edge with text on right */}
            {activeSlideEditor && (
              <div className="absolute top-0 left-full -translate-y-1/2 -translate-x-3 z-20 pointer-events-auto">
                <UserEditingBadge collaborator={activeSlideEditor} textPosition="right" />
              </div>
            )}

            {/* Slide Header Decorator */}
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground border-b border-border/50 pb-4">
              <span>{resourceName}</span>
              <span>SLIDE {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
            </div>

            {/* Slide Body */}
            {isEditing ? (
              <div className="space-y-4 my-auto">
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground">Title</label>
                  <input
                    className="w-full text-xl font-bold bg-background border border-primary rounded-md p-2"
                    value={titleEdit}
                    onChange={(e) => setTitleEdit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground">Subtitle</label>
                  <input
                    className="w-full text-sm text-muted-foreground bg-background border border-border rounded-md p-2"
                    value={subEdit}
                    onChange={(e) => setSubEdit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground">Key Bullets (1 per line)</label>
                  <textarea
                    rows={4}
                    className="w-full text-xs bg-background border border-border rounded-md p-2 font-mono"
                    value={bulletsEdit}
                    onChange={(e) => setBulletsEdit(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div
                className={`my-auto space-y-6 ${!currentSlidePeerLock ? "cursor-pointer group/slide" : ""}`}
                onClick={() => {
                  if (!currentSlidePeerLock && !isEditing) setIsEditing(true)
                }}
                title={!currentSlidePeerLock ? "Click to edit slide" : undefined}
              >
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground group-hover/slide:text-primary transition-colors">
                    {currentSlide.title}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">
                    {currentSlide.subtitle}
                  </p>
                </div>

                <ul className="space-y-3.5 pt-2">
                  {currentSlide.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-foreground/90">
                      <span className="size-2 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Slide Footer */}
            <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>Project P Collaborative Architecture</span>
              <span className="font-mono text-[10px]">Confidential & Proprietary</span>
            </div>

            {/* Floating bottom action group when editing */}
            {isEditing && (
              <div className="absolute -bottom-3.5 right-6 z-30 flex items-center gap-1.5 p-1 bg-background border border-border shadow-md rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setTitleEdit(currentSlide.title)
                    setSubEdit(currentSlide.subtitle)
                    setBulletsEdit(currentSlide.bullets.join("\n"))
                    setIsEditing(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-6 px-2 text-xs font-medium"
                  onClick={handleSaveSlideDraft}
                >
                  Confirm
                </Button>
              </div>
            )}
          </div>

          {/* Floating Navigation Controls */}
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-xs"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex ? "w-6 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-xs"
              disabled={currentIndex === slides.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Speaker Notes Drawer */}
        {showNotes && (
          <aside className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-card p-5 shrink-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <FileText className="size-3.5" />
                <span>Executive Speaker Notes</span>
              </div>
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs leading-relaxed text-foreground/90 font-serif">
                &ldquo;{currentSlide.speakerNotes}&rdquo;
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Pro-tip:</span> Use Left/Right arrow keys or spacebar to present.
            </div>
          </aside>
        )}
      </div>

      {/* Slide Grid Sorter Dialog */}
      <Dialog open={showGridSorter} onOpenChange={setShowGridSorter}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Slide Grid Sorter</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Jump instantly to any slide in this presentation deck.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 overflow-y-auto">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                onClick={() => {
                  setCurrentIndex(i)
                  setShowGridSorter(false)
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between aspect-16/10 ${
                  i === currentIndex
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono text-muted-foreground mb-1">
                    SLIDE {i + 1}
                  </div>
                  <h4 className="text-xs font-bold line-clamp-2 text-foreground">
                    {slide.title}
                  </h4>
                </div>
                <div className="text-[10px] text-muted-foreground line-clamp-2 mt-2">
                  {slide.bullets[0] || slide.subtitle}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
