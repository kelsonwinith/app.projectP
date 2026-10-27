"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Collection,
  DEFAULT_RESOURCES,
  INITIAL_CHAT_MESSAGES,
  ChatMessageItem,
  Resource,
} from "@/lib/workspace-types"
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
  resources: Resource[]
  allResources: Resource[]
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

  // Actions
  openResourceAndChat: (name: string) => void
  closeResource: () => void
  toggleCollection: (name: string) => void
  addFolder: (parentName?: string) => string
  createResource: (type: string, targetCollection?: string) => void
  importFiles: (files: FileList | File[], targetCollection?: string) => Promise<void>
  moveResource: (resourceName: string, targetCollection: string) => void
  deleteTarget: (target: string, kind: "collection" | "resource") => void
  sendMessage: (customText?: string) => void
  handleSaveDraft: (draft: { title: string; type: string; preview: string }) => void
  handleMiniChatDragStart: (event: React.MouseEvent) => void
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
  const toggleCollection = useCollectionStore((state) => state.toggleCollection)
  const addFolder = useCollectionStore((state) => state.addFolder)
  const addResourceToCollection = useCollectionStore((state) => state.addResourceToCollection)
  const moveResource = useCollectionStore((state) => state.moveResource)
  const deleteTargetFromStore = useCollectionStore((state) => state.deleteTarget)

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

  const openResourceAndChat = React.useCallback(
    (name: string) => {
      setOpenResource(name)
      setChatMode("full")
      const path = findResourcePath(name, collections, rootFiles)
      const targetUrl = `/resources/${path.map(encodeURIComponent).join("/")}`
      if (pathname !== targetUrl) {
        router.push(targetUrl)
      }
    },
    [collections, rootFiles, pathname, router]
  )

  const closeResource = React.useCallback(() => {
    setOpenResource(null)
    setChatMode("full")
    if (pathname && pathname.startsWith("/resources")) {
      router.push("/")
    }
  }, [pathname, router])

  const createResource = React.useCallback(
    (type: string, targetCollection?: string) => {
      const template =
        DEFAULT_RESOURCES.find((item) => item.type === type) ?? DEFAULT_RESOURCES[0]

      // Sibling-scoped unique file naming: check only the destination folder or root!
      let siblingFiles: string[] = rootFiles
      if (targetCollection && targetCollection !== "root") {
        const folder = findFolder(collections, targetCollection)
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
      }
      setCreatedResources((current) => [...current.filter((r) => r.name !== name), resource])
      addResourceToCollection(targetCollection || "root", name)
      openResourceAndChat(name)
    },
    [collections, rootFiles, openResourceAndChat, addResourceToCollection]
  )

  const importFiles = React.useCallback(
    async (files: FileList | File[], targetCollection?: string) => {
      const fileList = Array.from(files)
      if (fileList.length === 0) return

      let effectiveTarget = targetCollection || "root"
      let firstResourceName: string | null = null

      for (const file of fileList) {
        let folderForFile = effectiveTarget
        if (file.webkitRelativePath) {
          const parts = file.webkitRelativePath.split("/")
          if (parts.length > 1) {
            const folderName = parts[0]
            const existingFolder = findFolder(collections, folderName)
            if (existingFolder) {
              folderForFile = existingFolder.id || existingFolder.name
            } else {
              folderForFile = addFolder(
                effectiveTarget !== "root" ? effectiveTarget : undefined,
                folderName
              )
            }
          }
        }

        // 1. Read and extract raw text
        const rawText = await readTextFromFile(file)
        const resourceType = determineResourceType(file.name)
        const baseName = cleanBaseName(file.name)

        // 2. Check siblings in destination
        let siblingFiles: string[] = rootFiles
        if (folderForFile && folderForFile !== "root") {
          const folder = findFolder(collections, folderForFile)
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
        }

        setCreatedResources((current) => [...current.filter((r) => r.name !== name), resource])
        addResourceToCollection(folderForFile, name)

        if (!firstResourceName) {
          firstResourceName = name
        }
      }

      if (firstResourceName) {
        openResourceAndChat(firstResourceName)
      }
    },
    [collections, rootFiles, addFolder, addResourceToCollection, openResourceAndChat]
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

        const assistantMsg: ChatMessageItem = {
          role: "assistant",
          text: replyText,
          faithfulnessScore: hasConflict ? 74 : 98,
          hasConflictWarning: hasConflict,
          conflictDetails,
          generatedResourceDraft: draft,
          citations: citations.length > 0 ? citations : undefined,
        }

        setMessages((current) => [...current, assistantMsg])
      }, 400)
    },
    [chat, openResource]
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
      resources: DEFAULT_RESOURCES,
      allResources,
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
      sendMessage,
      handleSaveDraft,
      handleMiniChatDragStart,
    }),
    [
      collections,
      allResources,
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
      sendMessage,
      handleSaveDraft,
      handleMiniChatDragStart,
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
