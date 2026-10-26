# User Journey & Interaction Workflows 🗺️

เอกสารฉบับนี้อธิบายเส้นทางประสบการณ์ผู้ใช้ (User Journey) และแผนภาพลำดับขั้นตอนการทำงาน (Sequence & Flowcharts) ฉบับปรับปรุง เพื่อรองรับ **Shared Temp Draft State**, **3-Tab Save Modal พร้อม Selective Staging**, **Conflict Detection (On Generate & On Save)**, และ **Canonical Term Standardization**

---

## 1. ลำดับการแก้ไขแบบ Shared Temp State (รีเฟรชไม่หาย ทุกคนเห็นตรงกัน)

```mermaid
sequenceDiagram
    autonumber
    actor UserA as ผู้แก้ไข (User A)
    actor UserB as เพื่อนร่วมทีม (User B)
    participant UI_A as Next.js (User A)
    participant UI_B as Next.js (User B)
    participant WS as WebSocket Collaboration Server
    participant DB as PostgreSQL (resource_temp_drafts)

    UserA->>UI_A: แก้ไขบล็อกข้อความ <p id="p-002">
    UserA->>UI_A: พิมพ์เสร็จและคลิกออกจากบล็อก (Unfocus)
    
    UI_A->>WS: release_and_reveal_block(res_id, "p-002", new_html="...")
    WS->>DB: บันทึกเข้าตาราง resource_temp_drafts (สถานะ: 'temp_draft')
    WS-->>UI_B: บรอดแคสต์: บล็อก "p-002" อัปเดตเนื้อหา Temp ใหม่
    
    Note over UI_A,UI_B: หาก User A หรือ User B กด Refresh เบราว์เซอร์<br/>ข้อมูล Temp Draft นี้จะยังคงอยู่ ไม่สูญหาย!

    opt ต้องการย้อนค่าเฉพาะบล็อกนี้
        UserA->>UI_A: คลิกปุ่ม "Revert Block" ที่บล็อก "p-002"
        UI_A->>WS: revert_temp_block(res_id, "p-002")
        WS->>DB: ลบข้อมูลใน resource_temp_drafts คืนค่าเวอร์ชันทางการ
        WS-->>UI_B: บรอดแคสต์: บล็อก "p-002" ย้อนกลับสู่ค่าเดิมเรียบร้อย
    end
```

---

## 2. ลำดับการบันทึกเอกสารด้วย 3-Tab Save Modal พร้อม Selective Staging

```mermaid
sequenceDiagram
    autonumber
    actor User as สมาชิกผู้บันทึก
    participant UI as Next.js 3-Tab Save Modal
    participant API as FastAPI Backend
    participant Worker as Background Worker
    participant DB as PostgreSQL

    User->>UI: คลิกปุ่ม "💾 บันทึกเอกสาร (Save Resource)"
    UI->>API: GET /api/v1/projects/{id}/resources/{res_id}/save-modal-data
    API-->>UI: ส่งข้อมูลทั้ง 3 แท็บ (Original, Temp Diff พร้อมสถิติคำ, และ ผลตรวจ Conflict)
    
    UI->>User: เปิด 3-Tab Save Modal:
    Note over UI,User: - แท็บ 1: ดูเนื้อหาเดิมทั้งฉบับ<br/>- แท็บ 2: ดู Diff (+120/-30 คำ) พร้อม Checkbox แต่ละบล็อก<br/>- แท็บ 3: กรอก Commit Message และดู Conflict Alerts
    
    User->>UI: ติ๊กเลือก [✓] บล็อก 1 และ 2 (แต่เว้นบล็อก 3 ไว้)
    User->>UI: กรอกบันทึกย่อ: "อัปเดตสเปกเฟสแรก" แล้วคลิก "✅ ยืนยันบันทึก"
    
    UI->>API: PUT /api/v1/.../save-selective (ส่งรายการ block_ids ที่เลือก)
    API->>DB: บันทึกเฉพาะบล็อกที่เลือกเข้าเวอร์ชันถาวร (บล็อก 3 ยังคงเป็น Temp ต่อไป)
    API->>Worker: Enqueue งาน Incremental Delta Sync ทันที!
    API-->>UI: ยืนยันบันทึกสำเร็จ (200 OK)
```

---

## 3. ลำดับการตรวจจับ Conflict 2 จังหวะ (On Generate & On Save)

```mermaid
flowchart TD
    Trigger1[1. ผู้ใช้สั่ง AI สร้าง Resource ใหม่ใน Chat] --> Check1[AI รัน Cross-Source Fact Checker]
    Trigger2[2. ผู้ใช้กดปุ่ม Save Resource] --> Check2[AI รัน Cross-Source Fact Checker]

    Check1 --> Analyze[วิเคราะห์ Claims เทียบกับไฟล์อื่นๆ ในโปรเจกต์]
    Check2 --> Analyze

    Analyze --> Result{พบข้อเท็จจริงขัดแย้งหรือไม่?}
    
    Result -- พบความขัดแย้งในขั้นตอน Generate -- --> Alert1[แสดงหน้าต่างเตือนในแชท: 'เนื้อหาที่สร้างขัดแย้งกับไฟล์ B' ก่อนกดเพิ่มเข้าคลัง]
    Result -- พบความขัดแย้งในขั้นตอน Save -- --> Alert2[แสดงในการ์ดแท็บที่ 3: 'หมายเหตุ & ข้อขัดแย้ง' ใน Save Modal ทันที]
    Result -- ไม่พบข้อขัดแย้ง -- --> Pass[ผ่าน: บันทึกได้ราบรื่น ไร้ข้อติดขัด]
```
