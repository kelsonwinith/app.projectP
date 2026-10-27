import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Collection } from "./workspace-types"

function generateFolderId(): string {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function ensureFolderIds(items: Collection[]): Collection[] {
  return items.map((item) => ({
    ...item,
    id: item.id || `f_${item.name}_${Math.random().toString(36).slice(2, 7)}`,
    folders: item.folders ? ensureFolderIds(item.folders) : [],
  }))
}

export function findFolder(items: Collection[], target: string): Collection | null {
  for (const item of items) {
    if (item.id === target || item.name === target) return item
    if (item.folders) {
      const found = findFolder(item.folders, target)
      if (found) return found
    }
  }
  return null
}

function updateCollectionTree(
  items: Collection[],
  target: string,
  update: (item: Collection) => Collection
): Collection[] {
  return items.map((item) => {
    if (item.id === target || (!item.id && item.name === target)) {
      return update(item)
    }
    return {
      ...item,
      folders: item.folders ? updateCollectionTree(item.folders, target, update) : item.folders,
    }
  })
}

function removeCollectionTree(items: Collection[], target: string): Collection[] {
  return items
    .filter((item) => item.id !== target && item.name !== target)
    .map((item) => ({
      ...item,
      folders: item.folders ? removeCollectionTree(item.folders, target) : item.folders,
    }))
}

function removeResourceFromTree(items: Collection[], resourceName: string): Collection[] {
  return items.map((item) => {
    const hasChild = item.children.includes(resourceName)
    const newChildren = item.children.filter((c) => c !== resourceName)
    const newCount = hasChild ? Math.max(0, item.count - 1) : item.count
    return {
      ...item,
      count: newCount,
      children: newChildren,
      folders: item.folders ? removeResourceFromTree(item.folders, resourceName) : item.folders,
    }
  })
}

export function getNextSiblingFolderName(baseName: string, siblingFolders: Collection[] = []): string {
  const existingNames = new Set(siblingFolders.map((f) => f.name))
  if (!existingNames.has(baseName)) {
    return baseName
  }
  let index = 1
  while (existingNames.has(`${baseName} ${index}`)) {
    index++
  }
  return `${baseName} ${index}`
}

export function getNextSiblingResourceName(type: string, siblingFiles: string[] = []): string {
  const existingNames = new Set(siblingFiles)
  if (!existingNames.has(type)) {
    return type
  }
  let index = 1
  while (existingNames.has(`${type} ${index}`)) {
    index++
  }
  return `${type} ${index}`
}

function getUniqueFileNameInDestination(fileName: string, destFiles: string[]): string {
  if (!destFiles.includes(fileName)) return fileName
  const match = fileName.match(/^(.*?)(?: (\d+))?$/)
  const base = match && match[1] ? match[1] : fileName
  let index = 1
  while (destFiles.includes(`${base} ${index}`)) {
    index++
  }
  return `${base} ${index}`
}

function moveResourceInTree(
  items: Collection[],
  resourceName: string,
  targetCollection: string
): Collection[] {
  // 1. Remove from source
  const stripped = removeResourceFromTree(items, resourceName)
  // 2. Find destination to ensure unique name
  const dest = findFolder(stripped, targetCollection)
  const destFiles = dest ? dest.children : []
  const finalName = getUniqueFileNameInDestination(resourceName, destFiles)

  // 3. Add to destination
  return updateCollectionTree(stripped, targetCollection, (item) => ({
    ...item,
    open: true,
    count: item.children.includes(finalName) ? item.count : item.count + 1,
    children: item.children.includes(finalName)
      ? item.children
      : [...item.children, finalName],
  }))
}

interface CollectionStore {
  collections: Collection[]
  rootFiles: string[]
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  setCollections: (collections: Collection[]) => void
  toggleCollection: (name: string) => void
  addFolder: (parentName?: string, name?: string) => string
  addResourceToCollection: (targetCollection: string, resourceName: string) => void
  moveResource: (resourceName: string, targetCollection: string) => void
  deleteTarget: (target: string, kind: "collection" | "resource") => void
  clearCollections: () => void
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: [], // Starts empty until created by user
      rootFiles: [], // Loose resources directly at root level
      hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      setCollections: (collections) => set({ collections }),

      toggleCollection: (target: string) => {
        set((state) => ({
          collections: updateCollectionTree(state.collections, target, (item) => ({
            ...item,
            open: !item.open,
          })),
        }))
      },

      addFolder: (parentTarget?: string, customName?: string) => {
        let parentFolder: Collection | null = null
        let siblingFolders: Collection[] = get().collections

        if (parentTarget) {
          parentFolder = findFolder(get().collections, parentTarget)
          if (parentFolder) {
            siblingFolders = parentFolder.folders ?? []
          }
        }

        const folderName =
          customName?.trim() || getNextSiblingFolderName("Folder", siblingFolders)

        const newFolder: Collection = {
          id: generateFolderId(),
          name: folderName,
          count: 0,
          open: true,
          children: [],
          folders: [],
        }

        set((state) => ({
          collections: parentFolder
            ? updateCollectionTree(state.collections, parentFolder.id || parentFolder.name, (item) => ({
                ...item,
                open: true,
                folders: [...(item.folders ?? []), newFolder],
              }))
            : [...state.collections, newFolder],
        }))

        return newFolder.id || newFolder.name || ""
      },

      addResourceToCollection: (targetCollection: string, resourceName: string) => {
        set((state) => {
          if (!targetCollection || targetCollection === "root") {
            const finalName = getUniqueFileNameInDestination(resourceName, state.rootFiles)
            return {
              rootFiles: state.rootFiles.includes(finalName)
                ? state.rootFiles
                : [...state.rootFiles, finalName],
            }
          }

          const targetFolder = findFolder(state.collections, targetCollection)
          const destFiles = targetFolder ? targetFolder.children : []
          const finalName = getUniqueFileNameInDestination(resourceName, destFiles)

          return {
            collections: updateCollectionTree(state.collections, targetCollection, (item) => ({
              ...item,
              open: true,
              count: item.children.includes(finalName) ? item.count : item.count + 1,
              children: item.children.includes(finalName)
                ? item.children
                : [...item.children, finalName],
            })),
          }
        })
      },

      moveResource: (resourceName: string, targetCollection: string) => {
        set((state) => {
          if (!targetCollection || targetCollection === "root") {
            const stripped = removeResourceFromTree(state.collections, resourceName)
            const finalName = getUniqueFileNameInDestination(resourceName, state.rootFiles)
            const newRootFiles = state.rootFiles.includes(finalName)
              ? state.rootFiles
              : [...state.rootFiles, finalName]
            return {
              collections: stripped,
              rootFiles: newRootFiles,
            }
          }

          const newRootFiles = state.rootFiles.filter((r) => r !== resourceName)
          const newCollections = moveResourceInTree(state.collections, resourceName, targetCollection)
          return {
            collections: newCollections,
            rootFiles: newRootFiles,
          }
        })
      },

      deleteTarget: (target: string, kind: "collection" | "resource") => {
        set((state) => ({
          rootFiles:
            kind === "resource"
              ? state.rootFiles.filter((r) => r !== target)
              : state.rootFiles,
          collections:
            kind === "collection"
              ? removeCollectionTree(state.collections, target)
              : removeResourceFromTree(state.collections, target),
        }))
      },

      clearCollections: () => set({ collections: [], rootFiles: [] }),
    }),
    {
      name: "project-p-collections",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.collections) {
          state.setCollections(ensureFolderIds(state.collections))
        }
        state?.setHasHydrated(true)
      },
    }
  )
)
