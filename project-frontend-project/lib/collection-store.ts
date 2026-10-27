import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { Collection, DEFAULT_COLLECTIONS } from "./workspace-types"

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

export function findResourcePath(
  targetResource: string,
  collections: Collection[],
  rootFiles: string[] = [],
  privateCollections: Collection[] = [],
  privateRootFiles: string[] = []
): string[] {
  // 1. Check if resource exists in Private root
  if (privateRootFiles.includes(targetResource)) {
    return ["Private", targetResource]
  }

  // 2. Check if resource exists in Private collections tree
  function searchPrivate(items: Collection[], currentPath: string[]): string[] | null {
    for (const item of items) {
      const nextPath = [...currentPath, item.name]
      if (item.children.includes(targetResource)) {
        return ["Private", ...nextPath, targetResource]
      }
      if (item.folders && item.folders.length > 0) {
        const found = searchPrivate(item.folders, nextPath)
        if (found) return found
      }
    }
    return null
  }

  const foundInPrivate = searchPrivate(privateCollections, [])
  if (foundInPrivate) return foundInPrivate

  // 3. Check if resource exists in Public root
  if (rootFiles.includes(targetResource)) {
    return [targetResource]
  }

  // 4. Check if resource exists in Public collections tree
  function search(items: Collection[], currentPath: string[]): string[] | null {
    for (const item of items) {
      const nextPath = [...currentPath, item.name]
      if (item.children.includes(targetResource)) {
        return [...nextPath, targetResource]
      }
      if (item.folders && item.folders.length > 0) {
        const found = search(item.folders, nextPath)
        if (found) return found
      }
    }
    return null
  }

  const foundInTree = search(collections, [])
  if (foundInTree) return foundInTree

  return [targetResource]
}

