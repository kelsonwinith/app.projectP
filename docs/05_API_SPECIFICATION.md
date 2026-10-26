# RESTful & Streaming API Specification 🔌

เอกสารฉบับนี้กำหนดสเปกของ API สำหรับ **FastAPI Backend** เพื่อให้ **Next.js Frontend** เชื่อมต่อการทำงานได้อย่างสมบูรณ์แบบ ครอบคลุม **3-Tab Save Modal API**, **การบันทึกแบบเลือกบล็อก (Selective Staging)**, **การคืนค่าเฉพาะบล็อก (Revert Block)**, **WebSocket Cell-Level Lock**, และ **Canonical Living Glossary**

---

## 1. ข้อมูลพื้นฐาน (Base URL & Headers)
* **Base URL:** `/api/v1`
* **WebSocket URL:** `ws://api.domain.com/ws`
* **Authentication:** Bearer Token (JWT) ผ่าน Header `Authorization: Bearer <token>`

---

## 2. กลุ่ม API: การบันทึก 3 แท็บและการเลือก Commit (3-Tab Save & Selective Staging)

### 2.1 ดึงข้อมูลสำหรับเรนเดอร์หน้าต่าง 3-Tab Save Modal
* **`GET /api/v1/projects/{project_id}/resources/{resource_id}/save-modal-data`**
  - รวบรวมข้อมูลทั้ง 3 แท็บส่งให้ Frontend ในการเรียกครั้งเดียว
  - **Response (200 OK):**
    ```json
    {
      "tab_original": {
        "full_html": "<article><p id='p-001'>ข้อความเดิม...</p></article>",
        "version_number": 1
      },
      "tab_proposed_diff": {
        "stats": { "added_words": 120, "deleted_words": 30, "blocks_changed": 3 },
        "diff_blocks": [
          { "anchor_id": "p-001", "status": "modified", "original": "เดิม", "proposed": "ใหม่" },
          { "anchor_id": "p-002", "status": "modified", "original": "เดิม 2", "proposed": "ใหม่ 2" }
        ]
      },
      "tab_conflicts_and_notes": {
        "detected_conflicts": [
          {
            "conflicting_file": "Invoice_Policy.docx",
            "anchor_id": "p-03",
            "statement_here": "ชำระเงิน 60 วัน",
            "statement_there": "ชำระเงิน 30 วัน",
            "severity": "critical"
          }
        ]
      }
    }
    ```

### 2.2 บันทึกเฉพาะบล็อกที่ติ๊กเลือก (Selective Commit API)
* **`PUT /api/v1/projects/{project_id}/resources/{resource_id}/save-selective`**
  - นำเฉพาะบล็อกที่ติ๊ก `selected_anchor_ids` เข้าบันทึกเป็นเวอร์ชันถาวร (บล็อกที่ไม่ติ๊กจะคงเป็น Temp ต่อไป)
  - **Request Body:**
    ```json
    {
      "selected_anchor_ids": ["p-001", "p-002"],
      "commit_message": "อัปเดตสเปกเฟส 1 เรียบร้อย"
    }
    ```
  - **Response (200 OK):**
    ```json
    {
      "status": "committed",
      "new_version": 2,
      "uncommitted_temp_blocks_count": 1,
      "message": "Selected blocks committed. Delta sync enqueued."
    }
    ```

### 2.3 ย้อนค่าเฉพาะบล็อก (Revert Single Block API)
* **`POST /api/v1/projects/{project_id}/resources/{resource_id}/revert-block`**
  - ลบดราฟต์ชั่วคราวของบล็อกนั้นออกจาก `resource_temp_drafts` คืนค่าเดิมเวอร์ชันเซฟ
  - **Request Body:**
    ```json
    { "anchor_id": "p-002" }
    ```

---

## 3. กลุ่ม WebSocket API: การล็อกระดับเซลล์และ Temp Sync (Cell Lock & Temp State)

* **`WS /ws/projects/{project_id}/resources/{resource_id}?token=<jwt>`**

### 3.1 สัญญาณขอล็อกเฉพาะเซลล์ในตาราง (Cell-Level Lock)
* **Client ส่ง:**
  ```json
  { "action": "acquire_cell_lock", "anchor_id": "row-03:col-02", "actor_name": "Somchai" }
  ```
* **Server บรอดแคสต์:** เซลล์ `row-03:col-02` ถูกล็อกโดย Somchai (คนอื่นแก้เซลล์อื่นได้ปกติ)

### 3.2 สัญญาณอัปเดตผลลัพธ์เป็น Temp State ทันทีที่พิมพ์เสร็จ (Reveal Temp)
* **Client ส่ง (เมื่อ Unfocus):**
  ```json
  {
    "action": "release_and_reveal_temp",
    "anchor_id": "p-002",
    "temp_html": "<p id='p-002'>ข้อความร่างใหม่ที่บันทึกเป็น Temp...</p>",
    "temp_raw_text": "ข้อความร่างใหม่..."
  }
  ```
* **Server จัดการ:** บันทึกลงตาราง `resource_temp_drafts` และบรอดแคสต์หาทุกคนในห้อง (รีเฟรชไม่หาย)

---

## 4. กลุ่ม API: Canonical Glossary และ Knowledge Gaps

### 4.1 ดึงคำศัพท์มาตรฐานแบบ Canonical (ลดความซ้ำซ้อน)
* **`GET /api/v1/projects/{project_id}/glossaries/canonical`**
  - ส่งกลับคำหลักมาตรฐาน พร้อมรายการคำพ้อง/คำย่อ (Aliases) ใต้คำนั้น
  - **Response:**
    ```json
    {
      "canonical_term": "Kubernetes",
      "tag": "Software",
      "aliases": ["K8s", "k8s", "Kubernetes Cluster"],
      "definition": "ระบบ Container Orchestration มาตรฐาน"
    }
    ```

### 4.2 ค้นหาช่องว่างความรู้ (Knowledge Gap Finder API)
* **`GET /api/v1/projects/{project_id}/knowledge-gaps`**
  - ค้นหาคำศัพท์ที่ถูกพูดถึงบ่อยในเอกสาร แต่ยังไม่มีเอกสารใดเขียนอธิบายเป็นทางการ
  - **Response:**
    ```json
    {
      "gaps": [
        {
          "concept": "Zero-Trust Architecture",
          "mention_count": 5,
          "source_files": ["security_spec.docx", "api_gateway.md"]
        }
      ]
    }
    ```
