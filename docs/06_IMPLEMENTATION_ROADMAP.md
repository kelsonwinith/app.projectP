# Implementation Roadmap & Milestones 🚀

เอกสารฉบับนี้จัดทำแผนการพัฒนาโปรเจกต์ **Project P** ทีละขั้นตอน (Phase-by-Phase Roadmap) จากผืนผ้าใบว่างเปล่า (Blank Canvas) สู่ระบบ Real-time Collaborative Multi-Format AI Knowledge Operating System ที่สมบูรณ์แบบ

---

## 📅 ภาพรวมระยะเวลาและหมุดหมาย (Phased Timeline)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Universal Ingestion & Advanced Multi-Format Viewers (W1-2)    │
│ ➔ Document TOC ScrollSpy + Slide Grid Sorter + Split WYSIWYG/Markdown │
│ ➔ Chat-to-Resource Creation (เริ่มคิดและสร้างเอกสารจากศูนย์)           │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Canonical Knowledge Hub & Gap Finder (W3-4)                   │
│ ➔ Canonical Living Glossary (รวมคำพ้องคำย่อลดความซ้ำซ้อน)              │
│ ➔ Knowledge Gap / Orphan Concept Finder ชี้เป้าเนื้อหาที่ยังขาด       │
│ ➔ Smart Graph Filters 5 เลเยอร์                                        │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Cell Locking, Shared Temp Draft & 3-Tab Save (W5-6)           │
│ ➔ Granular Cell-Level Locking ในตาราง Sheet                            │
│ ➔ Shared Temp Draft Store (รีเฟรชไม่หาย ทุกคนเห็นตรงกัน)               │
│ ➔ 3-Tab Save Modal พร้อมสถิติคำ และ Selective Block Staging           │
│ ➔ Quick Revert Block per Paragraph/Cell                                │
├────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Conflict Engine (Generate/Save), Rules & Polish (W7-8)        │
│ ➔ Conflict Detection 2 จังหวะ (ตอน AI ร่างเอกสาร และตอนกด Save)        │
│ ➔ Project Rules Simulator / Sandbox                                    │
│ ➔ Citation Faithfulness Check (ป้ายตรวจทานอ้างอิงตรงความจริง 100%)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 รายละเอียดของแต่ละหมุดหมาย (Milestone Breakdown)

### 📌 Phase 1: โครงสร้างหลักและวิวเวอร์ขั้นสูง (Advanced Viewers Core)
1. ติดตั้ง Next.js 15, FastAPI และ PostgreSQL 16 พร้อมส่วนขยาย `uuid-ossp`, `pgvector`, `pg_trgm`
2. พัฒนา Multi-Format Ingestion Pipeline พร้อมวิวเวอร์พิเศษ:
   - **TOC ScrollSpy:** สารบัญเลื่อนไฮไลต์ตามการอ่านจริง
   - **Slide Grid Sorter:** ดู Thumbnail ทุกสไลด์พร้อมกัน
   - **Split Mode:** สลับระหว่าง WYSIWYG และ Raw Markdown
3. พัฒนาฟังก์ชัน **Chat-to-Resource Creation**:
   - ผู้ใช้คุยกับ AI ในโปรเจกต์ว่างเปล่า เพื่อให้ช่วยคิดเนื้อหา/Requirement
   - ปุ่มบันทึกผลงานลง Shared Resource เป็นเอกสารชิ้นแรก

---

### 📌 Phase 2: ศูนย์รวมองค์ความรู้มาตรฐาน และตัวค้นหาช่องว่างความรู้
1. พัฒนาระบบ **Canonical Living Glossary**:
   - สกัดคำศัพท์พร้อมรวมคำพ้องและคำย่อเป็น "คำหลักมาตรฐาน" ลดความซ้ำซ้อน
   - ระบบ Hover Card แสดงนิยามมาตรฐานเดียวกันแม้เขียนคนละรูป
2. พัฒนาระบบ **Knowledge Gap / Orphan Concept Finder**:
   - ตรวจจับแนวคิดที่มีการเอ่ยถึงบ่อยแต่ยังไม่มีเอกสารอธิบายอย่างเป็นทางการ
   - ปุ่มสั่ง AI ร่างเอกสารใหม่ปิดช่องว่างความรู้
3. พัฒนา Interactive Knowledge Graph GUI พร้อม 5 ตัวกรองอัจฉริยะ

---

### 📌 Phase 3: ล็อกระดับเซลล์ ดราฟต์ชั่วคราว และการบันทึก 3 แท็บ
1. พัฒนาระบบ **Cell-Level Table Locking**:
   - แยกล็อกเฉพาะเซลล์/แถวในตาราง ทำให้แก้ไขพร้อมกันได้หลายคน
2. พัฒนาระบบ **Shared Temp Draft State (รีเฟรชไม่หาย)**:
   - ตาราง `resource_temp_drafts` จัดเก็บเนื้อหาที่แก้ไขชั่วคราว ทุกคนเห็นตรงกัน
   - ฟังก์ชัน **Revert Block** คืนค่าเฉพาะบล็อกนั้น
3. พัฒนาระบบ **3-Tab Save Modal**:
   - แท็บ 1 (Original), แท็บ 2 (Proposed Diff พร้อมสถิติคำและ Checkbox เลือกบล็อก), แท็บ 3 (หมายเหตุและผลตรวจ Conflict)
   - บันทึกเฉพาะบล็อกที่ติ๊ก ส่วนบล็อกที่ไม่ติ๊กจะคงเป็น Temp ต่อไป

---

### 📌 Phase 4: ระบบตรวจจับข้อขัดแย้งสองจังหวะ และการขัดเกลา
1. พัฒนาระบบ **Contradiction & Conflict Detection (On Generate & On Save)**:
   - ตรวจสอบความขัดแย้งทั้งตอน AI ร่างเอกสารใหม่ในแชท และตอนกด Save Resource
2. พัฒนา **Project Rules Simulator / Sandbox**:
   - หน้าต่างทดสอบส่งคำถามจำลองเพื่อตรวจสอบผลลัพธ์ของกฎก่อนเปิดใช้งานจริง
3. พัฒนาระบบ **Citation Faithfulness Check**:
   - ป้ายกำกับตรวจทาน `[Ref: doc #p-14 ✓]` พร้อม Popover ประโยคต้นฉบับ
4. ตรวจสอบความปลอดภัยและ Performance Audit ครบวงจร
