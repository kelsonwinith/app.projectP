# Technical & System Architecture 🏗️

เอกสารฉบับนี้อธิบายสถาปัตยกรรมทางเทคนิคของระบบ **CogniNest** ฉบับปรับปรุง เพื่อรองรับ **Distributed Block Lock พร้อม Heartbeat Safety**, **ระบบซิงค์ความรู้ส่วนต่าง Incremental Delta Syncer**, และ **Smart Graph Filter Query Engine**

---

## 1. สถาปัตยกรรมการล็อกระดับบล็อกและ Heartbeat (Block Lock & Heartbeat Architecture)

เพื่อไม่ให้เกิดการแก้ไขชนกัน และป้องกันปัญหา Lock ค้างเมื่อเกิดเหตุการณ์ตัดการเชื่อมต่อ:

```
┌────────────────────────────────────────────────────────┐
│ CLIENT (Next.js 15)                                    │
│ 1. Focus บล็อก <p id="p-002">                          │
│ 2. ส่ง WS: acquire_block_lock                          │
│ 3. ตั้ง setInterval ทุก 15s ส่ง ping_lock_heartbeat    │
└───────────────────────────┬────────────────────────────┘
                            │ WebSocket
                            ▼
┌────────────────────────────────────────────────────────┐
│ WEBSOCKET PRESENCE GATEWAY (FastAPI)                   │
│ 1. บันทึกลง Redis:                                     │
│    Key: "lock:{res_id}:{anchor_id}"                    │
│    Val: { "user_id": "u-1", "heartbeat_at": "..." }    │
│    TTL: 60 วินาที                                      │
│ 2. เมื่อได้รับ ping_lock_heartbeat:                     │
│    ยืดอายุ Key ใน Redis อีก 60 วินาที (EXPIRE 60)      │
│ 3. หากขาด Ping เกิน 60 วินาที:                         │
│    Redis ลบ Key อัตโนมัติ                              │
│    Gateway บรอดแคสต์ Event `block_auto_unlocked`       │
└────────────────────────────────────────────────────────┘
```

---

## 2. สถาปัตยกรรม Incremental Delta Knowledge Extraction Service

กลไกประหยัด Token และเวลาในการประมวลผล:

```
[ผู้ใช้คลิกปุ่ม '⚡ อัปเดต Knowledge']
                     │
                     ▼
┌────────────────────────────────────────────────────────┐
│ INCREMENTAL DELTA KNOWLEDGE SYNCER                     │
│ 1. ดึง Resource ที่ถูกแก้ไขจาก `modified_resource_ids` │
│ 2. นำ `current_version` เทียบกับ `last_synced_version` │
│    เพื่อดึง Unified Diff Patch                         │
│ 3. วิเคราะห์ส่วนที่เพิ่มเข้า (Added Delta):             │
│    ➔ ส่งเฉพาะข้อความที่เพิ่มเข้า LLM เพื่อสกัด         │
│      คำศัพท์ใหม่ (Glossaries) และโหนดใหม่ (Nodes)      │
│    ➔ Upsert เข้า Database ทันที                        │
│ 4. วิเคราะห์ส่วนที่ลบออก (Deleted Delta):              │
│    ➔ Reference Counter Check: ตรวจสอบว่าคำศัพท์/โหนด   │
│      เดิมยังถูกอ้างอิงจาก Resource อื่นหรือไม่          │
│    ➔ หากไม่มีจุดอื่นอ้างอิง ทำการ Prune หรือ Unlink    │
│ 5. คำนวณ Embeddings เฉพาะ Chunks ที่ถูกแก้ไข          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
            [ประหยัด Token ได้มากกว่า 90%]
```

---

## 3. สถาปัตยกรรมตัวกรองมโนทัศน์ (Smart Graph Filter Query Engine)

เพื่อให้การเรนเดอร์กราฟในหน้าเว็บตอบสนองรวดเร็วและสะอาดตา:

### Dynamic Graph Query Builder:
* **Degree Centrality Calculation:** ฐานข้อมูลจะคำนวณจำนวนเส้นเชื่อม (Degree) แบบไดนามิก เพื่อให้ผู้ใช้สามารถเลื่อน Slider กรองเอาเฉพาะโหนดหลัก (Hub Nodes) ที่มีเส้นเชื่อมมากกว่าค่าที่กำหนดได้ทันที
* **SQL Index Optimization:**
  ```sql
  SELECT n.id, n.label, n.node_type, COUNT(e.id) as degree
  FROM knowledge_graph_nodes n
  LEFT JOIN knowledge_graph_edges e 
    ON n.id = e.source_node_id OR n.id = e.target_node_id
  WHERE n.project_id = :project_id
    AND (:folder_id IS NULL OR :folder_id = ANY(n.source_resource_ids))
    AND (:node_type IS NULL OR n.node_type = :node_type)
  GROUP BY n.id
  HAVING COUNT(e.id) >= :min_degree;
  ```
