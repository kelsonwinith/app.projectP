# CogniNest (SynapseLM) 🧠
### Universal Multi-Format AI Knowledge & Block-Locked Collaborative Resource OS

> **Next-generation Source-Grounded Multi-Modal Knowledge Engine & Living Collaborative Workspace**  
> ผสานแนวคิดของ NotebookLM เข้ากับโครงสร้าง Shared Resource, Block-Level Exclusive Locking พร้อมระบบ Heartbeat Timeout ป้องกัน Lock ค้าง, Incremental Delta Knowledge Sync (สกัดเฉพาะส่วนต่างประหยัด Token), Smart Knowledge Graph Filtering, Tag-based Living Glossary, Human-in-the-Loop AI Review, Full Audit Trail, และ Blank Canvas Onboarding

---

## 📌 สรุปภาพรวมโปรเจกต์ (Executive Summary)

**CogniNest** เป็น Web Application สำหรับการจัดการเอกสาร ค้นคว้า และร่วมมือกันสร้างสรรค์องค์ความรู้ด้วย AI สำหรับทีมแบบ Multi-user ที่ให้ความสำคัญกับ **ความถูกต้องของข้อมูล (Data Integrity)**, **การทำงานร่วมกันที่ไร้การชนกัน (Conflict-Free Collaboration)**, และ **การประหยัดต้นทุน Token ด้วยสถาปัตยกรรม Incremental Delta Sync**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME COLLABORATIVE SHARED WORKSPACE                          │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│               📂 RESOURCE                 │                🧠 KNOWLEDGE                │
│       (Block-Locked Editing + Audit Log)  │       (องค์ความรู้ที่ AI ตกผลึกร่วมกัน)      │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Universal Multi-Format Editable Viewers │ • Living Project Glossary (Tag-based Poly) │
│ • Block-Level Exclusive Lock:             │ • Smart Filtered Knowledge Graph:          │
│   - ใครกดแก้บล็อกไหน บล็อกนั้นจะถูก Lock  │   - กรองตาม Folder / Resource ต้นทาง       │
│   - ป้องกัน Lock ค้างด้วย Heartbeat (60s) │   - กรองตาม Node Type (Concept/Entity/Org) │
│   - คนอื่นไม่เห็นการพิมพ์สดๆ (Isolated)   │   - กรองตาม Tag [Tech], [Legal]            │
│   - ต้องกด 'บันทึก' และ 'Unfocus'         │   - Slider คัดกรอง Hub Nodes (ความเชื่อมโยง)│
│     คนอื่นถึงจะเห็นและเข้าแก้ต่อได้        │ • Incremental Delta Knowledge Sync:        │
│ • Full Audit Trail & Version History      │   - ผู้ใช้กดปุ่ม 'Update Knowledge'        │
│   (บันทึกประวัติละเอียด ย้อนกลับได้)      │   - AI สแกนเฉพาะไฟล์ที่แก้และส่วนต่าง (Diff)│
│                                           │   - เพิ่ม/ลบเฉพาะส่วนที่กระทบ (ประหยัด Token)│
└───────────────────────────────────────────┴────────────────────────────────────────────┘
                                          │
                                          ▼
              ┌─────────────────────────────────────────────────────────┐
              │  ⚙️ PROJECT RULES ENGINE & 💬 PRIVATE 1-USER CHAT SESSION│
              │  - Default Scope: ทั้งโปรเจกต์ (เลือกเฉพาะเอกสารได้)     │
              │  - Blank Canvas: เริ่มคุยสั่งสร้างเอกสารจากศูนย์ได้ทันที│
              │  - AI Propose -> User Confirm Changes -> Save to Shared │
              └─────────────────────────────────────────────────────────┘
