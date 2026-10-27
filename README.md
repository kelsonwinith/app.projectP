# Project P 🧠
### Universal Multi-Format AI Knowledge & Block-Locked Collaborative Resource OS

> **Next-generation Source-Grounded Multi-Modal Knowledge Engine & Living Collaborative Workspace**  
> ผสานแนวคิดของ NotebookLM เข้ากับโครงสร้าง Shared Resource, 6 รูปแบบ Resource หลากมิติ, Cross-Resource Transclusion (อ้างอิงและฝังกราฟ/ตาราง/สไลด์ข้ามไฟล์แบบ Single Source of Truth ไม่ Duplicate Code), Cell-Level Table Locking, Shared Temp Draft State, 3-Tab Save Modal, Canonical Living Glossary, และ TOC ScrollSpy

---

## 📌 สรุปภาพรวมโปรเจกต์ (Executive Summary)

**Project P** เป็น Web Application สำหรับการจัดการเอกสาร ค้นคว้า และร่วมมือกันสร้างสรรค์องค์ความรู้ด้วย AI สำหรับทีมแบบ Multi-user ที่ให้ความสำคัญกับ **โครงสร้าง Resource หลากมิติ (6 Formats)**, **การอ้างอิงข้ามไฟล์โดยไม่ Duplicate ข้อมูล (Transclusion Engine)**, และ **ความถูกต้องของข้อมูล (Data Integrity)**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      REAL-TIME COLLABORATIVE SHARED WORKSPACE                          │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│               📂 RESOURCE                 │                🧠 KNOWLEDGE                │
│       (6 รูปแบบไฟล์ + Cross Transclusion) │       (องค์ความรู้ที่ AI ตกผลึกร่วมกัน)      │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • 6 Core Resource Types:                  │ • Canonical Living Glossary:               │
│   1. 📄 Document (TOC ScrollSpy, Split)   │   - รวมคำพ้อง/คำย่อเป็น 'คำหลักมาตรฐาน'     │
│   2. 📊 Table/Sheet (Cell-Level Locking)  │   - ตัดความซ้ำซ้อนของคำความหมายเดียวกัน     │
│   3. 📽️ Presentation (Slide Grid Sorter)  │ • Smart Filtered Knowledge Graph (5 เลเยอร์│
│   4. 🕸️ Graph/Diagram (Canvas/Code Mode)  │ • Knowledge Gap & Orphan Concept Finder:   │
│   5. 🖼️ Visual/Image (High-Res Zoom & Pan)│   - ค้นหาประเด็นที่ยังขาดเอกสารอธิบาย       │
│   6. 💻 Code/Spec (Syntax Highlight/Range)│ • 3-Tab Save & Conflict Modal:             │
│ • Cross-Resource Transclusion Engine:     │   [แท็บ 1: ก่อนแก้ไข] | [แท็บ 2: หลังแก้]  │
│   - ฝังกราฟ/ตารางเป็น Live Widget ใน Doc  │   [แท็บ 3: หมายเหตุ & ตรวจจับข้อขัดแย้ง]    │
│   - อ้างอิงลิงก์ข้อความ + Hover Preview   │ • Incremental Delta Knowledge Sync         │
│   - แก้ไขไฟล์แม่ -> ทุกไฟล์อัปเดตอัตโนมัติ│                                            │
│ • Shared Temp Draft (รีเฟรชไม่หาย)        │                                            │
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

## 📚 สารบัญเอกสารสเปกโปรเจกต์ (Documentation Suite)

| เอกสาร | รายละเอียด |
| :--- | :--- |
| **[01_PRD.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/01_PRD.md)** | Product Requirements ฉบับสมบูรณ์: Cell Locking, Shared Temp State, 3-Tab Save, Canonical Glossary |
| **[02_USER_JOURNEY_AND_FLOWS.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/02_USER_JOURNEY_AND_FLOWS.md)** | Sequence Flows: Shared Temp Flow, 3-Tab Save Modal, Conflict Checking on Generate/Save |
| **[03_SYSTEM_ARCHITECTURE.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/03_SYSTEM_ARCHITECTURE.md)** | Technical Architecture: Temp Draft State Engine, Canonical Term Reducer, Conflict Detection Engine |
| **[04_DATA_SCHEMA.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/04_DATA_SCHEMA.md)** | Database Schema: เพิ่มฟิลด์ `canonical_term_id`, ตาราง `resource_temp_drafts`, `knowledge_conflicts` |
| **[05_API_SPECIFICATION.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/05_API_SPECIFICATION.md)** | APIs: Temp Draft Sync, 3-Tab Save API, Selective Block Commit, Canonical Glossary API |
| **[06_IMPLEMENTATION_ROADMAP.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/06_IMPLEMENTATION_ROADMAP.md)** | แผนงานพัฒนาตามลำดับความสำคัญ 4 ระยะ |
| **[07_RESOURCE_TYPES_AND_TRANSCLUSION.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/07_RESOURCE_TYPES_AND_TRANSCLUSION.md)** | **ข้อกำหนด 6 ประเภท Resource และระบบ Transclusion:** อ้างอิงและฝังกราฟ/ตาราง/สไลด์ข้ามไฟล์แบบไม่ Duplicate Code |
| **[08_ADR_FRONTEND_WORKSPACE_ARCHITECTURE.md](file:///Users/sinthonwilke/On%20My%20Mac/GitHub/app.resourceProject/docs/08_ADR_FRONTEND_WORKSPACE_ARCHITECTURE.md)** | **ADR 008:** สถาปัตยกรรม Frontend Workspace: Side Panel ซ้าย/ขวา, Full Chat ➔ Resource Viewer + Floating Mini-Chat |
