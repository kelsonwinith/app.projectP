"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  ChevronRight,
  Moon,
  PanelLeft,
  Search,
  Sun,
} from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function WorkspaceHeader() {
  const pathname = usePathname()
  const { openResource, setSearchOpen } = useWorkspace()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getPageTitle = () => {
    if (openResource) return openResource
    if (pathname === "/knowledge-hub") return "Knowledge Hub"
    if (pathname === "/glossary") return "Living Glossary"
    if (pathname === "/activity") return "Workspace Activity"
    if (pathname === "/settings") return "Settings & Preferences"
    return "Workspace overview"
  }

  const getBreadcrumbLabel = () => {
    if (openResource) return openResource
    if (pathname === "/knowledge-hub") return "Knowledge hub"
    if (pathname === "/glossary") return "Glossary"
    if (pathname === "/activity") return "Activity"
    if (pathname === "/settings") return "Settings"
    return "Workspace"
  }

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
  }

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] px-5 sm:px-8 shrink-0">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation"
          className="grid size-8 place-items-center rounded-md border border-[#e4e8ee] dark:border-[#242e3a] text-[#657384] lg:hidden"
        >
          <PanelLeft className="size-4" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-[12px] text-[#8a95a3] dark:text-[#64748b]">
            <span>Project P</span>
            <ChevronRight className="size-3" />
            <span className="font-medium text-[#344250] dark:text-[#cbd5e1]">
              {getBreadcrumbLabel()}
            </span>
          </div>
          <div className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em] text-[#17212b] dark:text-[#f1f5f9]">
            {getPageTitle()}
          </div>
        </div>
      </div>

      {/* Right: Search, Member Avatars, Theme Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Search / Command Button */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden h-9 items-center gap-2 rounded-md border border-[#e4e8ee] dark:border-[#242e3a] bg-[#fafbfc] dark:bg-[#1e2530] px-3 text-[12px] text-[#677687] dark:text-[#94a3b8] shadow-xs sm:flex hover:border-[#cbd5e1] transition-colors"
        >
          <Search className="size-3.5" />
          <span>Search</span>
          <span className="ml-4 rounded border border-[#e4e8ee] dark:border-[#334155] bg-white dark:bg-[#0f172a] px-1.5 py-0.5 text-[10px] text-[#a1aab5] font-mono">
            ⌘ K
          </span>
        </button>

        {/* Quick Theme Toggle Button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="size-9 p-0 border-[#e4e8ee] dark:border-[#242e3a]"
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="size-4 text-amber-400" />
                ) : (
                  <Moon className="size-4 text-[#637080]" />
                )}
              </Button>
            }
          />
          <TooltipContent>
            {mounted && resolvedTheme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
          </TooltipContent>
        </Tooltip>

        {/* Member Avatars */}
        <div className="flex -space-x-2">
          <div className="grid size-7 place-items-center rounded-full border-2 border-white dark:border-[#161c24] bg-[#f3d6c4] text-[9px] font-semibold text-[#87573f]">
            JD
          </div>
          <div className="grid size-7 place-items-center rounded-full border-2 border-white dark:border-[#161c24] bg-[#d6e6d4] text-[9px] font-semibold text-[#477448]">
            MK
          </div>
          <div className="grid size-7 place-items-center rounded-full border-2 border-white dark:border-[#161c24] bg-[#ddd4ee] text-[9px] font-semibold text-[#664d8f]">
            +4
          </div>
        </div>
      </div>
    </header>
  )
}
