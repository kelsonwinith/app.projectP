# Product Requirements Document (PRD) 📋
## Project: CogniNest (Universal AI Knowledge & Collaborative Resource OS)

---

## 1. วิสัยทัศน์และเป้าหมายของผลิตภัณฑ์ (Product Vision & Goals)

### 1.1 วิสัยทัศน์ (Vision)
สร้างแพลตฟอร์มบริหารจัดการและสังเคราะห์องค์ความรู้ยุคใหม่ที่รองรับ **"ไฟล์อะไรก็ได้ในโลก"** โดยแปลงข้อมูลต้นฉบับให้อยู่ในรูปแบบข้อมูลมาตรฐานของระบบ และนำเสนอใหม่ (Re-represented) ผ่านหน้าเว็บเป็น **Semantic HTML หลากรูปแบบ (Document, Presentation, Interactive Table, Image with Vision AI)** ที่ผู้ใช้สามารถ **เปิดดูและแก้ไขเนื้อหาได้ทันที (In-Place Editable)** ทำงานร่วมกันแบบ **Real-time Multiplayer (เห็น Live Cursors และ AI Presence)** ควบคุมการเปลี่ยนแปลงด้วยระบบ **Human-in-the-Loop Confirmation** และเก็บบันทึกประวัติการแก้ไขครบ 100% (**Full Audit Trail & Version History**)

### 1.2 วัตถุประสงค์หลัก (Core Objectives)
1. **In-Place Editable Multi-Format Viewers:** เปิดดูไฟล์ใดๆ แล้วสามารถพิมพ์แก้ไขเนื้อหาได้ทันทีในหน้าเว็บ
2. **Explicit Save & Knowledge Sync Trigger:** การแก้ไขจะไม่บันทึกอัตโนมัติ ผู้ใช้ต้องกด "บันทึก" และกดยืนยันด้วยตนเองเท่านั้น ระบบจึงจะเริ่มรัน Background Job เพื่ออัปเดต Knowledge ประจำโปรเจกต์
3. **Human-in-the-Loop AI Review (Confirm Change):** เมื่อ AI Agent ช่วยร่างหรือแก้ไขเนื้อหา ผู้ใช้เจ้าของ Agent ต้องตรวจสอบ Diff และกดปุ่ม "Confirm Change" ข้อมูลจึงจะถูกบันทึกลง Resource จริง
4. **Real-time Multiplayer Collaboration & AI Presence:** เห็นเคอร์เซอร์และตำแหน่งการพิมพ์ของเพื่อนร่วมทีมแบบ Real-time และเห็นสถานะว่า AI Agent ของใครกำลังแก้ไขย่อหน้าใดอยู่
5. **Full Audit Trail & Version History:** ทุก Resource เก็บบันทึกประวัติการเปลี่ยนแปลงแบบ Git-like (ใครแก้, เมื่อไหร่, Diff อะไรบ้าง) ยกเว้นการแชทถามตอบส่วนตัวที่ไม่แตะต้อง Resource

---

