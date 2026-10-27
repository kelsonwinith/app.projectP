# User Journeys and Workflows

**Document Version**: 1.0.0
**Status**: Active

This document specifies the primary user journeys, sequence interactions, and workflow state machines for Project P.

---

## 1. Shared Temp Draft Collaboration Workflow

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Editor (User A)
    actor UserB as Collaborator (User B)
    participant UI_A as Client App (User A)
    participant UI_B as Client App (User B)
    participant WS as WebSocket Hub
    participant DB as Shared Temp Store (Redis/PostgreSQL)

    UserA->>UI_A: Edits block <p id="p-002">
    UserA->>UI_A: Unfocuses block (click outside or tab away)
    
    UI_A->>WS: release_and_reveal_block(res_id, "p-002", new_html)
    WS->>DB: Upsert into resource_temp_drafts
    WS-->>UI_B: Broadcast block_updated_temp(res_id, "p-002")
    
    Note over UI_A,UI_B: Even if User A or User B refreshes the browser,<br/>the temp draft state persists and is re-rendered!

    opt Reverting specific block
        UserA->>UI_A: Clicks "Revert Block" on "p-002"
        UI_A->>WS: revert_temp_block(res_id, "p-002")
        WS->>DB: Delete from resource_temp_drafts
        WS-->>UI_B: Broadcast block_reverted(res_id, "p-002")
    end
```

---

## 2. 3-Tab Save Modal with Selective Staging Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Workspace Author
    participant UI as 3-Tab Save Modal
    participant API as FastAPI Gateway
    participant Worker as Background Sync Worker
    participant DB as PostgreSQL Core DB

    User->>UI: Clicks "Save Resource"
    UI->>API: GET /api/v1/projects/{id}/resources/{res_id}/save-modal-data
    API-->>UI: Returns 3 tabs: Original, Temp Diff (+words/-words), Conflict Detection Report
    
    UI->>User: Renders 3-Tab Save Modal
    Note over UI,User: Tab 1: Full original text<br/>Tab 2: Diff view with per-block checkboxes<br/>Tab 3: Commit notes and cross-source conflict report
    
    User->>UI: Selects [✓] Blocks 1 & 2 (leaves Block 3 unchecked)
    User->>UI: Enters commit message: "Update phase 1 dosage metrics" and clicks Commit
    
    UI->>API: PUT /api/v1/.../save-selective (selected_anchor_ids: ["p-1", "p-2"])
    API->>DB: Commit selected blocks to resource_versions; delete selected from resource_temp_drafts
    Note over DB: Block 3 remains in resource_temp_drafts as pending temp edit
    
    API->>Worker: Enqueue Incremental Delta Sync (only for committed blocks)
    Worker->>DB: Update pgvector chunks & living knowledge nodes
    API-->>UI: Commit success response
```

---

## 3. Canonical Term Standardization Flow

```mermaid
flowchart TD
    A["User adds or imports concept: 'K8s Cluster'"] --> B["Synonym & Acronym Normalizer"]
    B --> C{"Matches Canonical Term?"}
    C -- Yes --> D["Link to Canonical: 'Kubernetes'"]
    C -- No --> E["Create New Canonical Term"]
    D --> F["Deduplicate Knowledge Graph Node"]
    D --> G["Display Canonical Hover Card Across Resources"]
    E --> H["Add to docs/context/001-ubiquitous-language.md"]
```

---

## 4. Knowledge Gap Discovery & AI Drafting Flow

```mermaid
sequenceDiagram
    autonumber
    actor Author as Workspace Author
    participant Hub as Knowledge Hub UI
    participant AI as Project P AI Engine
    participant Repo as Resource Store

    Hub->>Hub: Scan resource chunks for high-frequency mentions lacking parent documents
    Hub->>Author: Display Knowledge Gap: "Cell-Level Table Locking" (5 mentions, no defining doc)
    
    Author->>Hub: Clicks "Draft Doc for this Concept"
    Hub->>AI: Trigger draft generation with prompt & context citations
    AI-->>Hub: Streams structured draft preview with suggested outline
    
    Author->>Repo: Saves draft as new Document in "Product docs" collection
    Hub->>Hub: Knowledge Gap resolved (transferred to verified canonical resource)
```
