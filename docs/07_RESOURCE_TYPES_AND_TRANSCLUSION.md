# Resource Types & Cross-Resource Transclusion Specification 🧩

เอกสารฉบับนี้กำหนดรายละเอียดของ **ประเภท Resource ทั้งหมดในระบบ**, **สิ่งที่ผู้ใช้สามารถทำได้ในแต่ละประเภท (User Capabilities)**, และ **กลไกการอ้างอิงข้าม Resource แบบไม่ Duplicate Code (Cross-Resource Transclusion & Single Source of Truth)**

---

## 1. ประเภท Resource ทั้ง 6 ชนิด และสิ่งที่ผู้ใช้ทำได้ (Resource Capabilities)

ระบบ CogniNest แบ่งประเภท Resource ออกเป็น 6 รูปแบบหลัก โดยทั้งหมดจะถูกจัดเก็บเป็นข้อมูลโครงสร้างกลาง และ Re-represent แสดงผลบนเว็บเป็น HTML:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      UNIVERSAL RESOURCE ECOSYSTEM                      │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. 📄 DOCUMENT    │ 2. 📊 TABLE/SHEET │ 3. 📽️ PRESENTATION             │
│ (เอกสารบทความ)    │ (ตารางคำนวณ)      │ (สไลด์นำเสนอ)                  │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. 🕸️ GRAPH/DIAGRAM│ 5. 🖼️ VISUAL/IMAGE│ 6. 💻 CODE/SPEC                │
│ (แผนผังระบบ/สถาปัต)│ (รูปภาพ & Vision) │ (สคริปต์/สเปกโครงสร้าง)        │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

### 📄 1. ประเภท Document (`.doc`, `.docx`, `.pdf`, `.md`, `.txt`, Web Article)
* **การแสดงผล:** Clean Article Reader View พร้อม Dynamic Table of Contents (TOC ScrollSpy)
* **สิ่งที่ผู้ใช้ทำได้ (User Actions):**
  - **In-Place Editing:** พิมพ์แก้ไขข้อความ หัวข้อ (H1-H6), รายการ, ตาราง และ Callout Box
  - **Split View:** สลับมุมมองระหว่าง Visual WYSIWYG และ Raw Markdown
  - **Block-Level Locking:** เข้าแก้ทีละบล็อก บล็อกถูกล็อกแบบส่วนตัว และปล่อยผลลัพธ์ให้ทุกคนเห็นเมื่อ Unfocus
  - **Inline Highlighting & Comments:** คลุมดำข้อความเพื่อไฮไลต์สี หรือเพิ่มบันทึกส่วนตัว
  - **Cross-Resource Embedding:** ดึง Graph, Table, หรือ Image จาก Resource อื่นมา **ฝังเป็น Live Widget** ในเอกสารได้โดยไม่ต้องเขียนโค้ดซ้ำ

---

### 📊 2. ประเภท Table / Spreadsheet (`.sheet`, `.xlsx`, `.csv`, `.tsv`)
* **การแสดงผล:** Interactive Data Grid HTML
* **สิ่งที่ผู้ใช้ทำได้ (User Actions):**
  - **Cell-Level Locking:** ล็อกเฉพาะ Cell หรือ Row ที่กำลังพิมพ์ ทำให้เพื่อนร่วมทีมแก้ไขตารางเดียวกันคนละเซลล์ได้พร้อมกัน
  - **Data Type Formatting:** จัดรูปแบบคอลัมน์ (วันที่, ตัวเลข, สกุลเงิน, ตัวเลือก Dropdown)
  - **Sort & Filter:** ค้นหา กรองข้อมูล และจัดเรียงแถวตามคอลัมน์ที่ต้องการ
  - **Column Summary Aggregation:** แถบสรุปผลลัพธ์ท้ายคอลัมน์ (Sum, Average, Min, Max, Count)
  - **Cell Range Export/Embed:** สมาชิกสามารถเลือก Range เช่น `A1:D10` เพื่อนำไปอ้างอิงแปะใน Document

---

### 📽️ 3. ประเภท Presentation (`.slide`, `.pptx`, Slides PDF)
* **การแสดงผล:** Interactive Slide Deck HTML พร้อมโหมด Slide Grid Sorter
* **สิ่งที่ผู้ใช้ทำได้ (User Actions):**
  - **Slide-by-Slide Presenter:** เลื่อนดูสไลด์ทีละหน้า พร้อมอ่านบันทึกผู้บรรยาย (Speaker Notes)
  - **Slide Grid Sorter:** สลับเป็นมุมมอง Grid Thumbnail แสดงสไลด์ทุกหน้าพร้อมกัน ลากสลับตำแหน่งสไลด์ได้
  - **Slide Content Editing:** แก้ไขหัวข้อ Bullet points และรูปภาพในแต่ละหน้าสไลด์
  - **Slide-Level Locking:** ล็อกเฉพาะหน้าที่กำลังแก้ไข
  - **Single Slide Transclusion:** ดึงเฉพาะ "สไลด์หน้า 3" ไปฝังใน Document เพื่ออ้างอิงประกอบรายงาน

