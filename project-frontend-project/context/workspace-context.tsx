"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Collection,
  DEFAULT_RESOURCES,
  INITIAL_CHAT_MESSAGES,
  ChatMessageItem,
  Resource,
  WorkspaceRule,
} from "@/lib/workspace-types"
import { useRulesStore } from "@/lib/rules-store"
import {
  useCollectionStore,
  findFolder,
  findResourcePath,
  getNextSiblingResourceName,
} from "@/lib/collection-store"
import { useDraftStore } from "@/lib/draft-store"
import {
  readTextFromFile,
  determineResourceType,
  cleanBaseName,
  formatTextToPrettierBlocks,
} from "@/lib/resource-importer"

interface WorkspaceContextType {
  collections: Collection[]
  rootFiles: string[]
  privateCollections: Collection[]
  privateRootFiles: string[]
  resources: Resource[]
  allResources: Resource[]
  knowledgeResources: Resource[]
  openResource: string | null
  deletedResources: string[]
  chat: string
  setChat: (text: string) => void
  messages: ChatMessageItem[]
  chatMode: "full" | "floating" | "minimized"
  setChatMode: (mode: "full" | "floating" | "minimized") => void
  chatPosition: { x: number; y: number }
  setChatPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  rulesMode: "strict" | "fast"
  setRulesMode: (mode: "strict" | "fast") => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void

  // Rules (Project Agent Skills & Guardrails)
  rules: WorkspaceRule[]
  activeRules: WorkspaceRule[]
  toggleRule: (id: string) => void
  addRule: (rule: Omit<WorkspaceRule, "id">) => void
  deleteRule: (id: string) => void
  updateRule: (id: string, updates: Partial<WorkspaceRule>) => void

  // Actions
  openResourceAndChat: (name: string) => void
  closeResource: () => void
  toggleCollection: (name: string) => void
  addFolder: (parentName?: string, isPrivate?: boolean) => string
  createResource: (type: string, targetCollection?: string, isPrivate?: boolean) => void
  importFiles: (files: FileList | File[], targetCollection?: string, isPrivate?: boolean) => Promise<void>
  moveResource: (resourceName: string, targetCollection: string, isPrivate?: boolean) => void
  deleteTarget: (target: string, kind: "collection" | "resource") => void
  renameResource: (oldName: string, newName: string) => void
  renameFolder: (targetId: string, newName: string) => void
  sendMessage: (customText?: string) => void
  handleSaveDraft: (draft: { title: string; type: string; preview: string }) => void
  handleMiniChatDragStart: (event: React.MouseEvent) => void
  isResourcePrivate: (name: string) => boolean
}

const WorkspaceContext = React.createContext<WorkspaceContextType | null>(null)

