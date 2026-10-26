# CogniNest (SynapseLM) 🧠
### Universal Multi-Format AI Knowledge & Block-Locked Collaborative Resource OS

> **Next-generation Source-Grounded Multi-Modal Knowledge Engine & Living Collaborative Workspace**  
> ผสานแนวคิดของ NotebookLM เข้ากับโครงสร้าง Shared Resource, Block-Level Exclusive Locking พร้อมระบุตัวตนผู้ล็อก (Private Typing -> Broadcast เมื่อเสร็จ), Whole-Document Save with Full Diff Modal, Save-Triggered Incremental Knowledge Sync & Contradiction Detector, Citation Faithfulness Check, และ Rules Simulator

---

## 📌 สรุปภาพรวมโปรเจกต์ (Executive Summary)

**CogniNest** เป็น Web Application สำหรับการจัดการเอกสาร ค้นคว้า และร่วมมือกันสร้างสรรค์องค์ความรู้ด้วย AI สำหรับทีมแบบ Multi-user ที่ให้ความสำคัญกับ **ความถูกต้องของข้อมูล (Data Integrity)**, **ประสบการณ์การแก้ไขร่วมกันที่ไม่สับสน (Isolated Block Drafting)**, และ **การตรวจทานก่อนบันทึกจริง (Diff Review before Commit)**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME COLLABORATIVE SHARED WORKSPACE                          │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│               📂 RESOURCE                 │                🧠 KNOWLEDGE                │
│       (Block-Locked Editing + Audit Log)  │       (องค์ความรู้ที่ AI ตกผลึกร่วมกัน)      │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Universal Multi-Format Editable Viewers │ • Living Project Glossary (Tag-based Poly) │
│ • Block-Level Exclusive Locking:          │ • Smart Filtered Knowledge Graph (5 เลเยอร์│
│   - ใคร/AI Agent กำลังแก้ บล็อกนั้นจะ Lock│ • Save-Triggered Delta Sync:               │
│   - แสดงป้ายระบุชัดเจนว่าใครกำลังแก้ไข     │   - บันทึก Resource ปุ๊บ -> Background     │
│   - พิมพ์แบบส่วนตัว (ไม่แสดง Real-time)   │     Job ซิงค์ความรู้ให้ทันที               │
│   - เมื่อพิมพ์เสร็จ -> แสดงผลใหม่ให้ทุกคน │ • ⚠️ Contradiction & Conflict Detector:    │
│     เห็นทันที                             │   - AI ตรวจจับข้อเท็จจริงขัดแย้งระหว่างไฟล์│
│ • Full Document Save with Diff Modal:     │   - แจ้งเตือนคู่ไฟล์ที่ข้อมูลไม่ตรงกันทันที │
│   - กด Save Resource -> พรีวิว Diff ทั่ว   │ • Living Summaries & Verified Fact Base    │
│     เอกสารก่อนกดยืนยันบันทึกจริง          │                                            │
│ • Full Audit Trail & Version History      │                                            │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
                                          │
                                          ▼
              ┌─────────────────────────────────────────────────────────┐
              │  ⚙️ PROJECT RULES SIMULATOR & 💬 PRIVATE 1-USER CHAT     │
              │  - Rules Sandbox: ทดสอบกฎและผลลัพธ์ของ AI ก่อนใช้งานจริง │
              │  - Citation Faithfulness Check: ตรวจสอบความถูกต้องอ้างอิง│
              │  - Blank Canvas: เริ่มคุยสั่งสร้างเอกสารจากศูนย์ได้ทันที│
              │  - AI Propose -> User Confirm Changes -> Save to Shared │
              └─────────────────────────────────────────────────────────┘
```

---

## 🌟 วงจรการแก้ไขและการบันทึกที่ชัดเจน (Editing & Save Flow)

1. **การล็อกระดับบล็อกและความเป็นส่วนตัว (Block Locking & Isolated Typing):**
   - เมื่อ User A หรือ AI Agent ของ User A เริ่มแก้ไขบล็อกใด บล็อกนั้นจะถูก **Lock ทันที**
   - สมาชิกคนอื่นจะเห็นป้ายระบุชัดเจนว่า *"บล็อกนี้กำลังถูกแก้ไขโดย [ชื่อ User / AI Agent]"* และไม่สามารถกดเข้าแก้ซ้อนได้
   - **ไม่แสดงผลตัวหนังสือแบบ Real-time:** เนื้อหาที่กำลังพิมพ์จะถูกแยกเก็บเป็นร่างส่วนตัว เพื่อไม่ให้ตัวหนังสือวิ่งรบกวนสายตาผู้อื่น
   - **แสดงผลใหม่ทันทีเมื่อพิมพ์เสร็จ:** ทันทีที่ User A พิมพ์เสร็จ (คลิกออกจากบล็อก) หรือ AI Agent ร่างเสร็จ บล็อกนั้นจะ **แสดงผลข้อความใหม่ให้ทุกคนในห้องเห็นพร้อมกันทันที**
2. **การบันทึกเอกสารทั้งฉบับ (Save Resource with Diff Modal):**
   - เมื่อแก้ไขเนื้อหาในบล็อกต่างๆ เรียบร้อยแล้ว ผู้ใช้กดปุ่ม **"💾 บันทึกเอกสาร (Save Resource)"**
   - ระบบแสดงหน้าต่าง **Document Diff Modal** เปรียบเทียบข้อความเดิม (สีแดง) กับข้อความใหม่ (สีเขียว) ทั้งเอกสารอย่างชัดเจน
   - ผู้ใช้ตรวจทานและกรอกบันทึกย่อ (Commit Message) แล้วกดยืนยันบันทึก
3. **ซิงค์ความรู้และตรวจจับ Conflict อัตโนมัติ (Immediate Delta Sync & Conflict Check):**
   - ทันทีที่ยืนยันบันทึก ระบบจะส่งงานเข้า Background Job รันการซิงค์ความรู้เฉพาะส่วนต่าง (Incremental Delta Sync) อัปเดต Living Glossary และ Knowledge Graph
   - รัน **Contradiction & Conflict Detector** หากพบข้อมูลขัดแย้งกับเอกสารอื่นในโปรเจกต์ จะขึ้นการ์ดแจ้งเตือน Conflict Alert ใน Knowledge Hub ทันที

---

## 📚 สารบัญเอกสารสเปกโปรเจกต์ (Documentation Suite)

| เอกสาร | รายละเอียด |
| :--- | :--- |
| **[01_PRD.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/01_PRD.md)** | Product Requirements: Block Lock Lifecycle (Lock -> Private Type -> Reveal upon finish -> Save Resource Diff) |
| **[02_USER_JOURNEY_AND_FLOWS.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/02_USER_JOURNEY_AND_FLOWS.md)** | Sequence Flows: การแสดงป้าย Lock, การปล่อยผลลัพธ์ใหม่ทันทีที่พิมพ์เสร็จ, โฟลว์ Save Resource พร้อม Diff |
| **[03_SYSTEM_ARCHITECTURE.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/03_SYSTEM_ARCHITECTURE.md)** | Technical Architecture: Redis Block Lock, WebSocket Event Dispatcher, Save & Conflict Pipeline |
| **[04_DATA_SCHEMA.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/04_DATA_SCHEMA.md)** | Database Schema: ตาราง `knowledge_conflicts`, `resource_versions`, `resource_audit_logs` |
| **[05_API_SPECIFICATION.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/05_API_SPECIFICATION.md)** | APIs: WebSocket Block Lock / Reveal Event, Diff Preview, Save Confirmed, Conflicts API |
| **[06_IMPLEMENTATION_ROADMAP.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/06_IMPLEMENTATION_ROADMAP.md)** | แผนงานพัฒนาตามลำดับความสำคัญ 4 ระยะ |
