# Implementation Roadmap

**Document Version**: 1.0.0
**Status**: Active

This document outlines the phased engineering milestones, deliverable checklists, and verification criteria for Project P.

---

## 1. Phase Milestones

### Phase 1: Local-First Workspace Shell & File Explorer (Completed)
- [x] Fixed-height side panel with scoped Collections tree scrolling and 100vh viewport constraint.
- [x] Native File Explorer interaction model with right-click context menus (`ContextMenu`) and submenus.
- [x] Drag-and-drop organization (`@dnd-kit`) supporting both folder targets and root-level placement.
- [x] Sibling-scoped directory naming with dynamic gap-filling running integer reuse (e.g. `Folder/Folder`, `Document 1`).
- [x] Centered bottom chat bar with immediate typability and integrated open/hide transcript window.

### Phase 2: Living Glossary & Knowledge Gap Discovery (Completed)
- [x] Canonical living glossary UI with alias groups, frequency counters, and term standardization modal.
- [x] Knowledge Hub interface with high-frequency orphan concept gap discovery and one-click AI drafting.
- [x] Visual transclusion reference mapping and cross-resource linkage views.

### Phase 3: Universal Resource Viewers (Completed)
- [x] Document Viewer: Clean single-view article layout with dynamic TOC ScrollSpy and direct click-to-edit.
- [x] Interactive Table Grid: High-performance data grid with cell-level editing and concurrency locking.
- [x] Slide Deck Presenter: Interactive slide viewer with keyboard navigation and Slide Grid Sorter overview.
- [x] Multimodal Viewers: System Graph Canvas, Code / Spec syntax viewer, Vision Image Annotator, and Synchronized Audio Transcript Player.
- [x] Unified sub-header toolbar (`h-11`) with consistent hierarchy, floating user presence badges, and floating Confirm/Cancel action controls.

### Phase 4: Shared Temp Drafts & 3-Tab Save Modal (Completed)
- [x] Local-first shared temp draft engine persisting uncommitted block/cell edits across reloads.
- [x] Targeted block-level revert action restoring authoritative state.
- [x] 3-Tab Save Modal: Tab 1 (Original), Tab 2 (Proposed Diff with `+words/-words` stats & per-block checkboxes), Tab 3 (Notes & Conflict Detection report).

### Phase 5: Production Hardening & Cloud Sync Federation (Backlog)
- [ ] Cross-tab synchronization via `BroadcastChannel` event bus.
- [ ] Cloud sync adapter for multi-user federation.

---

## 2. Verification and Quality Gates

| Verification Check | Target Standard | Tooling |
| :--- | :--- | :--- |
| TypeScript Compile | 0 errors | `npx tsc --noEmit` |
| Next.js Static Build | 7/7 routes prerendered | `npm run build` |
| Documentation Linter | 0 failures, numbered convention | `docs_lint.py` |
| Glossary Linter | 0 failures, Term/Meaning/Avoid format | `glossary_lint.py` |
| ADR Integrity Scan | Sequential, required sections | `adr_scan.py` |
