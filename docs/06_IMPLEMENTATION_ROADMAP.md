# Implementation Roadmap & Milestones 🚀

เอกสารฉบับนี้จัดทำแผนการพัฒนาโปรเจกต์ **CogniNest** ทีละขั้นตอน (Phase-by-Phase Roadmap) จาก Minimum Viable Product (MVP) ไปสู่ระบบที่สมบูรณ์แบบพร้อมใช้งานจริง

---

## 📅 ภาพรวมระยะเวลาและหมุดหมาย (Phased Timeline)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Core Architecture & Ingestion Engine (สัปดาห์ที่ 1 - 2)        │
│ ➔ ติดตั้ง FastAPI + Next.js + PostgreSQL + ตัวแปลง DOCX/PDF -> HTML     │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Knowledge Pillar & Living GUI (สัปดาห์ที่ 3 - 4)               │
│ ➔ Background Worker + Living Glossary + Interactive Knowledge Graph    │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Rules Engine & Grounded Chat (สัปดาห์ที่ 5 - 6)               │
│ ➔ 1-User-1-Session + Hybrid RAG + Streaming SSE + Deep Citation        │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Generative Co-Creation & Production Polish (สัปดาห์ที่ 7 - 8)   │
│ ➔ AI Document Creation + Role Permissions + Security + Optimizations   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 รายละเอียดของแต่ละหมุดหมาย (Milestone Breakdown)

### 📌 Phase 1: โครงสร้างหลักและการแปลงเอกสาร (Core & Ingestion)
* **เป้าหมาย:** ผู้ใช้สามารถสร้างโปรเจกต์ จัดโฟลเดอร์ และอัปโหลดไฟล์ที่ถูกแปลงเป็น Semantic HTML ได้อย่างถูกต้อง 100%
* **งานที่ต้องส่งมอบ:**
  1. ติดตั้ง Next.js 15 (Tailwind CSS, Lucide Icons, Shadcn UI) และ FastAPI Project Structure
  2. ตั้งค่า PostgreSQL 16 พร้อมตาราง `users`, `projects`, `folders`, `resources`
  3. พัฒนา Ingestion Pipeline:
     - Parser สำหรับ `.docx` (Mammoth/python-docx), `.pdf` (PyMuPDF), `.txt`, `.md`
     - กลไกแปลงเป็น Semantic HTML พร้อมฝังรหัสย่อหน้า `<p id="p-xxx">`
  4. สร้างหน้าจอ Resource Explorer: โฟลเดอร์แบบ Tree View (สร้าง/ย้าย/ลบ) และ HTML Reader View สำหรับอ่านเอกสาร

---

### 📌 Phase 2: เสาหลักความรู้และระบบ GUI (Knowledge Pillar & GUI)
* **เป้าหมาย:** สร้างระบบประมวลผลเบื้องหลัง (Background Worker) เพื่อสร้าง Knowledge Graph และ Living Glossary อัตโนมัติ
* **งานที่ต้องส่งมอบ:**
  1. ติดตั้ง Celery / ARQ ร่วมกับ Redis สำหรับงาน Background Jobs
  2. พัฒนาระบบ Living Glossary:
     - AI ดึงคำศัพท์และนิยามอัตโนมัติเมื่อไฟล์ถูกอัปโหลด
     - ตกแต่ง HTML Reader ให้แสดง Glossary Hover Cards เมื่อเมาส์ชี้คำศัพท์
  3. พัฒนาระบบ Interactive Knowledge Graph:
     - Worker ส่งข้อความเข้า LLM เพื่อสกัด Nodes (Entity/Concept) และ Edges
     - หน้า GUI Next.js เรนเดอร์กราฟด้วย Cytoscape.js หรือ React Flow (ซูม ลาก ฟิลเตอร์ได้)
  4. หน้าจอจัดการ Living Glossary Hub (ค้นหา, แก้ไขคำนิยาม, กดยืนยัน Verified)

---

### 📌 Phase 3: ระบบกฎและแชทอ้างอิงแหล่งที่มา (Rules & Grounded Chat)
* **เป้าหมาย:** ผู้ใช้สามารถตั้งกฎควบคุม AI และสนทนาแบบอ้างอิงเอกสารในโปรเจกต์ได้ 1-User-1-Session
* **งานที่ต้องส่งมอบ:**
  1. ติดตั้งส่วนขยาย `pgvector` และพัฒนา Semantic Chunking + Embeddings Generation
  2. พัฒนาโมดูล Project Rules Engine:
     - หน้าจอ CRUD ตั้งกฎ Do's, Don'ts, Persona, และ Formatting
     - Logic ในการ Compile กฎเข้ากับ System Prompt ก่อนเรียก LLM
  3. พัฒนาระบบแชทสไตล์ NotebookLM:
     - ล็อกสิทธิ์ 1 ผู้ใช้มี 1 Session ต่อโปรเจกต์
     - ตอบกลับแบบ Streaming SSE (Server-Sent Events)
     - Interactive Citation Tag: คลิกแล้วเด้งไปเปิด HTML Reader และเลื่อนไปยังย่อหน้าเป้าหมาย

---

### 📌 Phase 4: คำสั่งสร้างสรรค์เอกสารใหม่และขัดเกลาระบบ (Generative & Polish)
* **เป้าหมาย:** ผู้ใช้สามารถสั่งให้ AI สร้างเอกสารฉบับใหม่และบันทึกเข้าสู่โฟลเดอร์ใน Resource ได้โดยตรง
* **งานที่ต้องส่งมอบ:**
  1. ฟีเจอร์ "Save AI Output as New Resource":
     - ปุ่มบันทึกผลการสังเคราะห์จากแชทลงโฟลเดอร์ที่ต้องการ
     - แปลงข้อความที่ AI ตอบเป็น Semantic HTML และส่งให้ Worker ทำ Index ทันที
  2. Web URL Ingestion (Trafilatura Scraper)
  3. Multi-user Sharing & Role-based Permissions (Owner, Editor, Viewer)
  4. Performance Caching (Redis), Security Audit (XSS Sanitization), และ Automated E2E Tests
