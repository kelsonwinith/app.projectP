# Architecture Decision Records

This document maintains the sequential log of significant architectural and design decisions for Project P.

---

# ADR-001: Centered Bottom Chat Bar with Integrated Open-Hide Chat Window

## Status
Accepted

## Context
Previously, the chat interaction model included floating corner windows and separate draggable mini-chat popups. These created visual clutter, conflicted with canvas margins, and fragmented the user experience across multiple chat representations. Users required a single, clean interaction paradigm where the chat bar is always centered at the bottom, ready for instant typing, with simple open/hide behavior for the conversational messages window.

## Decision
We completely removed all corner floating windows and draggable mini-chat popups. The chat interface is strictly unified into:
1. A permanent centered bottom chat bar (`fixed bottom-4 left-0 right-0 lg:left-[248px]`), ensuring immediate typability at all times.
2. An integrated upward chat window that opens directly above the center chat bar.
3. A single toggle button adjacent to the chat bar that opens and hides the chat window, alongside auto-open behavior upon message dispatch.

## Consequences
- **Positive**: Complete elimination of corner window clutter; unified, predictable interaction model across all views; immediate centered keyboard typability; seamless open/hide transitions.
- **Negative / Trade-offs**: Requires dedicated bottom margin padding (`pb-28`) on workspace page containers to prevent docking overlap over bottom page content.

---

# ADR-002: Dual-Stage Conflict Detection Lifecycle

## Status
Accepted

## Context
Contradictions between different workspace specifications (such as differing API timeout values, dosage limits in clinical metrics, or policy timelines) lead to hallucinated AI outputs and misaligned engineering deliverables. Running conflict checks continuously during every keystroke is computationally expensive, whereas running checks only post-commit fails to prevent bad data from entering the canonical store.

## Decision
We enforce a dual-stage conflict detection lifecycle:
1. **On Generate**: Triggered automatically when an AI assistant drafts a new resource or synthesizes text.
2. **On Save**: Triggered automatically when the author opens the 3-tab save modal, rendering detected discrepancies in Tab 3 (Notes & Conflicts).

## Consequences
- **Positive**: Zero keystroke latency during active editing; guaranteed verification boundary before permanent commit; transparent severity tagging for cross-resource discrepancies.
- **Negative / Trade-offs**: Save modal opening requires an asynchronous pre-flight comparison check against pgvector chunks.

---

# ADR-003: Redis-Backed Shared Temp Drafts for Granular Collaboration

## Status
Accepted

## Context
Multi-user collaboration often leads to lost work when authors refresh their browser before formally committing a document. Traditional optimistic client-only draft states are invisible to teammates, causing simultaneous conflicting edits.

## Decision
We store uncommitted block-level and cell-level mutations in a centralized shared temp draft buffer backed by Redis for sub-15ms WebSocket roundtrips, with persistence in PostgreSQL `resource_temp_drafts`. When an author unfocuses an edited element, the mutation is broadcast to all active peers and layered over committed content on any subsequent page refresh.

## Consequences
- **Positive**: Zero data loss across browser reloads; real-time multi-user visibility of work-in-progress; granular per-block revert capability.
- **Negative / Trade-offs**: Increased storage footprint in Redis and PostgreSQL requiring routine garbage collection of abandoned temporary drafts.

---

# ADR-004: Fixed-Height Side Panel with Scoped Collection Tree Scrolling

## Status
Accepted

## Context
When page content exceeded viewport height, unconstrained window scrolling caused the entire sidebar (including brand header, workspace navigation, and footer settings) to scroll off-screen. Users needed the side panel to always fit 100% of the viewport height without scrolling as a whole, while allowing only the collections file explorer section to scroll when many folders or files exist.

## Decision
We enforced a strictly bounded layout hierarchy:
1. The root layout is constrained to `h-screen max-h-screen overflow-hidden flex`.
2. The side panel (`WorkspaceSidebar`) is fixed to `h-screen max-h-screen w-[248px] shrink-0 overflow-hidden flex flex-col`.
3. The brand header, main navigation, collections header, and footer profile/settings card are all pinned using `shrink-0`.
4. Only the collections tree section (`<div className="flex-1 min-h-0 overflow-hidden">` with `<ScrollArea className="h-full">`) is permitted to scroll.
5. All page content scrolling is isolated to the main content container (`<main className="flex-1 min-h-0 overflow-y-auto pb-28">`).

