"use client"

import * as React from "react"
import { INITIAL_AUDIO_TRANSCRIPT, type AudioTranscriptItem } from "@/lib/resource-data"
import { useDraftStore, useResourceDrafts, useResourceOverrides } from "@/lib/draft-store"
import { useCollabStore, useCurrentUser } from "@/lib/collab-store"
import { UserEditingBadge } from "./user-editing-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AudioLines,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  Edit2,
  Clock,
  Radio,
} from "lucide-react"

interface AudioViewerProps {
  resourceName: string
}

export function AudioViewer({ resourceName }: AudioViewerProps) {
  const drafts = useResourceDrafts(resourceName)
  const committedOverrides = useResourceOverrides(resourceName)
  const saveTempBlock = useDraftStore((state) => state.saveTempBlock)
  const revertTempBlock = useDraftStore((state) => state.revertTempBlock)
  const peerLocks = useCollabStore((state) => state.peerLocks)
  const collaborators = useCollabStore((state) => state.collaborators)
  const currentUser = useCurrentUser()

  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null)
  const [editText, setEditText] = React.useState("")

  const totalDuration = 90 // 1m 30s

  // Compute transcript items with draft overrides
  const transcriptItems = React.useMemo(() => {
    return INITIAL_AUDIO_TRANSCRIPT.map((item) => {
      const anchorId = `audio-${item.id}`
      const draft = drafts[anchorId]
      const override = committedOverrides[anchorId]
      const effectiveText = draft?.proposedText ?? override ?? item.text
      return {
        ...item,
        text: effectiveText,
        isDraftModified: !!draft,
      }
    })
  }, [drafts, committedOverrides])

  // Playback timer ticker
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000 / playbackSpeed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed])

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const secs = Math.floor(sec % 60)
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const handleSeek = (sec: number) => {
    setCurrentTime(sec)
    if (!isPlaying) setIsPlaying(true)
  }

  const toggleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1))
  }

  const handleStartEdit = (item: AudioTranscriptItem) => {
    setEditingItemId(item.id)
    setEditText(item.text)
  }

  const handleSaveEdit = (origItem: AudioTranscriptItem) => {
    const origSnippet = INITIAL_AUDIO_TRANSCRIPT.find((t) => t.id === origItem.id)
    saveTempBlock(
      resourceName,
      `audio-${origItem.id}`,
      origSnippet?.text || origItem.text,
      editText
    )
    setEditingItemId(null)
  }

  // Find active transcript index based on currentTime
  const activeTranscriptIndex = transcriptItems.reduce((acc, curr, idx) => {
    if (currentTime >= curr.seconds) return idx
    return acc
  }, 0)

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Top Audio Player Hero Arena */}
      <div className="border-b border-border bg-gradient-to-b from-card to-background p-6 shrink-0 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20 flex items-center justify-center shrink-0">
              <AudioLines className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground tracking-tight">
                  {resourceName}
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono border-fuchsia-500/30 text-fuchsia-600">
                  Audio SSoT
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI Speech-to-Text Synchronized Recording & Transcripts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono gap-1 text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
              <Sparkles className="size-3" />
              AI Transcript 99% Verified
            </Badge>
          </div>
        </div>

        {/* Waveform & Scrubber Control Bar */}
        <div className="p-4 rounded-xl border border-border bg-card/60 shadow-xs space-y-3">
          {/* Waveform graphic */}
          <div className="h-10 flex items-center justify-between gap-1 px-2">
            {Array.from({ length: 48 }).map((_, i) => {
              const progressRatio = i / 48
              const isPlayed = progressRatio <= currentTime / totalDuration
              const barHeight = isPlaying
                ? Math.sin(i * 0.4 + currentTime) * 14 + 18
                : Math.abs(Math.sin(i * 0.3)) * 20 + 8

              return (
                <div
                  key={i}
                  onClick={() => handleSeek(progressRatio * totalDuration)}
                  className={`w-1 rounded-full cursor-pointer transition-all duration-150 ${
                    isPlayed
                      ? "bg-fuchsia-600 dark:bg-fuchsia-400"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  style={{ height: `${Math.max(6, barHeight)}px` }}
                />
              )
            })}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                className="size-9 rounded-full shadow-xs bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
              </Button>

              <span className="font-mono text-xs text-foreground font-semibold">
                {formatSeconds(currentTime)} / {formatSeconds(totalDuration)}
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={0}
              max={totalDuration}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="flex-1 accent-fuchsia-600 h-1.5 cursor-pointer bg-muted rounded-lg"
            />

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-mono"
                onClick={toggleSpeed}
              >
                {playbackSpeed}x
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Transcript Arena */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />
              <span>Interactive Speech-to-Text Transcript</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Click any timestamp to seek audio
            </span>
          </div>

          {transcriptItems.map((item, idx) => {
            const isActive = idx === activeTranscriptIndex
            const isEditing = editingItemId === item.id
            const lockKey = `${resourceName}:audio-${item.id}`
            const peerLock = peerLocks[lockKey]
            const peerCollab = peerLock ? collaborators.find((c) => c.id === peerLock.collaboratorId) : null
            const isPeerLocked = !!(peerLock && peerCollab)
            const activeAudioEditor = isPeerLocked ? peerCollab : isEditing ? currentUser : null

            return (
              <div
                key={item.id}
                className={`relative p-4 rounded-xl border transition-all ${
                  activeAudioEditor
                    ? `${activeAudioEditor.borderColor} ${activeAudioEditor.bgLight} shadow-sm ring-1 ${activeAudioEditor.ringColor}`
                    : isActive
                    ? "border-fuchsia-500/50 bg-fuchsia-50/15 dark:bg-fuchsia-950/10 shadow-xs ring-1 ring-fuchsia-500/30"
                    : "border-border bg-card/40 hover:border-border/80"
                }`}
              >
                {/* Absolute floating Avatar centered on the edge of the corner */}
                {activeAudioEditor && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-3 z-20 pointer-events-auto">
                    <UserEditingBadge collaborator={activeAudioEditor} textPosition="left" />
                  </div>
                )}

                <div className={`flex items-center justify-between gap-3 mb-2 ${activeAudioEditor ? "pr-28" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.speakerColor}`}
                    >
                      {item.speakerInitials}
                    </div>
                    <span className="text-xs font-semibold text-foreground">
                      {item.speaker}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSeek(item.seconds)}
                      className="font-mono text-[10px] text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 px-2 py-0.5 rounded transition-colors font-medium cursor-pointer"
                      title="Jump to this moment in audio"
                    >
                      {item.timestamp}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isDraftModified && (
                      <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                        Temp Draft
                      </Badge>
                    )}
                    {!isEditing && !isPeerLocked ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                        onClick={() => handleStartEdit(item)}
                      >
                        <Edit2 className="size-2.5 mr-1" />
                        Edit Transcript
                      </Button>
                    ) : null}
                    {item.isDraftModified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                        onClick={() => revertTempBlock(resourceName, `audio-${item.id}`)}
                      >
                        <RotateCcw className="size-2.5 mr-1" />
                        Revert
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      className="w-full text-xs font-sans leading-relaxed p-2.5 rounded-lg border border-primary bg-background focus:outline-hidden"
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setEditingItemId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => handleSaveEdit(item)}
                      >
                        <Check className="size-3" />
                        Save Draft
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-foreground/90 pl-8">
                    {item.text}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