---

### 🕸️ 4. ประเภท Graph / Diagram (`.graph`, Mermaid, Architecture Diagram, Flowchart, ERD)
* **การแสดงผล:** Interactive Canvas (เรนเดอร์ด้วย Mermaid / Cytoscape / SVG)
* **สิ่งที่ผู้ใช้ทำได้ (User Actions):**
  - **Visual Node-Link Editor:** ลากวางโหนด (Nodes), เพิ่มข้อความ, ลากเส้นเชื่อม (Edges), เปลี่ยนสีและรูปร่าง
  - **Dual Mode (Code vs Canvas):** สลับดูโค้ดโครงสร้าง (Mermaid / JSON AST) หรือหน้าจอวาดภาพ
  - **Interactive Pan & Zoom:** ย่อ-ขยายและเลื่อนดูแผนผังขนาดใหญ่ได้อิสระ
  - **Component Export for Documents:** ถูกออกแบบมาเพื่อให้ Document อื่นดึงไปฝังแสดงผลเป็น **Live Interactive Diagram**

---

### 🖼️ 5. ประเภท Visual / Image (`.image`, `.png`, `.jpg`, `.jpeg`, `.svg`)
* **การแสดงผล:** Visual Card with Multimodal Vision AI
* **สิ่งที่ผู้ใช้ทำได้ (User Actions):**
  - **High-Res Zoom & Pan:** ซูมดูรายละเอียดภาพความละเอียดสูงได้ถึง 500%
  - **Vision AI Caption & OCR Editing:** อ่านและแก้ไขคำบรรยายภาพ (Caption) และข้อความที่สกัดได้จากภาพ (OCR)
  - **Bounding Box Annotation:** ลากกล่องสี่เหลี่ยมมาร์กจุดสำคัญบนภาพพร้อมแปะป้ายคำอธิบาย
  - **Knowledge Searchable:** ภาพทุกภาพค้นหาเจอผ่าน Search และ RAG ได้ด้วย Vision Caption

---

### 💻 6. ประเภท Code / Spec (`.code`, `.sql`, `.json`, `.yaml`, `.proto`)
* **การแสดงผล:** Code Editor with Syntax Highlighting & Line Numbers
* **สิ่งที่ผู้ใช้ทำได้ (User Actions):**
  - **Syntax Highlight & Formatting:** ไฮไลต์สีตามภาษาโปรแกรม และจัดย่อหน้าอัตโนมัติ (Prettify)
  - **Line Range Locking:** ล็อกเฉพาะช่วงบรรทัดที่กำลังแก้ไข
  - **Schema/Data Validator:** ตรวจสอบความถูกต้องของ JSON / YAML / SQL Schema แบบเรียลไทม์
  - **Snippet Reference:** เลือกบรรทัดที่ `15-30` เพื่อดึงไปอ้างอิงในเอกสารคู่มือ

---

## 2. กลไกการอ้างอิงข้าม Resource โดยไม่ Duplicate Code (Transclusion Engine)

### 2.1 ปัญหาของการก็อปปี้โค้ดข้ามไฟล์ (The Duplication Problem)
สมมุติเรามี:
* `Resource A`: `graph/system_architecture.graph` (แผนภาพสถาปัตยกรรมระบบ)
* `Resource B`: `docs/เอกสารระบบ.doc` (เอกสารอธิบายระบบ)
* หากนำโค้ดไดอะแกรมไปก็อปปี้แปะลงใน `เอกสารระบบ.doc` เมื่อวันหนึ่งทีมงานแก้ไข `system_architecture.graph` ข้อมูลใน `เอกสารระบบ.doc` จะกลายเป็นข้อมูลเก่า (Outdated) ทันที

### 2.2 โซลูชัน: Single Source of Truth ผ่าน Universal Resource URI
ในระบบ CogniNest เอกสารทุกชิ้น ย่อหน้า สไลด์ หรือโหนด จะมี **Universal URI** ประจำตัว:
`cogni://projects/{project_id}/resources/{resource_id}#{anchor_id}`

