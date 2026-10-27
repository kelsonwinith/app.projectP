"use client"

import * as React from "react"
import { useCollabStore, type Collaborator } from "@/lib/collab-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserEditingBadge } from "./user-editing-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Users,
  Lock,
  Sparkles,
  CheckCircle2,
  Activity,
  Radio,
  RotateCcw,
} from "lucide-react"

interface CollabPresenceProps {
  resourceName: string
}

export function CollabPresence({ resourceName }: CollabPresenceProps) {
  const collaborators = useCollabStore((state) => state.collaborators)
  const peerLocks = useCollabStore((state) => state.peerLocks)
  const simulatedActivityEnabled = useCollabStore((state) => state.simulatedActivityEnabled)
  const toggleSimulatedActivity = useCollabStore((state) => state.toggleSimulatedActivity)

  const [dialogOpen, setDialogOpen] = React.useState(false)

  // Filter locks relevant to current resource
  const activeResourceLocks = Object.values(peerLocks).filter(
    (l) => l.resourceName === resourceName
  )

  return (
    <>
      <div
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-muted/60 transition-colors select-none group"
        title="View active peer collaborators & locks"
      >
        {/* Avatars Cluster with Hover Details */}
        <TooltipProvider delay={100}>
          <div className="flex -space-x-1.5" onClick={(e) => e.stopPropagation()}>
            {collaborators.map((c) => (
              <Tooltip key={c.id}>
                <TooltipTrigger
                  className={`size-6 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-bold shadow-xs cursor-pointer hover:z-20 hover:scale-115 transition-transform ${c.color}`}
                >
                  {c.initials}
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  align="center"
                  className="z-50 bg-white dark:bg-[#1a222d] text-foreground border border-border shadow-xl p-3 rounded-lg flex items-center gap-3 min-w-[210px] animate-in fade-in-0 zoom-in-95"
                >
                  <div
                    className={`size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${c.color}`}
                  >
                    {c.initials}
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ({c.role})
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate font-mono">
                      {c.email}
                    </span>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* Live Pill */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hidden sm:flex">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px] group-hover:text-foreground">
            {collaborators.length} online
          </span>
          {activeResourceLocks.length > 0 && (
            <Badge
              variant="outline"
              className="text-[9px] font-mono px-1 py-0 h-4 border-amber-500/30 text-amber-600 bg-amber-500/10 gap-0.5"
            >
              <Lock className="size-2" />
              {activeResourceLocks.length} locked
            </Badge>
          )}
        </div>
      </div>

      {/* Collaborator Presence Inspector Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-semibold">
                    Simulated Peer Concurrency
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Local-first collaborative presence and collision avoidance.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Collaborators List */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Active Collaborators in Workspace
              </div>

              <div className="space-y-1.5">
                {collaborators.map((c) => {
                  const isUser = c.id === "user-you"
                  return (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-xs ${c.color}`}
                        >
                          {c.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {c.name}
                            </span>
                            <Badge variant="outline" className="text-[9px] font-mono py-0 h-4">
                              {c.role}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">
                            {c.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          {c.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Active Locks in this resource */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
                Active Locks in {resourceName}
              </div>

              {activeResourceLocks.length === 0 ? (
                <div className="p-3 rounded-lg border border-border/50 bg-muted/10 text-xs text-muted-foreground text-center">
                  No active locks in this resource. All blocks and cells are concurrently editable.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activeResourceLocks.map((lock) => {
                    const collab = collaborators.find((c) => c.id === lock.collaboratorId)
                    return (
                      <div
                        key={lock.id}
                        className="p-2.5 rounded-lg border border-border/70 bg-card/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Lock className="size-3 text-muted-foreground shrink-0" />
                          <span className="font-mono text-[11px] font-semibold text-foreground truncate">
                            #{lock.targetId}
                          </span>
                        </div>
                        {collab && (
                          <UserEditingBadge collaborator={collab} size="xs" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Simulated Activity Toggle */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-foreground">
                  Simulated Peer Activity
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Toggle mock peers editing blocks to test collision locks.
                </div>
              </div>

              <Button
                size="sm"
                variant={simulatedActivityEnabled ? "secondary" : "outline"}
                className="h-7 text-xs gap-1.5"
                onClick={toggleSimulatedActivity}
              >
                <Radio className={`size-3 ${simulatedActivityEnabled ? "text-emerald-500 animate-pulse" : ""}`} />
                {simulatedActivityEnabled ? "Mock Active" : "Paused"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
