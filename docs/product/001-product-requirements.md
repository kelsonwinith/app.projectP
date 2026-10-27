# Product Requirements

**Document Version**: 1.0.0
**Status**: Active

## 1. Vision and Core Objectives

### 1.1 Vision
Project P is a universal AI knowledge workspace and collaborative resource operating system designed to ingest any file format, normalize it into structured representations, and render it through interactive semantic HTML interfaces (Documents, Presentations, Interactive Tables, Graphs, and Vision-enabled Images). The platform ensures safe multi-user collaboration through fine-grained cell-level table locking, centralized shared temp drafts that survive page refreshes, a 3-tab save modal with selective staging, canonical term standardization, and dual-stage conflict detection.

### 1.2 Core Objectives
1. **Granular Collaboration & Shared Temp Drafts:**
   - In tabular resources, concurrency locks are applied strictly to targeted cell/row coordinates rather than locking the entire sheet.
   - When a block or cell is edited and unfocused, the mutation is immediately persisted to a local-first shared temp draft buffer. Changes survive page reloads and are synchronized live across sessions.
   - Authors can revert specific blocks back to their last committed state using a targeted Revert Block action.
2. **3-Tab Save Modal with Selective Staging:**
   - Opening the save modal provides a 3-tab audit workflow:
     - **Tab 1: Original:** Complete view of the currently committed authoritative version.
     - **Tab 2: Proposed with Diff:** Inline additions/deletions diff view with word count statistics (`+words / -words`), accompanied by per-block checkboxes for selective staging. Unchecked blocks remain in temp draft state.
     - **Tab 3: Notes & Conflicts:** Commit message entry and automated detection results highlighting any conflicting statements or metric discrepancies with other workspace documents.
3. **Dual-Stage Conflict Detection:**
   - Contradiction checks execute automatically during two critical lifecycle events:
     - **On Generate:** When generating new resources or content drafts via AI.
     - **On Save:** When launching the 3-tab save modal prior to committing.
4. **Canonical Term Standardization:**
   - Living glossary automatically identifies and collapses synonyms, spelling variations, and acronyms (e.g., `Kubernetes`, `K8s`, `k8s`) into a single canonical term, preventing duplicate nodes in the knowledge graph.
5. **Knowledge Gap & Orphan Concept Finder:**
   - Knowledge Hub filters identify concepts referenced repeatedly (3+ occurrences) across resources that lack a dedicated defining document, providing one-click AI drafting.
6. **Universal Viewers & Direct Editing:**
   - **TOC ScrollSpy:** Dynamic table of contents that tracks reading position in clean single-view documents.
   - **Slide Grid Sorter:** Thumbnail grid overview for rapid slide rearrangement and navigation.
   - **Direct In-Place Editing:** Click any content block directly to edit in place, with floating Confirm/Cancel action controls and real-time collaborator presence badges.

---

## 2. Shared Temp Drafts & 3-Tab Save Lifecycle

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        RESOURCE: "Clinical_Trial_Phase1.html"          │
├────────────────────────────────────────────────────────────────────────┤
│ <p id="p-001"> [Committed Authoritative Version]                       │
├────────────────────────────────────────────────────────────────────────┤
│ <p id="p-002" class="temp-draft">                                      │
│   🟡 [Shared Temp Draft] Edited by Sarah (survives refresh, broadcast) │
│   [Revert Block Button] Reverts this specific block back to committed  │
├────────────────────────────────────────────────────────────────────────┤
│ <tr id="row-04" class="cell-locked">                                   │
│   🔒 Cell B4 is locked by Alex (other cells remain concurrently editable│
└────────────────────────────────────────────────────────────────────────┘
```

When a user initiates the Save Resource flow:
- **Tab 1 (Original):** Displays the complete authoritative content before edits.
- **Tab 2 (Proposed with Diff):** Shows delta statistics (`+120 words | -30 words | 4 blocks modified`) with block-level checkboxes:
  - `[✓] Block 1 (Staged for commit)`
  - `[ ] Block 2 (Unstaged -> remains in shared temp draft)`
- **Tab 3 (Notes & Conflicts):** Commit message input and cross-resource conflict verification card.
- **On Confirmation:** Staged blocks transition to permanent versions, trigger incremental delta sync across the knowledge index, and unstaged blocks persist in temporary state.
