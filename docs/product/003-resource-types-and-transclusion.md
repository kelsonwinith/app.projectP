# Resource Types and Transclusion Specification

**Document Version**: 1.0.0
**Status**: Active

This document specifies the six primary resource formats supported by Project P, their user capabilities, concurrency models, and the cross-resource transclusion architecture.

---

## 1. Universal Resource Ecosystem (6 Resource Types)

Project P normalizes incoming file formats into structured intermediate schemas and renders them as semantic, collaborative HTML:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      UNIVERSAL RESOURCE ECOSYSTEM                      │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ 1. 📄 DOCUMENT    │ 2. 📊 TABLE/SHEET │ 3. 📽️ PRESENTATION             │
│ (Articles, Specs) │ (Data grids)      │ (Slide decks)                  │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 4. 🕸️ GRAPH/DIAGRAM│ 5. 🖼️ VISUAL/IMAGE│ 6. 💻 CODE/SPEC                │
│ (Architecture)    │ (Vision & OCR)    │ (Schemas, Contracts)           │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

### 1.1 Document (`.doc`, `.docx`, `.pdf`, `.md`, `.txt`)
- **Rendering:** Article reader view with dynamic TOC ScrollSpy.
- **Capabilities:**
  - In-place WYSIWYG block editing.
  - Split view between visual rendering and raw Markdown.
  - Block-level locking during active typing.
  - Inline annotations and transcluded embed containers.

### 1.2 Table / Spreadsheet (`.xlsx`, `.csv`, `.tsv`, `.sheet`)
- **Rendering:** High-performance interactive HTML data grid.
- **Capabilities:**
  - **Cell-Level Concurrency:** Locks only specific cell or row coordinates (`row-N:col-M`), enabling multiple collaborators to work in the same sheet simultaneously.
  - Data type formatting (Dates, Numbers, Currencies, Status tags).
  - Sorting, multi-column filtering, and summary aggregations (Sum, Avg, Min, Max).
  - Cell range export and transclusion embedding into documents.

### 1.3 Presentation (`.pptx`, `.slide`, Slide PDFs)
- **Rendering:** Interactive slide deck presenter with keyboard navigation and fullscreen mode.
- **Capabilities:**
  - Slide-by-slide presenter view with speaker notes.
  - Slide Grid Sorter: visual thumbnail overview for slide reordering.
  - Slide-level locking during live editing.
  - Single slide transclusion into external documents.

### 1.4 Graph / Diagram (`.graph`, Mermaid, Architecture Diagrams, ERDs)
- **Rendering:** Interactive canvas rendered with Mermaid and SVG.
- **Capabilities:**
  - Interactive pan, zoom, node selection, and cluster grouping.
  - Bi-directional sync: modifying node definitions updates referenced canonical glossary entries.

### 1.5 Visual / Image (`.png`, `.jpg`, `.svg`, Design boards)
- **Rendering:** High-resolution viewer with Vision AI annotation overlays.
- **Capabilities:**
  - Semantic image tagging and optical character recognition (OCR).
  - Bounding box annotations and region-specific commentary.

### 1.6 Code / Specification (`.ts`, `.py`, `.sql`, `.json`, OpenAPI)
- **Rendering:** Monospaced code viewer with syntax highlighting and line numbers.
- **Capabilities:**
  - AST parsing and symbol extraction linked directly to the canonical living glossary.
  - Contract validation and schema drift detection against database migrations.

---

## 2. Cross-Resource Transclusion (Single Source of Truth)

Transclusion allows authors to embed content blocks, table ranges, slide figures, or graph diagrams from a canonical source resource into one or more target resources by reference:

```text
Source Resource ("API Specification v2")
  └─ Block ID: #gateway-spec (Authoritative block)
         │
         ├─── Transcluded into Destination A ("System Architecture")
         └─── Transcluded into Destination B ("Product Roadmap")
```

### 2.1 Synchronization Rules
- **Reference-Only Storage:** Target resources do not clone content strings; they persist an anchor reference (`transclusion_id`, `source_resource_id`, `anchor_id`).
- **Automated Propagation:** When a source block is updated and committed, the background worker identifies all dependent transclusion pointers and refreshes rendered views without manual copy-pasting.
- **Conflict Safeguard:** If a proposed change in a source block contradicts a target document's claims, the save modal highlights the contradiction in Tab 3 before committing.
