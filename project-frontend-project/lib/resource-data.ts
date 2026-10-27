export interface DocumentBlock {
  id: string
  title: string
  content: string
  isTranscluded?: boolean
  transclusionSource?: string
}

export interface TableRowData {
  id: string
  subjectId: string
  cohort: string
  baselineMetric: string
  currentDosage: string
  responseRate: number
  toxicityGrade: string
  status: "Active" | "Completed" | "Monitoring"
}

export interface SlideData {
  id: string
  title: string
  subtitle: string
  bullets: string[]
  speakerNotes: string
  diagramType?: string
}

export interface GraphNode {
  id: string
  label: string
  role: string
  category: "Client" | "Engine" | "Storage" | "Sync"
  x: number
  y: number
  connections: string[]
}

export interface ImageAnnotation {
  id: string
  x: number // percentage
  y: number
  label: string
  comment: string
  tag: "Accessibility" | "Brand" | "Layout"
}

export interface CodeSpecData {
  language: string
  filename: string
  code: string
  symbols: Array<{ name: string; type: string; line: number }>
}

// 1. Document Data
export const INITIAL_DOCUMENT_BLOCKS: DocumentBlock[] = [
  {
    id: "p-001",
    title: "1. Overview & System Scope",
    content:
      "Project P represents a universal AI knowledge workspace and collaborative resource operating system. It ingests arbitrary content formats, normalizes them into structured models, and renders them through interactive semantic viewers.",
  },
  {
    id: "p-002",
    title: "2. Single-Source-of-Truth Transclusions",
    content:
      "All resources maintain single-source-of-truth transclusion pointers. When an authoritative source block updates, downstream targets automatically inherit the change without content duplication.",
    isTranscluded: true,
    transclusionSource: "System Architecture #gateway-spec",
  },
  {
    id: "p-003",
    title: "3. Shared Temp Drafts & Concurrency",
    content:
      "In-progress edits are persisted immediately to client-side storage upon block unfocus. Mutations survive browser refreshes and can be selectively committed via the 3-tab save modal.",
  },
  {
    id: "p-004",
    title: "4. Rate Limits & Security Boundaries",
    content:
      "All API calls require valid JWT bearer tokens with standard claims. Token expiration is configured with a 3600-second TTL and automatic rotation.",
  },
  {
    id: "p-005",
    title: "5. Error Handling & Problem Details",
    content:
      "Client applications receive RFC 7807 compliant problem details for all validation failures, ensuring deterministic error boundary rendering across workspace modules.",
  },
]

// 2. Table Data
export const INITIAL_TABLE_ROWS: TableRowData[] = [
  {
    id: "row-1",
    subjectId: "SUBJ-101",
    cohort: "Cohort A (Low)",
    baselineMetric: "12.4 mg/dL",
    currentDosage: "25 mg",
    responseRate: 78,
    toxicityGrade: "Grade 0",
    status: "Active",
  },
  {
    id: "row-2",
    subjectId: "SUBJ-102",
    cohort: "Cohort A (Low)",
    baselineMetric: "14.1 mg/dL",
    currentDosage: "25 mg",
    responseRate: 82,
    toxicityGrade: "Grade 1",
    status: "Active",
  },
  {
    id: "row-3",
    subjectId: "SUBJ-201",
    cohort: "Cohort B (Med)",
    baselineMetric: "16.8 mg/dL",
    currentDosage: "50 mg",
    responseRate: 91,
    toxicityGrade: "Grade 1",
    status: "Active",
  },
  {
    id: "row-4",
    subjectId: "SUBJ-202",
    cohort: "Cohort B (Med)",
    baselineMetric: "15.3 mg/dL",
    currentDosage: "50 mg",
    responseRate: 88,
    toxicityGrade: "Grade 0",
    status: "Monitoring",
  },
  {
    id: "row-5",
    subjectId: "SUBJ-301",
    cohort: "Cohort C (High)",
    baselineMetric: "19.5 mg/dL",
    currentDosage: "75 mg",
    responseRate: 95,
    toxicityGrade: "Grade 2",
    status: "Active",
  },
  {
    id: "row-6",
    subjectId: "SUBJ-302",
    cohort: "Cohort C (High)",
    baselineMetric: "18.2 mg/dL",
    currentDosage: "75 mg",
    responseRate: 93,
    toxicityGrade: "Grade 1",
    status: "Completed",
  },
]

