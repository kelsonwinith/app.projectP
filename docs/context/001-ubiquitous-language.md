# Project P Canonical Context

Project P is a universal AI knowledge workspace and collaborative resource operating system supporting multi-format resources, single-source-of-truth transclusion, and multi-user granular collaboration.

## Language

| Term | Meaning | Avoid |
| :--- | :--- | :--- |
| Resource | A structured standard content entity representing a document, table, presentation, graph, image, or code within a workspace. | File, raw blob, static asset |
| Shared Temp Draft | A local-first collaborative draft buffer persisted in client storage and synchronized across browser sessions so users see uncommitted mutations across page refreshes. | Ephemeral draft, local scratchpad, unsaved state |
| Selective Staging | The commit mechanism within the 3-tab save modal enabling authors to stage and commit specific blocks permanently while leaving other blocks in temporary state. | Partial commit, cherry-picking, batch save |
| Transclusion | The mechanism of embedding a content block or range from a canonical source resource into a destination document by reference without content duplication. | Live embed, copied block, dynamic clone |
| Canonical Term | The authoritative standardized naming and definition for a concept in the living glossary, under which all synonyms and acronyms are collapsed. | Preferred term, primary keyword, alias |
| Cell-Level Table Locking | A fine-grained concurrency control protocol locking only the specific cell coordinate being edited while peers modify other cells concurrently. | Sheet lock, table lock, row freeze |
| Faithfulness Score | A verification metric measuring the mathematical adherence of generated AI assertions to verified workspace resource claims, preventing false hallucinated statements. | Hallucination guard, grounding score, trust score |
| Conflict Detection | Automated verification identifying contradicting statements, metrics, or policies across workspace resources, triggered on generate and on save. | Contradiction check, fact discrepancy check, claim diff |
| Knowledge Gap | A domain entity or concept referenced repeatedly across workspace resources that lacks an authoritative defining resource. | Orphan concept, missing doc, dead link |
| 3-Tab Save Modal | A modal inspection interface presenting Original, Proposed with Diff, and Notes & Conflicts tabs prior to staging commits. | Save popup, commit dialog, staging modal |
| Private Section | A dedicated personal workspace hierarchy under Collections whose resources belong solely to the user and are strictly isolated from the shared knowledge index, living glossary, and contradiction detection. | Secret folder, private space, hidden drive |
| Workspace Rules | Configurable project-wide agent skills and safety directives categorized into proactive actions to perform (Do) and defensive guardrails to avoid (Avoid), injected dynamically into AI prompt evaluation. | Prompts, system instructions, AI preferences |
