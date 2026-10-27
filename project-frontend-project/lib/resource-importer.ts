import { type DocumentBlock } from "./resource-data"

export function getFileExtension(filename: string): string {
  const parts = filename.split(".")
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ""
}

export function cleanBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf(".")
  const base = lastDot > 0 ? filename.slice(0, lastDot) : filename
  // Clean special characters and underscores into clean spaces
  return base.replace(/[-_]+/g, " ").trim()
}

export function determineResourceType(
  filename: string
): "Document" | "Table" | "Code" | "Image" | "Presentation" | "Graph" | "Audio" {
  const ext = getFileExtension(filename)

  switch (ext) {
    case "md":
    case "txt":
    case "doc":
    case "docx":
    case "pdf":
    case "rtf":
    case "odt":
      return "Document"

    case "csv":
    case "tsv":
    case "xlsx":
    case "xls":
    case "sheet":
      return "Table"

    case "mp3":
    case "wav":
    case "m4a":
    case "ogg":
    case "flac":
    case "aac":
      return "Audio"

    case "json":
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "py":
    case "sql":
    case "yaml":
    case "yml":
    case "sh":
    case "css":
    case "html":
    case "rust":
    case "rs":
    case "go":
      return "Code"

    case "png":
    case "jpg":
    case "jpeg":
    case "webp":
    case "svg":
    case "gif":
    case "bmp":
      return "Image"

    case "pptx":
    case "ppt":
    case "slide":
    case "key":
      return "Presentation"

    case "graph":
    case "mermaid":
    case "mmd":
      return "Graph"

    default:
      return "Document"
  }
}

/**
 * Reads file content and extracts clean raw text.
 * Handles .txt, .md, .json, .csv, as well as .docx / binary text extraction.
 */
export async function readTextFromFile(file: File): Promise<string> {
  const ext = getFileExtension(file.name)

  // Standard text formats
  if (
    [
      "txt",
      "md",
      "json",
      "csv",
      "tsv",
      "ts",
      "tsx",
      "js",
      "jsx",
      "py",
      "sql",
      "yaml",
      "yml",
      "sh",
      "css",
      "html",
    ].includes(ext)
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  // Word .docx or binary text extraction
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || "")
      // If it has XML tags (e.g. from word/document.xml in docx)
      if (text.includes("<w:t") || text.includes("<?xml")) {
        const matches = text.match(/<w:t[^>]*>(.*?)<\/w:t>/g)
        if (matches && matches.length > 0) {
          const extracted = matches
            .map((m) => m.replace(/<[^>]+>/g, ""))
            .join(" ")
            .replace(/\s+/g, " ")
          resolve(extracted)
          return
        }
      }
      // Clean readable ascii/utf8 strings from binary buffer
      const printable = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s{3,}/g, "\n\n")
      resolve(printable.trim() || `Imported content from ${file.name}`)
    }
    reader.onerror = () => resolve(`Imported file: ${file.name}`)
    reader.readAsText(file)
  })
}

/**
 * Normalizes and formats raw flattened text into clean, structured DocumentBlocks.
 * Re-layouts headings, paragraphs, and lists into prettier readable blocks.
 */
export function formatTextToPrettierBlocks(
  rawText: string,
  filename: string
): DocumentBlock[] {
  const baseName = cleanBaseName(filename)
  // 1. Normalize line endings
  const normalized = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim()

  if (!normalized) {
    return [
      {
        id: "p-001",
        title: `1. Overview of ${baseName}`,
        content: `Document imported from ${filename}. Ready for collaborative editing.`,
      },
    ]
  }

  // 2. Try splitting by Markdown headings (#, ##, ###)
  const headingRegex = /(?:^|\n)(#{1,3}\s+[^\n]+)/g
  const headingMatches = Array.from(normalized.matchAll(headingRegex))

  if (headingMatches.length >= 2) {
    const blocks: DocumentBlock[] = []
    let lastIndex = 0
    let currentTitle = `1. Introduction: ${baseName}`

    for (let i = 0; i < headingMatches.length; i++) {
      const match = headingMatches[i]
      const matchIndex = match.index!
      const headingText = match[1].replace(/^#{1,3}\s+/, "").trim()

      if (matchIndex > lastIndex) {
        const prevContent = normalized.slice(lastIndex, matchIndex).trim()
        if (prevContent) {
          blocks.push({
            id: `p-${String(blocks.length + 1).padStart(3, "0")}`,
            title: currentTitle,
            content: prevContent,
          })
        }
      }

      currentTitle = `${blocks.length + 1}. ${headingText}`
      lastIndex = matchIndex + match[0].length
    }

    // Trailing content
    const trailing = normalized.slice(lastIndex).trim()
    if (trailing) {
      blocks.push({
        id: `p-${String(blocks.length + 1).padStart(3, "0")}`,
        title: currentTitle,
        content: trailing,
      })
    }

    if (blocks.length > 0) return blocks
  }

  // 3. Fallback: Split by double line breaks (paragraphs)
  const rawParagraphs = normalized
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (rawParagraphs.length === 0) {
    return [
      {
        id: "p-001",
        title: `1. ${baseName}`,
        content: normalized,
      },
    ]
  }

  // Cluster paragraphs into structured blocks (1-2 paragraphs per block)
  const blocks: DocumentBlock[] = []
  let blockIdx = 1

  for (let i = 0; i < rawParagraphs.length; i += 2) {
    const p1 = rawParagraphs[i]
    const p2 = rawParagraphs[i + 1]
    const combinedContent = p2 ? `${p1}\n\n${p2}` : p1

    // Extract first line or summary as title if available
    let blockTitle = `${blockIdx}. Section ${blockIdx}`
    if (p1.length < 60 && !p1.includes(".")) {
      blockTitle = `${blockIdx}. ${p1}`
    } else if (blockIdx === 1) {
      blockTitle = `1. Overview: ${baseName}`
    }

    blocks.push({
      id: `p-${String(blockIdx).padStart(3, "0")}`,
      title: blockTitle,
      content: combinedContent,
    })
    blockIdx++
  }

  return blocks
}
