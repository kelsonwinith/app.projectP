# Implementation Roadmap

**Document Version**: 1.0.0
**Status**: Active

This document outlines the phased engineering milestones, deliverable checklists, and verification criteria for Project P.

---

## 1. Phase Milestones

### Phase 1: Shared Temp Drafts & 3-Tab Save Controller
- [x] Schema migration for `resource_temp_drafts` and `resource_transclusions`.
- [x] Redis scratchpad integration with WebSocket hub for sub-15ms broadcast.
- [x] 3-Tab Save Modal UI with inline diff computation and per-block selective staging checkboxes.
- [x] Block-level revert mechanism and conflict detection tab integration.

### Phase 2: Living Glossary & Canonical Term Standardization
- [x] Canonical term entity normalization engine collapsing acronyms (`K8s` -> `Kubernetes`).
- [x] Living glossary UI with alias badge groups, frequency counts, and standardization modal.
- [x] Knowledge Gap finder detecting high-frequency concepts lacking defining documents.
- [x] One-click AI drafting workflow for orphan knowledge gaps.

### Phase 3: Universal Resource Viewers & Ergonomics
- [x] Interactive Table Data Grid with cell-level concurrency locking (`row-N:col-M`).
- [x] Article reader view with TOC ScrollSpy and WYSIWYG / Markdown split mode.
- [x] Slide deck presenter with Slide Grid Sorter thumbnail management.
- [x] Centered bottom chat bar with zero-click typability and integrated open/hide chat window controls.
- [x] File explorer interaction paradigm with context menus, submenus, and @dnd-kit drag-and-drop.

### Phase 4: Production Hardening & Full-Stack Federation
- [ ] Automated Redis memory eviction policy for abandoned temp drafts (> 7 days stale).
- [ ] End-to-end WebSocket load testing with 1,000 concurrent active cell locks.
- [ ] Enterprise SSO (SAML 2.0 / OIDC) and fine-grained role-based permissions.

---

## 2. Verification and Quality Gates

| Verification Check | Target Standard | Tooling |
| :--- | :--- | :--- |
| TypeScript Compile | 0 errors | `npx tsc --noEmit` |
| Next.js Static Build | 7/7 routes prerendered | `npm run build` |
| Documentation Linter | 0 failures, numbered convention | `docs_lint.py` |
| Glossary Linter | 0 failures, Term/Meaning/Avoid format | `glossary_lint.py` |
| ADR Integrity Scan | Sequential, required sections | `adr_scan.py` |
