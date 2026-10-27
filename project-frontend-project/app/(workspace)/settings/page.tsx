"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Check,
  CheckCircle2,
  HardDrive,
  Laptop,
  Moon,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  Users,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Settings State
  const [workspaceName, setWorkspaceName] = React.useState("Project P")
  const [workspaceDescription, setWorkspaceDescription] = React.useState(
    "Universal AI Knowledge & Collaborative Resource OS"
  )
  const [autoSyncTransclusion, setAutoSyncTransclusion] = React.useState(true)
  const [conflictCheckOnGenerate, setConflictCheckOnGenerate] = React.useState(true)
  const [conflictCheckOnSave, setConflictCheckOnSave] = React.useState(true)
  const [sharedTempDrafts, setSharedTempDrafts] = React.useState(true)
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const isDarkMode = mounted && resolvedTheme === "dark"

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17212b] dark:text-[#f1f5f9]">
              Workspace Settings
            </h1>
            <p className="mt-1 text-sm text-[#637080] dark:text-[#90a0b2]">
              Manage appearance, AI fact-checking rules, collaborative temp drafts, and team permissions.
            </p>
          </div>

          <Button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#1c5da7] hover:bg-[#164b87] text-white shadow-sm"
          >
            {savedSuccess ? (
              <>
                <Check className="size-4 text-emerald-300" />
                <span>Saved successfully</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>

        {/* 1. Appearance & Theme Settings */}
        <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Palette className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                  Appearance & Theme
                </CardTitle>
                <CardDescription className="text-xs text-[#637080] dark:text-[#90a0b2]">
                  Customize how Project P looks on your device or sync with system preferences.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-[#edf0f3] dark:bg-[#242e3a]" />
          <CardContent className="space-y-6 pt-6">
            {/* Dark Mode Quick Switch */}
            <div className="flex items-center justify-between rounded-xl border border-[#edf0f3] dark:border-[#242e3a] p-4 bg-[#f8fafc]/50 dark:bg-[#1a222c]/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-medium text-[#17212b] dark:text-[#e8edf2]">
                  {isDarkMode ? <Moon className="size-4 text-violet-400" /> : <Sun className="size-4 text-amber-500" />}
                  <span>Dark Theme</span>
                </div>
                <div className="text-xs text-[#637080] dark:text-[#90a0b2]">
                  Switch between light and high-contrast dark color scheme
                </div>
              </div>
              {mounted && (
                <Switch
                  checked={resolvedTheme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  aria-label="Toggle dark mode"
                />
              )}
            </div>

            {/* Theme Visual Selector Cards */}
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#a0a9b5] dark:text-[#64748b]">
                Theme Mode
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Light Option */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all ${
                    mounted && theme === "light"
                      ? "border-[#1c5da7] bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                      : "border-[#e4e8ee] dark:border-[#242e3a] hover:border-[#cbd5e1] dark:hover:border-[#374151]"
                  }`}
                >
                  <div className="grid size-10 place-items-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50">
                    <Sun className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#17212b] dark:text-[#f1f5f9]">Light</div>
                    <div className="text-xs text-[#637080] dark:text-[#90a0b2]">Clean bright canvas</div>
                  </div>
                  {mounted && theme === "light" && (
                    <div className="absolute top-2 right-2 rounded-full bg-[#1c5da7] text-white p-0.5">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>

                {/* Dark Option */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all ${
                    mounted && theme === "dark"
                      ? "border-[#1c5da7] bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                      : "border-[#e4e8ee] dark:border-[#242e3a] hover:border-[#cbd5e1] dark:hover:border-[#374151]"
                  }`}
                >
                  <div className="grid size-10 place-items-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200/50">
                    <Moon className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#17212b] dark:text-[#f1f5f9]">Dark</div>
                    <div className="text-xs text-[#637080] dark:text-[#90a0b2]">Low-light contrast</div>
                  </div>
                  {mounted && theme === "dark" && (
                    <div className="absolute top-2 right-2 rounded-full bg-[#1c5da7] text-white p-0.5">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>

                {/* System Option */}
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`group relative flex flex-col items-center gap-3 rounded-xl border p-4 text-center transition-all ${
                    mounted && theme === "system"
                      ? "border-[#1c5da7] bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                      : "border-[#e4e8ee] dark:border-[#242e3a] hover:border-[#cbd5e1] dark:hover:border-[#374151]"
                  }`}
                >
                  <div className="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Laptop className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#17212b] dark:text-[#f1f5f9]">System</div>
                    <div className="text-xs text-[#637080] dark:text-[#90a0b2]">Follow OS setting</div>
                  </div>
                  {mounted && theme === "system" && (
                    <div className="absolute top-2 right-2 rounded-full bg-[#1c5da7] text-white p-0.5">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Workspace Profile & Single Source of Truth Rules */}
        <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                  Single Source of Truth & Fact Checking
                </CardTitle>
                <CardDescription className="text-xs text-[#637080] dark:text-[#90a0b2]">
                  Configure transclusion sync, two-stage conflict detection, and live temporary drafts.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-[#edf0f3] dark:bg-[#242e3a]" />
          <CardContent className="space-y-5 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212b] dark:text-[#e8edf2]">
                  Workspace Name
                </label>
                <Input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="bg-[#f8fafc] dark:bg-[#121820] border-[#d9e1ec] dark:border-[#2a3644]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#17212b] dark:text-[#e8edf2]">
                  Workspace Vision / Focus
                </label>
                <Input
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  className="bg-[#f8fafc] dark:bg-[#121820] border-[#d9e1ec] dark:border-[#2a3644]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {/* SSoT Transclusion */}
              <div className="flex items-center justify-between rounded-xl border border-[#edf0f3] dark:border-[#242e3a] p-4 bg-[#f8fafc]/50 dark:bg-[#1a222c]/50">
                <div className="space-y-0.5 pr-4">
                  <div className="text-sm font-medium text-[#17212b] dark:text-[#e8edf2]">
                    Transclusion Auto-Sync (SSoT)
                  </div>
                  <div className="text-xs text-[#637080] dark:text-[#90a0b2]">
                    Automatically propagate block updates to all referenced documents across the workspace.
                  </div>
                </div>
                {mounted && (
                  <Switch
                    checked={autoSyncTransclusion}
                    onCheckedChange={setAutoSyncTransclusion}
                  />
                )}
              </div>

              {/* Conflict Detection on Generate */}
              <div className="flex items-center justify-between rounded-xl border border-[#edf0f3] dark:border-[#242e3a] p-4 bg-[#f8fafc]/50 dark:bg-[#1a222c]/50">
                <div className="space-y-0.5 pr-4">
                  <div className="text-sm font-medium text-[#17212b] dark:text-[#e8edf2]">
                    Conflict Check on Resource Generate
                  </div>
                  <div className="text-xs text-[#637080] dark:text-[#90a0b2]">
                    AI scans drafted content against all existing specifications before letting you preview or save.
                  </div>
                </div>
                {mounted && (
                  <Switch
                    checked={conflictCheckOnGenerate}
                    onCheckedChange={setConflictCheckOnGenerate}
                  />
                )}
              </div>

              {/* Conflict Detection on Save */}
              <div className="flex items-center justify-between rounded-xl border border-[#edf0f3] dark:border-[#242e3a] p-4 bg-[#f8fafc]/50 dark:bg-[#1a222c]/50">
                <div className="space-y-0.5 pr-4">
                  <div className="text-sm font-medium text-[#17212b] dark:text-[#e8edf2]">
                    Conflict Check on 3-Tab Save Modal
                  </div>
                  <div className="text-xs text-[#637080] dark:text-[#90a0b2]">
                    Highlight conflicting claims and number mismatches in Tab 3 (Notes & Conflicts).
                  </div>
                </div>
                {mounted && (
                  <Switch
                    checked={conflictCheckOnSave}
                    onCheckedChange={setConflictCheckOnSave}
                  />
                )}
              </div>

              {/* Shared Temp Draft State */}
              <div className="flex items-center justify-between rounded-xl border border-[#edf0f3] dark:border-[#242e3a] p-4 bg-[#f8fafc]/50 dark:bg-[#1a222c]/50">
                <div className="space-y-0.5 pr-4">
                  <div className="text-sm font-medium text-[#17212b] dark:text-[#e8edf2]">
                    Central Shared Temp Draft State
                  </div>
                  <div className="text-xs text-[#637080] dark:text-[#90a0b2]">
                    Preserve uncommitted block edits across page refreshes and broadcast live preview to peers.
                  </div>
                </div>
                {mounted && (
                  <Switch
                    checked={sharedTempDrafts}
                    onCheckedChange={setSharedTempDrafts}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Team & Collaborators */}
        <Card className="border-[#e4e8ee] dark:border-[#242e3a] bg-white dark:bg-[#161c24] shadow-xs">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <Users className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                    Team Members & Roles
                  </CardTitle>
                  <CardDescription className="text-xs text-[#637080] dark:text-[#90a0b2]">
                    Collaborators with access to this workspace and locked resources.
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Invite Member
              </Button>
            </div>
          </CardHeader>
          <Separator className="bg-[#edf0f3] dark:bg-[#242e3a]" />
          <CardContent className="pt-6">
            <div className="divide-y divide-[#edf0f3] dark:divide-[#242e3a]">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 bg-[#dbeafe] dark:bg-[#1e3a8a] text-[#25558c] dark:text-[#93c5fd]">
                    <AvatarFallback className="text-xs font-semibold">SW</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                      Sarah Wong (You)
                    </div>
                    <div className="text-[11px] text-[#637080] dark:text-[#90a0b2]">
                      sarah.wong@project-p.internal
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-900/60 dark:text-blue-400">
                  Workspace Owner
                </Badge>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 bg-[#dcfce7] dark:bg-[#064e3b] text-[#166534] dark:text-[#86efac]">
                    <AvatarFallback className="text-xs font-semibold">AR</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                      Alex Rivera
                    </div>
                    <div className="text-[11px] text-[#637080] dark:text-[#90a0b2]">
                      alex.r@project-p.internal
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Editor
                </Badge>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-8 bg-[#f3e8ff] dark:bg-[#581c87] text-[#6b21a8] dark:text-[#d8b4fe]">
                    <AvatarFallback className="text-xs font-semibold">JL</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xs font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                      Jordan Lee
                    </div>
                    <div className="text-[11px] text-[#637080] dark:text-[#90a0b2]">
                      jordan.lee@project-p.internal
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Reviewer
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
