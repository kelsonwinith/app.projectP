# RESTful & Streaming API Specification 🔌

เอกสารฉบับนี้กำหนดสเปกของ API สำหรับ **FastAPI Backend** เพื่อให้ **Next.js Frontend** เชื่อมต่อการทำงานได้อย่างสมบูรณ์แบบ ครอบคลุม **การสั่งซิงค์ความรู้ส่วนต่าง Incremental Delta Sync**, **ตัวกรอง Smart Knowledge Graph**, **การส่ง Heartbeat ต่ออายุการล็อกบล็อก**, และ **Living Glossary จำแนกด้วย Tags**

---

## 1. ข้อมูลพื้นฐาน (Base URL & Headers)
* **Base URL:** `/api/v1`
* **WebSocket URL:** `ws://api.domain.com/ws`
* **Authentication:** Bearer Token (JWT) ผ่าน Header `Authorization: Bearer <token>` หรือ Query Param สำหรับ WebSocket

---

## 2. กลุ่ม API: ซิงค์ความรู้ส่วนต่างและการติดตาม (Incremental Sync & Stale Tracking)

### 2.1 ตรวจสอบสถานะความรู้ล้าสมัย (Stale Knowledge Indicator API)
* **`GET /api/v1/projects/{project_id}/knowledge/sync-status`**
  - **Response (200 OK):**
    ```json
    {
      "is_stale": true,
      "last_synced_at": "2026-10-26T21:00:00Z",
      "modified_resources": [
        {
          "id": "uuid-res-1",
          "name": "architecture_v2.docx",
          "format_type": "document",
          "updated_at": "2026-10-26T23:15:00Z"
        }
      ]
    }
    ```

### 2.2 สั่งซิงค์ความรู้เฉพาะส่วนต่าง (Incremental Delta Sync API)
* **`POST /api/v1/projects/{project_id}/knowledge/sync`**
  - รันกระบวนการ Delta Sync: ส่งเฉพาะไฟล์ใน `modified_resources` และวิเคราะห์ Diff ส่วนต่าง เพื่อประหยัด Token สูงสุด
  - **Response (202 Accepted):**
    ```json
    {
      "message": "Incremental delta knowledge sync initiated.",
      "job_id": "job-celery-123",
      "sync_mode": "incremental_delta"
    }
    ```

---

## 3. กลุ่ม WebSocket API: การล็อกระดับบล็อกและ Heartbeat (Block Lock & Heartbeat)

* **`WS /ws/projects/{project_id}/resources/{resource_id}?token=<jwt>`**

### 3.1 สัญญาณขอเข้าล็อกบล็อก (Acquire Block Lock)
* **Client ส่ง:**
  ```json
  { "action": "acquire_block_lock", "anchor_id": "p-002" }
  ```
* **Server บรอดแคสต์:** บล็อก "p-002" ถูกล็อกโดย User A (TTL 60s ใน Redis)

### 3.2 สัญญาณส่ง Heartbeat ต่ออายุ Lock ทุก 15 วินาที (Heartbeat Ping)
* **Client ส่ง (ทุก 15s ตราบใดที่ยัง Focus อยู่):**
  ```json
  { "action": "ping_lock_heartbeat", "anchor_id": "p-002" }
  ```
* **Server จัดการ:** ขยายเวลา `EXPIRE lock:{res_id}:{anchor_id} 60` หากขาด Ping เกิน 60 วินาที จะบรอดแคสต์ `block_auto_unlocked` ทันที

### 3.3 สัญญาณบันทึกและปลดล็อกเมื่อ Unfocus (Save & Release Lock)
* **Client ส่ง:**
  ```json
  {
    "action": "save_and_release_block",
    "anchor_id": "p-002",
    "new_html": "<p id='p-002'>ข้อความใหม่ที่แก้ไขแล้ว</p>",
    "new_raw_text": "ข้อความใหม่ที่แก้ไขแล้ว"
  }
  ```
* **Server บรอดแคสต์:** ส่งข้อความใหม่และปลดล็อกบล็อกให้ทุกคนทราบ

---

## 4. กลุ่ม API: ตัวกรอง Smart Knowledge Graph (Graph Query Filters)

* **`GET /api/v1/projects/{project_id}/knowledge-graph`**
  - **Query Parameters:**
    - `folder_id` (UUID, optional): กรองเฉพาะความรู้ที่สกัดจากโฟลเดอร์นี้
    - `resource_id` (UUID, optional): กรองเฉพาะเอกสารเดี่ยว
    - `node_type` (string, optional): เช่น `CONCEPT`, `TECH_ENTITY`, `ORGANIZATION`, `RULE`
    - `tag` (string, optional): เช่น `Software`, `Pharmacy`, `Legal`
    - `min_degree` (int, default=1): กรองเฉพาะ Hub Nodes ที่มีเส้นเชื่อมต่อตั้งแต่ N เส้นขึ้นไป
    - `is_verified` (bool, optional): true = แสดงเฉพาะโหนดที่ทีมงานมนุษย์ตรวจทานแล้ว
  - **Response (Filtered Graph):**
    ```json
    {
      "nodes": [
        {
          "id": "uuid-node-fastapi",
          "label": "FastAPI",
          "node_type": "TECH_ENTITY",
          "tag": "Software",
          "degree": 5,
          "is_verified": true,
          "summary": "High-performance Python web framework"
        }
      ],
      "edges": [
        {
          "id": "uuid-edge-1",
          "source": "uuid-node-fastapi",
          "target": "uuid-node-postgres",
          "relation": "connects_to"
        }
      ]
    }
    ```

---

## 5. กลุ่ม API: Living Glossary จำแนกด้วย Tags

* **`GET /api/v1/projects/{project_id}/glossaries?tag=Software&is_verified=true`**
  - ค้นหาคำศัพท์แบบระบุ Tag และสถานะการตรวจทาน

---

## 6. กลุ่ม API: การสนทนาส่วนตัวและขอบเขต (Private Chat & Scope Picker)

* **`POST /api/v1/projects/{project_id}/chat/messages`**
  - รองรับ Scope Filter (Default: ทั้งโปรเจกต์ หรือเลือกเฉพาะเจาะจง)
  - ตอบกลับแบบ SSE Token Streaming พร้อม Citation พิกัดย่อหน้า/สไลด์/เซลล์
