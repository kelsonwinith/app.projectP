# User Journey & System Interaction Flows 🗺️

เอกสารฉบับนี้อธิบายเส้นทางประสบการณ์ผู้ใช้ (User Journey) และแผนภาพลำดับขั้นตอนการทำงาน (Sequence & Flowcharts) ของระบบ **CogniNest** ที่ครอบคลุมการแปลงข้อมูลหลากฟอร์แมต (Docs, Slides, Sheets, Graphs, Images with AI Vision), เมนูลอยเมื่อคลุมดำข้อความ, ระบบลบ Resource พร้อมวิเคราะห์ผลกระทบ และการทำงานร่วมกันแบบ Shared Knowledge & Private Chat

---

## 1. ผังวงจรชีวิตของระบบ (System Lifecycle Overview)

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. สร้างโปรเจกต์ใหม่ (เริ่มต้นด้วยความว่างเปล่า)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. นำเข้าไฟล์หลากรูปแบบ (Any Files: DOCX, PDF, PPTX, XLSX, Images...)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. Background Job Pipeline ทำงานอัตโนมัติ                              │
│    - แปลงข้อมูลเป็น Semantic HTML (Doc, Slide, Sheet, Graph, Vision)   │
│    - ฝัง Universal Anchor IDs (p-xxx, slide-xx, cell-xx)               │
│    - สกัด Living Glossary + Interactive Knowledge Graph                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. สมาชิกทีมใช้งานร่วมกันบน Shared Knowledge                           │
│    - อ่านเอกสาร HTML ผ่าน Reader View                                  │
│    - คลุมดำข้อความเพื่อส่งเข้าแชท หรือสร้าง Glossary Term ทันที         │
│    - ดูโหนดสัมพันธ์ใน Knowledge Graph                                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. การทำงานกับ AI ส่วนบุคคล (Private 1-User-1-Session)                │
│    - ถามตอบคำถามโดยมี Citation ย้อนกลับไปยังพิกัดต้นทาง                │
│    - สั่ง AI สร้างเอกสารใหม่ แล้วกดบันทึกเข้าสู่โฟลเดอร์ส่วนกลาง       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 6. การจัดการและลบข้อมูลอย่างปลอดภัย (Impact-Aware Deletion)            │
│    - คำนวณผลกระทบต่อ Glossary, Graph และ Syntheses ก่อนยืนยันลบ        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. แผนภาพและขั้นตอนการทำงานอย่างละเอียด (Detailed Workflows)

### 2.1 โฟลว์การนำเข้าไฟล์หลากรูปแบบและ AI Vision Ingestion

```mermaid
sequenceDiagram
    autonumber
    actor User as ผู้ใช้ (Frontend)
    participant API as FastAPI Backend
    participant Worker as Background Worker
    participant Vision as AI Vision Service
    participant LLM as AI Knowledge Extractor
    participant DB as PostgreSQL

    User->>API: อัปโหลดไฟล์ (DOCX / PPTX / XLSX / PNG Image)
    API->>DB: สร้าง Resource (status="processing")
    API->>Worker: Enqueue Ingestion Job (resource_id)
    API-->>User: 202 Accepted (UI แสดงแท่งประมวลผล)

    activate Worker
    alt กรณีเป็นไฟล์รูปภาพ (PNG / JPG)
        Worker->>Vision: ส่งภาพเพื่อวิเคราะห์องค์ประกอบและข้อความ
        Vision-->>Worker: Dense Semantic Description (คำบรรยายภาพเชิงลึก)
        Worker->>Worker: สร้าง HTML View (รูปต้นฉบับ + คำบรรยายประกอบ)
    else กรณีเป็น Spreadsheet (XLSX / CSV)
        Worker->>Worker: แปลงเป็น Interactive Data Table HTML (พิกัด row/col)
    else กรณีเป็น Presentation (PPTX)
        Worker->>Worker: แปลงเป็น Slide Deck HTML (พิกัด slide-1, slide-2)
    else กรณีเป็น Text/Doc (DOCX / PDF / MD)
        Worker->>Worker: แปลงเป็น Semantic Document HTML (พิกัด p-001, p-002)
    end

    Worker->>DB: บันทึก HTML Content + Chunks + Anchor IDs
    
    Note over Worker,LLM: เริ่มกระบวนการสกัดความรู้อัตโนมัติ (Shared Knowledge)
    Worker->>LLM: สกัดคำศัพท์เฉพาะ (Glossary Extraction)
    LLM-->>Worker: รายการคำศัพท์ + นิยาม
    Worker->>DB: Upsert ลงตาราง Project Glossaries

    Worker->>LLM: สกัดความสัมพันธ์ Entities & Concepts
    LLM-->>Worker: Nodes & Edges
    Worker->>DB: Upsert ลงตาราง Knowledge Graph

    Worker->>DB: ปรับสถานะ Resource เป็น "ready"
    deactivate Worker
    
    Worker->>User: ส่งแจ้งเตือน WebSocket: "ประมวลผลเสร็จสิ้น & Knowledge อัปเดตแล้ว"
```

