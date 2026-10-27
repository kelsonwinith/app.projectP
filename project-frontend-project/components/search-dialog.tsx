"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  FileText,
  Table2,
  Presentation,
  Network,
  Code2,
  ImageIcon,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function SearchDialog() {
  const router = useRouter()
  const { searchOpen, setSearchOpen, allResources, openResourceAndChat } = useWorkspace()
  const [query, setQuery] = React.useState("")

  const filtered = React.useMemo(() => {
    if (!query.trim()) return allResources
    const q = query.toLowerCase()
    return allResources.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.detail.toLowerCase().includes(q)
    )
  }, [allResources, query])

  const handleSelectResource = (name: string) => {
    openResourceAndChat(name)
    setSearchOpen(false)
    setQuery("")
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    setSearchOpen(false)
    setQuery("")
  }

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24]">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Search and Jump</DialogTitle>
          <DialogDescription>Search resources, pages, or tools in Project P</DialogDescription>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#edf0f3] dark:border-[#242e3a]">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a resource name, format, or page..."
            className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-7 p-0"
            autoFocus
          />
          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
            ESC
          </Badge>
        </div>

        {/* Quick Links & Results */}
        <ScrollArea className="max-h-80 p-3">
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Resources ({filtered.length})
            </div>

            {filtered.map((res) => {
              const Icon = res.icon || FileText
              return (
                <button
                  key={res.name}
                  type="button"
                  onClick={() => handleSelectResource(res.name)}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-[#17212b] dark:text-[#f1f5f9] hover:bg-[#f7f8fa] dark:hover:bg-[#1f2937]/60 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`grid size-7 place-items-center rounded-md shrink-0 ${res.color}`}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{res.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{res.detail}</div>
                    </div>
                  </div>
                  <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )
            })}

            <div className="mt-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono border-t border-[#edf0f3] dark:border-[#242e3a] pt-2">
              Workspace Pages
            </div>

            {[
              { label: "Workspace Overview", path: "/" },
              { label: "Knowledge Hub & Coverage", path: "/knowledge-hub" },
              { label: "Living Glossary (12 terms)", path: "/glossary" },
              { label: "Activity Log", path: "/activity" },
              { label: "Settings & Dark Theme", path: "/settings" },
            ].map((page) => (
              <button
                key={page.path}
                type="button"
                onClick={() => handleNavigate(page.path)}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-[#17212b] dark:text-[#f1f5f9] hover:bg-[#f7f8fa] dark:hover:bg-[#1f2937]/60 transition-colors"
              >
                <span>{page.label}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{page.path}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
