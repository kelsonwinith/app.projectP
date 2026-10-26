# Implementation Roadmap & Milestones 🚀

เอกสารฉบับนี้จัดทำแผนการพัฒนาโปรเจกต์ **CogniNest** ทีละขั้นตอน (Phase-by-Phase Roadmap) จาก Minimum Viable Product (MVP) ไปสู่ระบบ Real-time Collaborative Multi-Format AI Operating System ที่สมบูรณ์แบบ

---

## 📅 ภาพรวมระยะเวลาและหมุดหมาย (Phased Timeline)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Universal Ingestion & In-Place Editable Viewers (สัปดาห์ 1-2) │
│ ➔ FastAPI + Next.js + PostgreSQL + Ingestion Parser + In-Place Editor   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Knowledge Pillar & Living GUI Hub (สัปดาห์ 3-4)                │
│ ➔ Celery Worker + Living Glossary + Knowledge Graph + Hover Cards      │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Real-time Collaboration & AI Human-in-the-Loop (สัปดาห์ 5-6)  │
│ ➔ WebSocket Presence (Live Cursors & AI Presence) + AI Diff Review Bar │
│ ➔ Explicit Save & Commit System + Full Audit Trail & Version History   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Rules Engine, Grounded Chat & Production Polish (สัปดาห์ 7-8)  │
│ ➔ Project Rules Engine + Private 1-User RAG Chat (SSE) + Citations     │
│ ➔ Deletion Impact Assessment + Generative AI Document Creation         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 รายละเอียดของแต่ละหมุดหมาย (Milestone Breakdown)

### 📌 Phase 1: โครงสร้างหลักและการแก้ไขเอกสาร (Core & In-Place Editor)
1. ติดตั้ง Next.js 15 (Tailwind CSS, Shadcn UI, Tiptap/ProseMirror) และ FastAPI
2. ติดตั้ง PostgreSQL 16 สำหรับตาราง `users`, `projects`, `folders`, `resources`
3. พัฒนา Multi-Format Ingestion Pipeline:
   - แปลงไฟล์ Document, Presentation, Spreadsheet และ Image เข้าสู่ระบบ
   - ฉีด Anchor IDs กำกับทุกย่อหน้า/สไลด์/เซลล์
4. พัฒนา In-Place Editable Viewers (เปิดดูและแก้ไขเนื้อหาได้ทันที พร้อมสถานะ Unsaved Changes)

---

### 📌 Phase 2: เสาหลักความรู้และระบบ GUI (Knowledge Pillar & GUI Hub)
1. ติดตั้ง Redis + Celery / ARQ สำหรับงาน Background Knowledge Processing
2. พัฒนาระบบ Living Glossary:
   - Background Job สกัดคำศัพท์และนิยามอัตโนมัติ
   - หน้าจัดการ Glossary Hub พร้อมระบบ Hover Card ในหน้าอ่านเอกสาร
3. พัฒนาระบบ Interactive Knowledge Graph:
   - Worker ส่งโครงสร้างข้อมูลเข้า LLM เพื่อสกัด Nodes & Edges
   - เรนเดอร์กราฟแบบ Interactive บน Next.js ด้วย Cytoscape.js หรือ React Flow
4. กลไก Manual Save Confirmation Modal (กรอก Commit Message และสั่งรัน Background Job อัปเดต Knowledge)

---

### 📌 Phase 3: การทำงานร่วมกันแบบเรียลไทม์ และระบบควบคุม AI (Collaboration & Control)
1. ติดตั้ง WebSocket Presence Gateway:
   - ส่งตำแหน่งเคอร์เซอร์และบล็อกที่กำลังพิมพ์ (Live Multiplayer Cursors)
   - แถบแสดงสถานะ **AI Agent Presence** ป้องกันการพิมพ์ทับซ้อนกัน
2. พัฒนาระบบ Human-in-the-Loop AI Proposal:
   - เมื่อ AI ช่วยร่างข้อความ จะแสดง Inline Diff Bar (แดง/เขียว)
   - เฉพาะผู้ใช้เจ้าของ AI จึงจะมีสิทธิ์กด `Confirm Changes` หรือ `Discard`
3. พัฒนาระบบ Full Audit Trail & Version History:
   - เก็บบันทึก Snapshot ลงตาราง `resource_versions`
   - ตาราง `resource_audit_logs` บันทึกทุกความเคลื่อนไหว (ยกเว้น Private Chat) พร้อมปุ่ม Rollback

---

### 📌 Phase 4: กฎควบคุม AI, แชทส่วนบุคคล และความปลอดภัย (Rules, Chat & Polish)
1. พัฒนา Project Rules Engine (Do's, Don'ts, Persona, Formatting)
2. พัฒนาระบบแชทส่วนบุคคล (Private 1-User-1-Session per Project):
   - ค้นคืนข้อมูลแบบ Hybrid RAG (pgvector Cosine + Full-text TSV)
   - Real-time Token Streaming (SSE) พร้อม Universal Deep Citation Anchors
3. พัฒนาระบบ Deletion Impact Assessment Preview Modal
4. ฟังก์ชัน "Save AI Generation as Shared Resource"
5. ตรวจสอบความปลอดภัย (XSS Sanitization, Tenant Isolation) และ Automated Tests
