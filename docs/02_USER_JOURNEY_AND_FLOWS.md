# User Journey & Interaction Workflows 🗺️

เอกสารฉบับนี้อธิบายเส้นทางประสบการณ์ผู้ใช้ (User Journey) และแผนภาพลำดับขั้นตอนการทำงาน (Sequence & Flowcharts) ฉบับปรับปรุง เพื่อรองรับ **Block-Level Locking พร้อม Heartbeat Timeout**, **Incremental Delta Knowledge Sync**, และ **Smart Knowledge Graph Filters**

---

## 1. ลำดับการล็อกระดับบล็อก และกลไก Heartbeat Timeout (Lock Heartbeat Flow)

```mermaid
sequenceDiagram
    autonumber
    actor UserA as ผู้แก้ไข (User A)
    actor UserB as เพื่อนร่วมทีม (User B)
    participant UI_A as Next.js (User A)
    participant WS as WebSocket Collaboration Server
    participant Redis as Redis Lock Store

    UserA->>UI_A: คลิกแก้ไขบล็อก <p id="p-002">
    UI_A->>WS: acquire_block_lock(res_id, "p-002")
    WS->>Redis: SET lock:res_id:p-002 user_A EX 60
    WS-->>UserB: บรอดแคสต์: บล็อก "p-002" ถูกล็อกโดย User A

    loop ทุกๆ 15 วินาที (Heartbeat Loop)
        UI_A->>WS: ping_lock_heartbeat(res_id, "p-002")
        WS->>Redis: EXPIRE lock:res_id:p-002 60 (ต่ออายุ Lock ไปอีก 60 วิ)
    end

    alt กรณี User A ปิดแท็บ หรือเน็ตหลุดกะทันหัน
        Note over UI_A,WS: สัญญาณ Heartbeat ขาดหายไป
        Note over Redis: เวลาผ่านไป 60 วินาที... Key หมดอายุ (Expired)
        WS-->>UserB: บรอดแคสต์: บล็อก "p-002" หลุดจากการล็อกแล้ว (Auto-Unlocked)
    else กรณีปกติ (User A บันทึกและ Unfocus)
        UserA->>UI_A: กดบันทึกบล็อก และคลิกเมาส์ออก (Unfocus)
        UI_A->>WS: release_block_lock(res_id, "p-002")
        WS->>Redis: DEL lock:res_id:p-002
        WS-->>UserB: อัปเดตข้อความใหม่ + ปลดล็อกบล็อก
    end
```

---

## 2. ลำดับการซิงค์ความรู้แบบประหยัด Token: Incremental Delta Sync

```mermaid
flowchart TD
    A[ผู้ใช้คลิกปุ่ม '⚡ อัปเดต Knowledge'] --> B[ระบบดึงรายชื่อไฟล์ใน modified_resources]
    B --> C[เปรียบเทียบ Diff กับเวอร์ชันก่อนหน้า: สกัด Added Text & Deleted Text]
    
    C --> D[1. สกัดเฉพาะ Added Text]
    D --> E[ส่งเฉพาะข้อความที่เพิ่มเข้าสู่ LLM เพื่อดึง Glossary & Graph Nodes ใหม่]
    E --> F[Upsert เข้าตาราง project_glossaries และ knowledge_graph_nodes]

    C --> G[2. ตรวจสอบ Deleted Text]
    G --> H[ค้นหาคำศัพท์/โหนดที่ข้อความนี้เคยอ้างอิง]
    H --> I{ยังมีเอกสารอื่นอ้างอิงอยู่หรือไม่?}
    I -- มีเอกสารอื่นอ้างอิง -- --> J[คงไว้ตามปกติ]
    I -- ไม่มีใครอ้างอิงแล้ว -- --> K[ปลดการเชื่อมโยง หรือลบออก (Pruning)]

    F --> L[คำนวณ Embeddings เฉพาะ Chunks ที่เปลี่ยนแปลง]
    K --> L
    L --> M[ล้าง modified_resources และตั้ง is_stale = false]
    M --> N[แจ้งเตือน Frontend: การซิงค์เสร็จสิ้น (ใช้ Token น้อยลง 90%+)]
```

---

## 3. ลำดับการใช้งานตัวกรอง Smart Knowledge Graph (Graph Filter Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as สมาชิกในทีม
    participant UI as Next.js Graph Viewer
    participant API as FastAPI Backend
    participant DB as PostgreSQL

    User->>UI: เปิดหน้า Knowledge Graph Hub (พบโหนด 150 โหนด หนาแน่นเกินไป)
    User->>UI: ปรับตัวกรอง:
    Note over UI,User: - เลือกโฟลเดอร์: "Clinical Trials"<br/>- เลือก Node Type: "CONCEPT"<br/>- ปรับ Hub Slider: เส้นเชื่อม >= 3 เส้น
    
    UI->>API: GET /api/v1/projects/{id}/knowledge-graph?folder_id=...&node_type=CONCEPT&min_degree=3
    API->>DB: Query โหนดและเส้นเชื่อมตามเงื่อนไข
    API-->>UI: คืนค่าเฉพาะ 18 โหนดหลักที่เป็นแกนกลาง
    
    UI->>User: เรนเดอร์กราฟใหม่ที่สะอาดตา คมชัด และตรงประเด็นทันที
```
