# RESTful & Streaming API Specification 🔌

เอกสารฉบับนี้กำหนดสเปกของ API สำหรับ **FastAPI Backend** เพื่อให้ **Next.js Frontend** เชื่อมต่อการทำงานได้อย่างสมบูรณ์แบบ ครอบคลุมระบบบันทึกแบบกดยืนยัน (Explicit Save), การตรวจทานข้อเสนอจาก AI (AI Proposal Diff Review), ประวัติเวอร์ชันและ Audit Log, และ WebSocket สำหรับ Real-time Presence

---

## 1. ข้อมูลพื้นฐาน (Base URL & Headers)
* **Base URL:** `/api/v1`
* **WebSocket URL:** `ws://api.domain.com/ws`
* **Authentication:** Bearer Token (JWT) ส่งผ่าน Header `Authorization: Bearer <token>` หรือ Query Param สำหรับ WebSocket

---

## 2. กลุ่ม API: การแก้ไข การบันทึก และการตรวจสอบ (Editing, Save & Audit)

### 2.1 บันทึกการแก้ไขแบบกดยืนยัน (Explicit Save & Commit)
* **`PUT /api/v1/projects/{project_id}/resources/{resource_id}/save-confirmed`**
  - บันทึกการเปลี่ยนแปลงจาก In-place Editor โดยต้องมี Commit Message เสมอ
  - ทริกเกอร์ Background Job เพื่อ Sync Knowledge Hub อัตโนมัติ
  - **Request Body:**
    ```json
    {
      "semantic_html": "<article><p id='p-001'>ข้อความที่แก้ไขใหม่...</p></article>",
      "raw_text": "ข้อความที่แก้ไขใหม่...",
      "commit_message": "แก้ไขส่วนบทนำและอัปเดตสถิติล่าสุด"
    }
    ```
  - **Response (200 OK):**
    ```json
    {
      "resource_id": "8fa21e64-...",
      "current_version": 2,
      "message": "Resource saved and version 2 committed. Knowledge sync job enqueued."
    }
    ```

### 2.2 การตรวจทานข้อเสนอแนะจาก AI (Human-in-the-Loop Proposal Review)
* **`POST /api/v1/projects/{project_id}/resources/{resource_id}/proposals/{proposal_id}/accept`**
  - ผู้ใช้เจ้าของ AI กดยอมรับการแก้ไขของ AI นำผลลัพธ์บันทึกลง Resource ทันที
  - **Response (200 OK):**
    ```json
    {
      "status": "accepted",
      "new_version": 3,
      "audit_log_id": "uuid-audit-123"
    }
    ```
* **`POST /api/v1/projects/{project_id}/resources/{resource_id}/proposals/{proposal_id}/reject`**
  - ผู้ใช้ปฏิเสธข้อเสนอแนะของ AI คืนค่าเนื้อหาดั้งเดิม

### 2.3 ประวัติเวอร์ชันและบันทึกการตรวจสอบ (Version History & Audit Trail)
* **`GET /api/v1/projects/{project_id}/resources/{resource_id}/versions`**
  - ดึงรายการเวอร์ชันทั้งหมด (v1, v2, ...) พร้อม Commit Message และชื่อผู้บันทึก
* **`GET /api/v1/projects/{project_id}/resources/{resource_id}/diff?v_from=1&v_to=2`**
  - ส่งกลับข้อมูลการเปรียบเทียบความต่าง (Diff JSON) ระหว่าง 2 เวอร์ชัน
* **`POST /api/v1/projects/{project_id}/resources/{resource_id}/rollback`**
  - ย้อนกลับสู่เวอร์ชันที่ระบุ:
    ```json
    { "target_version": 1, "commit_message": "Rollback to version 1 due to error in v2" }
    ```
* **`GET /api/v1/projects/{project_id}/resources/{resource_id}/audit-logs`**
  - รายการบันทึกการตรวจสอบทุกความเคลื่อนไหว (CREATED, MANUAL_EDIT, AI_EDIT, ROLLBACK)
  - *(ข้อยกเว้น: การสนทนาถามตอบใน Private Chat จะไม่แสดงในนี้)*

---

## 3. กลุ่ม API: Real-time Presence & Collaboration (WebSocket)

* **`WS /ws/projects/{project_id}/resources/{resource_id}?token=<jwt>`**
  - เชื่อมต่อห้องแก้ไขแบบ Real-time
  - **Client ส่ง (Event: cursor_move / active_focus):**
    ```json
    {
      "type": "presence_update",
      "anchor_id": "p-014",
      "cursor_offset": 5,
      "is_typing": true
    }
    ```
  - **Server บรอดแคสต์ (Event: peer_presence):**
    ```json
    {
      "type": "peer_state",
      "peers": [
        {
          "user_id": "uuid-user-b",
          "user_name": "Somsak",
          "user_color": "#10B981",
          "anchor_id": "p-014",
          "ai_agent": { "is_active": false }
        },
        {
          "user_id": "uuid-user-a",
          "user_name": "Somchai",
          "user_color": "#6366F1",
          "anchor_id": "p-002",
          "ai_agent": {
            "is_active": true,
            "action": "กำลังเขียนย่อหน้าข้อสรุป..."
          }
        }
      ]
    }
    ```

---

## 4. กลุ่ม API: ทรัพยากรและฟอร์แมตข้อมูล (Resources & Viewers)

* **`POST /api/v1/projects/{project_id}/resources/upload`** (Multipart File Upload ทุกชนิด)
* **`GET /api/v1/projects/{project_id}/resources/{resource_id}`** (ดึง HTML พร้อมสิทธิ์แก้ไข)
* **`GET /api/v1/projects/{project_id}/resources/{resource_id}/deletion-impact`** (ประเมินผลกระทบก่อนลบ)
* **`DELETE /api/v1/projects/{project_id}/resources/{resource_id}?retain_knowledge=true`** (ลบไฟล์)

---

## 5. กลุ่ม API: ไฮไลต์และ Living Knowledge Hub (Shared)

* **`POST /api/v1/projects/{project_id}/resources/{resource_id}/annotations`** (บันทึกไฮไลต์สี/โน้ต)
* **`GET /api/v1/projects/{project_id}/glossaries`** (Living Glossary)
* **`GET /api/v1/projects/{project_id}/knowledge-graph`** (โหนดและเส้นเชื่อมสำหรับ GUI)
* **`POST /api/v1/projects/{project_id}/knowledge-graph/reason-nodes`** (สั่ง AI วิเคราะห์ความสัมพันธ์ระหว่าง 2 โหนด)
* **`GET /api/v1/projects/{project_id}/rules`** & **`POST /api/v1/projects/{project_id}/rules`** (Rules Engine)

---

## 6. กลุ่ม API: แชทส่วนบุคคลและสร้างเอกสาร (Private Chat & Generative)

* **`GET /api/v1/projects/{project_id}/chat/session`** (Session ส่วนบุคคล 1 คนต่อ 1 Session)
* **`POST /api/v1/projects/{project_id}/chat/messages`** (SSE Real-time Streaming พร้อม Citations)
* **`POST /api/v1/projects/{project_id}/chat/propose-edit`** (สั่ง AI ร่างข้อความใหม่เพื่อสร้าง Pending Proposal)
* **`POST /api/v1/projects/{project_id}/resources/create-from-ai`** (นำคำตอบในแชทบันทึกเป็น Shared Resource ใหม่)
