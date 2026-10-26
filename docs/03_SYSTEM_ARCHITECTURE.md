# Technical & System Architecture 🏗️

เอกสารฉบับนี้อธิบายสถาปัตยกรรมทางเทคนิคของระบบ **CogniNest** อย่างครอบคลุม โดยเน้นการรองรับไฟล์ทุกประเภท (Any File Ingestion), การแปลงเป็น Semantic HTML หลากมิติ (Multi-Format HTML Representation), กลไก AI Vision Pipeline สำหรับรูปภาพ, ระบบ Universal Granular Citation และ Impact Analysis Engine

---

## 1. ผังสถาปัตยกรรมระบบรวม (Detailed Component Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Next.js 15)                       │
│  ┌──────────────────────┬──────────────────────┬────────────────────┐  │
│  │ Multi-Format Reader: │ Interactive          │ Floating Action    │  │
│  │ - Document View      │ Knowledge Graph      │ Selection Toolbar  │  │
│  │ - Slide Deck View    │ (Cytoscape/ReactFlow)│ (Chat / Glossary)  │  │
│  │ - Spreadsheet View   ├──────────────────────┼────────────────────┤  │
│  │ - Vision Media View  │ Living Glossary Hub  │ Private Chat       │  │
│  │ - Graph/Flow View    │ (Hover Popovers)     │ Studio (SSE)       │  │
│  └──────────────────────┴──────────────────────┴────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST / SSE / WebSocket
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND API LAYER (Python FastAPI)                 │
│  ┌──────────────────────┬──────────────────────┬────────────────────┐  │
│  │ Auth & Multi-tenant  │ Pre-flight Impact    │ RAG & Rules        │  │
│  │ (Shared Commons vs   │ Analysis Engine      │ Compiler Service   │  │
│  │  Private Sessions)   │ (Pre-delete checks)  │ (Prompt Harness)   │  │
│  └──────────────────────┴──────────────────────┴────────────────────┘  │
└──────────────────┬────────────────────────────────┬────────────────────┘
                   │                                │ Enqueue Tasks
                   ▼                                ▼
