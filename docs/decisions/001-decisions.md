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

---

# ADR-008: Direct In-Place Block Editing with Floating Action Toolbars and Removal of Redundant Sub-Controls

## Status
Accepted

## Context
Earlier resource viewers featured modal edit modes, pre-editing "Edit" toolbar buttons, split WYSIWYG/Markdown view toggles, and static sidebar footer callouts ("Local-First Grounding", "Computer Vision Grounding", etc.). Inline "Save Draft" buttons inside content cards created layout shifts and cognitive confusion with the authoritative header "Save Changes" action.

## Decision
We simplified the universal viewer interaction model across all 7 resource formats:
1. **Direct Click-to-Edit**: Eliminated pre-editing "Edit" buttons; users click any content block, slide card, table cell, code section, or transcript item directly to enter edit mode.
2. **Floating Action Controls**: Replaced inline "Save Draft" buttons with a standardized floating `Cancel` and `Confirm` action group toolbar positioned along the bottom edge of the active block (`absolute -bottom-3.5 right-4 z-30`), preventing internal layout shifts.
3. **Corner Presence Avatar**: Positioned active collaborator avatars centered on the top-right corner edge (`top-0 left-full -translate-y-1/2 -translate-x-3`) with the `Editing...` status text streaming strictly to the right.
4. **Single-View Document Mode**: Removed the "WYSIWYG", "Markdown", and "Split" view buttons, retaining a single unified article reader with dynamic outline ScrollSpy.
5. **Removal of Extraneous Footers**: Completely eliminated decorative footer callout boxes ("Local-First Grounding", "Computer Vision Grounding", "Code Grounding", "Graph SSoT", and "Pro-tip") across all viewer sidebars to keep panels focused on core workflows.

## Consequences
- **Positive**: Zero layout shift during in-place editing; instant click-to-edit responsiveness; complete disambiguation between block confirmation and top-level SSoT commit; maximized vertical screen real estate in sidebars.
- **Negative / Trade-offs**: Users who preferred raw markdown code editing in documents now interact with formatted semantic blocks rather than a raw syntax editor.

---

# ADR-009: Private Section Architecture and Strict Knowledge Index Isolation

## Status
Accepted

## Context
Users frequently create personal scratchpads, interim meeting notes, draft code experiments, or confidential resources that belong strictly to the individual user. When such files are placed in shared collections, they inadvertently get ingested into the team's semantic retrieval index, surfaced in Living Glossary concept links, counted in Knowledge Hub gap analysis, or evaluated during cross-source contradiction checks. Users required a dedicated "Private" section under Collections where personal resources reside, completely isolated from team knowledge grounding.

## Decision
We implemented a dedicated "Private" hierarchy in the workspace:
1. **Private Section Placement**: Rendered a distinct "Private" section in the sidebar directly beneath Collections, marked with a lock indicator and "Personal only" subtitle.
2. **Independent Tree & Root Hierarchy**: Maintained isolated `privateCollections` and `privateRootFiles` within client storage, supporting nested folders, unique sibling naming, root-level resources, and drag-and-drop.
3. **Strict Knowledge Grounding Isolation**:
   - Excluded private resources from the pgvector semantic retrieval index and team knowledge base.
   - Omitted private resources from Living Glossary term scans and referenced resource links.
   - Bypassed Knowledge Hub orphan gap detection and transclusion graphs for private content.
   - Disabled cross-source fact-checking contradiction flags between private scratchpads and canonical team baselines.
4. **Viewer Distinction & Local Persistence**:
   - Displayed `Private / ...` breadcrumbs with a lock icon and a "Personal File" badge in the universal resource header.
   - Suppressed external collaborator presence indicators (rendering "Personal File · Isolated") since private items belong exclusively to the user.
   - Local commits persist to client private storage without polluting the canonical Single Source of Truth (SSoT).

## Consequences
- **Positive**: Complete privacy and isolation for personal scratchpad files; zero contamination of shared team retrieval embeddings, glossary citations, or knowledge gap statistics; clear visual identity in the universal viewer.
- **Negative / Trade-offs**: Resources in the Private section cannot be transcluded by team documents or cited in public synthesis responses unless explicitly migrated to public Collections.

---

# ADR-010: Workspace Rules as Project Agent Skills and Safety Guardrails

## Status
Accepted

## Context
As teams leverage AI assistant synthesis, resource generation, and conversational querying across a complex workspace, they require explicit control over agent behavior, safety boundaries, style standards, and knowledge grounding. Without configurable project-wide skills and guardrails, the assistant may hallucinate uncommitted roadmap deadlines, suggest destructive database migrations without rollbacks, format timestamps inconsistently, or leak private files into team summaries. Users required a centralized "Rules" management interface where rules can be created, toggled, categorized, and dynamically injected into the AI system directives.

## Decision
We implemented a dedicated Workspace Rules engine and management page:
1. **Rule Categorization & Polarity**:
   - **Do Directives (`type: 'do'`)**: Proactive agent skills dictating actions the assistant must perform (e.g. ground claims in verified documents, enforce canonical living glossary terms, use standard ISO date formatting).
   - **Avoid Directives (`type: 'avoid'`)**: Defensive safety guardrails dictating behaviors the assistant must strictly avoid (e.g. never reference or leak Private resources, avoid unvetted schema migrations without rollbacks, avoid fabricating speculative launch deadlines).
   - **Categories**: `Safety`, `Behavior`, `Style`, and `Knowledge`.
2. **Dedicated Workspace Navigation**:
   - Added `/rules` under the primary Workspace navigation items with a live badge displaying active enabled rules count.
   - Built a comprehensive rules management page featuring KPI summary counters, search filtering, type pills (`All`, `Do's`, `Avoids`), category pills, switch toggles, deletion, and a "New Rule" modal dialog.
3. **Dynamic Prompt Injection & Audit Badging**:
   - Active enabled rules are compiled into system directives and prepended to the AI prompt evaluation payload.
   - Assistant responses in the workspace chat display an `Enforced Rules` pill badge indicating the exact guardrails applied to synthesize that response.
4. **Persistent Local Store**:
   - Managed via Zustand with `localStorage` persistence (`project-p-rules`), allowing instant toggles and runtime updates without page reloads.

## Consequences
- **Positive**: Direct user sovereignty over AI behavior and project agent skills; transparent verification badges in chat showing which guardrails were enforced; immediate toggleability of safety rules.
- **Negative / Trade-offs**: Active rules increase system prompt token overhead proportionally to the number of enabled directives.
