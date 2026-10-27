# Controller and Store Contracts Specification

**Document Version**: 2.0.0
**Status**: Active

This document specifies the local-first client store interfaces, save controller contracts, and cross-tab event protocols for Project P.

---

## 1. Storage & Controller Architecture

In local-first mode, all state operations run synchronously or via local promises against client storage (backed by Zustand `persist` in `localStorage` and IndexedDB), with optional cross-tab synchronization via `BroadcastChannel`.

---

## 2. 3-Tab Save & Selective Staging Controller Contracts

### 2.1 `getSaveModalData(resourceName: string)`
- **Description:** Computes inline diffs, stats, and conflict audits for the 3-tab save modal.
- **Return Type:**
```typescript
interface SaveModalPayload {
  tabOriginal: {
    fullContent: string
    versionNumber: number
  }
  tabProposedDiff: {
    stats: {
      addedWords: number
      deletedWords: number
      blocksChanged: number
    }
    diffBlocks: Array<{
      anchorId: string
      status: 'modified' | 'added' | 'deleted'
      original: string
      proposed: string
    }>
  }
  tabConflictsAndNotes: {
    detectedConflicts: Array<{
      conflictingResource: string
      anchorId?: string
      statementHere: string
      statementThere: string
      severity: 'critical' | 'warning'
    }>
  }
}
```

### 2.2 `commitSelective(resourceName: string, payload: CommitSelectivePayload)`
- **Description:** Commits selected block anchors into the permanent resource content, retaining unselected anchors in temporary draft storage.
- **Parameter Payload:**
```typescript
interface CommitSelectivePayload {
  selectedAnchorIds: string[]
  commitMessage?: string
  conflictResolutions?: Array<{
    conflictId: string
    resolution: string
  }>
}
```
- **Return Type:**
```typescript
interface CommitResult {
  status: 'success'
  newVersion: number
  committedAnchors: string[]
  remainingTempAnchors: string[]
}
```

### 2.3 `revertTempBlock(resourceName: string, anchorId: string)`
- **Description:** Deletes the pending temporary mutation for a specific block or cell, restoring the committed version.
- **Return Type:** `{ status: 'reverted'; anchorId: string }`

---

## 3. Real-Time Concurrency & Multi-Tab Broadcast Protocol

Uses `BroadcastChannel("project_p_channel")` to broadcast mutations across browser tabs:

### 3.1 Cell Locking
- **Dispatch:** `{ action: "acquire_cell_lock", resourceName: string, coordinate: string }`
- **Receive:** `{ event: "cell_locked", coordinate: string, sessionId: string }`

### 3.2 Temp Draft Broadcast
- **Dispatch:** `{ action: "release_and_reveal_block", resourceName: string, anchorId: string, tempHtml: string }`
- **Receive:** `{ event: "block_updated_temp", resourceName: string, anchorId: string }`
