"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface Collaborator {
  id: string
  name: string
  email: string
  initials: string
  role: "Owner" | "Editor" | "Reviewer" | "Lead Architect"
  color: string
  borderColor: string
  ringColor: string
  bgLight: string
  textColor: string
  badgeColor: string
  status: "idle" | "viewing" | "editing"
  activeActivity?: string
}

export const MOCK_COLLABORATORS: Collaborator[] = [
  {
    id: "user-you",
    name: "Sarah Wong",
    email: "sarah.wong@project-p.internal",
    initials: "SW",
    role: "Owner",
    color: "bg-blue-600 text-white",
    borderColor: "border-blue-500",
    ringColor: "ring-blue-500/30",
    bgLight: "bg-blue-50/20 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-300",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    status: "editing",
    activeActivity: "Active Session Owner",
  },
  {
    id: "user-alex",
    name: "Alex Rivera",
    email: "alex.rivera@project-p.internal",
    initials: "AR",
    role: "Editor",
    color: "bg-emerald-600 text-white",
    borderColor: "border-emerald-500",
    ringColor: "ring-emerald-500/30",
    bgLight: "bg-emerald-50/20 dark:bg-emerald-950/20",
    textColor: "text-emerald-700 dark:text-emerald-300",
    badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    status: "editing",
    activeActivity: "Editing Table Cell SUBJ-201:Dosage",
  },
  {
    id: "user-jordan",
    name: "Jordan Lee",
    email: "jordan.lee@project-p.internal",
    initials: "JL",
    role: "Reviewer",
    color: "bg-purple-600 text-white",
    borderColor: "border-purple-500",
    ringColor: "ring-purple-500/30",
    bgLight: "bg-purple-50/20 dark:bg-purple-950/20",
    textColor: "text-purple-700 dark:text-purple-300",
    badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    status: "editing",
    activeActivity: "Editing Document Block #p-004",
  },
  {
    id: "user-marcus",
    name: "Marcus Vance",
    email: "marcus.vance@project-p.internal",
    initials: "MV",
    role: "Lead Architect",
    color: "bg-amber-600 text-white",
    borderColor: "border-amber-500",
    ringColor: "ring-amber-500/30",
    bgLight: "bg-amber-50/20 dark:bg-amber-950/20",
    textColor: "text-amber-700 dark:text-amber-300",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    status: "editing",
    activeActivity: "Editing Document Block #p-002",
  },
]

export interface PeerLock {
  id: string
  resourceName: string
  targetId: string // e.g. "p-004" or "row-3:currentDosage"
  collaboratorId: string
  reason: string
  lockedAt: number
}

interface CollabStoreState {
  collaborators: Collaborator[]
  peerLocks: Record<string, PeerLock> // key: `${resourceName}:${targetId}`
  simulatedActivityEnabled: boolean

  toggleSimulatedActivity: () => void
  acquireLock: (resourceName: string, targetId: string, collaboratorId: string, reason: string) => void
  releaseLock: (resourceName: string, targetId: string) => void
  getLockForTarget: (resourceName: string, targetId: string) => PeerLock | undefined
  getCollaborator: (id: string) => Collaborator | undefined
}

const INITIAL_PEER_LOCKS: Record<string, PeerLock> = {
  // 1. Table cell locked by Alex Rivera
  "Clinical Trial Metrics:row-3:currentDosage": {
    id: "lock-alex-1",
    resourceName: "Clinical Trial Metrics",
    targetId: "row-3:currentDosage",
    collaboratorId: "user-alex",
    reason: "Adjusting dosage levels based on clinical lab results.",
    lockedAt: Date.now() - 45000,
  },
  // 2. Document block locked by Jordan Lee
  "API Specification v2:p-004": {
    id: "lock-jordan-1",
    resourceName: "API Specification v2",
    targetId: "p-004",
    collaboratorId: "user-jordan",
    reason: "Drafting revised JWT expiration & TTL rotate policies.",
    lockedAt: Date.now() - 90000,
  },
  // 3. Document block session owned by Marcus Vance
  "API Specification v2:p-002": {
    id: "lock-marcus-1",
    resourceName: "API Specification v2",
    targetId: "p-002",
    collaboratorId: "user-marcus",
    reason: "Updating architecture contract & transclusions.",
    lockedAt: Date.now() - 15000,
  },
  // 4. Slide Deck locked by Jordan Lee
  "Product Roadmap:slide-slide-2": {
    id: "lock-slide-1",
    resourceName: "Product Roadmap",
    targetId: "slide-slide-2",
    collaboratorId: "user-jordan",
    reason: "Revising Q4 executive roadmap bullets.",
    lockedAt: Date.now() - 30000,
  },
}

export const useCollabStore = create<CollabStoreState>()(
  persist(
    (set, get) => ({
      collaborators: MOCK_COLLABORATORS,
      peerLocks: INITIAL_PEER_LOCKS,
      simulatedActivityEnabled: true,

      toggleSimulatedActivity: () => {
        set((state) => {
          const next = !state.simulatedActivityEnabled
          return {
            simulatedActivityEnabled: next,
            peerLocks: next ? INITIAL_PEER_LOCKS : {},
          }
        })
      },

      acquireLock: (resourceName, targetId, collaboratorId, reason) => {
        const key = `${resourceName}:${targetId}`
        set((state) => ({
          peerLocks: {
            ...state.peerLocks,
            [key]: {
              id: `lock-${Date.now()}`,
              resourceName,
              targetId,
              collaboratorId,
              reason,
              lockedAt: Date.now(),
            },
          },
        }))
      },

      releaseLock: (resourceName, targetId) => {
        const key = `${resourceName}:${targetId}`
        set((state) => {
          const updated = { ...state.peerLocks }
          delete updated[key]
          return { peerLocks: updated }
        })
      },

      getLockForTarget: (resourceName, targetId) => {
        const key = `${resourceName}:${targetId}`
        return get().peerLocks[key]
      },

      getCollaborator: (id) => {
        return get().collaborators.find((c) => c.id === id)
      },
    }),
    {
      name: "project-p-collab",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useCurrentUser(): Collaborator {
  const collaborators = useCollabStore((state) => state.collaborators)
  return (
    collaborators.find((c) => c.id === "user-you") || MOCK_COLLABORATORS[0]
  )
}
