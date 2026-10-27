import * as React from "react"
import { WorkspaceSidebar } from "@/components/workspace-sidebar"
import { WorkspaceHeader } from "@/components/workspace-header"
import { WorkspaceChat } from "@/components/workspace-chat"
import { SearchDialog } from "@/components/search-dialog"

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#f7f8fa] dark:bg-[#0f141a] text-[#17212b] dark:text-[#f1f5f9] flex">
      <WorkspaceSidebar />
      <section className="min-w-0 flex-1 flex flex-col h-screen max-h-screen overflow-hidden">
        <WorkspaceHeader />
        <main className="flex-1 min-h-0 overflow-y-auto pb-28">
          {children}
        </main>
      </section>

      <WorkspaceChat />
      <SearchDialog />
    </div>
  )
}
