"use client"

import * as React from "react"
import { INITIAL_TABLE_ROWS, type TableRowData } from "@/lib/resource-data"
import {
  useDraftStore,
  useResourceDrafts,
  useResourceOverrides,
  useResourceLocks,
} from "@/lib/draft-store"
import { useCollabStore, useCurrentUser } from "@/lib/collab-store"
import { UserEditingBadge } from "./user-editing-badge"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table as TableIcon,
  Search,
  Lock,
  ArrowUpDown,
  Filter,
  RotateCcw,
} from "lucide-react"

interface TableViewerProps {
  resourceName: string
}

export function TableViewer({ resourceName }: TableViewerProps) {
  const drafts = useResourceDrafts(resourceName)
  const committedOverrides = useResourceOverrides(resourceName)
  const cellLocks = useResourceLocks(resourceName)
  const peerLocks = useCollabStore((state) => state.peerLocks)
  const collaborators = useCollabStore((state) => state.collaborators)
  const currentUser = useCurrentUser()

  const saveTempBlock = useDraftStore((state) => state.saveTempBlock)
  const revertTempBlock = useDraftStore((state) => state.revertTempBlock)
  const acquireCellLock = useDraftStore((state) => state.acquireCellLock)
  const releaseCellLock = useDraftStore((state) => state.releaseCellLock)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortField, setSortField] = React.useState<keyof TableRowData>("subjectId")
  const [sortAsc, setSortAsc] = React.useState(true)
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; col: keyof TableRowData } | null>(null)
  const [cellInputVal, setCellInputVal] = React.useState("")

  // Compute table data combining baseline + overrides + temp drafts
  const rows = React.useMemo(() => {
    return INITIAL_TABLE_ROWS.map((row) => {
      const updatedRow = { ...row }
      ;(Object.keys(row) as Array<keyof TableRowData>).forEach((col) => {
        if (col === "id") return
        const anchorId = `cell-${row.id}-${String(col)}`
        const draft = drafts[anchorId]
        const override = committedOverrides[anchorId]
        if (draft) {
          // @ts-expect-error dynamic assign
          updatedRow[col] = col === "responseRate" ? Number(draft.proposedText) : draft.proposedText
        } else if (override !== undefined) {
          // @ts-expect-error dynamic assign
          updatedRow[col] = col === "responseRate" ? Number(override) : override
        }
      })
      return updatedRow
    })
  }, [drafts, committedOverrides])

  // Filter and sort
  const filteredRows = React.useMemo(() => {
    return rows
      .filter((r) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
          r.subjectId.toLowerCase().includes(q) ||
          r.cohort.toLowerCase().includes(q) ||
          r.currentDosage.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const valA = a[sortField]
        const valB = b[sortField]
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA))
      })
  }, [rows, searchQuery, sortField, sortAsc])

  // Summary metrics
  const avgResponse = Math.round(
    rows.reduce((acc, curr) => acc + curr.responseRate, 0) / rows.length
  )
  const activeCount = rows.filter((r) => r.status === "Active").length

  const handleStartEdit = (rowId: string, col: keyof TableRowData, currentVal: any) => {
    const lockKey = `${resourceName}:${rowId}:${String(col)}`
    if (peerLocks[lockKey]) {
      return // Prevent edit on peer-locked cells
    }
    const coord = `${rowId}:${String(col)}`
    acquireCellLock(resourceName, coord)
    setEditingCell({ rowId, col })
    setCellInputVal(String(currentVal))
  }

  const handleFinishEdit = (originalRow: TableRowData) => {
    if (!editingCell) return
    const { rowId, col } = editingCell
    const coord = `${rowId}:${String(col)}`
    const anchorId = `cell-${rowId}-${String(col)}`
    const origVal = String(originalRow[col])

    if (cellInputVal !== origVal) {
      saveTempBlock(resourceName, anchorId, origVal, cellInputVal)
    }
    releaseCellLock(resourceName, coord)
    setEditingCell(null)
  }

  const toggleSort = (field: keyof TableRowData) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Table Toolbar */}
      <div className="h-11 border-b border-border flex items-center justify-between px-5 bg-card/40 shrink-0 gap-4">
        <div className="flex items-center gap-2.5">
          <Badge variant="outline" className="font-mono text-xs gap-1.5 py-1">
            <TableIcon className="size-3.5 text-emerald-500" />
            Data Grid
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {rows.length} rows
          </span>
          {Object.keys(drafts).length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
              Temp Drafts
            </Badge>
          )}
        </div>

        {/* Tools: Filter & Metrics */}
        <div className="flex items-center gap-3">
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-2 size-3 text-muted-foreground" />
            <Input
              placeholder="Filter table..."
              className="h-7 pl-7 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px]">
              Avg: <span className="font-bold">{avgResponse}%</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[11px]">
              Active: <span className="font-bold">{activeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-muted/70 text-muted-foreground font-mono text-[11px] uppercase tracking-wider border-b border-border">
              <tr>
                <th
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("subjectId")}
                >
                  <div className="flex items-center gap-1.5">
                    Subject ID <ArrowUpDown className="size-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("cohort")}
                >
                  <div className="flex items-center gap-1.5">
                    Cohort <ArrowUpDown className="size-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Baseline Metric</th>
                <th
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort("currentDosage")}
                >
                  <div className="flex items-center gap-1.5">
                    Dosage <ArrowUpDown className="size-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-foreground text-right"
                  onClick={() => toggleSort("responseRate")}
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Response Rate <ArrowUpDown className="size-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Toxicity</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRows.map((row) => {
                const origRow = INITIAL_TABLE_ROWS.find((r) => r.id === row.id) || row
                return (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Subject ID */}
                    <td className="py-3 px-4 font-mono font-medium text-foreground">
                      {row.subjectId}
                    </td>

                    {/* Cohort */}
                    <td className="py-3 px-4 text-foreground/90">{row.cohort}</td>

                    {/* Baseline Metric */}
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {row.baselineMetric}
                    </td>

                    {/* Dosage (Editable with cell locking) */}
                    <td className="py-2 px-3">
                      {(() => {
                        const lockKey = `${resourceName}:${row.id}:currentDosage`
                        const peerLock = peerLocks[lockKey]
                        const peerCollab = peerLock
                          ? collaborators.find((c) => c.id === peerLock.collaboratorId)
                          : null

                        if (peerLock && peerCollab) {
                          return (
                            <div
                              className={`relative flex items-center justify-between p-1.5 rounded border ${peerCollab.borderColor}/50 ${peerCollab.bgLight} ring-1 ${peerCollab.ringColor} font-mono cursor-not-allowed select-none min-h-[32px]`}
                            >
                              <span className="font-semibold text-foreground text-xs">{row.currentDosage}</span>
                              <div className="absolute top-0 left-full -translate-y-1/2 -translate-x-2 pointer-events-auto z-10">
                                <UserEditingBadge collaborator={peerCollab} size="xs" textPosition="right" />
                              </div>
                            </div>
                          )
                        }

                        if (editingCell?.rowId === row.id && editingCell?.col === "currentDosage") {
                          return (
                            <div className="relative border border-blue-500 rounded p-0.5 bg-blue-50/20 ring-1 ring-blue-500/30">
                              <div className="absolute top-0 left-full -translate-y-1/2 -translate-x-2 pointer-events-auto z-10">
                                <UserEditingBadge collaborator={currentUser} size="xs" textPosition="right" />
                              </div>
                              <Input
                                className="h-7 text-xs font-mono w-full"
                                value={cellInputVal}
                                onChange={(e) => setCellInputVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleFinishEdit(origRow)
                                  if (e.key === "Escape") setEditingCell(null)
                                }}
                                autoFocus
                              />
                              {/* Floating bottom action group */}
                              <div className="absolute -bottom-8 right-0 z-30 flex items-center gap-1 p-0.5 bg-background border border-border shadow-md rounded-md">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                                  onClick={() => setEditingCell(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-6 px-1.5 text-[10px] font-medium"
                                  onClick={() => handleFinishEdit(origRow)}
                                >
                                  Confirm
                                </Button>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div
                            className="flex items-center justify-between p-1.5 rounded hover:bg-muted/80 cursor-pointer font-mono"
                            onClick={() => handleStartEdit(row.id, "currentDosage", row.currentDosage)}
                          >
                            <span>{row.currentDosage}</span>
                            {cellLocks[`${row.id}:currentDosage`] ? (
                              <Badge
                                variant="outline"
                                className="text-[9px] gap-1 text-blue-600 bg-blue-500/10 border-blue-500/20"
                              >
                                <Lock className="size-2.5" />
                                Locked by You
                              </Badge>
                            ) : drafts[`cell-${row.id}-currentDosage`] ? (
                              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                            ) : null}
                          </div>
                        )
                      })()}
                    </td>

                    {/* Response Rate (Editable with progress bar) */}
                    <td className="py-2 px-3 text-right">
                      {editingCell?.rowId === row.id && editingCell?.col === "responseRate" ? (
                        <div className="relative border border-blue-500 rounded p-0.5 bg-blue-50/20 ring-1 ring-blue-500/30">
                          <div className="absolute top-0 left-full -translate-y-1/2 -translate-x-2 pointer-events-auto z-10">
                            <UserEditingBadge collaborator={currentUser} size="xs" textPosition="right" />
                          </div>
                          <Input
                            type="number"
                            className="h-7 w-20 text-xs font-mono text-right"
                            value={cellInputVal}
                            onChange={(e) => setCellInputVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleFinishEdit(origRow)
                              if (e.key === "Escape") setEditingCell(null)
                            }}
                            autoFocus
                          />
                          {/* Floating bottom action group */}
                          <div className="absolute -bottom-8 right-0 z-30 flex items-center gap-1 p-0.5 bg-background border border-border shadow-md rounded-md">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                              onClick={() => setEditingCell(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-6 px-1.5 text-[10px] font-medium"
                              onClick={() => handleFinishEdit(origRow)}
                            >
                              Confirm
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-end gap-2 p-1.5 rounded hover:bg-muted/80 cursor-pointer font-mono"
                          onClick={() => handleStartEdit(row.id, "responseRate", row.responseRate)}
                        >
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, row.responseRate)}%` }}
                            />
                          </div>
                          <span className="font-semibold">{row.responseRate}%</span>
                          {drafts[`cell-${row.id}-responseRate`] && (
                            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </div>
                      )}
                    </td>

                    {/* Toxicity Grade */}
                    <td className="py-3 px-4">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-mono ${
                          row.toxicityGrade === "Grade 0"
                            ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                            : row.toxicityGrade === "Grade 1"
                            ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
                            : "text-rose-600 bg-rose-500/10 border-rose-500/20"
                        }`}
                      >
                        {row.toxicityGrade}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          row.status === "Active"
                            ? "border-primary/40 text-primary"
                            : row.status === "Completed"
                            ? "border-muted text-muted-foreground"
                            : "border-amber-500/40 text-amber-600"
                        }`}
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
