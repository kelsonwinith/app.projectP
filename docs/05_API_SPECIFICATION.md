# RESTful & Streaming API Specification 🔌

เอกสารฉบับนี้กำหนดสเปกของ API สำหรับ **FastAPI Backend** เพื่อให้ **Next.js Frontend** เชื่อมต่อการทำงานได้อย่างราบรื่น รองรับทั้ง JSON REST endpoints, Multipart File Uploads และ Server-Sent Events (SSE) สำหรับ AI Streaming

---

## 1. ข้อมูลพื้นฐาน (Base URL & Headers)
* **Base URL:** `/api/v1`
* **Authentication:** Bearer Token (JWT) ส่งผ่าน Header `Authorization: Bearer <token>`
* **Content-Type:** `application/json` (ยกเว้น File Upload ใช้ `multipart/form-data`)

---

## 2. กลุ่ม API: การจัดการโปรเจกต์และโฟลเดอร์ (Projects & Folders)

### 2.1 สร้างและดึงข้อมูลโปรเจกต์
* **`GET /api/v1/projects`**
  - ดึงรายการโปรเจกต์ทั้งหมดที่ผู้ใช้เป็นเจ้าของหรือสมาชิก
* **`POST /api/v1/projects`**
  - สร้างโปรเจกต์ใหม่ (เริ่มต้นด้วยความว่างเปล่า: Resource 0, Knowledge 0)
  - **Body:**
    ```json
    {
      "name": "AI Oncology Research",
      "description": "การศึกษาโมเดลวิเคราะห์มะเร็ง",
      "domain_metadata": { "domain": "healthcare", "language": "th" }
    }
    ```
* **`GET /api/v1/projects/{project_id}`**
  - ดึงรายละเอียดโปรเจกต์, จำนวน Resource, สถิติของ Knowledge Graph และ Glossary

### 2.2 การจัดการโครงสร้างโฟลเดอร์ (Folder Hierarchy)
* **`GET /api/v1/projects/{project_id}/folders/tree`**
  - ดึงโครงสร้างโฟลเดอร์ทั้งหมดแบบ Nested Tree Hierarchy พร้อมจำนวนไฟล์ในแต่ละโฟลเดอร์
* **`POST /api/v1/projects/{project_id}/folders`**
  - สร้างโฟลเดอร์ใหม่ (กำหนด `parent_id` เป็น null สำหรับ Root หรือระบุ UUID สำหรับ Sub-folder)
* **`PATCH /api/v1/projects/{project_id}/folders/{folder_id}`**
  - ย้ายโฟลเดอร์ หรือเปลี่ยนชื่อ

---

## 3. กลุ่ม API: ทรัพยากรและการนำเข้า (Resources & Ingestion)

### 3.1 อัปโหลดไฟล์เอกสาร (DOCX, PDF, TXT, MD)
* **`POST /api/v1/projects/{project_id}/resources/upload`**
  - **Content-Type:** `multipart/form-data`
  - **Form Data:**
    - `file`: ไฟล์ไบนารี (`.docx`, `.pdf`, `.txt`, `.md`)
    - `folder_id`: UUID ของโฟลเดอร์ปลายทาง (Optional)
  - **Response (202 Accepted):**
    ```json
    {
      "resource_id": "8fa21e64-...",
      "status": "pending",
      "message": "File received. Background ingestion job queued."
    }
    ```

### 3.2 นำเข้าผ่าน URL (Web Scrape)
* **`POST /api/v1/projects/{project_id}/resources/url`**
  - **Body:**
    ```json
    {
      "url": "https://example.com/research-paper",
      "folder_id": "Optional UUID"
    }
    ```

### 3.3 เรียกดูเนื้อหาเอกสาร (Semantic HTML Reader View)
* **`GET /api/v1/projects/{project_id}/resources/{resource_id}`**
  - ส่งกลับข้อมูลสำหรับเรนเดอร์ใน Reader Mode:
  - **Response:**
    ```json
    {
      "id": "8fa21e64-...",
      "name": "Clinical_Trial_Phase1.docx",
      "file_type": "docx",
      "status": "ready",
      "table_of_contents": [
        { "level": 1, "title": "1. Introduction", "anchor_id": "sec-1" },
        { "level": 2, "title": "1.1 Background", "anchor_id": "sec-1-1" }
      ],
      "semantic_html": "<article><h1 id='sec-1'>1. Introduction</h1><p id='p-001'>...</p></article>"
    }
    ```

---

## 4. กลุ่ม API: ศูนย์รวมองค์ความรู้ (Knowledge Hub)

