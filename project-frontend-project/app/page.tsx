'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import {
  BookOpen, Bot, ChevronDown, ChevronRight, Code2, FileText, Folder, FolderPlus,
  ImageIcon, LayoutGrid, Library, MessageSquareText, MoreHorizontal, Network,
  PanelLeft, Presentation, Search, Settings2, Sparkles, Table2, Trash2, Users, X, Zap,
} from 'lucide-react'

type Collection = {
  name: string
  count: number
  open: boolean
  children: string[]
  folders?: Collection[]
}

const initialCollections: Collection[] = [
  { name: 'Product docs', count: 12, open: true, children: ['API Specification v2', 'Product Roadmap'], folders: [{ name: 'Archive', count: 3, open: false, children: ['Launch notes'], folders: [] }] },
  { name: 'Research & insights', count: 8, open: false, children: ['Clinical Trial Metrics', 'Market notes'], folders: [{ name: 'Experiments', count: 2, open: false, children: ['Study brief'], folders: [] }] },
  { name: 'Team playbook', count: 6, open: false, children: ['Onboarding guide', 'Brand direction'], folders: [] },
]

const resources = [
  { name: 'System Architecture', type: 'Graph', icon: Network, color: 'bg-violet-50 text-violet-600', detail: 'Architecture graph · synced 2 min ago' },
  { name: 'API Specification v2', type: 'Document', icon: FileText, color: 'bg-blue-50 text-blue-600', detail: 'Document · edited 18 min ago' },
  { name: 'Clinical Trial Metrics', type: 'Table', icon: Table2, color: 'bg-emerald-50 text-emerald-600', detail: 'Table · synced 42 min ago' },
  { name: 'Product Roadmap', type: 'Presentation', icon: Presentation, color: 'bg-amber-50 text-amber-600', detail: 'Presentation · updated yesterday' },
  { name: 'Brand direction', type: 'Image', icon: ImageIcon, color: 'bg-rose-50 text-rose-600', detail: 'Image board · updated yesterday' },
  { name: 'Database schema', type: 'Code', icon: Code2, color: 'bg-cyan-50 text-cyan-600', detail: 'Code resource · updated Oct 24' },
]

function ResourceIcon({ type }: { type: string }) {
  const resource = resources.find((item) => item.type === type || item.name === type)
  const Icon = resource?.icon ?? FileText
  return <Icon className={`size-3.5 shrink-0 ${resource?.color.split(' ').find((token) => token.startsWith('text-')) ?? 'text-[#a0aab5]'}`} aria-hidden="true" />
}

function CollectionTree({ items, level = 0, onToggle, onOpen, onMenu }: { items: Collection[]; level?: number; onToggle: (name: string) => void; onOpen: (name: string) => void; onMenu: (event: React.MouseEvent, target: string, kind?: 'collection' | 'resource') => void }) {
  return <div className="flex flex-col gap-0.5">{items.map((collection) => {
    const folders = [...(collection.folders ?? [])].sort((a, b) => a.name.localeCompare(b.name))
    const files = [...collection.children].sort((a, b) => a.localeCompare(b))
    return <div key={`${collection.name}-${level}`}>
      <button onClick={() => onToggle(collection.name)} onContextMenu={(event) => onMenu(event, collection.name)} className="flex w-full items-center gap-2 rounded-[9px] px-2 py-2.5 pr-1 text-left text-[13px] text-[#637080] hover:bg-[#f7f8fa]" style={{ paddingLeft: 8 + level * 12 }}><ChevronRight className={`size-3 text-[#a0aab5] transition-transform ${collection.open ? 'rotate-90' : ''}`} /><Folder className="size-[16px] shrink-0 text-[#e2a93b]" />{collection.name}<span className="ml-auto text-[11px] text-[#a7b0bc]">{collection.count}</span></button>
      {collection.open && <div className="flex flex-col gap-0.5 border-l border-[#edf0f3] pl-2" style={{ marginLeft: 8 + level * 12 }}>{folders.map((folder) => <CollectionTree key={folder.name} items={[folder]} level={level + 1} onToggle={onToggle} onOpen={onOpen} onMenu={onMenu} />)}{files.map((child) => <button key={child} onClick={() => onOpen(child)} onContextMenu={(event) => onMenu(event, child, 'resource')} className="flex w-full min-w-0 items-center gap-2 rounded-[9px] px-2 py-2.5 pr-1 text-left text-[13px] text-[#637080] hover:bg-[#f7f8fa] hover:text-[#3773ad]"><span className="size-3 shrink-0" aria-hidden="true" /><ResourceIcon type={child} /> <span className="truncate">{child}</span></button>)}</div>}
    </div>
  })}</div>
}

