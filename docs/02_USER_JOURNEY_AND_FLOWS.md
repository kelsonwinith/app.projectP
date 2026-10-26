# User Journey & Interaction Workflows 🗺️

เอกสารฉบับนี้อธิบายเส้นทางประสบการณ์ผู้ใช้ (User Journey) และแผนภาพลำดับขั้นตอนการทำงาน (Sequence & Flowcharts) ฉบับปรับปรุง เพื่อรองรับ **In-Place Editable HTML Viewers**, **ระบบกดยืนยันบันทึกแบบ Explicit Save**, **Human-in-the-Loop AI Proposal Review**, **Real-time Multiplayer Collaboration** และ **Full Audit Trail**

---

## 1. ผังรวมขั้นตอนการแก้ไขและการร่วมมือกัน (Collaborative Editing Flow)

```mermaid
flowchart TD
    subgraph CollaborativeSession[1. เข้าสู่หน้าแก้ไข Resource แบบ Real-time]
        Open[User เปิดดู Resource] --> WS[เชื่อมต่อ WebSocket Presence Gateway]
        WS --> Cursor[เห็น Live Cursors ของเพื่อนร่วมทีม & ตำแหน่งที่กำลังโฟกัส]
    end

    subgraph UserEditing[2. การแก้ไขด้วยตนเอง Manual Editing]
        Cursor --> Type[User พิมพ์แก้ไขข้อความ/ตาราง/สไลด์]
        Type --> Unsaved[แสดงสถานะ Unsaved Changes]
        Unsaved --> ClickSave[User กดปุ่ม 'บันทึกการเปลี่ยนแปลง']
        ClickSave --> Modal[Confirmation Modal: กรอก Commit Message]
        Modal --> Confirmed[กดยืนยันการบันทึก]
        Confirmed --> Audit[บันทึกลง Version History & Audit Log]
        Confirmed --> BGJob[ทริกเกอร์ Background Job อัปเดต Knowledge]
    end

    subgraph AIProposal[3. การแก้ไขผ่าน AI Agent]
        Chat[User สั่ง AI ใน Private Chat: 'ช่วยแก้ข้อความนี้'] --> AIStream[AI สตรีม Proposed Changes]
        AIStream --> LockUI[แสดงป้าย AI Presence เหนือย่อหน้าเป้าหมาย]
        LockUI --> DiffView[แสดง Diff Preview: แดง=เดิม, เขียว=ใหม่]
        DiffView --> Decision{User เจ้าของ Agent ตัดสินใจ}
        Decision -- ❌ Reject --> Revert[ยกเลิกข้อเสนอ คืนค่าเดิม]
        Decision -- ✅ Confirm Change --> CommitAI[บันทึกลง Shared Resource พร้อม Audit Log]
        CommitAI --> BGJob
    end
```

---

## 2. ลำดับขั้นตอนการทำงานอย่างละเอียด (Detailed Workflows)

### 2.1 โฟลว์การแก้ไขเอกสารด้วยตนเอง และการกดยืนยันบันทึก (Explicit Save Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as สมาชิกผู้แก้ไข (User A)
    actor Team as เพื่อนร่วมทีม (User B)
    participant UI as Next.js Editor
    participant WS as WebSocket Collaboration Server
    participant API as FastAPI Backend
    participant DB as PostgreSQL
    participant Worker as Background Worker

    User->>UI: เปิดดูเอกสาร "architecture_spec.docx"
    UI->>WS: เชื่อมต่อ Room (resource_id)
    WS-->>Team: บรอดแคสต์: User A กำลังดูเอกสารนี้

    User->>UI: พิมพ์แก้ไขย่อหน้าที่ 2
    UI->>WS: อัปเดตพิกัด Live Cursor และตำแหน่งกำลังพิมพ์
    WS-->>Team: แสดง Cursor ของ User A พร้อมกรอบสีรอบย่อหน้าที่ 2

    Note over UI,User: UI แสดงสถานะ "Unsaved Changes" (ยังไม่บันทึกอัตโนมัติ)
    User->>UI: คลิกปุ่ม "💾 บันทึกการเปลี่ยนแปลง"
    UI->>User: เปิด Modal: "ยืนยันการบันทึก พร้อมระบุบันทึกย่อ (Commit Note)"
    User->>UI: กรอกบันทึก: "ปรับปรุงข้อกำหนด Database" และกดยืนยัน

    UI->>API: PUT /api/v1/projects/{id}/resources/{res_id} (พร้อม HTML ใหม่ + Commit Note)
    API->>DB: บันทึกข้อมูลลง resources (shared)
    API->>DB: บันทึกประวัติลง resource_versions และ resource_audit_logs
    API->>Worker: Enqueue งาน Background Sync Knowledge (Glossary & Graph)
    API-->>UI: ยืนยันบันทึกสำเร็จ (200 OK)
    
    WS-->>Team: บรอดแคสต์: เอกสารอัปเดตเวอร์ชันใหม่แล้ว
    Worker->>DB: สกัดคำศัพท์ใหม่ และอัปเดต Knowledge Graph ในพื้นหลัง
    Worker-->>UI: แจ้งเตือน: องค์ความรู้ใน Knowledge Hub อัปเดตเรียบร้อย
