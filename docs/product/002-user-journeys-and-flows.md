# User Journeys and Workflows

**Document Version**: 1.0.0
**Status**: Active

This document specifies the primary user journeys, sequence interactions, and workflow state machines for Project P.

---

## 1. Shared Temp Draft Collaboration Workflow

```mermaid
sequenceDiagram
    autonumber
    actor UserA as Editor
    participant UI_A as Editor UI
    participant Store as Local-First Draft Store
    participant Bus as Session Broadcast Bus

    UserA->>UI_A: Edits block <p id="p-002">
    UserA->>UI_A: Unfocuses block (click outside or tab away)
    
    UI_A->>Store: saveTempBlock(res_id, "p-002", new_html)
    Store-->>UI_A: Persisted to client storage
    UI_A->>Bus: Broadcast block_updated_temp(res_id, "p-002")
    
    Note over UI_A,Store: Even if user refreshes the browser,<br/>the temp draft state persists and is re-rendered!

    opt Reverting specific block
        UserA->>UI_A: Clicks "Revert Block" on "p-002"
        UI_A->>Store: revertTempBlock(res_id, "p-002")
        Store-->>UI_A: Deleted from temp drafts
        UI_A->>Bus: Broadcast block_reverted(res_id, "p-002")
    end
```

---

## 2. 3-Tab Save Modal with Selective Staging Workflow

```mermaid
sequenceDiagram
    autonumber
    actor User as Workspace Author
    participant UI as 3-Tab Save Modal
    participant Store as Local-First Resource Store
    participant Engine as Conflict & Index Engine

    User->>UI: Clicks "Save Resource"
    UI->>Store: getSaveModalData(res_id)
    Store->>Engine: Run contradiction check against workspace resources
    Engine-->>Store: Detected conflicts report
    Store-->>UI: Returns 3 tabs: Original, Temp Diff (+words/-words), Conflict Report
    
    UI->>User: Renders 3-Tab Save Modal
    Note over UI,User: Tab 1: Full original text<br/>Tab 2: Diff view with per-block checkboxes<br/>Tab 3: Commit notes and cross-source conflict report
    
    User->>UI: Selects [✓] Blocks 1 & 2 (leaves Block 3 unchecked)
    User->>UI: Enters commit message: "Update phase 1 dosage metrics" and clicks Commit
    
    UI->>Store: commitSelective(selected_anchor_ids: ["p-1", "p-2"])
    Store->>Store: Commit selected blocks to resource; delete selected from temp drafts
    Note over Store: Block 3 remains in temp drafts as pending edit
    
    Store->>Engine: Sync knowledge index (only for committed blocks)
    UI-->>User: Commit success confirmation
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
