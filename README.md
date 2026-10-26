# CogniNest (SynapseLM) 🧠
### AI-Powered Dynamic Knowledge & Resource Management Engine

> **Next-generation Source-Grounded Knowledge Management & Living Research Workspace**  
> ผสานแนวคิดของ NotebookLM เข้ากับโครงสร้าง Resource Hierarchy, Living Glossary, Interactive Knowledge Graph, Custom Project Rules และ AI Self-Synthesis Engine

---

## 📌 สรุปภาพรวมโปรเจกต์ (Executive Summary)

**CogniNest** เป็น Web Application สำหรับการจัดการเอกสาร ค้นคว้า และสร้างองค์ความรู้ใหม่ด้วย AI สำหรับผู้ใช้งานแบบ Multi-user โดยออกแบบ Workspace ให้แบ่งออกเป็น **2 เสาหลักคู่ขนาน (Two Pillars)** ภายในโปรเจกต์เดียวกัน:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PROJECT WORKSPACE                             │
├───────────────────────────────────┬────────────────────────────────────┤
│           📂 RESOURCE             │            🧠 KNOWLEDGE            │
│   (โฟลเดอร์ & เอกสารต้นฉบับ)     │    (องค์ความรู้ที่ AI สังเคราะห์)   │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Hierarchical Folder Tree        │ • Dynamic Project Glossary (GUI)   │
│ • Raw File Upload (.docx, .pdf,   │ • Interactive Knowledge Graph (GUI)│
│   .txt, .md, Web URL)             │ • Living Topic Summaries & Insights│
│ • Universal HTML Representation   │ • Key Takeaways & Fact Base        │
│   (แปลงทุกฟอร์แมตเป็น Semantic     │ • AI-Generated Documents & Reports │
│    HTML คงเนื้อหาครบ 100%)         │                                    │
└───────────────────────────────────┴────────────────────────────────────┘
                                  │
                                  ▼
      ┌─────────────────────────────────────────────────────────┐
      │  ⚙️ PROJECT RULES ENGINE & 💬 1-USER-1-SESSION AI CHAT   │
      │  (ควบคุมพฤติกรรม AI ด้วย Rules + คุย/สั่งให้สร้างเอกสาร)  │
      └─────────────────────────────────────────────────────────┘