// 3. Presentation Slides
export const INITIAL_SLIDES: SlideData[] = [
  {
    id: "slide-1",
    title: "Project P: Q4 2026 Executive Overview",
    subtitle: "Universal AI Knowledge Workspace & Collaborative Resource OS",
    bullets: [
      "Multi-format ingestion: Documents, Sheets, Slide Decks, Graphs, Images, and Code",
      "Local-first state architecture with sub-millisecond in-memory responsiveness",
      "Cross-document single-source-of-truth transclusion engine",
    ],
    speakerNotes: "Welcome everyone. Today we are walking through the core architecture of Project P.",
  },
  {
    id: "slide-2",
    title: "Shared Temp Drafts & 3-Tab Save Flow",
    subtitle: "Safe multi-user editing without lost progress",
    bullets: [
      "Mutations persist to local storage on block blur, surviving page reloads",
      "Auditable 3-Tab Save modal: Original, Proposed with Diff, and Notes & Conflicts",
      "Selective staging: commit specific blocks while leaving in-progress edits in draft state",
    ],
    speakerNotes: "Highlight the selective staging checkboxes. Users are never forced into all-or-nothing commits.",
  },
  {
    id: "slide-3",
    title: "Cell-Level Table Concurrency",
    subtitle: "Granular locking instead of whole-sheet blocking",
    bullets: [
      "Targeted cell coordinates (e.g. row-3:col-2) locked during active editing",
      "Peer collaborators concurrently update adjacent rows and columns without collision",
      "Automatic unlock timeouts with temp draft preservation",
    ],
    speakerNotes: "Contrast this with legacy spreadsheet locking where entire workbooks get frozen.",
  },
  {
    id: "slide-4",
    title: "Canonical Living Glossary",
    subtitle: "Automated ubiquitous language standardization",
    bullets: [
      "Acronym collapsing and synonym unification (e.g. K8s -> Kubernetes)",
      "High-frequency orphan concept detection (Knowledge Gaps finder)",
      "One-click AI drafting resolving unlinked workspace concepts",
    ],
    speakerNotes: "The glossary serves as the bridge between technical specifications and code identifiers.",
  },
  {
    id: "slide-5",
    title: "Roadmap: Production Hardening",
    subtitle: "Milestones and delivery gates",
    bullets: [
      "Universal TOC ScrollSpy and WYSIWYG / Markdown split mode",
      "Slide Grid Sorter overview for instant deck rearrangement",
      "Multi-tab sync bus via BroadcastChannel",
    ],
    speakerNotes: "Conclude with the upcoming verification milestones and developer ergonomics.",
  },
]

// 4. Graph Nodes
export const INITIAL_GRAPH_NODES: GraphNode[] = [
  {
    id: "node-client",
    label: "Next.js 16 Client App",
    role: "Universal Viewers, Chat Bar, Explorer",
    category: "Client",
    x: 80,
    y: 120,
    connections: ["node-state", "node-chat"],
  },
  {
    id: "node-state",
    label: "Local-First State Engine",
    role: "Zustand Persist & Temp Drafts",
    category: "Engine",
    x: 320,
    y: 120,
    connections: ["node-storage", "node-transclusion"],
  },
  {
    id: "node-chat",
    label: "Assistant Agent Engine",
    role: "Fact-Checking & Conflict Guard",
    category: "Engine",
    x: 320,
    y: 260,
    connections: ["node-glossary"],
  },
  {
    id: "node-transclusion",
    label: "SSoT Transclusion Bus",
    role: "Anchor Linking & Auto-Propagation",
    category: "Sync",
    x: 560,
    y: 80,
    connections: ["node-storage"],
  },
  {
    id: "node-glossary",
    label: "Canonical Living Glossary",
    role: "Synonym Normalization & Knowledge Gaps",
    category: "Sync",
    x: 560,
    y: 220,
    connections: ["node-storage"],
  },
  {
    id: "node-storage",
    label: "Browser Storage & Bus",
    role: "LocalStorage / IndexedDB & BroadcastChannel",
    category: "Storage",
    x: 780,
    y: 160,
    connections: [],
  },
]

