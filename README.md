# CogniNest (SynapseLM) 🧠
### Universal Multi-Format AI Knowledge & Real-time Collaborative Resource OS

> **Next-generation Source-Grounded Multi-Modal Knowledge Engine & Living Collaborative Workspace**  
> ผสานแนวคิดของ NotebookLM เข้ากับโครงสร้าง Shared Resource, Universal In-Place Editable HTML Viewers, Multiplayer Real-time Collaboration (Live Cursors & AI Presence), Human-in-the-Loop Change Approval, Full Version Audit Log, Living Glossary และ Interactive Knowledge Graph

---

## 📌 สรุปภาพรวมโปรเจกต์ (Executive Summary)

**CogniNest** เป็น Web Application สำหรับการจัดการเอกสาร ค้นคว้า และร่วมมือกันสร้างสรรค์องค์ความรู้ด้วย AI สำหรับทีมแบบ Multi-user โดยผสาน **การแก้ไขเอกสารร่วมกันแบบ Real-time (Multiplayer Collaboration)** และ **การควบคุมผลลัพธ์ของ AI อย่างเข้มงวด (Human-in-the-Loop Approval)**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME COLLABORATIVE SHARED WORKSPACE                          │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│               📂 RESOURCE                 │                🧠 KNOWLEDGE                │
│       (แก้ไขได้ทันที + Realtime Cursors)   │       (องค์ความรู้ที่ AI ตกผลึกร่วมกัน)      │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Universal Multi-Format Editable Viewers │ • Living Project Glossary (Interactive)    │
│   (Document, Presentation, Table, Visual) │ • Dynamic Knowledge Graph (Nodes & Edges)  │
│ • Real-time Multiplayer Presence:         │ • Multi-format Key Takeaways & Fact Base   │
│   - แสดง Live Cursors ของสมาชิกในทีม       │ • Auto-updated via Background Job หลังกด   │
│   - แสดงแถบ AI Agent Presence ที่กำลังแก้  │   บันทึก Resource สำเร็จ                   │
│ • Manual Save & Confirm Trigger:          │ • Deletion Impact Assessment Preview       │
│   (แก้ไขแล้วต้องกดยืนยันบันทึกด้วยตัวเอง)    │                                            │
│ • Human-in-the-loop AI Diff Review:       │                                            │
│   (ผลลัพธ์จาก AI ต้องกดยอมรับก่อนบันทึกจริง)│                                            │
│ • Full Audit Trail & Version History      │                                            │
│   (บันทึกประวัติการเปลี่ยนแปลงแบบ Git-like)│                                            │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
                                          │
                                          ▼
              ┌─────────────────────────────────────────────────────────┐
              │  ⚙️ PROJECT RULES ENGINE & 💬 PRIVATE 1-USER CHAT SESSION│
              │  - สนทนาและสั่งงาน AI ส่วนตัว (ไม่ปนกับ Audit Log)       │
              │  - สั่ง AI แก้ไขหรือสร้างเอกสาร -> ต้องกด Confirm Change │
              │  - อ้างอิงแหล่งที่มาได้ลึกระดับ (ย่อหน้า/สไลด์/แถว/รูป) │
              └─────────────────────────────────────────────────────────┘
```

---

## 🌟 จุดเด่นสำคัญที่เพิ่มเข้ามา (Collaborative & Editing Features)

1. **In-Place Editable HTML Viewers (เปิดปุ๊บ แก้ไขได้ทันที):**
   - ผู้ใช้เปิดดู Resource ใดๆ สามารถพิมพ์แก้ไขเนื้อหาในหน้าเว็บได้ทันที (WYSIWYG Semantic Editor)
   - **Explicit Manual Save & Confirmation:** ไม่ Auto-save โดยไม่ตั้งใจ ผู้ใช้ต้องกด "บันทึก" และกดยืนยันก่อน ระบบจึงจะรัน **Background Job** ไปคำนวณและอัปเดต Knowledge (Glossary, Graph) รอบใหม่
2. **Human-in-the-Loop AI Change Review (ตรวจทานผลงาน AI ก่อน Commit):**
   - เมื่อผู้ใช้สั่งให้ AI แก้ไขหรือเรียบเรียงเอกสาร ระบบจะแสดงผลเป็น **Diff Preview (เทียบสิ่งที่เพิ่ม/ลบ)**
   - สมาชิกผู้สั่งต้องเป็นคนกดปุ่ม **"Confirm Change" (ยอมรับการแก้ไข)** ข้อมูลจึงจะถูกบันทึกลง Resource จริง
3. **Real-time Multiplayer Collaboration & AI Presence:**
   - เห็นตำแหน่งเคอร์เซอร์ (Live Cursors) และแถบสีของเพื่อนร่วมทีมว่าใครกำลังอ่านหรือพิมพ์ตรงจุดไหน
   - **AI Agent Presence:** แสดงสถานะชัดเจนว่า *"AI ของ User A กำลังร่างข้อความในย่อหน้าที่ 3..."* ป้องกันการแก้ไขซ้อนทับกัน
4. **Full Resource Audit Trail & Version History (ประวัติการแก้ไขครบ 100%):**
   - บันทึกทุกความเคลื่อนไหว: ใครแก้, แก้เมื่อไหร่, ข้อความก่อน-หลังเป็นอย่างไร ย้อนเวอร์ชันได้ตลอดเวลา
   - การถามตอบใน Private Chat จะไม่ถูกนับเป็น Audit Log (เพราะไม่มีผลกระทบต่อ Resource ส่วนรวม)

---

## 📚 สารบัญชุดเอกสารสเปกโปรเจกต์ (Documentation Suite)

| เอกสาร | รายละเอียด |
| :--- | :--- |
| **[01_PRD.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/01_PRD.md)** | Product Requirements: In-place Editing, Human-in-the-Loop Review, Real-time Presence, Full Audit Log |
| **[02_USER_JOURNEY_AND_FLOWS.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/02_USER_JOURNEY_AND_FLOWS.md)** | Sequence Flows: การแก้ไขและกดยืนยันบันทึก, AI Proposal Diff Review, Multiplayer Realtime Cursors |
| **[03_SYSTEM_ARCHITECTURE.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/03_SYSTEM_ARCHITECTURE.md)** | Technical Architecture: WebSocket Presence Gateway, Yjs/CRDT Sync, Audit & Diff Engine |
| **[04_DATA_SCHEMA.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/04_DATA_SCHEMA.md)** | Database Schema: ตาราง `resource_versions`, `resource_audit_logs`, `pending_ai_proposals` |
| **[05_API_SPECIFICATION.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/05_API_SPECIFICATION.md)** | APIs: WebSocket Collaboration, Save Resource Confirm, Diff Review Endpoints, Version History |
| **[06_IMPLEMENTATION_ROADMAP.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/06_IMPLEMENTATION_ROADMAP.md)** | แผนงานพัฒนา 4 ระยะ (เพิ่ม Phase สำหรับ Multiplayer Editor & Audit Engine) |
