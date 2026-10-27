import {
  AudioLines,
  BookOpen, Code2, FileText, Folder, FolderPlus,
  ImageIcon, LayoutGrid, Library, MessageSquareText,
  Network, Presentation, Settings2, ShieldCheck, Sparkles, Table2, Users, Zap,
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

export interface WorkspaceRule {
  id: string
  title: string
  category: "Safety" | "Behavior" | "Style" | "Knowledge"
  type: "do" | "avoid"
  description: string
  examples: string[]
  enabled: boolean
  systemDirective: string
}

export type ChatMessageItem = {
  role: 'user' | 'assistant'
  text: string
  faithfulnessScore?: number
  citations?: { name: string; quote?: string }[]
  hasConflictWarning?: boolean
  conflictDetails?: { conflictingFile: string; reason: string }
  generatedResourceDraft?: { title: string; type: string; preview: string }
  appliedRules?: string[]
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
  { label: 'Rules', href: '/rules', icon: ShieldCheck, badge: 6 },
  { label: 'Activity', href: '/activity', icon: Zap },
]

export const DEFAULT_RULES: WorkspaceRule[] = [
  {
    id: "rule-1",
    title: "Ground all claims in verified documents",
    category: "Knowledge",
    type: "do",
    description: "Ensure all answers and synthesized resources reference active workspace documentation rather than external or unverified assumptions.",
    examples: [
      "Cite 'API Specification v2' when explaining authentication flows",
      "Reference 'Clinical Trial Metrics' for exact dosage numbers",
    ],
    enabled: true,
    systemDirective: "Ground every factual assertion in verified project resources. Include source citations and never invent specifications.",
  },
  {
    id: "rule-2",
    title: "Never expose or index Private resources",
    category: "Safety",
    type: "avoid",
    description: "Strictly prevent personal notes, scratchpads, or private files from being cited in shared synthesis, living glossary, or team knowledge graphs.",
    examples: [
      "Do not mention content from Private folders in public chat synthesis",
      "Do not create cross-document links pointing to personal files",
    ],
    enabled: true,
    systemDirective: "Never reference, leak, or index resources marked as Private into team-facing documents or public synthesis.",
  },
  {
    id: "rule-3",
    title: "Enforce Canonical Terms from Living Glossary",
    category: "Behavior",
    type: "do",
    description: "Standardize acronyms and aliases to their canonical terms (e.g. use 'Kubernetes' instead of informal variations like 'kube').",
    examples: [
      "Standardize 'K8s' and 'k8s' to 'Kubernetes'",
      "Use 'Shared Temp Draft' for collaborative ephemeral state",
    ],
    enabled: true,
    systemDirective: "Always map known acronyms and synonyms to their canonical glossary term to maintain consistent terminology.",
  },
  {
    id: "rule-4",
    title: "Avoid unvetted schema migrations without rollbacks",
    category: "Safety",
    type: "avoid",
    description: "Do not propose destructive database changes, column drops, or schema modifications without an accompanying rollback script and zero-downtime strategy.",
    examples: [
      "Do not suggest 'DROP TABLE' or irreversible 'ALTER COLUMN' queries",
      "Require backward-compatible expansion migrations",
    ],
    enabled: true,
    systemDirective: "Refuse to generate destructive database schema alterations without explicit rollback procedures and data safety precautions.",
  },
  {
    id: "rule-5",
    title: "Standardize metric units and ISO-8601 timestamps",
    category: "Style",
    type: "do",
    description: "Use international standard units (mg, mL, Celsius, UTC, ISO-8601 dates) across all tabular resources, graphs, and documentation.",
    examples: [
      "Write '2026-10-27T17:00:00Z' instead of informal 'yesterday afternoon'",
      "Standardize clinical measurements to mg/dL",
    ],
    enabled: true,
    systemDirective: "Format all dates, times, and quantitative physical metrics using ISO standards and SI metric units.",
  },
  {
    id: "rule-6",
    title: "Avoid speculative roadmap milestones",
    category: "Behavior",
    type: "avoid",
    description: "Do not fabricate delivery quarters, launch deadlines, or engineering commitments that are not explicitly documented in the verified Product Roadmap.",
    examples: [
      "Do not claim 'Feature X launches in Q2' unless documented in Roadmap",
      "Acknowledge uncommitted features as pending triage",
    ],
    enabled: true,
    systemDirective: "Never fabricate release dates, launch quarters, or project timelines that lack explicit documentation in Product Roadmap.",
  },
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
