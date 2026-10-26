# CogniNest (SynapseLM) 🧠
### Universal Multi-Format AI Knowledge & Block-Locked Collaborative Resource OS

> **Next-generation Source-Grounded Multi-Modal Knowledge Engine & Living Collaborative Workspace**  
> ผสานแนวคิดของ NotebookLM เข้ากับโครงสร้าง Shared Resource, Cell-Level Table Locking, Shared Temp Draft State (รีเฟรชไม่หาย), 3-Tab Save Modal (ก่อนแก้ / หลังแก้ / หมายเหตุ & Conflict), Canonical Term Standardization, Knowledge Gap Finder, และ TOC ScrollSpy

---

## 📌 สรุปภาพรวมโปรเจกต์ (Executive Summary)

**CogniNest** เป็น Web Application สำหรับการจัดการเอกสาร ค้นคว้า และร่วมมือกันสร้างสรรค์องค์ความรู้ด้วย AI สำหรับทีมแบบ Multi-user ที่ให้ความสำคัญกับ **ความถูกต้องของข้อมูล (Data Integrity)**, **ระบบดราฟต์ชั่วคราวร่วมกัน (Shared Temp State)**, **การตรวจทานก่อนบันทึกแบบ 3 แท็บ**, และ **การจัดระเบียบคำศัพท์มาตรฐานไร้ความซ้ำซ้อน**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME COLLABORATIVE SHARED WORKSPACE                          │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│               📂 RESOURCE                 │                🧠 KNOWLEDGE                │
│       (Block/Cell-Locked + Shared Temp)   │       (องค์ความรู้ที่ AI ตกผลึกร่วมกัน)      │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Universal Multi-Format Viewers:         │ • Canonical Living Glossary:               │
│   - Document: Dynamic TOC + ScrollSpy     │   - รวมคำพ้อง/คำย่อเป็น 'คำหลักมาตรฐาน'     │
│   - Presentation: Grid Sorter View        │   - ตัดความซ้ำซ้อนของคำความหมายเดียวกัน     │
│   - Table: Granular Cell-Level Locking    │ • Smart Filtered Knowledge Graph (5 เลเยอร์│
│   - Split Mode: WYSIWYG vs Raw Markdown   │ • Knowledge Gap & Orphan Concept Finder:   │
│ • Shared Temp Draft (รีเฟรชไม่หาย):       │   - ค้นหาประเด็นที่ยังขาดเอกสารอธิบาย       │
│   - แก้ไขแล้วบันทึกเป็น Temp ให้ทุกคนเห็น │ • 3-Tab Save & Conflict Modal:             │
│   - ย้อนค่าเฉพาะบล็อกได้ (Revert Block)   │   [แท็บ 1: ก่อนแก้ไข] | [แท็บ 2: หลังแก้]  │
│ • Selective Save (ติ๊กเลือกบล็อกที่จะ Commit)│   [แท็บ 3: หมายเหตุ & ตรวจจับข้อขัดแย้ง]    │
│ • Full Audit Trail & Version History      │ • Incremental Delta Knowledge Sync         │
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

## 🌟 10 ฟังก์ชันเด่นที่ขัดเกลาจนสมบูรณ์แบบ

1. **Auto TOC with ScrollSpy & Viewer Enhancements:**
   - หน้ารีดเดอร์มีสารบัญด้านข้างเลื่อนตามการอ่านจริง (ScrollSpy)
   - หน้า Presentation มี **Slide Grid Sorter Mode** ดูภาพรวมทุกสไลด์พร้อมกัน
   - สลับโหมดอ่าน/เขียนได้ระหว่าง **WYSIWYG** และ **Raw Markdown**
2. **Cell-Level Table Locking (ล็อกเฉพาะเซลล์ในตาราง):**
   - ใน Table/Spreadsheet ล็อกเฉพาะ Cell หรือ Row ที่กำลังแก้ เพื่อนร่วมทีมแก้ไขคนละเซลล์ในตารางเดียวกันได้พร้อมกัน
3. **Shared Temp Draft State (แก้ไขแล้วรีเฟรชไม่หาย):**
   - เมื่อพิมพ์แก้ไขบล็อกเสร็จ ข้อมูลจะถูกบันทึกเป็น **Temp State** ในระบบทันที ทุกคนในทีมเห็นตรงกัน และแม้จะรีเฟรชเบราว์เซอร์ข้อมูลก็ไม่สูญหาย
   - มีปุ่ม **"Revert Block"** ย้อนข้อความเฉพาะบล็อกนั้นกลับสู่เวอร์ชันเซฟล่าสุดได้
4. **3-Tab Save Modal พร้อมสถิติ Diff และระบบเลือก Commit (Selective Staging):**
   - เมื่อกด Save Resource จะเปิดหน้าต่าง 3 แท็บ:
     - **แท็บ 1: ก่อนแก้ไข (Original)**
     - **แท็บ 2: หลังแก้ไข (Proposed with Diff)** พร้อมแถบสถิติคำ และ Checkbox ให้ติ๊กเลือกเฉพาะบล็อกที่ต้องการบันทึกจริง (บล็อกที่ไม่ติ๊กจะคงสถานะ Temp ต่อไป)
     - **แท็บ 3: หมายเหตุ & ข้อขัดแย้ง (Notes & Conflicts)** แสดงข้อเท็จจริงขัดแย้งที่ AI ตรวจพบก่อนกดยืนยัน
5. **Conflict Detection ตอน Save และตอน Generate:**
   - ระบบตรวจจับข้อเท็จจริงขัดแย้งจะทำงาน 2 จังหวะ: **ตอน AI ร่างเอกสารใหม่ (Generate Resource)** และ **ตอนกด Save Resource** พร้อมแสดงเตือนในแท็บที่ 3 ทันที
6. **Canonical Term Standardization ใน Living Glossary:**
   - ยุบรวมคำพ้องและคำย่อ (เช่น Kubernetes, K8s) ให้เหลือ **"คำหลักมาตรฐาน (Canonical Term)"** เพียงคำเดียว เพื่อลดความซ้ำซ้อนของแนวคิด
7. **Knowledge Gap / Orphan Concept Finder:**
   - ตัวกรองตรวจจับแนวคิดที่ถูกกล่าวถึงในเอกสาร แต่ยังไม่มีเอกสารใดให้คำนิยามหรือเขียนอธิบายอย่างเป็นทางการ ช่วยชี้เป้าเนื้อหาที่ทีมต้องเขียนเพิ่ม

---

## 📚 สารบัญเอกสารสเปกโปรเจกต์ (Documentation Suite)

| เอกสาร | รายละเอียด |
| :--- | :--- |
| **[01_PRD.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/01_PRD.md)** | Product Requirements ฉบับสมบูรณ์: Cell Locking, Shared Temp State, 3-Tab Save, Canonical Glossary |
| **[02_USER_JOURNEY_AND_FLOWS.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/02_USER_JOURNEY_AND_FLOWS.md)** | Sequence Flows: Shared Temp Flow, 3-Tab Save Modal, Conflict Checking on Generate/Save |
| **[03_SYSTEM_ARCHITECTURE.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/03_SYSTEM_ARCHITECTURE.md)** | Technical Architecture: Temp Draft State Engine, Canonical Term Reducer, Conflict Detection Engine |
| **[04_DATA_SCHEMA.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/04_DATA_SCHEMA.md)** | Database Schema: เพิ่มฟิลด์ `canonical_term_id`, ตาราง `resource_temp_drafts`, `knowledge_conflicts` |
| **[05_API_SPECIFICATION.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/05_API_SPECIFICATION.md)** | APIs: Temp Draft Sync, 3-Tab Save API, Selective Block Commit, Canonical Glossary API |
| **[06_IMPLEMENTATION_ROADMAP.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/06_IMPLEMENTATION_ROADMAP.md)** | แผนงานพัฒนาตามลำดับความสำคัญ 4 ระยะ |