## Consequences
- **Positive**: The side panel permanently fits the viewport height without whole-panel displacement; footer profile and settings remain visible and anchored; deep collection trees scroll smoothly in isolation; page content scrolls with a single, clean scrollbar.
- **Negative / Trade-offs**: Requires explicit `min-h-0` flexbox properties to prevent child elements from expanding past viewport boundaries.

---

# ADR-005: Client-Side Collection State Persistence with Zustand and LocalStorage

## Status
Accepted

## Context
Previously, the sidebar collections tree was initialized with static mock data (`Product docs`, `Research & insights`, `Team playbook`). Changes to folders and collections were held only in ephemeral component memory and reset on browser reload. Users required real persistence across page reloads without hardcoded mockups.

## Decision
We installed `zustand` and replaced all collection mock data with a dedicated persistent store (`lib/collection-store.ts`) using Zustand's `persist` middleware backed by `localStorage` (key: `project-p-collections`). Collections now initialize as an empty set, allowing users to create, nest, and delete real collections and folders. An empty state view with an "Add Collection" action is presented when no collections exist.

## Consequences
- **Positive**: Complete removal of mock data; real persistence of folder structures across browser refreshes; zero external backend dependency for client navigation trees; decoupled state management.
- **Negative / Trade-offs**: Collections are stored locally on the client machine; multi-device synchronization will require a cloud sync API adapter when full-stack backend endpoints are introduced.

---

# ADR-006: File Explorer Paradigm with Right-Click Context Menus and Drag-and-Drop Organization

## Status
Accepted

## Context
Initial iterations relied on header action buttons to create folders, and lacked contextual operations for resource management and folder restructuring. Users required native file explorer behavior, including the elimination of cluttering header add buttons, right-click context menus with multi-format resource submenus, and drag-and-drop file organization.

## Decision
We removed the explicit collection add button and implemented a full native file explorer interaction model:
1. Integrated shadcn `ContextMenu` primitives supporting right-click actions on folders, files, and empty explorer areas.
2. Implemented nested submenus for "New Resource" with dedicated entries for all 6 resource types (Document, Table, Presentation, Graph, Image, Code) in both right-click context menus and 3-dot dropdown menus.
3. Integrated `@dnd-kit/core` with `useDraggable` on files and `useDroppable` on folders, allowing users to drag files into target folders to reorganize their workspace hierarchy, persisting the result to `localStorage`.

## Consequences
- **Positive**: Clean, button-free header; native OS file explorer ergonomics; instant multi-format resource creation via nested submenus; tactile drag-and-drop file restructuring.
- **Negative / Trade-offs**: Requires pointer activation thresholds (`activationConstraint: { distance: 5 }`) to prevent drag events from intercepting standard click/open actions.

---

# ADR-007: Standardized Folder Paradigm and Dynamic Gap-Filling Running File Naming

## Status
Accepted

## Context
Initial file explorer implementations conflated "Collection" and "Folder" across the UI (displaying "New Collection" and "Collection 1"). In addition, trailing 3-dot buttons introduced visual clutter, and resource/folder naming used monotonic counters that did not reuse deleted indices, creating gaps (e.g., deleting item 2 caused the next item to be named 4).

## Decision
We standardized the file explorer interaction and naming architecture:
1. Pinned the sidebar section topic strictly to "Collections", while container items created inside are named "Folder" and empty state is defined as "No resources yet".
2. Enforced directory-scoped sibling uniqueness matching native file systems: duplicate name checking is strictly isolated to siblings within the same directory level. A nested folder inside `Folder` starts cleanly as `Folder` (yielding `Folder/Folder`, not `Folder/Folder 1`). Duplicates only increment (`Folder 1`, `Folder 2`, etc.) when created as siblings in the same parent.
3. Implemented sibling-scoped gap-filling running integer allocation for resources: the initial resource of any type in a given directory is named cleanly (`Document`, `Table`, `Code`), and duplicate counting (`Document 1`, `Document 2`) only activates when another file of that type already exists in that specific folder.
4. Enabled first-class root-level resource placement and drag-and-drop between root and folders, with automatic collision resolution on cross-folder moves.
5. Removed trailing 3-dot dropdown buttons in favor of 100% right-click context menus.
6. Preserved resource type colors (blue for Document, emerald for Table, amber for Presentation, violet for Graph, rose for Image, cyan for Code) across sidebar items and context menus.

## Consequences
- **Positive**: Clean, intuitive file explorer nomenclature; predictable and reusable file/folder sequence numbering; elimination of button clutter; consistent multi-format visual type indicators.
- **Negative / Trade-offs**: Client-side name scanning incurs `O(N)` set lookups on item creation, which remains negligible for workspace scale (<10,000 files).
