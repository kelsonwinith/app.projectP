# API Contracts Specification

**Document Version**: 1.0.0
**Status**: Active

This document specifies the RESTful and streaming WebSocket contracts for the Project P backend gateway.

---

## 1. Gateway Specifications

- **Base URL:** `/api/v1`
- **WebSocket Gateway:** `ws://api.domain.com/ws`
- **Authorization:** Bearer Token (JWT) via `Authorization: Bearer <token>`
- **Content-Type:** `application/json`

---

## 2. 3-Tab Save & Selective Staging APIs

### 2.1 Fetch 3-Tab Save Modal Payload
- **Endpoint:** `GET /api/v1/projects/{project_id}/resources/{resource_id}/save-modal-data`
- **Description:** Returns aggregated payload to populate all three modal tabs in a single roundtrip.
- **Response (200 OK):**
```json
{
  "tab_original": {
    "full_html": "<article><p id='p-001'>Original committed claim...</p></article>",
    "version_number": 1
  },
  "tab_proposed_diff": {
    "stats": { "added_words": 120, "deleted_words": 30, "blocks_changed": 2 },
    "diff_blocks": [
      {
        "anchor_id": "p-001",
        "status": "modified",
        "original": "Original committed claim...",
        "proposed": "Updated authoritative specification..."
      }
    ]
  },
  "tab_conflicts_and_notes": {
    "detected_conflicts": [
      {
        "conflicting_file": "System Architecture",
        "anchor_id": "redis-ttl",
        "statement_here": "TTL: 3600s",
        "statement_there": "TTL: 300s",
        "severity": "critical"
      }
    ]
  }
}
```

### 2.2 Execute Selective Commit
- **Endpoint:** `PUT /api/v1/projects/{project_id}/resources/{resource_id}/save-selective`
- **Description:** Commits only the checked block anchors to permanent storage, preserving unchecked anchors in temp draft state.
- **Request Body:**
```json
{
  "selected_anchor_ids": ["p-001"],
  "commit_message": "Align Redis TTL spec with System Architecture",
  "conflict_resolutions": [
    {
      "conflict_id": "conf_092",
      "resolution": "override_with_300s"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "status": "success",
  "new_version": 2,
  "committed_anchors": ["p-001"],
  "remaining_temp_anchors": ["p-002"]
}
```

### 2.3 Revert Block
- **Endpoint:** `DELETE /api/v1/projects/{project_id}/resources/{resource_id}/temp-drafts/{anchor_id}`
- **Description:** Deletes the pending temporary mutation for a specific block, restoring the committed version.
- **Response (200 OK):** `{"status": "reverted", "anchor_id": "p-002"}`

---

## 3. WebSocket Real-Time Protocol

### 3.1 Cell-Level Lock
- **Send:** `{"action": "acquire_cell_lock", "resource_id": "res_1", "coordinate": "row-04:col-02"}`
- **Receive (Broadcast):** `{"event": "cell_locked", "coordinate": "row-04:col-02", "user_id": "user_sarah"}`

### 3.2 Temp Draft Broadcast
- **Send:** `{"action": "release_and_reveal_block", "resource_id": "res_1", "anchor_id": "p-002", "temp_html": "..."}`
- **Receive (Broadcast):** `{"event": "block_updated_temp", "resource_id": "res_1", "anchor_id": "p-002", "editor_id": "user_sarah"}`