export function isResourceInPrivate(
  targetResource: string,
  privateCollections: Collection[] = [],
  privateRootFiles: string[] = []
): boolean {
  if (privateRootFiles.includes(targetResource)) return true
  function search(items: Collection[]): boolean {
    for (const item of items) {
      if (item.children.includes(targetResource)) return true
      if (item.folders && search(item.folders)) return true
    }
    return false
  }
  return search(privateCollections)
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

function renameFolderInTree(items: Collection[], targetId: string, newName: string): Collection[] {
  return items.map((item) => {
    if (item.id === targetId || item.name === targetId) {
      return { ...item, name: newName }
    }
    return {
      ...item,
      folders: item.folders ? renameFolderInTree(item.folders, targetId, newName) : item.folders,
    }
  })
}

function renameResourceInTree(items: Collection[], oldName: string, newName: string): Collection[] {
  return items.map((item) => ({
    ...item,
    children: item.children.map((c) => (c === oldName ? newName : c)),
    folders: item.folders ? renameResourceInTree(item.folders, oldName, newName) : item.folders,
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
  privateCollections: Collection[]
  privateRootFiles: string[]
  hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  setCollections: (collections: Collection[]) => void
  setPrivateCollections: (collections: Collection[]) => void
  toggleCollection: (name: string) => void
  addFolder: (parentName?: string, name?: string, isPrivate?: boolean) => string
  addResourceToCollection: (targetCollection: string, resourceName: string, isPrivate?: boolean) => void
  moveResource: (resourceName: string, targetCollection: string, isPrivate?: boolean) => void
  deleteTarget: (target: string, kind: "collection" | "resource") => void
  renameFolder: (targetId: string, newName: string) => void
  renameResource: (oldName: string, newName: string) => void
  clearCollections: () => void
  isResourcePrivate: (resourceName: string) => boolean
}

export const useCollectionStore = create<CollectionStore>()(
  persist(
    (set, get) => ({
      collections: DEFAULT_COLLECTIONS, // Starts with Example folder containing all resource mockups
      rootFiles: [], // Loose resources directly at root level
      privateCollections: [], // Isolated personal folders
      privateRootFiles: [], // Isolated personal root files
      hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      setCollections: (collections) => set({ collections }),
      setPrivateCollections: (privateCollections) => set({ privateCollections }),

      toggleCollection: (target: string) => {
        set((state) => {
          const inPublic = findFolder(state.collections, target)
          if (inPublic) {
            return {
              collections: updateCollectionTree(state.collections, target, (item) => ({
                ...item,
                open: !item.open,
              })),
            }
          }
          return {
            privateCollections: updateCollectionTree(state.privateCollections, target, (item) => ({
              ...item,
              open: !item.open,
            })),
          }
        })
      },

      addFolder: (parentTarget?: string, customName?: string, isPrivate?: boolean) => {
        const inPrivate =
          isPrivate ||
          parentTarget === "private:root" ||
          (parentTarget ? !!findFolder(get().privateCollections, parentTarget) : false)

        const targetTree = inPrivate ? get().privateCollections : get().collections
        let parentFolder: Collection | null = null
        let siblingFolders: Collection[] = targetTree

        if (parentTarget && parentTarget !== "root" && parentTarget !== "private:root") {
          parentFolder = findFolder(targetTree, parentTarget)
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
          isPrivate: inPrivate,
        }

        if (inPrivate) {
          set((state) => ({
            privateCollections: parentFolder
              ? updateCollectionTree(state.privateCollections, parentFolder.id || parentFolder.name, (item) => ({
                  ...item,
                  open: true,
                  folders: [...(item.folders ?? []), newFolder],
                }))
              : [...state.privateCollections, newFolder],
          }))
        } else {
          set((state) => ({
            collections: parentFolder
              ? updateCollectionTree(state.collections, parentFolder.id || parentFolder.name, (item) => ({
                  ...item,
                  open: true,
                  folders: [...(item.folders ?? []), newFolder],
                }))
              : [...state.collections, newFolder],
          }))
        }

        return newFolder.id || newFolder.name || ""
      },

      addResourceToCollection: (targetCollection: string, resourceName: string, isPrivate?: boolean) => {
        const isPrivateTarget =
          isPrivate ||
          targetCollection === "private:root" ||
          !!findFolder(get().privateCollections, targetCollection)

        if (isPrivateTarget) {
          set((state) => {
            if (!targetCollection || targetCollection === "private:root" || targetCollection === "root") {
              const finalName = getUniqueFileNameInDestination(resourceName, state.privateRootFiles)
              return {
                privateRootFiles: state.privateRootFiles.includes(finalName)
                  ? state.privateRootFiles
                  : [...state.privateRootFiles, finalName],
              }
            }

            const targetFolder = findFolder(state.privateCollections, targetCollection)
            const destFiles = targetFolder ? targetFolder.children : []
            const finalName = getUniqueFileNameInDestination(resourceName, destFiles)

            return {
              privateCollections: updateCollectionTree(state.privateCollections, targetCollection, (item) => ({
                ...item,
                open: true,
                count: item.children.includes(finalName) ? item.count : item.count + 1,
                children: item.children.includes(finalName)
                  ? item.children
                  : [...item.children, finalName],
              })),
            }
          })
        } else {
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
        }
      },

      moveResource: (resourceName: string, targetCollection: string, isPrivate?: boolean) => {
        const isTargetPrivate =
          isPrivate ||
          targetCollection === "private:root" ||
          !!findFolder(get().privateCollections, targetCollection)

        set((state) => {
          const strippedPublicCollections = removeResourceFromTree(state.collections, resourceName)
          const strippedPublicRoot = state.rootFiles.filter((r) => r !== resourceName)
          const strippedPrivateCollections = removeResourceFromTree(state.privateCollections, resourceName)
          const strippedPrivateRoot = state.privateRootFiles.filter((r) => r !== resourceName)

          if (isTargetPrivate) {
            if (!targetCollection || targetCollection === "private:root") {
              const finalName = getUniqueFileNameInDestination(resourceName, strippedPrivateRoot)
              return {
                collections: strippedPublicCollections,
                rootFiles: strippedPublicRoot,
                privateCollections: strippedPrivateCollections,
                privateRootFiles: [...strippedPrivateRoot, finalName],
              }
            }

            const dest = findFolder(strippedPrivateCollections, targetCollection)
            const destFiles = dest ? dest.children : []
            const finalName = getUniqueFileNameInDestination(resourceName, destFiles)

            return {
              collections: strippedPublicCollections,
              rootFiles: strippedPublicRoot,
              privateRootFiles: strippedPrivateRoot,
              privateCollections: updateCollectionTree(strippedPrivateCollections, targetCollection, (item) => ({
                ...item,
                open: true,
                count: item.children.includes(finalName) ? item.count : item.count + 1,
                children: item.children.includes(finalName) ? item.children : [...item.children, finalName],
              })),
            }
          } else {
            if (!targetCollection || targetCollection === "root") {
              const finalName = getUniqueFileNameInDestination(resourceName, strippedPublicRoot)
              return {
                collections: strippedPublicCollections,
                rootFiles: [...strippedPublicRoot, finalName],
                privateCollections: strippedPrivateCollections,
                privateRootFiles: strippedPrivateRoot,
              }
            }

            const dest = findFolder(strippedPublicCollections, targetCollection)
            const destFiles = dest ? dest.children : []
            const finalName = getUniqueFileNameInDestination(resourceName, destFiles)

            return {
              rootFiles: strippedPublicRoot,
              privateCollections: strippedPrivateCollections,
              privateRootFiles: strippedPrivateRoot,
              collections: updateCollectionTree(strippedPublicCollections, targetCollection, (item) => ({
                ...item,
                open: true,
                count: item.children.includes(finalName) ? item.count : item.count + 1,
                children: item.children.includes(finalName) ? item.children : [...item.children, finalName],
              })),
            }
          }
        })
      },

      deleteTarget: (target: string, kind: "collection" | "resource") => {
        set((state) => ({
          rootFiles:
            kind === "resource"
              ? state.rootFiles.filter((r) => r !== target)
              : state.rootFiles,
          privateRootFiles:
            kind === "resource"
              ? state.privateRootFiles.filter((r) => r !== target)
              : state.privateRootFiles,
          collections:
            kind === "collection"
              ? removeCollectionTree(state.collections, target)
              : removeResourceFromTree(state.collections, target),
          privateCollections:
            kind === "collection"
              ? removeCollectionTree(state.privateCollections, target)
              : removeResourceFromTree(state.privateCollections, target),
        }))
      },

      renameFolder: (targetId: string, newName: string) => {
        const trimmed = newName.trim()
        if (!trimmed) return
        set((state) => ({
          collections: renameFolderInTree(state.collections, targetId, trimmed),
          privateCollections: renameFolderInTree(state.privateCollections, targetId, trimmed),
        }))
      },

      renameResource: (oldName: string, newName: string) => {
        const trimmed = newName.trim()
        if (!trimmed || trimmed === oldName) return
        set((state) => ({
          rootFiles: state.rootFiles.map((f) => (f === oldName ? trimmed : f)),
          privateRootFiles: state.privateRootFiles.map((f) => (f === oldName ? trimmed : f)),
          collections: renameResourceInTree(state.collections, oldName, trimmed),
          privateCollections: renameResourceInTree(state.privateCollections, oldName, trimmed),
        }))
      },

      clearCollections: () =>
        set({ collections: [], rootFiles: [], privateCollections: [], privateRootFiles: [] }),

      isResourcePrivate: (resourceName: string) => {
        return isResourceInPrivate(resourceName, get().privateCollections, get().privateRootFiles)
      },
    }),
    {
      name: "project-p-collections",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.collections || state.collections.length === 0) {
            state.setCollections(ensureFolderIds(DEFAULT_COLLECTIONS))
          } else {
            state.setCollections(ensureFolderIds(state.collections))
          }
          if (state.privateCollections && state.privateCollections.length > 0) {
            state.setPrivateCollections(ensureFolderIds(state.privateCollections))
          } else {
            state.setPrivateCollections([])
          }
          state.setHasHydrated(true)
        }
      },
    }
  )
)