function getAllResourceNamesFromCollections(collections: Collection[], rootFiles: string[] = []): string[] {
  const names: string[] = [...rootFiles]
  function traverse(cols: Collection[]) {
    for (const col of cols) {
      names.push(...col.children)
      if (col.folders) traverse(col.folders)
    }
  }
  traverse(collections)
  return names
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const collections = useCollectionStore((state) => state.collections)
  const rootFiles = useCollectionStore((state) => state.rootFiles)
  const privateCollections = useCollectionStore((state) => state.privateCollections)
  const privateRootFiles = useCollectionStore((state) => state.privateRootFiles)
  const toggleCollection = useCollectionStore((state) => state.toggleCollection)
  const addFolderInStore = useCollectionStore((state) => state.addFolder)
  const addResourceToCollection = useCollectionStore((state) => state.addResourceToCollection)
  const moveResource = useCollectionStore((state) => state.moveResource)
  const deleteTargetFromStore = useCollectionStore((state) => state.deleteTarget)
  const renameFolderInStore = useCollectionStore((state) => state.renameFolder)
  const renameResourceInStore = useCollectionStore((state) => state.renameResource)
  const isResourcePrivate = useCollectionStore((state) => state.isResourcePrivate)

  const rules = useRulesStore((state) => state.rules)
  const toggleRule = useRulesStore((state) => state.toggleRule)
  const addRule = useRulesStore((state) => state.addRule)
  const deleteRule = useRulesStore((state) => state.deleteRule)
  const updateRule = useRulesStore((state) => state.updateRule)

  const activeRules = React.useMemo(() => rules.filter((r) => r.enabled), [rules])

  const router = useRouter()
  const pathname = usePathname()

  const [createdResources, setCreatedResources] = React.useState<Resource[]>([])
  const [deletedResources, setDeletedResources] = React.useState<string[]>([])
  const [openResource, setOpenResource] = React.useState<string | null>(null)

  const [chat, setChat] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessageItem[]>(INITIAL_CHAT_MESSAGES)
  const [chatMode, setChatMode] = React.useState<"full" | "floating" | "minimized">("full")
  const [chatPosition, setChatPosition] = React.useState({ x: 0, y: 0 })
  const [rulesMode, setRulesMode] = React.useState<"strict" | "fast">("strict")
  const [searchOpen, setSearchOpen] = React.useState(false)

  const isDraggingRef = React.useRef(false)
  const dragStartRef = React.useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 })

  const allResources = React.useMemo(() => {
    return [...DEFAULT_RESOURCES, ...createdResources]
  }, [createdResources])

  // Public knowledge resources: Strictly excludes any private resource from semantic index and living glossary
  const knowledgeResources = React.useMemo(() => {
    return allResources.filter((r) => !isResourcePrivate(r.name))
  }, [allResources, isResourcePrivate])

  const openResourceAndChat = React.useCallback(
    (name: string) => {
      setOpenResource(name)
      setChatMode("full")
      const path = findResourcePath(name, collections, rootFiles, privateCollections, privateRootFiles)
      const targetUrl = `/resources/${path.map(encodeURIComponent).join("/")}`
      if (pathname !== targetUrl) {
        router.push(targetUrl)
      }
    },
    [collections, rootFiles, privateCollections, privateRootFiles, pathname, router]
  )

  const closeResource = React.useCallback(() => {
    setOpenResource(null)
    setChatMode("full")
    if (pathname && pathname.startsWith("/resources")) {
      router.push("/")
    }
  }, [pathname, router])

  const addFolder = React.useCallback(
    (parentName?: string, isPrivate?: boolean) => {
      return addFolderInStore(parentName, undefined, isPrivate)
    },
    [addFolderInStore]
  )

  const createResource = React.useCallback(
    (type: string, targetCollection?: string, isPrivate?: boolean) => {
      const template =
        DEFAULT_RESOURCES.find((item) => item.type === type) ?? DEFAULT_RESOURCES[0]

      const inPrivate =
        isPrivate ||
        targetCollection === "private:root" ||
        (targetCollection ? !!findFolder(privateCollections, targetCollection) : false)

      const targetTree = inPrivate ? privateCollections : collections
      let siblingFiles: string[] = inPrivate ? privateRootFiles : rootFiles
      if (targetCollection && targetCollection !== "root" && targetCollection !== "private:root") {
        const folder = findFolder(targetTree, targetCollection)
        if (folder) {
          siblingFiles = folder.children
        }
      }

      // First resource of this type in this folder has no number; duplicates start counting 1, 2, 3...
      const name = getNextSiblingResourceName(type, siblingFiles)

      const resource: Resource = {
        ...template,
        name,
        type,
        detail: `${type} resource · created just now`,
        isPrivate: inPrivate,
      }
      setCreatedResources((current) => [...current.filter((r) => r.name !== name), resource])
      addResourceToCollection(targetCollection || (inPrivate ? "private:root" : "root"), name, inPrivate)
      openResourceAndChat(name)
    },
    [collections, rootFiles, privateCollections, privateRootFiles, openResourceAndChat, addResourceToCollection]
  )

  const importFiles = React.useCallback(
    async (files: FileList | File[], targetCollection?: string, isPrivate?: boolean) => {
      const fileList = Array.from(files)
      if (fileList.length === 0) return

      const inPrivate =
        isPrivate ||
        targetCollection === "private:root" ||
        (targetCollection ? !!findFolder(privateCollections, targetCollection) : false)

      let effectiveTarget = targetCollection || (inPrivate ? "private:root" : "root")
      const targetTree = inPrivate ? privateCollections : collections
      let firstResourceName: string | null = null

      for (const file of fileList) {
        let folderForFile = effectiveTarget
        if (file.webkitRelativePath) {
          const parts = file.webkitRelativePath.split("/")
          if (parts.length > 1) {
            const folderName = parts[0]
            const existingFolder = findFolder(targetTree, folderName)
            if (existingFolder) {
              folderForFile = existingFolder.id || existingFolder.name
            } else {
              folderForFile = addFolder(
                effectiveTarget !== "root" && effectiveTarget !== "private:root" ? effectiveTarget : undefined,
                inPrivate
              )
            }
          }
        }

        // 1. Read and extract raw text
        const rawText = await readTextFromFile(file)
        const resourceType = determineResourceType(file.name)
        const baseName = cleanBaseName(file.name)

        // 2. Check siblings in destination
        let siblingFiles: string[] = inPrivate ? privateRootFiles : rootFiles
        if (folderForFile && folderForFile !== "root" && folderForFile !== "private:root") {
          const folder = findFolder(targetTree, folderForFile)
          if (folder) {
            siblingFiles = folder.children
          }
        }

        const name = getNextSiblingResourceName(baseName, siblingFiles)

        // 3. Prettier re-layout and formatting
        if (resourceType === "Document") {
          const prettierBlocks = formatTextToPrettierBlocks(rawText, file.name)
          useDraftStore.getState().saveImportedDocument(name, prettierBlocks)
        } else {
          useDraftStore.getState().saveTempBlock(name, "code-content", "", rawText)
        }

        // 4. Create resource metadata
        const template =
          DEFAULT_RESOURCES.find((item) => item.type === resourceType) ?? DEFAULT_RESOURCES[0]

        const resource: Resource = {
          ...template,
          name,
          type: resourceType,
          detail: `${resourceType} · imported from ${file.name}`,
          isPrivate: inPrivate,
        }

        setCreatedResources((current) => [...current.filter((r) => r.name !== name), resource])
        addResourceToCollection(folderForFile, name, inPrivate)

        if (!firstResourceName) {
          firstResourceName = name
        }
      }

      if (firstResourceName) {
        openResourceAndChat(firstResourceName)
      }
    },
    [collections, rootFiles, privateCollections, privateRootFiles, addFolder, addResourceToCollection, openResourceAndChat]
  )

  const deleteTarget = React.useCallback(
    (target: string, kind: "collection" | "resource") => {
      if (kind === "resource") {
        setDeletedResources((current) => (current.includes(target) ? current : [...current, target]))
        setCreatedResources((current) => current.filter((r) => r.name !== target))
        setOpenResource((current) => (current === target ? null : current))
        deleteTargetFromStore(target, "resource")
      } else {
        deleteTargetFromStore(target, "collection")
      }
    },
    [deleteTargetFromStore]
  )

  const renameResource = React.useCallback(
    (oldName: string, newName: string) => {
      const trimmed = newName.trim()
      if (!trimmed || trimmed === oldName) return
      renameResourceInStore(oldName, trimmed)
      useDraftStore.getState().renameResourceDrafts(oldName, trimmed)
      setCreatedResources((current) =>
        current.map((r) => (r.name === oldName ? { ...r, name: trimmed } : r))
      )
      if (openResource === oldName) {
        setOpenResource(trimmed)
        const path = findResourcePath(trimmed, collections, rootFiles, privateCollections, privateRootFiles)
        const targetUrl = `/resources/${path.map(encodeURIComponent).join("/")}`
        router.replace(targetUrl)
      }
    },
    [renameResourceInStore, openResource, collections, rootFiles, privateCollections, privateRootFiles, router]
  )

  const renameFolder = React.useCallback(
    (targetId: string, newName: string) => {
      const trimmed = newName.trim()
      if (!trimmed) return
      renameFolderInStore(targetId, trimmed)
      if (openResource) {
        const path = findResourcePath(openResource, collections, rootFiles, privateCollections, privateRootFiles)
        const targetUrl = `/resources/${path.map(encodeURIComponent).join("/")}`
        if (pathname !== targetUrl && pathname.startsWith("/resources")) {
          router.replace(targetUrl)
        }
      }
    },
    [renameFolderInStore, openResource, collections, rootFiles, privateCollections, privateRootFiles, pathname, router]
  )

  const handleSaveDraft = React.useCallback(
    (draft: { title: string; type: string; preview: string }) => {
      const template =
        DEFAULT_RESOURCES.find((item) => item.type === draft.type) ?? DEFAULT_RESOURCES[0]
      const resource: Resource = {
        ...template,
        name: draft.title,
        detail: `${draft.type} resource · created from chat`,
      }
      setCreatedResources((current) => [...current, resource])
      if (collections.length > 0) {
        addResourceToCollection(collections[0].name, draft.title)
      }
      openResourceAndChat(draft.title)
    },
    [openResourceAndChat, collections, addResourceToCollection]
  )

  const sendMessage = React.useCallback(
    (customText?: string) => {
      const message = (customText ?? chat).trim()
      if (!message) return
      setMessages((current) => [...current, { role: "user", text: message }])
      if (!customText) setChat("")

      window.setTimeout(() => {
        const isCurrentPrivate = openResource ? isResourcePrivate(openResource) : false

        if (isCurrentPrivate) {
          const assistantMsg: ChatMessageItem = {
            role: "assistant",
            text: `[Private Resource Mode] This note is stored in your personal Private collection and is strictly excluded from team knowledge grounding, Living Glossary, and SSoT conflict scans.\n\nResponding directly to your query about "${openResource}": everything looks well structured.`,
            faithfulnessScore: 100,
          }
          setMessages((current) => [...current, assistantMsg])
          return
        }

        const isConflict =
          message.toLowerCase().includes("conflict") ||
          message.toLowerCase().includes("budget") ||
          message.toLowerCase().includes("งบ") ||
          message.toLowerCase().includes("10,000")
        const isDraft =
          message.toLowerCase().includes("draft") ||
          message.toLowerCase().includes("create") ||
          message.toLowerCase().includes("สร้าง") ||
          message.toLowerCase().includes("ร่าง") ||
          message.toLowerCase().includes("spec")

        let replyText = `I found a useful starting point in ${openResource ?? "Project P"}. I verified this against our active collections and canonical glossary.`
        let hasConflict = false
        let conflictDetails = undefined
        let draft = undefined
        let citations: { name: string; quote?: string }[] = []

        if (isConflict) {
          hasConflict = true
          replyText = `Cross-source fact check detected a potential conflict with Clinical Trial Metrics. The specified budget and metrics deviate from the verified baseline.`
          conflictDetails = {
            conflictingFile: "Clinical Trial Metrics",
            reason:
              "Budget allocation and participant target contradict the verified sheet data.",
          }
        } else if (isDraft) {
          replyText = `I drafted a new resource based on your prompt. You can review the summary below and save it directly into your collections:`
          draft = {
            title: openResource ? `${openResource} Annex` : "Zero-Knowledge Auth Spec",
            type: "Document",
            preview:
              "Authentication and session exchange specification for secure microservices communication.",
          }
        } else {
          citations = [
            {
              name: openResource ?? "API Specification v2",
              quote: "Verified document reference",
            },
          ]
        }

        const activeRulesList = useRulesStore.getState().rules.filter((r) => r.enabled)
        const appliedRules = activeRulesList.slice(0, 3).map((r) => r.title)

        const assistantMsg: ChatMessageItem = {
          role: "assistant",
          text: replyText,
          faithfulnessScore: hasConflict ? 74 : 98,
          hasConflictWarning: hasConflict,
          conflictDetails,
          generatedResourceDraft: draft,
          citations: citations.length > 0 ? citations : undefined,
          appliedRules: appliedRules.length > 0 ? appliedRules : undefined,
        }

        setMessages((current) => [...current, assistantMsg])
      }, 400)
    },
    [chat, openResource, isResourcePrivate]
  )

  const handleMiniChatDragStart = React.useCallback(
    (event: React.MouseEvent) => {
      if (event.button !== 0) return
      isDraggingRef.current = true
      dragStartRef.current = {
        mouseX: event.clientX,
        mouseY: event.clientY,
        posX: chatPosition.x,
        posY: chatPosition.y,
      }

      function onMouseMove(e: MouseEvent) {
        if (!isDraggingRef.current) return
        const dx = e.clientX - dragStartRef.current.mouseX
        const dy = e.clientY - dragStartRef.current.mouseY
        setChatPosition({
          x: dragStartRef.current.posX + dx,
          y: dragStartRef.current.posY + dy,
        })
      }

      function onMouseUp() {
        isDraggingRef.current = false
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
      }

      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
    },
    [chatPosition]
  )

  // Global ⌘K shortcut listener
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const value = React.useMemo(
    () => ({
      collections,
      rootFiles,
      privateCollections,
      privateRootFiles,
      resources: DEFAULT_RESOURCES,
      allResources,
      knowledgeResources,
      openResource,
      deletedResources,
      chat,
      setChat,
      messages,
      chatMode,
      setChatMode,
      chatPosition,
      setChatPosition,
      rulesMode,
      setRulesMode,
      searchOpen,
      setSearchOpen,
      openResourceAndChat,
      closeResource,
      toggleCollection,
      addFolder,
      createResource,
      importFiles,
      moveResource,
      deleteTarget,
      renameResource,
      renameFolder,
      sendMessage,
      handleSaveDraft,
      handleMiniChatDragStart,
      rules,
      activeRules,
      toggleRule,
      addRule,
      deleteRule,
      updateRule,
      isResourcePrivate,
    }),
    [
      collections,
      rootFiles,
      privateCollections,
      privateRootFiles,
      allResources,
      knowledgeResources,
      openResource,
      deletedResources,
      chat,
      messages,
      chatMode,
      chatPosition,
      rulesMode,
      searchOpen,
      openResourceAndChat,
      closeResource,
      toggleCollection,
      addFolder,
      createResource,
      importFiles,
      moveResource,
      deleteTarget,
      renameResource,
      renameFolder,
      sendMessage,
      handleSaveDraft,
      handleMiniChatDragStart,
      rules,
      activeRules,
      toggleRule,
      addRule,
      deleteRule,
      updateRule,
      isResourcePrivate,
    ]
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider")
  }
  return context
}