```

---

## 🌟 จุดเด่นสำคัญที่ได้รับการขัดเกลาเพื่อประสิทธิภาพสูงสุด (Core Refinements)

1. **ระบบล็อกระดับบล็อกพร้อมกลไก Heartbeat Timeout (Lock Heartbeat 60s):**
   - เมื่อผู้ใช้เข้าแก้ไขบล็อก ระบบจะทำการล็อกใน Redis โดยมีอายุ (TTL) 60 วินาที
   - เบราว์เซอร์จะส่งสัญญาณ Heartbeat ทุก 15 วินาทีเพื่อต่ออายุตราบใดที่ยังแก้ไขอยู่
   - หากผู้ใช้ปิดแท็บ เน็ตหลุด หรือเครื่องดับ ระบบจะ **ปลดล็อกอัตโนมัติภายใน 60 วินาที** ป้องกันปัญหาบล็อกค้างถาวร
2. **ระบบซิงค์ความรู้แบบ Incremental Delta Sync (ประหยัด Token สูงสุด):**
   - เมื่อผู้ใช้กดปุ่ม **"⚡ อัปเดต Knowledge"** ระบบจะไม่สแกนใหม่ทั้ง 200 ไฟล์
   - Background Job จะนำเฉพาะไฟล์ที่อยู่ในรายการแก้ไข (`modified_resources`) มาเปรียบเทียบ Diff ส่วนต่าง:
     - ส่วนข้อความที่เพิ่มขึ้น ➔ สกัดคำศัพท์และโหนดใหม่เข้าไปเพิ่ม
     - ส่วนข้อความที่ถูกตัดออก ➔ ตรวจสอบและปลดการเชื่อมโยงคำศัพท์และโหนดเก่าออก
   - ช่วยประหยัด Token ได้มากกว่า 90% และประมวลผลเสร็จในหลักวินาที
3. **ตัวกรองมโนทัศน์อัจฉริยะ (Smart Knowledge Graph Filters):**
   - แก้ปัญหากราฟพันกันเป็นใยแมงมุม (Spaghetti Ball) ด้วย 5 ตัวกรองคุณภาพ:
     1. **Filter by Folder / Resource:** ดูกราฟเฉพาะโฟลเดอร์ เช่น โฟลเดอร์ "การเงิน" หรือ "การแพทย์"
     2. **Filter by Node Type:** แยกดูเฉพาะ `CONCEPT` (มโนทัศน์), `ENTITY` (เทคโนโลยี/เครื่องมือ), หรือ `ORGANIZATION`
     3. **Filter by Domain Tag:** เลือกเฉพาะแท็กที่สนใจ เช่น `[Software]`, `[Pharmacy]`, `[Legal]`
     4. **Hub Importance Slider:** แถบเลื่อนปรับระดับความสำคัญ (กรองแสดงเฉพาะโหนดที่มีเส้นเชื่อม >= N เส้น)
     5. **Verification State:** แสดงเฉพาะโหนดที่ทีมงานมนุษย์กดยืนยันแล้ว (Verified) หรือโหนดที่ AI สกัดมา
4. **พจนานุกรม Living Glossary จำแนกด้วย Tags:**
   - คำศัพท์เดียวกันแต่คนละความหมายถูกจัดระเบียบด้วย Tags (เช่น `API [Tech]` vs `API [Pharmacy]`)
5. **Private 1-User Chat & Human-in-the-Loop Review:**
   - แชทส่วนตัวไม่ปะปนกับผู้อื่น และเมื่อ AI เสนอการแก้ไขเอกสาร ผู้ใช้ต้องกด Confirm Changes ก่อนบันทึกลงคลังส่วนรวมเสมอ

---

## 📚 สารบัญเอกสารสเปกโปรเจกต์ (Documentation Suite)

| เอกสาร | รายละเอียด |
| :--- | :--- |
| **[01_PRD.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/01_PRD.md)** | Product Requirements ฉบับปรับปรุง: Lock Heartbeat, Incremental Delta Sync, Smart Graph Filters |
| **[02_USER_JOURNEY_AND_FLOWS.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/02_USER_JOURNEY_AND_FLOWS.md)** | Sequence Flows: การส่ง Heartbeat ต่ออายุ Lock, Incremental Sync Pipeline, Graph Filter Interaction |
| **[03_SYSTEM_ARCHITECTURE.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/03_SYSTEM_ARCHITECTURE.md)** | Technical Architecture: Redis Lock Heartbeat Manager, Delta Knowledge Syncer, Graph Filter Engine |
| **[04_DATA_SCHEMA.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/04_DATA_SCHEMA.md)** | Database Schema: ตาราง `project_knowledge_sync_states` รองรับ Delta Sync, ฟิลด์ Tag ใน Glossary |
| **[05_API_SPECIFICATION.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/05_API_SPECIFICATION.md)** | APIs: Incremental Sync API, Heartbeat Ping WebSocket, Filtered Knowledge Graph API |
| **[06_IMPLEMENTATION_ROADMAP.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/06_IMPLEMENTATION_ROADMAP.md)** | แผนการพัฒนา Phase 1 ถึง Phase 4 ตามลำดับความสำคัญทางเทคนิค |