// 5. Image Annotations
export const INITIAL_IMAGE_ANNOTATIONS: ImageAnnotation[] = [
  {
    id: "ann-1",
    x: 18,
    y: 22,
    label: "Monogram Geometry",
    comment: "P monogram constructed on an 8pt rounded squircle grid with 2.5px stroke weight.",
    tag: "Brand",
  },
  {
    id: "ann-2",
    x: 52,
    y: 35,
    label: "Primary Accent Palette",
    comment: "Cobalt Deep (#1c5da7) provides WCAG AAA contrast (7.4:1) on white surfaces.",
    tag: "Accessibility",
  },
  {
    id: "ann-3",
    x: 82,
    y: 65,
    label: "Dynamic Baseline Grid",
    comment: "All typography and icon baselines snap to 4px multiples for subpixel font rendering.",
    tag: "Layout",
  },
]

// 6. Code Spec
export const INITIAL_CODE_SPEC: CodeSpecData = {
  language: "typescript",
  filename: "workspace-schema.ts",
  code: `// Universal Workspace Data Schema & Transclusion Pointers
export interface WorkspaceResource {
  id: string;
  name: string;
  type: 'Document' | 'Table' | 'Presentation' | 'Graph' | 'Image' | 'Code';
  version: number;
  transclusions: Array<{
    sourceAnchorId: string;
    targetResource: string;
    syncMode: 'auto' | 'manual';
  }>;
}

export interface SharedTempDraft {
  anchorId: string;
  originalText: string;
  proposedText: string;
  updatedAt: number;
}

export function verifyResourceGrounding(
  claims: string[],
  canonicalDocs: Record<string, string>
): { score: number; conflicts: string[] } {
  // Deterministic local-first claim verification
  return {
    score: 98,
    conflicts: [],
  };
}`,
  symbols: [
    { name: "WorkspaceResource", type: "interface", line: 2 },
    { name: "SharedTempDraft", type: "interface", line: 14 },
    { name: "verifyResourceGrounding", type: "function", line: 21 },
  ],
}

// 7. Audio Resource Data
export interface AudioTranscriptItem {
  id: string
  timestamp: string
  seconds: number
  speaker: string
  speakerInitials: string
  speakerColor: string
  text: string
}

export const INITIAL_AUDIO_TRANSCRIPT: AudioTranscriptItem[] = [
  {
    id: "tr-1",
    timestamp: "00:04",
    seconds: 4,
    speaker: "Sarah Wong",
    speakerInitials: "SW",
    speakerColor: "bg-blue-600 text-white",
    text: "Welcome team. Let's do a quick alignment on Project P's local-first storage architecture and SSoT transclusions.",
  },
  {
    id: "tr-2",
    timestamp: "00:22",
    seconds: 22,
    speaker: "Alex Rivera",
    speakerInitials: "AR",
    speakerColor: "bg-emerald-600 text-white",
    text: "Clinical trial metrics are synchronized. Cell-level locking is working smoothly with zero collisions during concurrent edits.",
  },
  {
    id: "tr-3",
    timestamp: "00:48",
    seconds: 48,
    speaker: "Jordan Lee",
    speakerInitials: "JL",
    speakerColor: "bg-purple-600 text-white",
    text: "I reviewed the roadmap slide deck and verified that the 3-tab save modal selectively commits approved blocks to the knowledge index.",
  },
  {
    id: "tr-4",
    timestamp: "01:15",
    seconds: 75,
    speaker: "Project P AI",
    speakerInitials: "AI",
    speakerColor: "bg-amber-600 text-white",
    text: "Grounding verification is active. Continuous cross-source fact checking scored 98% faithfulness with no conflicting claims.",
  },
]
