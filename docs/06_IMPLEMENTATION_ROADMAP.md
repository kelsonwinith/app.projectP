# Implementation Roadmap & Milestones 🚀

เอกสารฉบับนี้จัดทำแผนการพัฒนาโปรเจกต์ **CogniNest** ทีละขั้นตอน (Phase-by-Phase Roadmap) จากผืนผ้าใบว่างเปล่า (Blank Canvas) สู่ระบบ Real-time Collaborative Multi-Format AI Knowledge Operating System ที่สมบูรณ์แบบ

---

## 📅 ภาพรวมระยะเวลาและหมุดหมาย (Phased Timeline)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Universal Ingestion & Blank Canvas Core (สัปดาห์ 1-2)         │
│ ➔ FastAPI + Next.js + PostgreSQL + Ingestion Engine                    │
│ ➔ Chat-to-Resource Creation (เริ่มคิดและสร้างเอกสารจากศูนย์)           │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Smart Filtered Knowledge Hub & Tag-Based Glossary (สัปดาห์ 3-4)│
│ ➔ Celery Worker + Smart Graph Filters (Degree Slider, Type, Tag)       │
│ ➔ Multi-format HTML Viewers (Document, Slide, Grid, Vision Card)       │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Block Lock with Heartbeat & Incremental Delta Sync (สัปดาห์ 5-6)│
│ ➔ Redis Block Lock (TTL 60s, Heartbeat Ping 15s, Auto-Expiry Safety)   │
│ ➔ Incremental Delta Knowledge Syncer (สกัดเฉพาะ Diff ประหยัด Token)    │
│ ➔ Stale Knowledge Tracker + Manual Update Button                       │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Context Scope, AI Review & Production Polish (สัปดาห์ 7-8)    │
│ ➔ Chat Scope Picker (Default ทั้งหมด / เลือกระบุโฟลเดอร์หรือไฟล์)       │
│ ➔ Human-in-the-Loop AI Diff Review Bar + Full Audit Trail & Rollback   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 รายละเอียดของแต่ละหมุดหมาย (Milestone Breakdown)

### 📌 Phase 1: โครงสร้างหลักและ Blank Canvas Onboarding
1. ติดตั้ง Next.js 15, FastAPI และ PostgreSQL 16 พร้อมส่วนขยาย `uuid-ossp`, `pgvector`, `pg_trgm`
2. พัฒนา Multi-Format Ingestion Pipeline:
   - แปลงไฟล์ Document, Presentation, Spreadsheet และ Image เป็น Semantic HTML
   - ฉีด Anchor IDs กำกับทุกย่อหน้า/สไลด์/เซลล์
3. พัฒนาฟังก์ชัน **Chat-to-Resource Creation**:
   - ผู้ใช้คุยกับ AI ในโปรเจกต์ว่างเปล่า เพื่อให้ช่วยคิดเนื้อหา/Requirement
   - ปุ่มบันทึกผลงานลง Shared Resource เป็นเอกสารชิ้นแรก

---

### 📌 Phase 2: ศูนย์รวมองค์ความรู้และ Smart Graph Filters
1. ติดตั้ง Celery / ARQ ร่วมกับ Redis สำหรับประมวลผล Knowledge ในพื้นหลัง
2. พัฒนาระบบ Living Glossary:
   - สกัดคำศัพท์พร้อมระบบ **Tags** แยกความหมายของคำซ้ำ (เช่น `API [Software]` vs `API [Pharmacy]`)
   - ระบบ Hover Card แสดงนิยามตรงตามหมวดหมู่ของเอกสารที่กำลังอ่าน
3. พัฒนา Interactive Knowledge Graph GUI พร้อม **5 ตัวกรองอัจฉริยะ**:
   - Folder/Resource Filter, Node Type Filter, Tag Filter, Degree Slider, และ Verification Status

---

### 📌 Phase 3: การล็อกระดับบล็อกพร้อม Heartbeat และการซิงค์ส่วนต่าง (Delta Sync)
1. พัฒนาระบบ **Block-Level Exclusive Locking พร้อม Heartbeat Safety**:
   - เชื่อมต่อ WebSocket ร่วมกับ Redis Key-Value (TTL 60s)
   - ส่ง Ping Heartbeat ทุก 15 วินาทีเพื่อต่ออายุตราบใดที่ยังแก้ไขอยู่
   - ปลดล็อกอัตโนมัติหากขาดการติดต่อไปเกิน 60 วินาที ป้องกันบล็อกค้าง
2. พัฒนาระบบ **Incremental Delta Knowledge Sync**:
   - วิเคราะห์เฉพาะไฟล์ใน `modified_resources` เทียบ Diff ส่วนต่าง
   - สกัดเฉพาะข้อความที่เพิ่มเข้า และตัดทอนคำศัพท์/โหนดที่ไม่มีการอ้างอิงแล้ว
   - ลดการใช้ Token ลงกว่า 90% และประมวลผลเร็วขึ้นอย่างมหาศาล
   - หน้าจอแสดง Stale Knowledge Indicator พร้อมปุ่มกดสั่งการด้วยตนเอง 100%

---

### 📌 Phase 4: ควบคุมขอบเขตแชท และการตรวจทานผลงาน AI (Scope & Audit)
1. พัฒนา **Context Scope Picker** ในหน้า Chat:
   - ค่าเริ่มต้นค้นหาทั้งโปรเจกต์ หรือคลิกเลือกเฉพาะบางโฟลเดอร์/เอกสาร
2. พัฒนาระบบ **Human-in-the-Loop AI Proposal Review**:
   - Inline Diff Bar แสดงข้อความเดิมและข้อความใหม่
   - ผู้ใช้เจ้าของ AI เป็นผู้กด Confirm Changes
3. พัฒนาระบบ **Full Audit Trail & Version History**:
   - ตาราง `resource_versions` และ `resource_audit_logs` พร้อมปุ่ม Rollback
   - ยกเว้นการสนทนาใน Private Chat ออกจาก Audit Log