ผู้ใช้สามารถนำ `Resource A` ไปใส่ใน `Resource B` ได้ **2 รูปแบบ โดยไม่เกิดการ Duplicate ข้อมูล**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   RESOURCE B: "docs/เอกสารระบบ.doc"                    │
├────────────────────────────────────────────────────────────────────────┤
│ <h1>1. สถาปัตยกรรมระบบโดยรวม</h1>                                      │
│ <p>ระบบนี้ทำงานบนพื้นฐานของ Microservices Architecture ดังแผนภาพ:</p>   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 🔗 [LIVE EMBEDDED COMPONENT]                                       │ │
│ │ แหล่งที่มา: 📂 graph/system_architecture.graph                     │ │
│ │ ────────────────────────────────────────────────────────────────── │ │
│ │                     [ Interactive Canvas ]                         │ │
│ │               Client ──> FastAPI ──> PostgreSQL                    │ │
│ │             (ซูมได้, คลิกดูรายละเอียดแต่ละโหนดได้)                 │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ <p>นอกจากนี้ยังสามารถอ้างอิงแบบลิงก์ข้อความ:                            │
│ ดูรายละเอียดโครงสร้างฐานข้อมูลได้ที่ 🔗 [ER-Diagram.graph] (ชี้ดูพรีวิว)│
│ </p>                                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2.3 รูปแบบการอ้างอิงที่ 1: Live Embedded Component (Transclusion Widget)
* **การเขียนใน Document:** ผู้ใช้พิมพ์ `/embed` หรือลากไฟล์ `system_architecture.graph` มาวางในหน้าเอกสาร
* **โครงสร้างโค้ดภายใน HTML (ไม่เก็บโค้ดกราฟ แต่เก็บ Pointer):**
  ```html
  <cogni-transclusion 
      resource-id="uuid-graph-res" 
      resource-name="system_architecture.graph"
      mode="interactive-component"
      auto-sync="true">
  </cogni-transclusion>
  ```
* **พฤติกรรม:**
  1. เมื่อเปิดอ่าน `เอกสารระบบ.doc` ระบบ Next.js จะดึงข้อมูลล่าสุดจาก `system_architecture.graph` มารันเป็น Interactive Component บนหน้าเอกสารทันที
  2. มีแถบ Badge ด้านบน: `[🔗 แหล่งที่มา: graph/system_architecture.graph]` คลิกเพื่อกระโดดไปไฟล์ต้นฉบับได้
  3. **เมื่อ `system_architecture.graph` ถูกแก้ไข:** ใน `เอกสารระบบ.doc` จะอัปเดตเป็นภาพใหม่ล่าสุดตามทันทีโดยอัตโนมัติ (Single Source of Truth 100%)

---

### 2.4 รูปแบบการอ้างอิงที่ 2: Inline Semantic Link with Live Hover Card
* **การเขียนใน Document:** พิมพ์ `@` หรือพิมพ์ลิงก์ Markdown เช่น `[แผนผังระบบ](cogni://resources/uuid-graph-res)`
* **พฤติกรรม:**
  - แสดงผลเป็นข้อความลิงก์ที่มีไอคอนระบุประเภท เช่น `[🕸️ แผนผังระบบ]`
  - เมื่อผู้ใช้เอาเมาส์ชี้ (Hover) จะมี **Live Mini-Preview Card** เด้งขึ้นมา แสดงภาพย่อของแผนผังและคำอธิบายสรุป โดยที่ผู้อ่านไม่ต้องคลิกเปิดหน้าต่างใหม่

---

## 3. สรุปเมทริกซ์การ Transclude ข้ามประเภท Resource

| Resource ต้นทาง (Source) | นำไปแปะใน Document ในรูปแบบใดได้บ้าง? | ประโยชน์ที่ได้รับ |
| :--- | :--- | :--- |
| **🕸️ Graph** | • Live Interactive Canvas<br>• Inline Link + Hover Preview | แก้กราฟที่เดียว เอกสารทุกฉบับที่อ้างอิงอัปเดตตามทันที |
| **📊 Table** | • Embedded Data Grid (เลือกเฉพาะ Range เช่น A1:D10)<br>• Metric Card (ดึงเฉพาะตัวเลข 1 ช่อง เช่น ยอดขายรวม) | ไม่ต้องก็อปปี้ตารางตัวเลขซ้ำซ้อน ตัวเลขอัปเดตตามชีตหลักเสมอ |
| **📽️ Presentation** | • Single Slide Embed (ฝังเฉพาะสไลด์หน้า 4)<br>• Slide Deck Mini-Player | นำสไลด์สรุปมาประกอบรายงานได้โดยตรง |
| **🖼️ Image** | • Dynamic Image Card พร้อม Live Vision Caption | ภาพและคำบรรยายซิงค์ตรงกับคลังภาพต้นฉบับ |
| **💻 Code** | • Code Block with Syntax Highlighting & Line Anchor | โค้ดตัวอย่างในคู่มือจะตรงกับสคริปต์จริงเสมอ |
