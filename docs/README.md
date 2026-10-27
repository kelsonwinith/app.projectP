# Project P Documentation Index

Universal AI Knowledge & Collaborative Resource OS documentation tree, organized by numbered subfolders following the canonical documentation convention.

## Canonical Context

The authoritative ubiquitous language glossary is the single source of truth for concept definitions and code identifiers:
- [Ubiquitous Language](context/001-ubiquitous-language.md): Project P canonical glossary, term definitions, and words to avoid.

---

## Directory Index

| Subfolder | Document | Purpose |
| :--- | :--- | :--- |
| `context/` | [001-ubiquitous-language.md](context/001-ubiquitous-language.md) | Canonical domain vocabulary and naming invariants |
| `product/` | [001-product-requirements.md](product/001-product-requirements.md) | Product vision, core objectives, and 3-tab save requirements |
| `product/` | [002-user-journeys-and-flows.md](product/002-user-journeys-and-flows.md) | Sequence diagrams and collaboration workflow state machines |
| `product/` | [003-resource-types-and-transclusion.md](product/003-resource-types-and-transclusion.md) | Universal resource formats and cross-resource transclusions |
| `architecture/` | [001-system-architecture.md](architecture/001-system-architecture.md) | Tiered system architecture, Redis scratchpad, and locking |
| `architecture/` | [002-data-schema.md](architecture/002-data-schema.md) | PostgreSQL 16 DDL, pgvector indexes, and ERD |
| `architecture/` | [003-api-contracts.md](architecture/003-api-contracts.md) | RESTful endpoints and real-time WebSocket contracts |
| `decisions/` | [001-decisions.md](decisions/001-decisions.md) | Architecture Decision Records (ADR log) |
| `development/` | [001-implementation-roadmap.md](development/001-implementation-roadmap.md) | Phased engineering milestones and quality gates |

---

## Conventions

- Documents live at `docs/<subfolder>/<NNN>-<kebab-name>.md`.
- All product and architecture documents include a document version and status header.
- Documents describe the current state of the system; past rationale is recorded under `decisions/`.