### 4.1 Living Project Glossary (คำศัพท์เฉพาะทาง)
* **`GET /api/v1/projects/{project_id}/glossaries`**
  - ค้นหาและดึงรายการคำศัพท์ (รองรับ Search Query, Pagination, Filter Verified/Unverified)
* **`POST /api/v1/projects/{project_id}/glossaries`**
  - เพิ่มคำศัพท์ใหม่ด้วยตนเอง (Manual addition)
* **`PATCH /api/v1/projects/{project_id}/glossaries/{glossary_id}`**
  - อัปเดตคำนิยาม หรือกดยืนยันตรวจทาน (`is_verified: true`)

### 4.2 Interactive Knowledge Graph
* **`GET /api/v1/projects/{project_id}/knowledge-graph`**
  - ดึงข้อมูลโหนดและเส้นเชื่อมสำหรับแสดงผลใน GUI (Cytoscape / React Flow):
  - **Response:**
    ```json
    {
      "nodes": [
        { "id": "uuid-1", "label": "Immunotherapy", "type": "CONCEPT", "summary": "Cancer treatment..." },
        { "id": "uuid-2", "label": "Trial_Phase1.docx", "type": "SOURCE_DOC", "summary": "Primary trial report" }
      ],
      "edges": [
        { "id": "uuid-e1", "source": "uuid-2", "target": "uuid-1", "relation": "defines" }
      ]
    }
    ```

### 4.3 Knowledge Syntheses & Summaries
* **`GET /api/v1/projects/{project_id}/syntheses`**
  - ดึงรายการสรุปภาพรวมโปรเจกต์ที่ AI สังเคราะห์ขึ้นมา

---

## 5. กลุ่ม API: กฎควบคุมพฤติกรรม AI (Project Rules Engine)

* **`GET /api/v1/projects/{project_id}/rules`**
  - รายการกฎทั้งหมดในโปรเจกต์
* **`POST /api/v1/projects/{project_id}/rules`**
  - สร้างกฎใหม่:
    ```json
    {
      "name": "Strict Citation & Official Tone",
      "rule_type": "do",
      "instruction": "ต้องอ้างอิงรหัสย่อหน้า [Ref: doc_name #p-id] ทุกครั้ง และตอบด้วยภาษาทางการเท่านั้น",
      "is_active": true
    }
    ```
* **`PATCH /api/v1/projects/{project_id}/rules/{rule_id}/toggle`**
  - เปิดหรือปิดการทำงานของกฎ (Toggle Active/Inactive)

---

## 6. กลุ่ม API: การสนทนาและสร้างสรรค์ (AI Chat & Generative Engine)

### 6.1 รับ Session สนทนาประจำตัว (1-User-1-Session per Project)
* **`GET /api/v1/projects/{project_id}/chat/session`**
  - ดึงประวัติและสถานะ Session ของผู้ใช้รายนั้น (หากยังไม่มี ระบบจะสร้างให้อัตโนมัติ 1 Session)
  - ตอบกลับพร้อมประวัติข้อความย้อนหลัง

### 6.2 ส่งข้อความและรับคำตอบแบบ Real-time Stream (SSE)
* **`POST /api/v1/projects/{project_id}/chat/messages`**
  - **Request Body:**
    ```json
    {
      "message": "ช่วยสรุปข้อเปรียบเทียบผลการรักษาจากโฟลเดอร์ Phase 1",
      "context_scope": {
        "folder_ids": ["uuid-folder-phase1"],
        "resource_ids": []
      }
    }
    ```
  - **Response (Server-Sent Events: text/event-stream):**
    ```
    event: delta
    data: {"token": "จากการ"}

    event: delta
    data: {"token": "วิเคราะห์..."}

    event: citation
    data: {"citations": [{"resource_id": "uuid-doc", "name": "Trial.docx", "anchor_id": "p-012"}]}

    event: done
    data: {"message_id": "uuid-msg-123"}
    ```

### 6.3 คำสั่งสร้างเอกสารใหม่จาก AI (Save Generative Artifact to Resource)
* **`POST /api/v1/projects/{project_id}/resources/create-from-ai`**
  - นำผลลัพธ์ที่ AI สร้างในแชท บันทึกเป็นเอกสารชิ้นใหม่ใน Resource Folder ทันที
  - **Request Body:**
    ```json
    {
      "folder_id": "uuid-folder-target",
      "name": "Comparative_Analysis_Report.md",
      "content": "# บทวิเคราะห์เปรียบเทียบ...\n\nเนื้อหาที่ AI สังเคราะห์...",
      "source_chat_message_id": "uuid-msg-123"
    }
    ```
  - **Response:** เอกสารใหม่ถูกแปลงเป็น Semantic HTML และส่งให้ Background Job อัปเดต Knowledge Graph ทันที