```

1. **📂 Resource (คลังทรัพยากร):**
   - จัดหมวดหมู่เอกสารแบบโฟลเดอร์ซ้อนโฟลเดอร์ (Nested Folders) ตาม UX ที่คุ้นเคย
   - นำเข้าเอกสารได้หลากรูปแบบ (`.docx`, `.pdf`, `.txt`, `.md`, Web URL)
   - ข้อมูลทั้งหมดจะถูกสกัดและ **Represent ใหม่ในรูปแบบ Semantic HTML** ผ่าน Reader View เพื่อประสบการณ์การอ่านที่สะอาดตา มีสารบัญ (TOC) ค้นหาง่าย และคงเนื้อหาครบถ้วน 100%

2. **🧠 Knowledge (ศูนย์รวมองค์ความรู้ที่ AI สังเคราะห์):**
   - เริ่มต้นจากความว่างเปล่า (Blank Canvas)
   - ทันทีที่ผู้ใช้อัปโหลด Resource ระบบ **Background Job** จะวิเคราะห์ เจาะลึก และสร้าง Knowledge อัตโนมัติ
   - แสดงผลในรูปแบบ **GUI ที่จับต้องได้**:
     - **Interactive Knowledge Graph:** แผนภาพโหนดความสัมพันธ์ของเอนทิตี แนวคิด และเอกสาร
     - **Living Glossary:** พจนานุกรมศัพท์เฉพาะทางประจำโปรเจกต์ มีระบบ Hover Card ในตัวอ่าน HTML
     - **Automated Summaries & Insights:** สรุปใจความสำคัญและข้อเท็จจริง

3. **⚙️ Project Rules (ระบบกฎและทักษะของ AI):**
   - คล้ายกับ Rule/Skill ใน Agent Harness กำหนดข้อจำกัด (Constraints), โทนภาษา, และสิ่งที่ AI ต้องทำหรือห้ามทำในการตอบและสังเคราะห์ความรู้

4. **💬 Single AI Session & Generative Engine:**
   - ผู้ใช้แต่ละคนจะมี **1 AI Session ประจำตัวต่อหนึ่งโปรเจกต์** (สไตล์ NotebookLM) เพื่อจำบริบทการสนทนาต่อเนื่อง
   - ผู้ใช้สามารถ **"สั่งให้ AI สร้างสิ่งใหม่"** เช่น ให้ร่างเอกสารใหม่ สรุปเปรียบเทียบ หรือสร้าง Action Plan ซึ่งผลลัพธ์สามารถบันทึกเป็น Resource หรือ Knowledge Item ใหม่ได้ทันที

---

## 🛠️ Tech Stack สถาปัตยกรรมระบบ

* **Frontend:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript, Tailwind CSS, Lucide Icons, React Flow / Cytoscape สำหรับ Knowledge Graph)
* **Backend:** [Python FastAPI](https://fastapi.tiangolo.com/) (Asynchronous REST & WebSocket API)
* **Background Worker:** Celery / ARQ + Redis (สำหรับประมวลผล Ingestion, แปลง HTML, สกัด Graph และสร้าง Glossary)
* **Database & Vector Engine:** PostgreSQL (พร้อมส่วนขยาย `pgvector` สำหรับจัดเก็บข้อมูลแบบ Hybrid: Relational + Vector Search)
* **LLM & Embedding:** รองรับ OpenAI, Claude, หรือ Google Gemini API + Local Embeddings

---

## 📚 สารบัญเอกสารการออกแบบระบบ (Documentation Suite)

เอกสารรายละเอียดทั้งหมดถูกจัดทำไว้ในโฟลเดอร์ `docs/` เพื่อใช้เป็นพิมพ์เขียว (Blueprint) ในการพัฒนาจริง:

| เอกสาร | รายละเอียด |
| :--- | :--- |
| **[01_PRD.md](file:///Users/sinthonwilke/On%20My%20Mac/GitLocal/app.project/docs/01_PRD.md)** | Product Requirements Document: เจาะลึกฟีเจอร์, Functional & Non-functional Requirements, User Stories |
| **[02_USER_JOURNEY_AND_FLOWS.md](file:///Users/sinthonwilke/On%20My%20Mac/GitLocal/app.project/docs/02_USER_JOURNEY_AND_FLOWS.md)** | แผนภาพ User Journey, Sequence Diagram ของ Background Job, Flow การแปลง HTML และการสั่ง AI สร้างเอกสาร |
| **[03_SYSTEM_ARCHITECTURE.md](file:///Users/sinthonwilke/On%20My%20Mac/GitLocal/app.project/docs/03_SYSTEM_ARCHITECTURE.md)** | สถาปัตยกรรมระบบ, Data Ingestion Pipeline, RAG Strategy, Graph Extraction Algorithm และ Rules Engine |
| **[04_DATA_SCHEMA.md](file:///Users/sinthonwilke/On%20My%20Mac/GitLocal/app.project/docs/04_DATA_SCHEMA.md)** | ฐานข้อมูล PostgreSQL ครบทุกตาราง (DDL, ER-Diagram, Foreign Keys, Vector Embeddings Index) |
| **[05_API_SPECIFICATION.md](file:///Users/sinthonwilke/On%20My%20Mac/GitLocal/app.project/docs/05_API_SPECIFICATION.md)** | ข้อกำหนด RESTful API & WebSocket สำหรับ Frontend และ Backend เชื่อมต่อกัน |
| **[06_IMPLEMENTATION_ROADMAP.md](file:///Users/sinthonwilke/On%20My%20Mac/GitLocal/app.project/docs/06_IMPLEMENTATION_ROADMAP.md)** | แผนงานพัฒนาตามลำดับความสำคัญ (Phase 1 MVP จนถึง Phase 4 Production) |