---

### 2.2 โฟลว์เมนูลอยเมื่อคลุมดำข้อความใน Reader View (Floating Selection Action)

```mermaid
flowchart TD
    A[ผู้ใช้เปิดอ่านเอกสารใน Reader Mode] --> B[ใช้เมาส์ลากคลุมดำข้อความบนหน้าจอ]
    B --> C[ระบบตรวจจับ Selection Event]
    C --> D[แสดง Floating Toolbar เหนือข้อความที่คลุมดำ]
    
    D --> E1[ปุ่ม: 💬 ส่งเข้าแชท AI]
    D --> E2[ปุ่ม: 📖 เพิ่มเป็น Glossary Term]
    D --> E3[ปุ่ม: 🖍️ ไฮไลต์ / โน้ต]

    E1 --> F1[ข้อความถูก Paste ลงใน Chat Input ทันที พร้อมแท็กพิกัดอ้างอิง]
    E2 --> F2[เปิด Modal สร้างคำศัพท์ นำข้อความที่คลุมดำเป็นคำศัพท์ และให้ AI เติมนิยามให้อัตโนมัติ]
    E3 --> F3[บันทึกสีไฮไลต์ลงในบัญชีผู้ใช้]
```

---

### 2.3 โฟลว์การลบ Resource พร้อมวิเคราะห์ผลกระทบ (Impact-Aware Deletion Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as ผู้ใช้
    participant UI as Next.js Frontend
    participant API as FastAPI Backend
    participant DB as PostgreSQL

    User->>UI: คลิกปุ่ม "ลบเอกสาร" (Delete Resource)
    UI->>API: GET /api/v1/projects/{id}/resources/{resource_id}/impact
    activate API
    API->>DB: ตรวจสอบ Glossary Terms ที่อ้างอิงเอกสารนี้
    API->>DB: ตรวจสอบ Knowledge Graph Nodes/Edges ที่ผูกอยู่
    API->>DB: ตรวจสอบ AI Syntheses ที่ใช้เอกสารนี้
    API-->>UI: ส่งรายงานผลกระทบ (Impact Report)
    deactivate API

    UI->>UI: แสดง Warning Modal แจ้งเตือน:\n- คำศัพท์ 5 คำจะกลายเป็น Orphaned\n- โหนดใน Graph 8 โหนดจะถูกลบ\nให้ผู้ใช้เลือกว่าจะลบหรือคงคำศัพท์ไว้
    
    User->>UI: กดยืนยันการลบ (Confirm Deletion)
    UI->>API: DELETE /api/v1/projects/{id}/resources/{resource_id}?retain_glossary=true
    API->>DB: ลบ Resource + ทำความสะอาด Graph และปรับสถานะ Glossary
    API-->>UI: 200 OK (Resource ถูกลบ, Knowledge อัปเดตทันที)
    UI-->>User: แสดงการแจ้งเตือนสำเร็จ
```

---

### 2.4 โฟลว์การอ้างอิงแหล่งที่มาสากล (Universal Citation Navigation)

```mermaid
flowchart LR
    A[AI ตอบข้อความในแชท] --> B[ท้ายประโยคมีป้ายอ้างอิง เช่น Ref: budget.xlsx #sheet1-R5C3]
    B --> C[ผู้ใช้คลิกที่ป้าย Ref]
    C --> D[ระบบเปิดหน้าต่าง Reader View ของไฟล์ budget.xlsx ในรูปแบบ Table HTML]
    D --> E[เลื่อนหน้าจออัตโนมัติไปยังแถว 5 คอลัมน์ 3]
    E --> F[ช่องตารางนั้นจะกะพริบแสงไฮไลต์สีเหลืองให้เห็นชัดเจนทันที]
```