## 2. การจัดการสิทธิ์และความร่วมมือ (Collaboration & Multi-tenancy Model)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROJECT: "NextGen Mobility"                     │
├────────────────────────────────────────────────────────────────────────┤
│ 🌐 REAL-TIME COLLABORATIVE SHARED LAYER                                │
│  ├── 📂 Resources (In-place Editable HTML, Live Cursors, Audit Log)   │
│  ├── 📖 Living Project Glossary (พจนานุกรมศัพท์เฉพาะทาง)                │
│  ├── 🕸️ Interactive Knowledge Graph (โหนดความสัมพันธ์ของทั้งโปรเจกต์)     │
│  ├── 💡 Knowledge Syntheses (บทสรุปภาพรวม)                            │
│  └── ⚙️ Project Rules (กฎและทักษะที่ใช้ร่วมกันทั้งโปรเจกต์)             │
├────────────────────────────────────────────────────────────────────────┤
│ 🔒 PRIVATE LAYER (แยกอิสระเฉพาะผู้ใช้แต่ละคน สไตล์ NotebookLM)         │
│  ├── 👤 User A Chat Session & AI Agent (ไม่ถูกนับเข้า Audit Log)       │
│  └── 👤 User B Chat Session & AI Agent (ส่วนตัว 100%)                  │
└────────────────────────────────────────────────────────────────────────┘
```

* **Human-in-the-Loop AI Action:** หาก User A สั่ง AI Agent ของตนเองว่า *"ช่วยแก้บทนำให้กระชับขึ้น"* AI จะสร้างเป็น **Proposed Changes (Diff Draft)** ซึ่งเฉพาะ User A เท่านั้นที่สามารถกด Accept หรือ Reject ได้ เมื่อกดยอมรับ ระบบจะบันทึกลง Shared Resource โดยมี Audit Log ระบุว่า *"แก้ไขโดย User A (ผ่าน AI Agent)"*

---

## 3. ขอบเขตฟังก์ชันการทำงานอย่างละเอียด (Functional Requirements)

### 3.1 การแก้ไขเนื้อหาทันทีบนหน้าเว็บ (In-Place Editable HTML Viewers)

ผู้ใช้สามารถเปิดดู Resource แล้วแก้ไขได้ทันทีตามฟอร์แมต:
* **Document Reader/Editor:** แก้ไขข้อความ หัวข้อ (H1-H6) รายการ และตารางแบบ WYSIWYG
* **Presentation Slide Editor:** แก้ไขข้อความในแต่ละสไลด์ จัดลำดับสไลด์ใหม่
* **Data Grid Table Editor:** ดับเบิลคลิกเซลล์ในตารางเพื่อพิมพ์แก้ตัวเลข/ข้อความ เพิ่มหรือลบแถวได้
* **Visual Card Editor:** แก้ไขคำบรรยายภาพ (Caption) และข้อความ OCR

#### กฎการบันทึก (Explicit Manual Save & Confirmation):
1. ระบบ **ไม่บันทึกอัตโนมัติ (No Auto-Save silently to project)** เพื่อป้องกันข้อมูลดิบที่ยังแก้ไม่เสร็จไปปนกับ Knowledge Base
2. ขณะกำลังแก้ไข หน้าจอจะมีสถานะ `Unsaved Changes` พร้อมปุ่ม `💾 บันทึกการเปลี่ยนแปลง`
3. เมื่อผู้ใช้กดปุ่มบันทึก ระบบจะแสดง **Confirmation Modal** เพื่อยืนยัน:
   - ผู้ใช้สามารถใส่บันทึกย่อ (Commit Message / Change Note) เช่น *"อัปเดตตัวเลขผลการทดลองไตรมาส 3"*
4. เมื่อกดยืนยัน:
   - บันทึกเวอร์ชันใหม่ลงตาราง `resource_versions`
   - บันทึกประวัติลง `resource_audit_logs`
   - **รัน Background Job อัตโนมัติ** เพื่อดึงคำศัพท์ใหม่เข้า Living Glossary และอัปเดต Knowledge Graph

---

### 3.2 การตรวจทานผลงานจาก AI Agent (Human-in-the-Loop AI Proposal & Review)

เมื่อผู้ใช้สั่งให้ AI Agent ในแชทส่วนตัวแก้ไขหรือเรียบเรียง Resource:
1. AI จะไม่บันทึกทับ Resource โดยตรง แต่จะสร้างสถานะ **"Pending Proposal"**
2. หน้าจอ Editor จะแสดงแถบ **Diff Review Bar** (เทียบข้อความเดิมสีแดง - ข้อความใหม่สีเขียว)
3. สมาชิกผู้สั่ง AI เท่านั้นที่จะเห็นปุ่มควบคุม:
   - `✅ ยอมรับและบันทึก (Confirm & Save Changes)`: บันทึกลง Resource และทริกเกอร์ Background Job
   - `❌ ปฏิเสธ (Discard Changes)`: ยกเลิกข้อเสนอแนะ กลับไปใช้เนื้อหาเดิม
4. เพื่อนร่วมทีมคนอื่นจะเห็นข้อความแจ้งเตือน: *"User A กำลังตรวจทานการแก้ไขจาก AI Agent"*

---

### 3.3 การทำงานร่วมกันแบบเรียลไทม์ (Multiplayer Collaboration & Live Presence)

ใช้เทคโนโลยี **WebSocket + CRDT (Yjs / Liveblocks)**:
1. **Live Multiplayer Cursors:**
   - แสดงเคอร์เซอร์พร้อมชื่อและสีประจำตัวของเพื่อนร่วมทีมที่กำลังเปิดดูหรือพิมพ์อยู่ในเอกสารเดียวกัน
   - แสดงขอบไฮไลต์ (Selection Box) รอบย่อหน้าหรือเซลล์ตารางที่เพื่อนร่วมทีมกำลังโฟกัส
2. **AI Agent Presence:**
   - หาก User B กำลังให้ AI Agent แก้ไขย่อหน้าใด บริเวณย่อหน้านั้นจะแสดงแถบประกายสีม่วง พร้อมป้ายกำกับ:  
     `🤖 AI ของ User B กำลังเรียบเรียงข้อความนี้...`
   - ป้องกันไม่ให้สมาชิกคนอื่นพิมพ์ทับตำแหน่งที่ AI กำลังทำงาน

---

### 3.4 ระบบประวัติการแก้ไขและบันทึกการตรวจสอบ (Full Audit Trail & Version History)

ทุก Resource ในโปรเจกต์จะมีแท็บ **"ประวัติและบันทึกการแก้ไข (Audit & History)"**:
1. **Audit Log Details:**
   - ผู้กระทำ (Actor: User ID, ชื่อ, และระบุว่าเป็นการแก้ด้วยมือหรือผ่าน AI Agent)
   - เวลาที่เกิดการเปลี่ยนแปลง (Timestamp)
   - ประเภทการกระทำ (Action: `RESOURCE_CREATED`, `MANUAL_EDIT`, `AI_EDIT_CONFIRMED`, `RESOURCE_MOVED`, `RESOURCE_DELETED`)
   - คำอธิบายการเปลี่ยนแปลง (Change Note)
2. **Version History & Diff Viewer:**
   - แสดงเวอร์ชันย้อนหลังทั้งหมด (v1.0, v1.1, v1.2, ...)
   - สามารถคลิกดู Diff แบบ Side-by-side หรือ Unified View ได้
   - มีปุ่ม **"ย้อนกลับสู่เวอร์ชันนี้ (Rollback to this version)"** ซึ่งต้องกดยืนยันก่อนเช่นกัน
3. **ข้อยกเว้น:**
   - คำถาม-คำตอบใน Private AI Chat จะ **ไม่ถูกบันทึกใน Audit Log** เพื่อรักษาความเป็นส่วนตัวและเนื่องจากไม่ได้ส่งผลกระทบต่อ Resource ส่วนรวมของโปรเจกต์

---

### 3.5 ระบบเตือนผลกระทบก่อนลบ (Deletion Impact Assessment)
- แสดง Impact Preview Modal เตือนจำนวนคำศัพท์ Glossary และโหนด Graph ที่จะขาดหาย
- ให้เลือกระหว่าง `Cascade Delete` หรือ `Retain Knowledge as Static Fact`

---

### 3.6 Floating Selection Toolbar ในหน้าอ่าน/แก้ไข
- คลุมดำข้อความเพื่อ: `💬 ถาม AI ในแชท`, `📖 ดึงเป็น Glossary`, `🖍️ ไฮไลต์/จดโน้ตส่วนตัว`
