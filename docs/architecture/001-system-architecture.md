# System Architecture

**Document Version**: 2.0.0
**Status**: Active

This document outlines the local-first web application architecture of Project P, including the client-side state engine, local temp draft persistence, cell-level concurrency model, 3-tab save controller, living glossary, and dual-stage conflict detection.

---

## 1. High-Level Architecture (Local-First Web App)

```text
┌────────────────────────────────────────────────────────┐
│ UI & INTERACTION LAYER (Next.js 16 App Router)         │
│ - Permanent Centered Bottom Chat Bar (Open/Hide Panel) │
│ - File Explorer Sidebar (Folders, Resources, DND)      │
│ - Universal Viewers (Document, Table, Presentation)    │
│ - 3-Tab Save Modal with Selective Staging Checkboxes   │
└───────────────────────────┬────────────────────────────┘
                            │ Zustand Actions & Hooks
                            ▼
┌────────────────────────────────────────────────────────┐
│ LOCAL-FIRST STATE ENGINE (Zustand & Client Controller) │
│ - Workspace Context (Active resources, open editor)    │
│ - Shared Temp Draft Store (Per-block uncommitted edits)│
│ - Cell-Level Concurrency & Lock Coordinator (Client)   │
│ - Sibling-Scoped Directory & Naming Controller         │
└───────────────────────────┬────────────────────────────┘
                            │ Storage Adapters & Event Bus
                            ▼
┌────────────────────────────────────────────────────────┐
│ PERSISTENCE & VERIFICATION LAYER (Browser Storage)     │
│ - LocalStorage / IndexedDB Storage Adapters            │
│ - BroadcastChannel Multi-Tab Sync Bus                  │
│ - Client-Side Word Diff & Contradiction Checker        │
│ - Canonical Living Glossary & Knowledge Index          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Local-First Shared Temp Draft State Engine

To ensure that in-progress edits survive browser reloads and are immediately responsive:

1. **Client Action:** When an author finishes editing a block or table cell and unfocuses (`blur`), the client updates the local-first temp draft store:
   ```json
   {
     "resource_id": "res_001",
     "anchor_id": "p-002",
     "temp_html": "<p id='p-002'>Updated clinical metric: 45mg dosage</p>",
     "updated_at": 1729864800000
   }
   ```
2. **Persistence Invariant:** The state engine writes the mutation to persistent client storage (`localStorage` / IndexedDB).
3. **Multi-Tab Synchronization:** A `BroadcastChannel("project_p_sync")` event emits `block_updated_temp` to update other open workspace tabs.
4. **Hydration Invariant:** On page load or reload, the resource viewer merges committed base content with pending temporary drafts, visually marking pending blocks with draft badges and a "Revert Block" action.

---

## 3. Cell-Level Table Concurrency & Locking Mechanics

In tabular resources, concurrency control is scoped to targeted cells:
1. **Focus:** When an editor focuses cell `row-03:col-02`, a local lock state is assigned with timestamp.
2. **Isolation:** Other cells remain concurrently editable without locking the entire sheet.
3. **Heartbeat:** When focus is lost or after an inactivity threshold, the cell edit transitions to a local temp draft.

---

## 4. 3-Tab Save & Selective Staging Controller

1. **Pre-Save Inspection:**
   - Clicking "Save Resource" opens the 3-tab audit modal.
   - Computes an inline diff between the committed base version and active temp drafts.
   - Calculates additions and deletions (`+words / -words`).
   - Runs client-side contradiction checks against other workspace resources to populate Tab 3 (Notes & Conflicts).
2. **Commit Execution:**
   - Staged blocks (`[✓]`): Merged into the permanent resource content in client storage and purged from temporary draft storage.
   - Unstaged blocks (`[ ]`): Retained in temporary draft storage for subsequent editing.

---

## 5. Dual-Stage Conflict Detection Lifecycle

Conflict detection executes during two discrete phases:
1. **On Generate:** When AI or the assistant proposes a newly synthesized resource or draft, it cross-references assertions against indexed workspace resources. Any contradictory metrics or policy dates trigger a warning badge before creation.
2. **On Save:** During 3-tab save modal inspection, newly staged blocks are checked against existing resources, displaying severity tags (`critical`, `warning`) in Tab 3.
