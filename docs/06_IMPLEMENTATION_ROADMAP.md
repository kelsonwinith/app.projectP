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
│ Phase 3: Save Diff Modal, Delta Sync & Contradiction Alert (สัปดาห์ 5-6)│
│ ➔ Whole-Document Save with Full Diff Confirmation Modal                │
│ ➔ Save-Triggered Incremental Delta Sync (รันอัตโนมัติทันทีหลัง Save)   │
│ ➔ Contradiction & Conflict Detector (ตรวจจับข้อเท็จจริงขัดแย้งข้ามไฟล์)│
│ ➔ Redis Block Lock (TTL 60s, Heartbeat Ping 15s, Auto-Expiry Safety)   │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Rules Simulator, Faithful Chat & Production Polish (สัปดาห์ 7-8)│
│ ➔ Project Rules Simulator / Sandbox (ทดสอบกฎก่อนใช้งานจริง)            │
│ ➔ Citation Faithfulness Check (ป้ายตรวจทานอ้างอิงตรงความจริง 100%)     │
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

### 📌 Phase 3: การบันทึกพร้อมดู Diff, ซิงค์ความรู้ และตรวจจับ Conflict
1. พัฒนาระบบ **Whole-Document Save with Full Diff Modal**:
   - หน้าจอเปรียบเทียบ Diff ทั้งเอกสารก่อนกดยืนยันบันทึกจริง
2. พัฒนาระบบ **Save-Triggered Incremental Delta Sync**:
   - รัน Background Job ซิงค์ความรู้ทันทีหลัง Save โดยวิเคราะห์เฉพาะ Diff ส่วนต่าง ประหยัด Token
3. พัฒนาระบบ **Contradiction & Conflict Detector**:
   - เปรียบเทียบข้อเท็จจริงใหม่กับไฟล์อื่นในโปรเจกต์ และสร้างการ์ดแจ้งเตือน Conflict Alert ใน Knowledge Hub
4. พัฒนาระบบ **Block-Level Locking พร้อม Heartbeat Safety (TTL 60s, Ping 15s)**

---

### 📌 Phase 4: ห้องทดลองกฎ, แชทอ้างอิงเที่ยงตรง และการขัดเกลาระบบ
1. พัฒนา **Project Rules Simulator / Sandbox**:
   - หน้าต่างทดสอบส่งคำถามจำลองเพื่อตรวจสอบผลลัพธ์ของกฎก่อนเปิดใช้งานจริง
2. พัฒนาระบบ **Citation Faithfulness Check**:
   - ป้ายกำกับตรวจทาน `[Ref: doc #p-14 ✓]` พร้อม Popover ประโยคต้นฉบับ
3. พัฒนาระบบ **Human-in-the-Loop AI Proposal Review**:
   - Inline Diff Bar แสดงข้อความเดิมและข้อความใหม่
   - ผู้ใช้เจ้าของ AI เป็นผู้กด Confirm Changes
4. พัฒนาระบบ **Full Audit Trail & Version History**:
   - ตาราง `resource_versions` และ `resource_audit_logs` พร้อมปุ่ม Rollback
