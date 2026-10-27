# Technical & System Architecture 🏗️

เอกสารฉบับนี้อธิบายสถาปัตยกรรมทางเทคนิคของระบบ **Project P** ฉบับปรับปรุง เพื่อรองรับ **ระบบ Shared Temp Draft State**, **การล็อกระดับ Cell ในตาราง**, **3-Tab Save & Selective Staging Engine**, **สถาปัตยกรรม Canonical Term Standardization**, และ **การตรวจจับ Conflict ใน 2 จังหวะ (On Generate & On Save)**

---

## 1. สถาปัตยกรรม Shared Temp Draft State (รีเฟรชไม่หาย)

เพื่อรองรับการแก้ไขที่บันทึกชั่วคราวให้ทุกคนในห้องเห็นตรงกันและไม่สูญหายเมื่อรีเฟรช:

```
┌────────────────────────────────────────────────────────┐
│ CLIENT (Next.js 15)                                    │
│ 1. แก้ไขบล็อกหรือเซลล์เสร็จ -> คลิกออก (Unfocus)       │
│ 2. ส่ง WS: `release_and_reveal_block`                  │
└───────────────────────────┬────────────────────────────┘
                            │ WebSocket
                            ▼
┌────────────────────────────────────────────────────────┐
│ FASTAPI & POSTGRESQL SHARED TEMP STORE                 │
│ 1. บันทึกเข้าตาราง `resource_temp_drafts`:             │
│    { resource_id, anchor_id, temp_html, updated_by }   │
│ 2. อัปเดต Cache ใน Redis เพื่อให้ดึงข้อมูลเร็วระดับ ms  │
│ 3. บรอดแคสต์ `block_updated_temp` หาเพื่อนร่วมทีม       │
└────────────────────────────────────────────────────────┘
```
* **Persistence Guarantee:** เมื่อผู้ใช้คนใดรีเฟรชหน้าเว็บ หรือปิดแล้วเปิดใหม่ ระบบจะดึงเนื้อหาจาก `resource_temp_drafts` มาทับเวอร์ชันทางการ ทำให้เนื้อหาล่าสุดไม่สูญหาย

---

## 2. สถาปัตยกรรมการล็อกระดับเซลล์ในตาราง (Cell-Level Table Locking)

```
[ผู้ใช้คลิกพิมพ์ที่ตาราง เซลล์ Row 3, Col 2]
                     │
                     ▼
[WebSocket ส่ง: acquire_cell_lock(res_id, "row-03:col-02")]
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ REDIS CELL LOCK KEY                                    │
│ Key: "lock:{res_id}:row-03:col-02"                     │
│ TTL: 60 วินาที (ต่ออายุด้วย Heartbeat ทุก 15 วินาที)   │
└────────────────────────────────────────────────────────┘
                     │
    ➔ คนอื่นสามารถเข้าแก้ เซลล์ Row 3, Col 1 หรือแถวอื่นได้ตามปกติ
```

---

## 3. สถาปัตยกรรม 3-Tab Save & Selective Staging Controller

1. เมื่อผู้ใช้กดปุ่ม Save Resource:
   - Controller รัน Diff เทียบระหว่าง `resource_temp_drafts` กับ `resources` (เวอร์ชันทางการล่าสุด)
   - คำนวณสถิติคำ (`+words`, `-words`)
   - **รัน Contradiction Detector ล่วงหน้า** เพื่อนำผลการตรวจจับส่งไปแสดงใน **แท็บที่ 3 (หมายเหตุ & ข้อขัดแย้ง)**
2. เมื่อผู้ใช้ส่งคำขอยืนยันบันทึก:
   - บล็อกที่ถูกติ๊ก `[✓]`: นำเนื้อหาเขียนทับลง `resources` และสร้างเวอร์ชันใหม่ใน `resource_versions` แล้วลบออกจาก `resource_temp_drafts`
   - บล็อกที่ไม่ถูกติ๊ก `[ ]`: คงไว้ใน `resource_temp_drafts` ต่อไป
   - ทริกเกอร์ **Incremental Delta Sync** เฉพาะบล็อกที่ถูก Commit ทันที!

---

## 4. สถาปัตยกรรมจัดระเบียบคำศัพท์มาตรฐาน (Canonical Term Standardization Engine)

ลดความซ้ำซ้อนของคำที่มีความหมายเดียวกัน:

```mermaid
flowchart LR
    A[ข้อความใหม่: 'K8s', 'Kubernetes Cluster'] --> B[Synonym & Acronym Normalizer]
    B --> C[LLM Semantic Embedding Matcher]
    C --> D{ตรงกับคำหลักเดิมใน Living Glossary หรือไม่?}
    
    D -- มีคำหลักอยู่แล้ว -- --> E[ผูกเป็น Alias ใต้ Canonical Term: 'Kubernetes']
    D -- เป็นแนวคิดใหม่ -- --> F[สร้างเป็น Canonical Term ใหม่]
    
    E --> G[ใน Knowledge Graph แสดงโหนดเดียว: 'Kubernetes']
    F --> G
```

---

## 5. สถาปัตยกรรมตัวค้นหาช่องว่างความรู้ (Knowledge Gap Finder Engine)

* ระบบรันการวิเคราะห์ Graph Connectivity และ Entity Mention Counts:
  - ดึงคำศัพท์ที่ถูกกล่าวถึงใน Resource Chunks ซ้ำๆ (`frequency >= 3`)
  - ตรวจสอบว่ามีโหนดใน Graph หรือเอกสารใดที่ให้นิยามความหมายโดยตรงหรือไม่
  - หากไม่มี ➔ บันทึกเป็น **Knowledge Gap Item** พร้อมปุ่มสั่ง AI ให้ช่วยร่างเอกสารปิดช่องว่างทันที