```

---

### 2.2 โฟลว์การตรวจทานการแก้ไขจาก AI Agent (Human-in-the-Loop Review Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as สมาชิกผู้สั่ง AI (User A)
    actor Team as เพื่อนร่วมทีม (User B)
    participant UI as Next.js Workspace
    participant WS as WebSocket Gateway
    participant API as FastAPI Backend
    participant LLM as AI Engine

    User->>UI: สั่งในช่องแชท: "ช่วยเขียนย่อหน้าข้อสรุปใหม่ให้เป็นทางการขึ้น"
    UI->>API: POST /api/v1/chat/propose-edit
    API->>LLM: ประมวลผลร่างข้อความใหม่
    
    UI->>WS: ส่งสัญญาณ AI Presence: User A's Agent กำลังแก้ข้อสรุป
    WS-->>Team: แสดงป้าย "🤖 AI ของ User A กำลังเรียบเรียงข้อความนี้..."

    LLM-->>UI: ส่งผลลัพธ์ข้อความที่แก้ไขกลับมา
    UI->>UI: เรนเดอร์แท่นตรวจทาน (Inline Diff Preview Bar)
    Note over UI,User: แสดงข้อความเดิมขีดฆ่าสีแดง + ข้อความใหม่ไฮไลต์สีเขียว<br/>พร้อมปุ่ม [Confirm Changes] และ [Discard]

    alt ผู้ใช้กด "Confirm Changes"
        User->>UI: คลิก "✅ Confirm Changes"
        UI->>API: POST /api/v1/resources/{id}/proposals/accept
        API->>API: บันทึกข้อความใหม่ลง Resource
        API->>API: เพิ่ม Audit Log: "User A (via AI Agent) ปรับปรุงย่อหน้าข้อสรุป"
        API-->>UI: ยืนยันสำเร็จ และปลดสถานะ AI Presence
        WS-->>Team: บรอดแคสต์: User A ได้ยอมรับการแก้ไขจาก AI เรียบร้อย
    else ผู้ใช้กด "Discard"
        User->>UI: คลิก "❌ Discard"
        UI->>UI: คืนค่าข้อความดั้งเดิม และปลดแถบ AI Presence
    end
```

---

### 2.3 โฟลว์การดูประวัติการแก้ไขและ Audit Log (Version History & Rollback)

```mermaid
sequenceDiagram
    autonumber
    actor User as สมาชิกในทีม
    participant UI as Next.js History Panel
    participant API as FastAPI Backend
    participant DB as PostgreSQL

    User->>UI: คลิกแท็บ "ประวัติการแก้ไข (Audit & History)" ในหน้าเอกสาร
    UI->>API: GET /api/v1/projects/{id}/resources/{res_id}/versions
    API->>DB: ดึงรายการเวอร์ชันทั้งหมด (v1.0, v1.1, v1.2) พร้อมชื่อผู้แก้และ Audit Log
    API-->>UI: คืนค่า Version List
    
    UI->>User: แสดง Timeline ประวัติการแก้ไข
    User->>UI: คลิกเลือก "ดูเปรียบเทียบ v1.0 กับ v1.2"
    UI->>API: GET /api/v1/projects/{id}/resources/{res_id}/diff?v_from=1.0&v_to=1.2
    API-->>UI: คืนค่า Side-by-side Diff JSON
    UI->>User: เรนเดอร์หน้าจอเปรียบเทียบสิ่งที่เพิ่ม/ลบ
    
    opt ต้องการย้อนกลับ (Rollback)
        User->>UI: คลิกปุ่ม "ย้อนกลับสู่เวอร์ชัน v1.0"
        UI->>User: แสดง Modal ยืนยันการ Rollback
        User->>UI: กดยืนยัน
        UI->>API: POST /api/v1/projects/{id}/resources/{res_id}/rollback
        API-->>UI: สร้างเวอร์ชันใหม่ที่เป็นเนื้อหาของ v1.0 พร้อม Audit Log: "Rollback by User"
    end
```
