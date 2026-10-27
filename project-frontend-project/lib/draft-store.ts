import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { type DocumentBlock } from "./resource-data"

export interface DraftBlock {
  anchorId: string
  originalText: string
  proposedText: string
  updatedAt: number
}

interface DraftStoreState {
  // resourceName -> Record<anchorId, DraftBlock>
  drafts: Record<string, Record<string, DraftBlock>>
  // resourceName -> Record<anchorId, string> (committed content overrides)
  committedOverrides: Record<string, Record<string, string>>
  // cell locks: resourceName -> Record<coordinate, { lockedBy: string; lockedAt: number }>
  cellLocks: Record<string, Record<string, { lockedBy: string; lockedAt: number }>>
  // imported custom document blocks: resourceName -> DocumentBlock[]
  importedDocuments: Record<string, DocumentBlock[]>

  saveTempBlock: (resourceName: string, anchorId: string, originalText: string, proposedText: string) => void
  revertTempBlock: (resourceName: string, anchorId: string) => void
  commitSelective: (resourceName: string, stagedAnchorIds: string[]) => void
  acquireCellLock: (resourceName: string, coordinate: string, user?: string) => void
  releaseCellLock: (resourceName: string, coordinate: string) => void
  saveImportedDocument: (resourceName: string, blocks: DocumentBlock[]) => void
  renameResourceDrafts: (oldName: string, newName: string) => void
  getDraftsForResource: (resourceName: string) => Record<string, DraftBlock>
  getCommittedOverrides: (resourceName: string) => Record<string, string>
}

export const useDraftStore = create<DraftStoreState>()(
  persist(
    (set, get) => ({
      drafts: {},
      committedOverrides: {},
      cellLocks: {},
      importedDocuments: {},

      saveTempBlock: (resourceName, anchorId, originalText, proposedText) => {
        set((state) => {
          const resDrafts = { ...(state.drafts[resourceName] || {}) }
          // If proposed equals original, delete draft
          if (proposedText.trim() === originalText.trim()) {
            delete resDrafts[anchorId]
          } else {
            resDrafts[anchorId] = {
              anchorId,
              originalText,
              proposedText,
              updatedAt: Date.now(),
            }
          }
          return {
            drafts: {
              ...state.drafts,
              [resourceName]: resDrafts,
            },
          }
        })
      },

      revertTempBlock: (resourceName, anchorId) => {
        set((state) => {
          const resDrafts = { ...(state.drafts[resourceName] || {}) }
          delete resDrafts[anchorId]
          return {
            drafts: {
              ...state.drafts,
              [resourceName]: resDrafts,
            },
          }
        })
      },

      commitSelective: (resourceName, stagedAnchorIds) => {
        set((state) => {
          const resDrafts = { ...(state.drafts[resourceName] || {}) }
          const resOverrides = { ...(state.committedOverrides[resourceName] || {}) }

          for (const anchorId of stagedAnchorIds) {
            if (resDrafts[anchorId]) {
              resOverrides[anchorId] = resDrafts[anchorId].proposedText
              delete resDrafts[anchorId]
            }
          }

          return {
            drafts: {
              ...state.drafts,
              [resourceName]: resDrafts,
            },
            committedOverrides: {
              ...state.committedOverrides,
              [resourceName]: resOverrides,
            },
          }
        })
      },

      acquireCellLock: (resourceName, coordinate, user = "You") => {
        set((state) => ({
          cellLocks: {
            ...state.cellLocks,
            [resourceName]: {
              ...(state.cellLocks[resourceName] || {}),
              [coordinate]: { lockedBy: user, lockedAt: Date.now() },
            },
          },
        }))
      },

      releaseCellLock: (resourceName, coordinate) => {
        set((state) => {
          const resLocks = { ...(state.cellLocks[resourceName] || {}) }
          delete resLocks[coordinate]
          return {
            cellLocks: {
              ...state.cellLocks,
              [resourceName]: resLocks,
            },
          }
        })
      },

      saveImportedDocument: (resourceName, blocks) => {
        set((state) => ({
          importedDocuments: {
            ...state.importedDocuments,
            [resourceName]: blocks,
          },
        }))
      },

      renameResourceDrafts: (oldName, newName) => {
        set((state) => {
          const drafts = { ...state.drafts }
          if (drafts[oldName]) {
            drafts[newName] = drafts[oldName]
            delete drafts[oldName]
          }
          const committedOverrides = { ...state.committedOverrides }
          if (committedOverrides[oldName]) {
            committedOverrides[newName] = committedOverrides[oldName]
            delete committedOverrides[oldName]
          }
          const cellLocks = { ...state.cellLocks }
          if (cellLocks[oldName]) {
            cellLocks[newName] = cellLocks[oldName]
            delete cellLocks[oldName]
          }
          const importedDocuments = { ...state.importedDocuments }
          if (importedDocuments[oldName]) {
            importedDocuments[newName] = importedDocuments[oldName]
            delete importedDocuments[oldName]
          }
          return { drafts, committedOverrides, cellLocks, importedDocuments }
        })
      },

      getDraftsForResource: (resourceName) => {
        return get().drafts[resourceName] || EMPTY_DRAFTS
      },

      getCommittedOverrides: (resourceName) => {
        return get().committedOverrides[resourceName] || EMPTY_OVERRIDES
      },
    }),
    {
      name: "project-p-drafts",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export const EMPTY_DRAFTS: Record<string, DraftBlock> = Object.freeze({})
export const EMPTY_OVERRIDES: Record<string, string> = Object.freeze({})
export const EMPTY_LOCKS: Record<string, { lockedBy: string; lockedAt: number }> = Object.freeze({})
export const EMPTY_DOC_BLOCKS: DocumentBlock[] = Object.freeze([]) as any

export function useResourceDrafts(resourceName: string) {
  return useDraftStore((state) => state.drafts[resourceName] ?? EMPTY_DRAFTS)
}

export function useResourceOverrides(resourceName: string) {
  return useDraftStore((state) => state.committedOverrides[resourceName] ?? EMPTY_OVERRIDES)
}

export function useResourceLocks(resourceName: string) {
  return useDraftStore((state) => state.cellLocks[resourceName] ?? EMPTY_LOCKS)
}

export function useImportedDocument(resourceName: string) {
  return useDraftStore((state) => state.importedDocuments[resourceName] ?? EMPTY_DOC_BLOCKS)
}
