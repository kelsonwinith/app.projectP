# Technical & System Architecture 🏗️

เอกสารฉบับนี้อธิบายสถาปัตยกรรมทางเทคนิคของระบบ **CogniNest** ฉบับปรับปรุง เพื่อรองรับ **Block-Level Exclusive Locking (Private Typing -> Broadcast เมื่อเสร็จ)**, **Whole-Document Save พร้อม Full Diff**, **ระบบตรวจจับข้อเท็จจริงขัดแย้ง (Contradiction & Conflict Detector)**, **ระบบตรวจสอบความเที่ยงตรงของการอ้างอิง (Citation Faithfulness Engine)**, และ **ห้องทดลองกฎ AI (Rules Simulator)**

---

## 1. ผังสถาปัตยกรรมการล็อกระดับบล็อกและการเผยแพร่ผลลัพธ์ (Block Lock & Reveal Architecture)

```
┌────────────────────────────────────────────────────────┐
│ CLIENT (Next.js 15)                                    │
│ 1. Focus หรือสั่ง AI แก้บล็อก <p id="p-002">           │
│ 2. ส่ง WS: acquire_block_lock(actor="User A")          │
│ 3. พิมพ์ข้อความใน Local State (ไม่ส่งตัวหนังสือวิ่งสด)  │
│ 4. ส่ง ping_lock_heartbeat ทุก 15 วินาที               │
└───────────────────────────┬────────────────────────────┘
                            │ WebSocket
                            ▼
┌────────────────────────────────────────────────────────┐
│ WEBSOCKET PRESENCE GATEWAY (FastAPI)                   │
│ 1. บันทึกลง Redis:                                     │
│    Key: "lock:{res_id}:{anchor_id}"                    │
│    Val: { "actor": "User A", "heartbeat_at": "..." }   │
│    TTL: 60 วินาที                                      │
│ 2. บรอดแคสต์หาเพื่อนร่วมทีม:                            │
│    `block_locked` (แสดงป้าย: กำลังแก้ไขโดย User A)      │
│ 3. เมื่อ User A พิมพ์เสร็จ (Unfocus / Blur):           │
│    ➔ Client ส่ง WS: `release_and_reveal_block`         │
│    ➔ ลบ Key ใน Redis                                   │
│    ➔ บรอดแคสต์ `block_updated`: ส่งข้อความใหม่ให้       │
│      ทุกคนในห้องเห็นพร้อมกันทันที                      │
└────────────────────────────────────────────────────────┘
```

---

## 2. สถาปัตยกรรมการบันทึกเอกสารทั้งฉบับ (Whole-Document Save & Diff Engine)

1. เมื่อผู้ใช้แก้ไขบล็อกต่างๆ เสร็จสมบูรณ์แล้ว เนื้อหาใหม่จะแสดงอยู่บนหน้าจอ
2. ผู้ใช้กดปุ่ม **"💾 บันทึกเอกสาร (Save Resource)"**:
   - Client ยิง API ขอพรีวิว Diff เทียบเนื้อหาทั้งเอกสารกับเวอร์ชันเดิมในฐานข้อมูล
   - แสดงผลใน Modal ให้ตรวจทานก่อน Commit
3. เมื่อกดยืนยัน:
   - บันทึกเวอร์ชันใหม่ลง `resources` และ `resource_versions`
   - **ทริกเกอร์ Background Job ทันที:** รัน Incremental Delta Sync (วิเคราะห์เฉพาะส่วนต่างที่แก้) และรัน Contradiction Detector

---

## 3. สถาปัตยกรรมตรวจจับข้อเท็จจริงขัดแย้ง (Contradiction & Conflict Detection Engine)

ทำงานอัตโนมัติใน Background Job ทันทีหลังจากการบันทึกเอกสาร:

```
[ข้อความใหม่ที่ถูกบันทึกใน Resource A]
                  │
                  ▼
[1. Claim & Fact Extractor (LLM)]
สกัดประโยคที่เป็นข้อเท็จจริงสำคัญ (Claims)
เช่น: {"subject": "payment_term", "predicate": "is", "object": "60 days"}
                  │
                  ▼
[2. Vector Similarity Search for Cross-Claims]
ค้นหาประโยคที่มีความหมายใกล้เคียงใน Resource อื่นๆ (Resource B, C, D)
                  │
                  ▼
[3. Natural Language Inference (NLI) Verifier]
ส่งข้อเท็จจริงคู่ขนานเข้าตรวจสอบ:
- Premise: "ระยะเวลาชำระเงิน 30 วัน" (Resource B)
- Hypothesis: "ระยะเวลาชำระเงิน 60 วัน" (Resource A)
- ผลลัพธ์: CONTRADICTION (ขัดแย้งกัน)
                  │
                  ▼
[4. บันทึกลงตาราง `knowledge_conflicts`]
ส่งสัญญาณแจ้งเตือนผ่าน WebSocket สู่หน้าจอ Knowledge Hub
```

---

## 4. สถาปัตยกรรมตรวจสอบความเที่ยงตรงของการอ้างอิง (Citation Faithfulness Engine)

เพื่อให้คำตอบของ AI ใน Private Chat ไร้การบิดเบือนข้อเท็จจริง (Anti-Hallucination):
1. **Semantic Entailment Checking:** เมื่อ LLM ตอบประโยคที่อ้างอิง `[Ref: doc #p-14]` ระบบ Background Token Evaluator จะนำข้อความในประโยคนั้นเทียบกับ Chunk ต้นฉบับในย่อหน้า p-14
2. **Faithfulness Score:** หากค่าความเที่ยงตรงสูงกว่า 0.85 ระบบจะติดป้ายยืนยัน `✓` สีเขียว
3. **Hover Grounding Card:** ส่งประโยคต้นฉบับที่ตรงกันไปแสดงใน Popover เพื่อให้ผู้ใช้อ่านตรวจทานได้ทันทีโดยไม่ต้องคลิกเปิดไฟล์

---

## 5. สถาปัตยกรรมห้องทดลองกฎ AI (Project Rules Simulator / Sandbox)

* **Isolated Sandbox Context:** สร้าง Session จำลองชั่วคราว ไม่บันทึกลงประวัติแชทจริง
* **Prompt Compilation Pipeline:**
  - ดึง Active Rules ทั้งหมดมาจัดเรียงตามลำดับความสำคัญ (System Constraints -> Don'ts -> Do's -> Persona)
  - นำส่งเข้า LLM พร้อมคำถามทดสอบ
* **Compliance Auditor:** ตรวจสอบคำตอบของ AI ว่ามีคำหรือรูปแบบที่ฝ่าฝืนกฎ Don'ts หรือไม่ ก่อนส่งผลลัพธ์กลับให้ผู้ใช้ดูในหน้าจอ
