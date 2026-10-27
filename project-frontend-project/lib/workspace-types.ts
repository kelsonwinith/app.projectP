import {
  AudioLines,
  BookOpen, Code2, FileText, Folder, FolderPlus,
  ImageIcon, LayoutGrid, Library, MessageSquareText,
  Network, Presentation, Settings2, Sparkles, Table2, Users, Zap,
} from 'lucide-react'

export type Collection = {
  id?: string
  name: string
  count: number
  open: boolean
  children: string[]
  folders?: Collection[]
  isPrivate?: boolean
}

export type Resource = {
  name: string
  type: 'Graph' | 'Document' | 'Table' | 'Presentation' | 'Image' | 'Code' | 'Audio' | string
  icon: any
  color: string
  detail: string
  content?: string
  isPrivate?: boolean
}

export type ChatMessageItem = {
  role: 'user' | 'assistant'
  text: string
  faithfulnessScore?: number
  citations?: { name: string; quote?: string }[]
  hasConflictWarning?: boolean
  conflictDetails?: { conflictingFile: string; reason: string }
  generatedResourceDraft?: { title: string; type: string; preview: string }
}

export type NavItem = {
  label: string
  href: string
  icon: any
  badge?: number
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Workspace', href: '/', icon: LayoutGrid },
  { label: 'Knowledge hub', href: '/knowledge-hub', icon: Library },
  { label: 'Glossary', href: '/glossary', icon: BookOpen, badge: 12 },
  { label: 'Activity', href: '/activity', icon: Zap },
]

export const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: "folder_example",
    name: "Example",
    count: 7,
    open: true,
    children: [
      "API Specification v2",
      "Clinical Trial Metrics",
      "Product Roadmap",
      "System Architecture",
      "Brand direction",
      "Executive Review Recording",
      "Database schema",
    ],
    folders: [],
  },
]

export const DEFAULT_RESOURCES: Resource[] = [
  {
    name: 'System Architecture',
    type: 'Graph',
    icon: Network,
    color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
    detail: 'Architecture graph · synced 2 min ago',
  },
  {
    name: 'API Specification v2',
    type: 'Document',
    icon: FileText,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    detail: 'Document · edited 18 min ago',
  },
  {
    name: 'Clinical Trial Metrics',
    type: 'Table',
    icon: Table2,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    detail: 'Table · synced 42 min ago',
  },
  {
    name: 'Product Roadmap',
    type: 'Presentation',
    icon: Presentation,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    detail: 'Presentation · updated yesterday',
  },
  {
    name: 'Brand direction',
    type: 'Image',
    icon: ImageIcon,
    color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    detail: 'Image board · updated yesterday',
  },
  {
    name: 'Executive Review Recording',
    type: 'Audio',
    icon: AudioLines,
    color: 'bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/40 dark:text-fuchsia-400',
    detail: 'Audio recording · synced 1 hour ago',
  },
  {
    name: 'Database schema',
    type: 'Code',
    icon: Code2,
    color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400',
    detail: 'Code resource · updated Oct 24',
  },
]

export const INITIAL_CHAT_MESSAGES: ChatMessageItem[] = [
  {
    role: 'assistant',
    text: 'Hello! I am Project P Assistant. I can help synthesize workspace knowledge, run cross-source fact checking, or draft new resources from our conversation.',
    faithfulnessScore: 99,
  },
  {
    role: 'user',
    text: 'Can you summarize our product docs and check if there are any conflicting claims?',
  },
  {
    role: 'assistant',
    text: 'Based on API Specification v2 and System Architecture:\n• The workspace operates on Next.js 16 with a high-performance local-first state engine.\n• Client storage handles shared temp drafts with sub-millisecond local persist roundtrips.\n• All resources maintain single-source-of-truth transclusion pointers.',
    citations: [
      { name: 'API Specification v2', quote: 'Local-first controller and schema contracts' },
      { name: 'System Architecture', quote: 'Zustand storage layer & broadcast channel' },
    ],
    faithfulnessScore: 98,
  },
]