type ChatMessageItem = {
  role: 'user' | 'assistant'
  text: string
  faithfulnessScore?: number
  citations?: { name: string; quote?: string }[]
  hasConflictWarning?: boolean
  conflictDetails?: { conflictingFile: string; reason: string }
  generatedResourceDraft?: { title: string; type: string; preview: string }
}

const initialChatMessages: ChatMessageItem[] = [
  {
    role: 'assistant',
    text: 'Hello Sarah! I am Project P Assistant. I can help synthesize workspace knowledge, run cross-source fact checking, or draft new resources from our conversation.',
    faithfulnessScore: 99,
  },
  {
    role: 'user',
    text: 'Can you summarize our product docs and check if there are any conflicting claims?',
  },
  {
    role: 'assistant',
    text: 'Based on API Specification v2 and System Architecture:\n• The backend operates on FastAPI and PostgreSQL 16 with pgvector for vector retrieval.\n• Redis handles shared temp drafts with sub-15ms WebSocket roundtrips.\n• All resources maintain single-source-of-truth transclusion pointers.',
    citations: [
      { name: 'API Specification v2', quote: 'FastAPI gateway and schema spec' },
      { name: 'System Architecture', quote: 'Redis cache layer & WebSocket hub' },
    ],
    faithfulnessScore: 98,
  },
]

