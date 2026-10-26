# RESTful & Streaming API Specification 🔌

เอกสารฉบับนี้กำหนดสเปกของ API สำหรับ **FastAPI Backend** เพื่อให้ **Next.js Frontend** เชื่อมต่อการทำงานได้อย่างสมบูรณ์แบบ ครอบคลุม **WebSocket Block Lock & Reveal Event**, **การพรีวิว Diff ก่อนบันทึกเอกสารทั้งฉบับ**, **การบันทึกพร้อมทริกเกอร์ซิงค์และตรวจจับ Conflict ทันที**, **API การจัดการข้อขัดแย้ง (Conflicts API)**, และ **ห้องทดลองกฎ AI (Rules Simulator API)**

---

## 1. ข้อมูลพื้นฐาน (Base URL & Headers)
* **Base URL:** `/api/v1`
* **WebSocket URL:** `ws://api.domain.com/ws`
* **Authentication:** Bearer Token (JWT) ผ่าน Header `Authorization: Bearer <token>`

---

## 2. กลุ่ม API: การพรีวิว Diff และการบันทึกเอกสารทั้งฉบับ (Whole-Document Save & Diff)

### 2.1 พรีวิว Diff ทั้งเอกสารก่อนกดยืนยัน (Diff Preview API)
* **`POST /api/v1/projects/{project_id}/resources/{resource_id}/diff-preview`**
  - ส่งร่างข้อความใหม่ทั้งเอกสารไปเปรียบเทียบกับเวอร์ชันที่บันทึกล่าสุด
  - **Request Body:**
    ```json
    { "draft_html": "<article><p id='p-001'>ข้อความใหม่...</p></article>" }
    ```
  - **Response (200 OK):**
    ```json
    {
      "diff_unified": "@@ -1,4 +1,4 @@\n-ข้อความเดิม\n+ข้อความใหม่...",
      "added_lines": 3,
      "removed_lines": 1,
      "diff_blocks": [
        { "anchor_id": "p-001", "change_type": "modified", "original": "เดิม", "proposed": "ใหม่" }
      ]
    }
    ```

### 2.2 บันทึกเอกสารทั้งฉบับ และทริกเกอร์ซิงค์ความรู้ทันที (Save Confirmed API)
* **`PUT /api/v1/projects/{project_id}/resources/{resource_id}/save-confirmed`**
  - บันทึกเวอร์ชันใหม่ และส่งเข้าคิว Background Job ทำการ Delta Sync + Contradiction Check ทันที!
  - **Request Body:**
    ```json
    {
      "semantic_html": "<article><p id='p-001'>ข้อความใหม่...</p></article>",
      "raw_text": "ข้อความใหม่...",
      "commit_message": "อัปเดตเงื่อนไขสัญญาฉบับแก้ไขไตรมาส 3"
    }
    ```
  - **Response (200 OK):**
    ```json
    {
      "resource_id": "uuid-res-1",
      "new_version": 2,
      "sync_job_id": "job-delta-sync-123",
      "message": "Resource saved. Incremental delta sync and conflict check enqueued immediately."
    }
    ```

---

## 3. กลุ่ม WebSocket API: การล็อกระดับบล็อกและการเผยแพร่ผลลัพธ์ (Block Lock & Reveal)

* **`WS /ws/projects/{project_id}/resources/{resource_id}?token=<jwt>`**

### 3.1 สัญญาณขอเข้าล็อกบล็อก (Acquire Block Lock)
* **Client ส่ง (Event: `acquire_block_lock`):**
  ```json
  {
    "action": "acquire_block_lock",
    "anchor_id": "p-002",
    "actor_name": "Somchai"
  }
  ```
* **Server บรอดแคสต์หาเพื่อนร่วมทีมในห้อง:**
  ```json
  {
    "event": "block_locked",
    "anchor_id": "p-002",
    "locked_by": "Somchai",
    "is_locked": true
  }
  ```

### 3.2 สัญญาณส่ง Heartbeat ต่ออายุ Lock ทุก 15 วินาที
* **Client ส่ง:**
  ```json
  { "action": "ping_lock_heartbeat", "anchor_id": "p-002" }
  ```
* **Server จัดการ:** ขยายเวลา `EXPIRE lock:{res_id}:{anchor_id} 60` หากขาด Ping เกิน 60 วินาที จะบรอดแคสต์ `block_auto_unlocked`

### 3.3 สัญญาณปลดล็อกและแสดงผลข้อความใหม่ทันทีเมื่อพิมพ์เสร็จ (Reveal on Finish)
* **Client ส่ง (เมื่อผู้ใช้พิมพ์เสร็จ / Unfocus หรือ AI เจนเสร็จ):**
  ```json
  {
    "action": "release_and_reveal_block",
    "anchor_id": "p-002",
    "new_html": "<p id='p-002'>ข้อความใหม่ที่ Somchai แก้ไขเสร็จสมบูรณ์แล้ว</p>",
    "new_raw_text": "ข้อความใหม่ที่ Somchai แก้ไขเสร็จสมบูรณ์แล้ว"
  }
  ```
* **Server บรอดแคสต์หาทุกคนในห้อง (Event: `block_updated`):**
  ```json
  {
    "event": "block_updated",
    "anchor_id": "p-002",
    "updated_html": "<p id='p-002'>ข้อความใหม่ที่ Somchai แก้ไขเสร็จสมบูรณ์แล้ว</p>",
    "is_locked": false
  }
  ```

---

## 4. กลุ่ม API: ระบบตรวจจับข้อเท็จจริงขัดแย้ง (Knowledge Conflicts API)

* **`GET /api/v1/projects/{project_id}/conflicts`**
  - รายการข้อขัดแย้งข้ามไฟล์ที่ AI ตรวจพบ
* **`PATCH /api/v1/projects/{project_id}/conflicts/{conflict_id}`**
  - เปลี่ยนสถานะข้อขัดแย้ง (`unresolved` -> `acknowledged` / `resolved`)

---

## 5. กลุ่ม API: ห้องทดลองกฎ AI (Rules Simulator API)

* **`POST /api/v1/projects/{project_id}/rules/simulate`**
  - ส่งคำถามจำลองเพื่อทดสอบกฎใน Sandbox
