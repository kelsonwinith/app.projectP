# System Architecture

**Document Version**: 1.0.0
**Status**: Active

This document outlines the system architecture of Project P, including the shared temp draft store, concurrency locking mechanisms, 3-tab save controller, canonical term standardization, and dual-stage conflict detection.

---

## 1. High-Level Architecture

```text
┌────────────────────────────────────────────────────────┐
│ CLIENT TIER (Next.js 16 App Router)                    │
│ - Persistent Bottom Chat Bar & Draggable Mini-Chat     │
│ - 3-Tab Save Modal with Selective Staging Checkboxes   │
│ - Universal Viewers (Document, Table, Presentation)    │
└───────────────────────────┬────────────────────────────┘
                            │ REST / WebSockets
                            ▼
┌────────────────────────────────────────────────────────┐
│ GATEWAY & COLLABORATION TIER (FastAPI & Redis)         │
│ - WebSocket Hub (Real-time cursor, lock & draft sync)  │
│ - Redis In-Memory Scratchpad (Sub-15ms temp state)     │
│ - Cell-Level Lock Coordinator (TTL: 60s, ping: 15s)    │
└───────────────────────────┬────────────────────────────┘
                            │ Async Workers / SQL
                            ▼
┌────────────────────────────────────────────────────────┐
│ PERSISTENCE & SEMANTIC TIER (PostgreSQL 16 & pgvector) │
│ - Core Relational Tables & Selective Commit History    │
│ - HNSW Vector Indexing & Inverted Trigram Search       │
│ - Canonical Living Glossary & Knowledge Graph Engine   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Shared Temp Draft State Engine

To ensure that in-progress edits survive browser reloads and are visible to peers in real time:

1. **Client Action:** When an author finishes editing a block or cell and unfocuses (`blur`), the client dispatches a WebSocket event:
   ```json
   {
     "event": "release_and_reveal_block",
     "resource_id": "res_001",
     "anchor_id": "p-002",
     "temp_html": "<p id='p-002'>Updated clinical metric: 45mg dosage</p>"
   }
   ```
2. **Buffer Persistence:** The server writes the payload to `resource_temp_drafts` in PostgreSQL and updates the Redis buffer cache.
3. **Peer Broadcast:** WebSocket emits `block_updated_temp` to all active session participants.
4. **Hydration Invariant:** On page load or refresh, client queries retrieve both committed resource blocks and pending temp drafts, layering temp drafts over committed blocks.

---

## 3. Cell-Level Table Locking Mechanics

```text
[User focuses cell at Row 3, Column 2]
                │
                ▼
[Client sends WS: acquire_cell_lock(res_id, "row-03:col-02")]
                │
                ▼
┌────────────────────────────────────────────────────────┐
│ REDIS CELL LOCK KEY                                    │
│ Key: "lock:{res_id}:row-03:col-02"                     │
│ Holder: "user_sarah"                                   │
│ TTL: 60 seconds (renewed via heartbeat every 15s)      │
└────────────────────────────────────────────────────────┘
                │
  Peer editors can freely edit Row 3 Column 1 or other cells concurrently.
```

---

## 4. 3-Tab Save & Selective Staging Controller

1. **Pre-Save Inspection:**
   - When the author clicks "Save Resource", the backend calculates an inline diff between `resource_temp_drafts` and the latest committed `resource_versions`.
   - Generates addition/deletion statistics (`+words / -words`).
   - Runs the Contradiction Detector in the background and populates Tab 3 (Notes & Conflicts).
2. **Commit Execution:**
   - Staged blocks (`[✓]`): Applied to `resources` table, recorded in `resource_versions`, and purged from `resource_temp_drafts`.
   - Unstaged blocks (`[ ]`): Retained in `resource_temp_drafts` as ongoing temporary drafts.
   - Triggers incremental delta vectorization only for modified anchors.

---

## 5. Dual-Stage Conflict Detection Lifecycle

Conflict detection executes during two discrete phases:
1. **On Generate:** When AI proposes a newly synthesized resource or draft, it cross-references facts against all indexed resource chunks in `pgvector`. Any contradictory numerical values or policy dates trigger a warning badge before creation.
2. **On Save:** During 3-tab save modal initialization, newly staged blocks are cross-checked against existing canonical resources, displaying severity tags (`critical`, `warning`) in Tab 3.