export default function Page() {
  const [activeNav, setActiveNav] = useState('Workspace')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [collections, setCollections] = useState(initialCollections)
  const [createdResources, setCreatedResources] = useState<typeof resources>([])
  const [resourceTarget, setResourceTarget] = useState<string | null>(null)
  const [resourceSubmenuOpen, setResourceSubmenuOpen] = useState(false)
  const [resourcePickerOpen, setResourcePickerOpen] = useState(false)
  const [selectedResourceType, setSelectedResourceType] = useState(resources[0].type)

  const allResources = useMemo(() => [...resources, ...createdResources], [createdResources])

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; kind: 'collection' | 'resource' | 'canvas'; target?: string } | null>(null)
  const [openResource, setOpenResource] = useState<string | null>(null)
  const [deletedResources, setDeletedResources] = useState<string[]>([])
  const [chat, setChat] = useState('')
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialChatMessages)
  const [chatMode, setChatMode] = useState<'full' | 'floating' | 'minimized'>('full')
  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 })
  const [rulesMode, setRulesMode] = useState<'strict' | 'fast'>('strict')
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 })
  const fullMessagesEndRef = useRef<HTMLDivElement>(null)
  const miniMessagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fullMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    miniMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleMiniChatDragStart(event: React.MouseEvent) {
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
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function handleSaveDraft(draft: { title: string; type: string; preview: string }) {
    const template = resources.find((item) => item.type === draft.type) ?? resources[0]
    const resource = { ...template, name: draft.title, detail: `${draft.type} resource · created from chat` }
    setCreatedResources((current) => [...current, resource])
    setCollections((current) => {
      if (current.length === 0) return current
      return [
        {
          ...current[0],
          open: true,
          count: current[0].count + 1,
          children: [...current[0].children, draft.title],
        },
        ...current.slice(1),
      ]
    })
    openResourceAndChat(draft.title)
  }

  function openResourceAndChat(name: string) {
    setOpenResource(name)
    setChatMode('floating')
  }

  function closeResource() {
    setOpenResource(null)
    setChatMode('full')
  }

  function showMenu(event: React.MouseEvent, kind: 'collection' | 'resource' | 'canvas', target?: string) {
    event.preventDefault()
    event.stopPropagation()
    setContextMenu({ x: event.clientX, y: event.clientY, kind, target })
  }

  function removeCollection(items: Collection[], target: string): Collection[] {
    return items.filter((item) => item.name !== target).map((item) => ({ ...item, folders: item.folders ? removeCollection(item.folders, target) : item.folders }))
  }

  function deleteTarget() {
    const target = contextMenu?.target
    if (!target) return
    if (contextMenu?.kind === 'resource') {
      setDeletedResources((current) => current.includes(target) ? current : [...current, target])
      setOpenResource((current) => current === target ? null : current)
    } else if (contextMenu?.kind === 'collection') {
      setCollections((current) => removeCollection(current, target))
    }
    setContextMenu(null)
  }

  function updateCollection(items: Collection[], target: string, update: (item: Collection) => Collection): Collection[] {
    return items.map((item) => item.name === target ? update(item) : { ...item, folders: item.folders ? updateCollection(item.folders, target, update) : item.folders })
  }

  function addFolder() {
    const parent = contextMenu?.kind === 'collection' ? contextMenu.target : undefined
    const folder = { name: `New folder ${Date.now().toString().slice(-4)}`, count: 0, open: true, children: [], folders: [] }
    setCollections((current) => parent ? updateCollection(current, parent, (item) => ({ ...item, open: true, folders: [...(item.folders ?? []), folder] })) : [...current, folder])
    setContextMenu(null)
  }

  function createResource(type: string) {
    const template = resources.find((item) => item.type === type) ?? resources[0]
    const name = `${type} ${createdResources.length + 1}`
    const resource = { ...template, name, detail: `${type} resource · created just now` }
    setCreatedResources((current) => [...current, resource])
    setCollections((current) => resourceTarget ? updateCollection(current, resourceTarget, (item) => ({ ...item, open: true, count: item.count + 1, children: [...item.children, name] })) : current)
    setResourceTarget(null)
    setResourceSubmenuOpen(false)
    setContextMenu(null)
    openResourceAndChat(name)
  }

  function sendMessage(customText?: string) {
    const message = (customText ?? chat).trim()
    if (!message) return
    setMessages((current) => [...current, { role: 'user', text: message }])
    if (!customText) setChat('')

    window.setTimeout(() => {
      const isConflict = message.toLowerCase().includes('conflict') || message.toLowerCase().includes('budget') || message.toLowerCase().includes('งบ') || message.toLowerCase().includes('10,000')
      const isDraft = message.toLowerCase().includes('draft') || message.toLowerCase().includes('create') || message.toLowerCase().includes('สร้าง') || message.toLowerCase().includes('ร่าง') || message.toLowerCase().includes('spec')

      let replyText = `I found a useful starting point in ${openResource ?? 'Project P'}. I verified this against our active collections and canonical glossary.`
      let hasConflict = false
      let conflictDetails = undefined
      let draft = undefined
      let citations: { name: string; quote?: string }[] = []

      if (isConflict) {
        hasConflict = true
        replyText = `Cross-source fact check detected a potential conflict with Clinical Trial Metrics. The specified budget and metrics deviate from the verified baseline.`
        conflictDetails = {
          conflictingFile: 'Clinical Trial Metrics',
          reason: 'Budget allocation and participant target contradict the verified sheet data.',
        }
      } else if (isDraft) {
        replyText = `I drafted a new resource based on your prompt. You can review the summary below and save it directly into your collections:`
        draft = {
          title: openResource ? `${openResource} Annex` : 'Zero-Knowledge Auth Spec',
          type: 'Document',
          preview: 'Authentication and session exchange specification for secure microservices communication.',
        }
      } else {
        citations = [
          { name: openResource ?? 'API Specification v2', quote: 'Verified document reference' },
        ]
      }

      const assistantMsg: ChatMessageItem = {
        role: 'assistant',
        text: replyText,
        faithfulnessScore: hasConflict ? 74 : 98,
        hasConflictWarning: hasConflict,
        conflictDetails,
        generatedResourceDraft: draft,
        citations: citations.length > 0 ? citations : undefined,
      }

      setMessages((current) => [...current, assistantMsg])
    }, 400)
  }

  const hasResource = Boolean(openResource)

  return (
    <main onContextMenu={(event) => showMenu(event, 'canvas')} onClick={() => contextMenu && setContextMenu(null)} className="min-h-screen bg-[#f7f8fa] text-[#17212b] selection:bg-[#d8e8ff]">
      <div className="flex min-h-screen">
        <aside className="hidden h-screen w-[248px] shrink-0 overflow-hidden border-r border-[#e4e8ee] bg-white lg:flex lg:flex-col" onContextMenu={(event) => showMenu(event, 'collection')}>
          <div className="flex h-[72px] items-center gap-3 border-b border-[#edf0f3] px-6">
            <div className="grid size-8 place-items-center rounded-[10px] bg-[#111827] text-white shadow-sm"><span className="text-sm font-bold">P</span></div>
            <div className="text-[15px] font-semibold tracking-[-0.02em]">Project P</div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-3 py-5">
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a9b5]">Workspace</div>
            <nav className="flex shrink-0 flex-col gap-1">
              {[['Workspace', LayoutGrid], ['Knowledge hub', Library], ['Glossary', BookOpen], ['Activity', Zap]].map(([label, Icon]) => {
                const active = activeNav === label
                return <button key={label as string} onClick={() => setActiveNav(label as string)} className={`flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-[13px] transition-colors ${active ? 'bg-[#eef3f9] font-semibold text-[#1c5da7]' : 'text-[#637080] hover:bg-[#f7f8fa]'}`}><Icon className="size-[16px]" />{label as string}{label === 'Glossary' && <span className="ml-auto rounded-full bg-[#fff1cc] px-1.5 py-0.5 text-[10px] font-semibold text-[#9b7016]">12</span>}</button>
              })}
            </nav>
            <div className="mb-2 mt-7 shrink-0 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a0a9b5]">Collections</div>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <CollectionTree items={collections} onToggle={(name) => setCollections((current) => updateCollection(current, name, (item) => ({ ...item, open: !item.open })))} onOpen={openResourceAndChat} onMenu={(event, target, kind = 'collection') => showMenu(event, kind, target)} />
            </div>
          </div>
          <div className="border-t border-[#edf0f3] p-3"><button onClick={() => setSettingsOpen(true)} className="flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-[13px] text-[#637080] hover:bg-[#f7f8fa]"><Settings2 className="size-[16px]" />Settings</button><div className="mt-3 flex items-center gap-2 rounded-[9px] bg-[#f8fafc] px-3 py-2.5"><div className="grid size-7 place-items-center rounded-full bg-[#dbeafe] text-[11px] font-semibold text-[#25558c]">SW</div><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold">Sarah Wong</div><div className="truncate text-[10px] text-[#8a95a3]">Product team</div></div><ChevronDown className="size-3.5 text-[#9aa5b2]" /></div></div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-between border-b border-[#e4e8ee] bg-white px-5 sm:px-8"><div className="flex items-center gap-3"><button className="grid size-8 place-items-center rounded-md border border-[#e4e8ee] text-[#657384] lg:hidden"><PanelLeft className="size-4" /></button><div><div className="flex items-center gap-2 text-[12px] text-[#8a95a3]"><span>Project P</span><ChevronRight className="size-3" /><span className="font-medium text-[#344250]">{openResource ?? 'Workspace'}</span></div><div className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em]">{openResource ?? 'Workspace overview'}</div></div></div><div className="flex items-center gap-2"><button className="hidden h-9 items-center gap-2 rounded-md border border-[#e4e8ee] px-3 text-[12px] text-[#677687] shadow-sm sm:flex"><Search className="size-3.5" />Search<span className="ml-4 rounded border border-[#e4e8ee] px-1.5 py-0.5 text-[10px] text-[#a1aab5]">⌘ K</span></button><div className="flex -space-x-2"><div className="grid size-7 place-items-center rounded-full border-2 border-white bg-[#f3d6c4] text-[9px] font-semibold text-[#87573f]">JD</div><div className="grid size-7 place-items-center rounded-full border-2 border-white bg-[#d6e6d4] text-[9px] font-semibold text-[#477448]">MK</div><div className="grid size-7 place-items-center rounded-full border-2 border-white bg-[#ddd4ee] text-[9px] font-semibold text-[#664d8f]">+4</div></div></div></header>

          <div className="mx-auto flex max-w-[1440px] flex-col px-5 py-7 sm:px-8 lg:px-10" onContextMenu={(event) => showMenu(event, 'resource')}>
            {!hasResource && <><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-[#5e8bb7]"><span className="size-1.5 rounded-full bg-[#4c9f82]" />All systems synced <span className="text-[#a3adb9]">·</span> Updated just now</div><h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#17212b] sm:text-[32px]">Good morning, Sarah.</h1><p className="mt-1.5 text-[14px] text-[#7a8795]">Choose a resource or ask Project P about your knowledge workspace.</p></div></div><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[['Resources', '48', Library], ['Knowledge coverage', '82%', Network], ['Open conflicts', '3', Sparkles], ['Team activity', '24', Users]].map(([label, value, Icon]) => <div key={label as string} className="rounded-xl border border-[#e4e8ee] bg-white p-4 shadow-[0_1px_2px_rgba(20,40,60,0.02)]"><div className="flex items-start justify-between"><div className="text-[12px] font-medium text-[#84909d]">{label as string}</div><Icon className="size-4 text-[#5b86b0]" /></div><div className="mt-3 text-[25px] font-semibold tracking-[-0.04em]">{value as string}</div></div>)}</div></>}

            {hasResource && <div className="rounded-xl border border-[#e4e8ee] bg-white p-6 shadow-[0_1px_2px_rgba(20,40,60,0.02)]"><div className="flex items-start justify-between"><div><div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#6d8eae]"><ResourceIcon type={allResources.find((item) => item.name === openResource)?.type ?? 'Document'} />{allResources.find((item) => item.name === openResource)?.type ?? 'Resource'}</div><h1 className="text-[28px] font-semibold tracking-[-0.04em]">{openResource}</h1><p className="mt-2 text-[13px] text-[#7a8795]">A focused resource view. Ask the mini chat below to summarize, compare, or update this content.</p></div><button onClick={closeResource} aria-label="Close resource" className="grid size-8 place-items-center rounded-md text-[#8e9aa7] hover:bg-[#f4f6f8]"><X className="size-4" /></button></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-[#f7f9fb] p-4"><div className="text-[11px] uppercase tracking-[0.12em] text-[#9aa5b2]">Status</div><div className="mt-2 text-[13px] font-semibold text-[#3f8065]">Synced</div></div><div className="rounded-lg bg-[#f7f9fb] p-4"><div className="text-[11px] uppercase tracking-[0.12em] text-[#9aa5b2]">Type</div><div className="mt-2 text-[13px] font-semibold">{allResources.find((item) => item.name === openResource)?.type}</div></div><div className="rounded-lg bg-[#f7f9fb] p-4"><div className="text-[11px] uppercase tracking-[0.12em] text-[#9aa5b2]">Source</div><div className="mt-2 text-[13px] font-semibold">Product docs</div></div></div></div>}

            {!hasResource && <div className="mt-7 rounded-xl border border-[#e4e8ee] bg-white shadow-[0_1px_2px_rgba(20,40,60,0.02)]"><div className="flex items-center justify-between border-b border-[#edf0f3] px-5 py-4"><div><h2 className="text-[14px] font-semibold">Resources</h2><p className="mt-0.5 text-[11px] text-[#8a95a3]">Folders and resource types in Project P</p></div><MoreHorizontal className="size-4 text-[#9aa5b2]" /></div><div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-3">{allResources.filter((resource) => !deletedResources.includes(resource.name)).map((resource) => <button key={resource.name} onClick={() => openResourceAndChat(resource.name)} onContextMenu={(event) => showMenu(event, 'resource', resource.name)} className="group flex items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-[#dbe5f0] hover:bg-[#f8fbfe]"><div className={`grid size-9 shrink-0 place-items-center rounded-lg ${resource.color}`}><resource.icon className="size-[17px]" /></div><div className="min-w-0"><div className="truncate text-[13px] font-medium text-[#263442]">{resource.name}</div><div className="mt-0.5 text-[11px] text-[#9aa5b2]">{resource.detail}</div></div><ChevronRight className="ml-auto size-3.5 text-[#b0bac5] opacity-0 transition-opacity group-hover:opacity-100" /></button>)}</div></div>}

            {hasResource ? <div className="mt-auto" /> : <div className="mt-7 grid gap-5 lg:grid-cols-2"><div className="rounded-xl border border-[#e4e8ee] bg-white p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-[14px] font-semibold">Workspace activity</h2><p className="mt-0.5 text-[11px] text-[#8a95a3]">Recent changes from your team</p></div><Users className="size-4 text-[#8a95a3]" /></div>{['Jordan Lee updated API Specification v2', 'Mina Kim resolved a glossary conflict', 'You created a new resource'].map((item) => <div key={item} className="border-t border-[#f0f2f5] py-3 text-[12px] text-[#697889]">{item}</div>)}</div><div className="rounded-xl border border-[#dbe5f0] bg-[#f8fbfe] p-5"><div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><h2 className="text-[14px] font-semibold">Project P assistant</h2><span className="rounded-full bg-[#deebf8] px-2 py-0.5 text-[10px] font-medium text-[#4778aa]">Beta</span></div><p className="mt-1 text-[12px] leading-relaxed text-[#6d8195]">Ask about resources, patterns, or your next draft.</p></div><Bot className="size-5 text-[#5d8ab6]" /></div></div></div>}
          </div>
        </section>
      </div>

      {chatMode === 'minimized' && (
        <button
          onClick={() => setChatMode(hasResource ? 'floating' : 'full')}
          className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-[#dbe5f0] bg-white px-4 py-3 text-[12px] font-semibold text-[#3972a6] shadow-lg hover:bg-[#f7f9fb] transition-colors"
        >
          <MessageSquareText className="size-4" />
          Chat
          <span className="rounded-full bg-[#eaf2fa] px-1.5 py-0.5 text-[10px]">{messages.length}</span>
        </button>
      )}

      {chatMode === 'full' && (
        <div
          className="fixed inset-x-5 bottom-5 z-30 mx-auto max-w-3xl rounded-2xl border border-[#dbe5f0] bg-white p-4 shadow-[0_12px_40px_rgba(30,60,90,0.14)] flex flex-col"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b border-[#edf0f3] pb-2.5">
            <div className="flex items-center gap-2 text-[12px] font-semibold text-[#3972a6]">
              <MessageSquareText className="size-4" />
              Project P chat session
            </div>

            <div className="flex items-center gap-2">
              {/* Rules Sandbox Mode Switcher */}
              <div className="flex items-center gap-0.5 rounded-md bg-[#f1f5f9] p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setRulesMode('strict')}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    rulesMode === 'strict'
                      ? 'bg-white text-[#1c5da7] shadow-xs'
                      : 'text-[#697889] hover:text-[#17212b]'
                  }`}
                >
                  Strict Fact Check
                </button>
                <button
                  type="button"
                  onClick={() => setRulesMode('fast')}
                  className={`rounded px-2 py-0.5 font-medium transition-colors ${
                    rulesMode === 'fast'
                      ? 'bg-white text-[#1c5da7] shadow-xs'
                      : 'text-[#697889] hover:text-[#17212b]'
                  }`}
                >
                  Fast Brainstorm
                </button>
              </div>

              <button
                onClick={() => setChatMode('minimized')}
                aria-label="Minimize chat"
                className="rounded-md px-2 py-1 text-[11px] text-[#8e9aa7] hover:bg-[#f4f6f8]"
              >
                Minimize
              </button>
            </div>
          </div>

          {/* 1. Messages Stream (ABOVE the chat input) */}
          {messages.length > 0 && (
            <div className="mb-3 flex max-h-72 flex-col gap-2.5 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex flex-col gap-1 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed whitespace-pre-line ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-[#1c5da7] text-white'
                        : 'rounded-bl-md bg-[#f1f5f9] text-[#2c3846]'
                    }`}
                  >
                    {message.text}

                    {/* Faithfulness Score Badge */}
                    {message.faithfulnessScore && (
                      <div className="mt-1 flex items-center gap-1">
                        <span className="rounded-full border border-[#cbe8db] bg-[#edf7f2] px-1.5 py-0.2 text-[9px] font-medium text-[#2f6e54]">
                          {message.faithfulnessScore}% verified
                        </span>
                      </div>
                    )}

                    {/* Citations Linking to Resources */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#e2e8f0]/60">
                        <span className="text-[10px] text-[#718096]">Sources:</span>
                        {message.citations.map((cite) => (
                          <button
                            key={cite.name}
                            type="button"
                            onClick={() => openResourceAndChat(cite.name)}
                            className="flex items-center gap-1 rounded border border-[#dbe5f0] bg-white px-2 py-0.5 text-[10px] font-medium text-[#1c5da7] hover:bg-[#eaf2fa] transition-colors"
                          >
                            <FileText className="size-2.5 text-[#1c5da7]" />
                            <span>{cite.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Conflict Warning Card */}
                    {message.hasConflictWarning && message.conflictDetails && (
                      <div className="mt-2 rounded-lg border border-[#f5dfb8] bg-[#fffaf0] p-2 text-[11px] text-[#9b6f17]">
                        <div className="flex items-center gap-1 font-semibold text-[#875d0d]">
                          <Sparkles className="size-3 text-[#d97706]" />
                          <span>Cross-source conflict: {message.conflictDetails.conflictingFile}</span>
                        </div>
                        <p className="mt-0.5 text-[#7c5b1b] text-[10px] leading-normal">{message.conflictDetails.reason}</p>
                      </div>
                    )}

                    {/* Chat-to-Resource Creation Draft Card */}
                    {message.generatedResourceDraft && (
                      <div className="mt-2 rounded-lg border border-[#dbe5f0] bg-white p-2.5 text-[11px] text-[#263442] shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1c5da7]">
                            Draft: {message.generatedResourceDraft.title}
                          </span>
                          <span className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[9px] uppercase font-mono text-[#697889]">
                            {message.generatedResourceDraft.type}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-[#697889] leading-normal">
                          {message.generatedResourceDraft.preview}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSaveDraft(message.generatedResourceDraft!)}
                          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1c5da7] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-[#164e90] transition-colors"
                        >
                          <FileText className="size-3" />
                          <span>Save to Collections & Open</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={fullMessagesEndRef} />
            </div>
          )}

          {/* 2. Quick Prompts (Just above the input bar) */}
          <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] border-t border-[#edf0f3] pt-2">
            <span className="text-[10px] font-medium text-[#8a95a3] shrink-0">Quick prompts:</span>
            <button
              type="button"
              onClick={() => sendMessage('Summarize our product docs and knowledge coverage')}
              className="shrink-0 rounded-full border border-[#edf0f3] bg-[#f7f8fa] px-2.5 py-0.5 text-[11px] text-[#637080] hover:bg-[#edf2f7] hover:text-[#17212b]"
            >
              Summarize workspace
            </button>
            <button
              type="button"
              onClick={() => sendMessage('Check for conflicting claims regarding budget and participant numbers')}
              className="shrink-0 rounded-full border border-[#f3dfb2] bg-[#fffaf0] px-2.5 py-0.5 text-[11px] text-[#9b6f17] hover:bg-[#faeed6]"
            >
              Check fact conflicts
            </button>
            <button
              type="button"
              onClick={() => sendMessage('Draft a new specification document for Zero-Knowledge Authentication')}
              className="shrink-0 rounded-full border border-[#dbe5f0] bg-[#f8fbfe] px-2.5 py-0.5 text-[11px] text-[#1c5da7] hover:bg-[#ebf3fc]"
            >
              Draft new doc
            </button>
          </div>

          {/* 3. Input Row */}
          <div className="flex items-center gap-2">
            <input
              value={chat}
              onChange={(event) => setChat(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) sendMessage()
              }}
              placeholder="Ask Project P anything..."
              className="min-w-0 flex-1 rounded-lg bg-[#f7f9fb] px-3 py-2.5 text-[13px] outline-none placeholder:text-[#a1acb8]"
            />
            <button
              onClick={() => sendMessage()}
              className="rounded-lg bg-[#1c5da7] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#164e90]"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {chatMode === 'floating' && (
        <div
          style={{ transform: `translate(${chatPosition.x}px, ${chatPosition.y}px)` }}
          className="fixed bottom-5 right-5 z-30 w-[min(380px,calc(100vw-32px))] rounded-2xl border border-[#dbe5f0] bg-white p-3 shadow-[0_12px_40px_rgba(30,60,90,0.14)] flex flex-col"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Draggable Header */}
          <div
            className="mb-2 flex cursor-move select-none items-center justify-between border-b border-[#edf0f3] pb-2 active:opacity-75"
            onMouseDown={handleMiniChatDragStart}
            onDoubleClick={() => setChatPosition({ x: 0, y: 0 })}
            title="Drag to reposition, double-click to reset"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#3972a6]">
              <MessageSquareText className="size-4" />
              <span>Mini chat</span>
              {openResource && (
                <span className="rounded bg-[#f1f5f9] px-1.5 py-0.5 text-[9px] font-normal text-[#64748b] truncate max-w-[120px]">
                  {openResource}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setChatMode('full')}
                className="rounded-md px-2 py-1 text-[10px] text-[#3972a6] hover:bg-[#f4f6f8]"
              >
                Expand
              </button>
              <button
                type="button"
                onClick={() => setChatMode('minimized')}
                className="rounded-md px-2 py-1 text-[10px] text-[#8e9aa7] hover:bg-[#f4f6f8]"
                aria-label="Minimize chat"
              >
                Minimize
              </button>
            </div>
          </div>

          {/* 1. Messages Stream (ABOVE the chat input) */}
          {messages.length > 0 && (
            <div className="mb-2 flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
              {messages.slice(-8).map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-line ${
                      message.role === 'user'
                        ? 'rounded-br-md bg-[#1c5da7] text-white'
                        : 'rounded-bl-md bg-[#f1f5f9] text-[#2c3846]'
                    }`}
                  >
                    {message.text}

                    {/* Citations in Mini Chat */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {message.citations.map((cite) => (
                          <button
                            key={cite.name}
                            type="button"
                            onClick={() => openResourceAndChat(cite.name)}
                            className="flex items-center gap-0.5 rounded border border-[#dbe5f0] bg-white px-1.5 py-0.5 text-[9px] font-medium text-[#1c5da7] hover:bg-[#eaf2fa]"
                          >
                            <FileText className="size-2 text-[#1c5da7]" />
                            <span>{cite.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Conflict Card in Mini Chat */}
                    {message.hasConflictWarning && message.conflictDetails && (
                      <div className="mt-1.5 rounded border border-[#f5dfb8] bg-[#fffaf0] p-1.5 text-[10px] text-[#9b6f17]">
                        <span className="font-semibold block">⚠️ Conflict: {message.conflictDetails.conflictingFile}</span>
                        <span className="text-[9px] text-[#7c5b1b]">{message.conflictDetails.reason}</span>
                      </div>
                    )}

                    {/* Resource Draft in Mini Chat */}
                    {message.generatedResourceDraft && (
                      <div className="mt-1.5 rounded border border-[#dbe5f0] bg-white p-2 text-[10px] text-[#263442]">
                        <span className="font-semibold text-[#1c5da7] block">
                          Draft: {message.generatedResourceDraft.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveDraft(message.generatedResourceDraft!)}
                          className="mt-1.5 flex w-full items-center justify-center gap-1 rounded bg-[#1c5da7] py-1 text-[9px] font-semibold text-white hover:bg-[#164e90]"
                        >
                          <FileText className="size-2.5" />
                          <span>Save to Collections</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={miniMessagesEndRef} />
            </div>
          )}

          {/* 2. Quick Prompts in Mini Chat (Just above input bar) */}
          <div className="mb-2 flex items-center gap-1 overflow-x-auto pb-1 text-[10px] border-t border-[#edf0f3] pt-1.5">
            <button
              type="button"
              onClick={() => sendMessage(`Summarize ${openResource ?? 'this resource'}`)}
              className="shrink-0 rounded-full border border-[#edf0f3] bg-[#f7f8fa] px-2 py-0.5 text-[#637080] hover:bg-[#edf2f7]"
            >
              Summarize
            </button>
            <button
              type="button"
              onClick={() => sendMessage('Check for conflicts')}
              className="shrink-0 rounded-full border border-[#f3dfb2] bg-[#fffaf0] px-2 py-0.5 text-[#9b6f17] hover:bg-[#faeed6]"
            >
              Conflicts
            </button>
            <button
              type="button"
              onClick={() => sendMessage(`Draft an update for ${openResource ?? 'Project P'}`)}
              className="shrink-0 rounded-full border border-[#dbe5f0] bg-[#f8fbfe] px-2 py-0.5 text-[#1c5da7] hover:bg-[#ebf3fc]"
            >
              Draft doc
            </button>
          </div>

          {/* 3. Input Row */}
          <div className="flex items-center gap-2">
            <input
              value={chat}
              onChange={(event) => setChat(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) sendMessage()
              }}
              placeholder={`Ask about ${openResource ?? 'Project P'}...`}
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#a1acb8]"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              className="rounded-lg bg-[#1c5da7] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#164e90]"
            >
              Send
            </button>
          </div>
        </div>
      )}
      {settingsOpen && <div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="fixed inset-0 z-40 flex items-end justify-end bg-black/20 p-4 sm:p-6" onClick={() => setSettingsOpen(false)}><section className="w-full max-w-sm rounded-2xl border border-[#dce3ea] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><h2 id="settings-title" className="text-base font-semibold">Settings</h2><p className="mt-1 text-xs text-[#7a8795]">Project P workspace settings.</p></div><button onClick={() => setSettingsOpen(false)} aria-label="Close settings" className="rounded-md p-1 text-[#8e9aa7] hover:bg-[#f4f6f8]"><X className="size-4" /></button></div></section></div>}

      {false && <div role="dialog" aria-modal="true" aria-labelledby="resource-picker-title" className="fixed inset-0 z-40 grid place-items-center bg-black/25 p-4" onClick={() => setResourcePickerOpen(false)}><section className="w-full max-w-lg rounded-2xl border border-[#dce3ea] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><h2 id="resource-picker-title" className="text-base font-semibold">Create resource</h2><p className="mt-1 text-xs text-[#7a8795]">Choose a resource type to add {resourceTarget ? `to ${resourceTarget}` : 'to Project P'}.</p></div><button onClick={() => setResourcePickerOpen(false)} aria-label="Close resource picker" className="rounded-md p-1 text-[#8e9aa7] hover:bg-[#f4f6f8]"><X className="size-4" /></button></div><div className="mt-5 flex flex-col gap-3"><label htmlFor="resource-type" className="text-xs font-semibold text-[#526172]">Resource type</label><div className="flex items-center gap-3"><div className={`grid size-10 shrink-0 place-items-center rounded-lg ${resources.find((resource) => resource.type === selectedResourceType)?.color ?? 'bg-[#f1f4f7] text-[#637080]'}`}><ResourceIcon type={selectedResourceType} /></div><select id="resource-type" value={selectedResourceType} onChange={(event) => setSelectedResourceType(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-[#dce3ea] bg-white px-3 py-2.5 text-sm text-[#263442] outline-none focus:border-[#8bb4d8]"><option value="Document">Document</option><option value="Table">Table</option><option value="Presentation">Presentation</option><option value="Graph">Graph</option><option value="Image">Image</option><option value="Code">Code</option></select></div><p className="text-[11px] text-[#8a95a3]">Choose what kind of resource to add before creating it.</p><button onClick={() => createResource(selectedResourceType)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1c5da7] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#164e90]"><FileText className="size-3.5" />Create {selectedResourceType}</button></div></section></div>}

      {contextMenu && <div role="menu" onClick={(event) => event.stopPropagation()} style={{ left: contextMenu.x, top: contextMenu.y }} className="fixed z-50 min-w-[190px] rounded-lg border border-[#dce3ea] bg-white p-1.5 shadow-xl"><div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a0aab5]">{contextMenu.kind === 'collection' ? 'Collection' : contextMenu.kind === 'resource' ? 'Resource' : 'Project P'}</div><button onClick={addFolder} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] text-[#526172] hover:bg-[#f3f6f9]"><FolderPlus className="size-3.5" />New folder</button><div className="relative" onMouseEnter={() => setResourceSubmenuOpen(true)} onMouseLeave={() => setResourceSubmenuOpen(false)}><button aria-haspopup="menu" aria-expanded={resourceSubmenuOpen} className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[12px] text-[#526172] hover:bg-[#f3f6f9]"><span className="flex items-center gap-2"><FileText className="size-3.5" />New resource</span><ChevronRight className="size-3 text-[#9aa5b2]" /></button>{resourceSubmenuOpen && <div role="menu" className="absolute left-full top-0 ml-1 min-w-[165px] rounded-lg border border-[#dce3ea] bg-white p-1.5 shadow-xl">{resources.map((resource) => <button key={resource.type} role="menuitem" onClick={() => createResource(resource.type)} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] text-[#526172] hover:bg-[#f3f6f9]"><span className={`grid size-6 place-items-center rounded-md ${resource.color}`}><resource.icon className="size-3.5" /></span>{resource.type}</button>)}</div>}</div>{contextMenu.target && contextMenu.kind !== 'canvas' && <button onClick={deleteTarget} className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12px] text-[#b35454] hover:bg-[#fff4f4]"><Trash2 className="size-3.5" />Delete {contextMenu.kind}</button>}</div>}
    </main>
  )
}
