# User Journey & Interaction Workflows 🗺️

เอกสารฉบับนี้อธิบายเส้นทางประสบการณ์ผู้ใช้ (User Journey) และแผนภาพลำดับขั้นตอนการทำงาน (Sequence & Flowcharts) ฉบับปรับปรุง เพื่อรองรับ **Block-Level Exclusive Locking ระบุตัวตนผู้ล็อก (Private Typing -> Broadcast เมื่อเสร็จ)**, **Whole-Document Save พร้อม Diff Modal**, และ **Save-Triggered Delta Sync & Conflict Detector**

---

## 1. ลำดับการล็อกระดับบล็อก และการแสดงผลเมื่อพิมพ์เสร็จ (Block Lock & Reveal Flow)

```mermaid
sequenceDiagram
    autonumber
    actor UserA as ผู้แก้ไข / AI Agent (User A)
    actor UserB as เพื่อนร่วมทีม (User B)
    participant UI_A as Next.js (User A)
    participant UI_B as Next.js (User B)
    participant WS as WebSocket Server
    participant Redis as Redis Lock Store

    UserA->>UI_A: เริ่มแก้ไขบล็อก <p id="p-002"> (หรือสั่ง AI Agent แก้)
    UI_A->>WS: acquire_block_lock(res_id, "p-002", actor="User A")
    WS->>Redis: SET lock:res_id:p-002 "User A" EX 60
    WS-->>UI_B: บรอดแคสต์: บล็อก "p-002" ถูกล็อกโดย: User A (แสดงแถบสีส้มระบุชื่อ)
    
    Note over UI_B,UserB: User B เห็นป้ายว่า User A กำลังแก้<br/>แต่ "ไม่เห็น" ตัวหนังสือวิ่งสดๆ (Private Typing)

    UserA->>UI_A: พิมพ์ข้อความจนเสร็จเรียบร้อย (หรือ AI ร่างข้อความเสร็จ)
    UserA->>UI_A: คลิกออกจากบล็อก (Unfocus / Blur)
    
    UI_A->>WS: release_and_reveal_block(res_id, "p-002", new_html="...")
    WS->>Redis: DEL lock:res_id:p-002
    WS-->>UI_B: ส่งข้อความใหม่ของบล็อก "p-002" + ปลดล็อกสถานะ
    
    Note over UI_B,UserB: บล็อก "p-002" บนหน้าจอของ User B<br/>เปลี่ยนเป็นข้อความใหม่ทันทีอย่างราบรื่น
```

---

## 2. ลำดับการบันทึกเอกสารทั้งฉบับ และการซิงค์ความรู้ (Save Resource & Delta Sync Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as สมาชิกผู้บันทึก
    participant UI as Next.js Editor
    participant API as FastAPI Backend
    participant Worker as Background Worker
    participant DB as PostgreSQL

    Note over User,UI: แก้ไขบล็อกต่างๆ จนพอใจแล้ว (เนื้อหาใหม่แสดงบนหน้าจอครบถ้วน)
    User->>UI: คลิกปุ่ม "💾 บันทึกเอกสาร (Save Resource)"
    
    UI->>API: POST /api/v1/projects/{id}/resources/{res_id}/diff-preview
    API-->>UI: คืนค่า Full Document Diff (ข้อความเดิม vs ข้อความใหม่ทั้งเอกสาร)
    
    UI->>User: เปิด Modal แสดงภาพรวม Diff (แดง=ตัดออก, เขียว=เพิ่มเข้า)
    Note over UI,User: ผู้ใช้ตรวจทานความถูกต้องทั้งเอกสาร และกรอก Commit Message
    User->>UI: คลิกปุ่ม "✅ ยืนยันการบันทึก"
    
    UI->>API: PUT /api/v1/projects/{id}/resources/{res_id}/save-confirmed
    API->>DB: บันทึกเวอร์ชันใหม่ลง resources, resource_versions, resource_audit_logs
    API->>Worker: Enqueue งาน Delta Sync + Conflict Detection ทันที!
    API-->>UI: ยืนยันบันทึกสำเร็จ (200 OK)
    
    activate Worker
    Worker->>Worker: สกัด Living Glossary และ Knowledge Graph เฉพาะส่วนต่าง (Delta)
    Worker->>Worker: รัน Contradiction Detector ตรวจหาข้อเท็จจริงขัดแย้งกับไฟล์อื่น
    opt พบข้อเท็จจริงขัดแย้ง
        Worker->>DB: บันทึก Alert ลงตาราง knowledge_conflicts
        Worker-->>UI: ส่งแจ้งเตือน WebSocket: "⚠️ พบข้อเท็จจริงขัดแย้งกับไฟล์ XYZ"
    end
    deactivate Worker
    
    Worker-->>UI: แจ้งเตือน: Knowledge Hub อัปเดตข้อมูลล่าสุดเรียบร้อย
```

---

## 3. ลำดับการทำงานของ Contradiction & Conflict Detector

```mermaid
flowchart TD
    A[Background Job เริ่มประมวลผลหลังบันทึกไฟล์ใหม่] --> B[สกัดข้อเท็จจริงสำคัญ Claims จากเนื้อหาใหม่]
    B --> C[ค้นหา Chunks ที่เกี่ยวข้องในเอกสารอื่นๆ ด้วย Vector Similarity]
    C --> D[ส่งข้อเท็จจริงคู่ขนานเข้า LLM Cross-Verification]
    
    D --> E{ข้อมูลตรงกันหรือขัดแย้งกัน?}
    E -- ข้อมูลสอดคล้องกัน -- --> F[ผ่าน: อัปเดต Knowledge Base ตามปกติ]
    E -- ข้อมูลขัดแย้งกัน -- --> G[สร้าง Record ในตาราง knowledge_conflicts]
    
    G --> H[แสดงป้ายเตือนใน Knowledge Hub: Conflict Alert]
    H --> I[แสดง: ชื่อ 2 ไฟล์ที่ขัดแย้ง + ข้อความที่ค้านกัน]
    I --> J[ทีมงานตรวจสอบและคลิก 'ทำเครื่องหมายว่ารับทราบ/แก้ไขแล้ว']
```

---

## 4. ลำดับการทดสอบกฎ AI ใน Rules Simulator (Rules Sandbox Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as ผู้ดูแลโปรเจกต์
    participant UI as Rules Sandbox UI
    participant API as FastAPI Backend
    participant Compiler as Prompt & Rules Compiler
    participant LLM as AI Engine

    Admin->>UI: เปิดแท็บ "🧪 ทดสอบกฎ (Rules Sandbox)"
    Admin->>UI: พิมพ์คำถามจำลอง: "โครงการนี้มีงบประมาณและส่วนลดเท่าไหร่?"
    UI->>API: POST /api/v1/projects/{id}/rules/simulate
    
    API->>Compiler: ดึง Active Rules ทั้งหมด (Do's, Don'ts, Persona)
    Compiler->>LLM: ส่ง Prompt ทดสอบพร้อมกฎที่คอมไพล์แล้ว
    LLM-->>API: คำตอบจำลอง
    
    API->>API: ตรวจสอบว่าคำตอบฝ่าฝืนกฎข้อใดหรือไม่ (Rule Compliance Check)
    API-->>UI: ส่งผลลัพธ์คำตอบ + กฎที่ถูกเรียกใช้ + สถานะ Pass/Fail
    
    UI->>Admin: แสดงคำตอบจำลอง พร้อมไฮไลต์ว่าปฏิบัติตามกฎ Don'ts เรียบร้อย
```