┌──────────────────────────────────┐ ┌──────────────────────────────────┐
│     DATABASE & VECTOR STORE      │ │       ASYNCHRONOUS WORKER        │
│          (PostgreSQL 16)         │ │         (Celery / Redis)         │
│  ┌─────────────────────────────┐ │ │  ┌─────────────────────────────┐ │
│  │ Relational: Users, Projects │ │ │  │ 1. Multi-Format Converter   │ │
│  │ Folders, Glossaries, Rules  │ │ │  │    (Doc/Slide/Sheet/Vision) │ │
│  ├─────────────────────────────┤ │ │  ├─────────────────────────────┤ │
│  │ Vector Store (pgvector):    │ │ │  │ 2. AI Multimodal Vision     │ │
│  │ Chunks & Granular Anchors   │ │ │  │    (Image Captioning)       │ │
│  ├─────────────────────────────┤ │ │  ├─────────────────────────────┤ │
│  │ Graph: Nodes & Edges        │ │ │  │ 3. Living Glossary Extractor│ │
│  └─────────────────────────────┘ │ │  ├─────────────────────────────┤ │
│                                  │ │  │ 4. Knowledge Graph Extractor│ │
│                                  │ │  └─────────────────────────────┘ │
└──────────────────────────────────┘ └──────────────────────────────────┘
```

---

## 2. Universal Ingestion & Multi-Format Representation Engine

ระบบรับไฟล์ทุกประเภท แล้วแปลงเข้าสู่ **Intermediate Canonical Representation (ICR)** ก่อนเรนเดอร์ออกมาเป็น Interactive HTML ตามลักษณะของข้อมูล:

### 2.1 ตระกูลเอกสารข้อความ (Documents: `.docx`, `.pdf`, `.txt`, `.md`, Web URL)
* **เครื่องมือสกัด:** `Mammoth`, `PyMuPDF`, `Markdown-it-py`, `Trafilatura`
* **รูปแบบการแปลงเป็น HTML:**
  - สร้างโครงสร้าง `<article class="doc-view">`
  - ฝัง ID ประจำย่อหน้าแบบต่อเนื่อง: `<p id="p-001">เนื้อหา...</p>`
  - ตาราง: `<table id="tbl-001">...</table>`
  - หัวข้อ: `<h1 id="sec-1">หัวข้อหลัก</h1>`

### 2.2 ตระกูลสไลด์นำเสนอ (Presentations: `.pptx`, Keynote)
* **เครื่องมือสกัด:** `python-pptx`
* **รูปแบบการแปลงเป็น HTML:**
  - แปลงแต่ละแผ่นสไลด์เป็น Container:
    ```html
    <section class="slide-deck">
      <div class="slide-card" id="slide-1" data-slide-number="1">
        <h2 class="slide-title">Market Analysis 2026</h2>
        <div class="slide-body">...</div>
        <div class="speaker-notes" id="slide-1-notes">...บันทึกของผู้บรรยาย...</div>
      </div>
    </section>
    ```

### 2.3 ตระกูลตารางและสเปรดชีต (Spreadsheets: `.xlsx`, `.xls`, `.csv`, `.tsv`)
* **เครื่องมือสกัด:** `OpenPyXL`, `pandas`
* **รูปแบบการแปลงเป็น HTML:**
  - เรนเดอร์เป็น Interactive Data Grid พร้อมระบบ Filter, Sort และระบุพิกัดเซลล์:
    ```html
    <div class="spreadsheet-view" data-sheet="Q1_Financials">
      <table id="sheet-q1">
        <thead>
          <tr id="sheet-q1-header"><th>A (Quarter)</th><th>B (Revenue)</th></tr>
        </thead>
        <tbody>
          <tr id="sheet-q1-R1"><td id="sheet-q1-R1C1">Q1</td><td id="sheet-q1-R1C2">$1,200,000</td></tr>
        </tbody>
      </table>
    </div>
    ```

### 2.4 ตระกูลรูปภาพและไดอะแกรม (Images with AI Vision: `.png`, `.jpg`, `.svg`, `.webp`)
* **เครื่องมือสกัด & Vision Pipeline:**
  1. จัดเก็บไฟล์ภาพต้นฉบับลง Object Storage (หรือ File Server)
  2. ส่งภาพเข้าโมเดล **AI Multimodal Vision** (เช่น GPT-4o Vision หรือ Gemini Flash Vision) พร้อม Prompt:
     *"จงบรรยายองค์ประกอบ แผนภาพ ตาราง ตัวอักษร และใจความสำคัญทั้งหมดในภาพนี้อย่างละเอียด เพื่อใช้เป็นฐานความรู้ RAG"*
  3. AI สร้างคำบรรยายเชิงลึก (Dense Semantic Description)
* **รูปแบบการแปลงเป็น HTML:**
  ```html
  <figure class="vision-image-view" id="fig-img-001">
    <div class="image-wrapper">
      <img src="/storage/resources/architecture-diagram.png" alt="Architecture Diagram" />
    </div>
    <figcaption class="ai-vision-caption" id="fig-img-001-desc">
      <h4>คำบรรยายภาพโดย AI Vision:</h4>
      <p id="fig-img-001-p1">แผนภาพแสดงสถาปัตยกรรมไมโครเซอร์วิส โดยมี API Gateway อยู่ตรงกลาง...</p>
    </figcaption>
  </figure>
  ```
  *คำบรรยายนี้จะถูกนำไปตัดเป็น Chunk และสร้าง Vector Embedding ทำให้ระบบสามารถค้นหาและตอบคำถามจากภาพได้ 100%*

---

## 3. มาตรฐานระบบอ้างอิงสากล (Universal Citation Protocol)

เพื่อให้ทุกคำตอบของ AI สามารถชี้พิกัดกลับไปยังแหล่งข้อมูลได้อย่างแม่นยำ ไม่ว่าข้อมูลนั้นจะอยู่ในฟอร์แมตใด:

### โครงสร้าง Universal Anchor Tag
`[Ref: <resource_name> #<anchor_id>]`

| ชนิดข้อมูล | ตัวอย่าง Citation Tag | พิกัดการกระโดดไปยัง HTML Reader |
| :--- | :--- | :--- |
| **Document** | `[Ref: manual.docx #p-042]` | เลื่อนจอไปยังย่อหน้าที่ 42 และไฮไลต์ข้อความ |
| **Presentation** | `[Ref: pitch_deck.pptx #slide-04]` | พลิกสไลด์ไปยังแผ่นที่ 4 พร้อมโฟกัสเนื้อหา |
| **Spreadsheet** | `[Ref: profit_2026.xlsx #sheet1-R8C3]` | สกรอลล์ตารางไปยังแถวที่ 8 คอลัมน์ที่ 3 พร้อมตีกรอบสี |
| **Image** | `[Ref: network_topo.png #fig-img-001-p1]` | เปิดภาพต้นฉบับพร้อมไฮไลต์คำบรรยายของ AI ด้านล่าง |

---

## 4. สถาปัตยกรรม Pre-flight Impact Analysis Engine (ก่อนลบข้อมูล)

เมื่อผู้ใช้ส่งคำขอตรวจสอบผลกระทบก่อนลบ Resource:
```
[User กดลบ Resource X]
         │
         ▼
[Pre-flight Impact Analyzer Service]
         ├─ 1. Query: ค้นหาคำศัพท์ใน project_glossaries ที่มี source_resource_ids มี X เพียงไฟล์เดียว
         ├─ 2. Query: ค้นหาโหนดใน knowledge_graph_nodes ที่เชื่อมกับ X
         ├─ 3. Query: ค้นหา knowledge_syntheses ที่อ้างอิง X
         │
         ▼
[Generate Impact Report JSON]
{
  "resource_id": "...",
  "resource_name": "quarterly_report.docx",
  "affected_glossaries_count": 4,
  "affected_glossary_terms": ["EBITDA", "Churn Rate", "LTV", "CAC"],
  "affected_nodes_count": 7,
  "affected_syntheses_count": 2
}
         │
         ▼
[Frontend แสดง Impact Modal เตือนผู้ใช้ก่อนยืนยัน]
```
