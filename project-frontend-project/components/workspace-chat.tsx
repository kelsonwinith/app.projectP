"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowUp,
  ChevronDown,
  ChevronUp,
  FileText,
  Minus,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useWorkspace } from "@/context/workspace-context"

export function WorkspaceChat() {
  const {
    openResource,
    chat,
    setChat,
    messages,
    sendMessage,
    handleSaveDraft,
    openResourceAndChat,
    activeRules,
  } = useWorkspace()

  // Controls whether the chat window between user and AI above the center chat bar is open or hidden
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages when chat window is open
  React.useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isChatOpen])

  const handleSend = () => {
    if (!chat.trim()) return
    sendMessage()
    setIsChatOpen(true)
  }

  // Toggle open / hide chat window
  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev)
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 lg:left-[248px] z-40 flex flex-col items-center justify-end px-4 pointer-events-none">
      <div className="w-full max-w-3xl flex flex-col gap-2">
        {/* Chat Window (Open / Hide upward drawer directly above center chat bar) */}
        {isChatOpen && (
          <div
            className="pointer-events-auto max-h-[58vh] overflow-hidden rounded-2xl border border-[#dbe5f0] dark:border-[#242e3a] bg-white/95 dark:bg-[#161c24]/95 backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.16)] flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Chat Window Header */}
            <div className="flex h-11 items-center justify-between border-b border-[#edf0f3] dark:border-[#242e3a] px-4 shrink-0 bg-[#f8fafc]/60 dark:bg-[#1a222c]/60">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#17212b] dark:text-[#f1f5f9]">
                <Sparkles className="size-3.5 text-[#1c5da7] dark:text-[#60a5fa]" />
                <span>Project P chat session</span>
                <span className="rounded-full bg-[#eef3f9] dark:bg-[#1c2736] px-1.5 py-0.2 text-[10px] font-mono text-[#1c5da7] dark:text-[#60a5fa]">
                  {messages.length}
                </span>
                {openResource && (
                  <span className="rounded bg-[#f1f5f9] dark:bg-[#1e2530] px-2 py-0.5 text-[10px] font-normal text-[#64748b] dark:text-[#94a3b8] truncate max-w-[180px]">
                    {openResource}
                  </span>
                )}
                <Link
                  href="/rules"
                  className="flex items-center gap-1 rounded bg-[#eef3f9] dark:bg-[#1c2736] px-2 py-0.5 text-[10px] font-medium text-[#1c5da7] dark:text-[#60a5fa] hover:opacity-80 transition-opacity ml-1"
                  title="Configure project agent rules"
                >
                  <ShieldCheck className="size-2.5" />
                  <span>{activeRules.length} rules</span>
                </Link>
              </div>

              {/* Minimize / Hide chat window */}
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                title="Hide chat window"
                aria-label="Hide chat window"
                className="grid size-7 place-items-center rounded-md text-[#8e9aa7] hover:bg-[#f1f5f9] dark:hover:bg-[#1f2937] hover:text-[#17212b] dark:hover:text-white transition-colors"
              >
                <Minus className="size-4" />
              </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex flex-col gap-1 ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed whitespace-pre-line ${
                      message.role === "user"
                        ? "rounded-br-md bg-[#1c5da7] text-white shadow-xs"
                        : "rounded-bl-md bg-[#f1f5f9] dark:bg-[#1e2530] text-[#2c3846] dark:text-[#e2e8f0]"
                    }`}
                  >
                    {message.text}

                    {/* Faithfulness Score & Applied Rules Badges */}
                    {(message.faithfulnessScore || (message.appliedRules && message.appliedRules.length > 0)) && (
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {message.faithfulnessScore && (
                          <span className="rounded-full border border-[#cbe8db] dark:border-[#14532d] bg-[#edf7f2] dark:bg-[#052e16] px-1.5 py-0.2 text-[9px] font-medium text-[#2f6e54] dark:text-[#4ade80]">
                            {message.faithfulnessScore}% verified
                          </span>
                        )}
                        {message.appliedRules && message.appliedRules.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full border border-[#d0e0f2] dark:border-[#1e3a5f] bg-[#f0f6ff] dark:bg-[#0d1d33] px-1.5 py-0.2 text-[9px] font-medium text-[#1c5da7] dark:text-[#60a5fa]"
                            title={`Rules enforced: ${message.appliedRules.join(", ")}`}
                          >
                            <ShieldCheck className="size-2.5" />
                            <span>{message.appliedRules.length} rules enforced</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Citations Linking to Resources */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#e2e8f0]/60 dark:border-[#334155]">
                        <span className="text-[10px] text-[#718096] dark:text-[#94a3b8]">
                          Sources:
                        </span>
                        {message.citations.map((cite) => (
                          <button
                            key={cite.name}
                            type="button"
                            onClick={() => openResourceAndChat(cite.name)}
                            className="flex items-center gap-1 rounded border border-[#dbe5f0] dark:border-[#334155] bg-white dark:bg-[#0f172a] px-2 py-0.5 text-[10px] font-medium text-[#1c5da7] dark:text-[#60a5fa] hover:bg-[#eaf2fa] dark:hover:bg-[#1e293b] transition-colors"
                          >
                            <FileText className="size-2.5 text-[#1c5da7] dark:text-[#60a5fa]" />
                            <span>{cite.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Conflict Warning Card */}
                    {message.hasConflictWarning && message.conflictDetails && (
                      <div className="mt-2 rounded-lg border border-[#f5dfb8] dark:border-[#78350f] bg-[#fffaf0] dark:bg-[#451a03]/30 p-2 text-[11px] text-[#9b6f17] dark:text-[#fde68a]">
                        <div className="flex items-center gap-1 font-semibold text-[#875d0d] dark:text-[#f59e0b]">
                          <Sparkles className="size-3 text-[#d97706]" />
                          <span>
                            Cross-source conflict: {message.conflictDetails.conflictingFile}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[#7c5b1b] dark:text-[#fef3c7] text-[10px] leading-normal">
                          {message.conflictDetails.reason}
                        </p>
                      </div>
                    )}

                    {/* Chat-to-Resource Creation Draft Card */}
                    {message.generatedResourceDraft && (
                      <div className="mt-2 rounded-lg border border-[#dbe5f0] dark:border-[#334155] bg-white dark:bg-[#0f172a] p-2.5 text-[11px] text-[#263442] dark:text-[#f1f5f9] shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#1c5da7] dark:text-[#60a5fa]">
                            Draft: {message.generatedResourceDraft.title}
                          </span>
                          <span className="rounded bg-[#f1f5f9] dark:bg-[#1e293b] px-1.5 py-0.5 text-[9px] uppercase font-mono text-[#697889] dark:text-[#94a3b8]">
                            {message.generatedResourceDraft.type}
                          </span>
                        </div>
                        <p className="mt-1 text-[10px] text-[#697889] dark:text-[#94a3b8] leading-normal">
                          {message.generatedResourceDraft.preview}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSaveDraft(message.generatedResourceDraft!)}
                          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md bg-[#1c5da7] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-[#164e90] transition-colors"
                        >
                          <FileText className="size-3" />
                          <span>Save to Collections & Open</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Center Chat Bar Row */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Main Input Box (Consistently centered, user can always directly type here) */}
          <div className="group flex-1 flex items-center gap-2.5 rounded-2xl border border-[#dbe5f0] dark:border-[#242e3a] bg-white/95 dark:bg-[#161c24]/95 backdrop-blur-md px-3.5 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] focus-within:border-[#1c5da7] dark:focus-within:border-[#60a5fa] focus-within:ring-2 focus-within:ring-[#1c5da7]/10 transition-all">
            <Sparkles className="size-4 shrink-0 text-[#1c5da7] dark:text-[#60a5fa]" />
            <input
              ref={inputRef}
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  handleSend()
                }
              }}
              placeholder={
                openResource
                  ? `Ask about ${openResource} or draft an update...`
                  : "Ask Project P anything, check conflicts, or draft a resource..."
              }
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] text-[#17212b] dark:text-[#f1f5f9]"
            />

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!chat.trim()}
              title="Send message (Enter)"
              aria-label="Send message"
              className="grid size-8 place-items-center rounded-xl bg-[#1c5da7] hover:bg-[#164e90] text-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>

          {/* Open / Hide Chat Window Button NEXT TO the chat bar */}
          <button
            type="button"
            onClick={handleToggleChat}
            title={isChatOpen ? "Hide chat window" : "Open chat window"}
            aria-label={isChatOpen ? "Hide chat window" : "Open chat window"}
            className="relative grid size-11 place-items-center rounded-2xl border border-[#dbe5f0] dark:border-[#242e3a] bg-white/95 dark:bg-[#161c24]/95 backdrop-blur-md text-[#64748b] hover:text-[#17212b] dark:hover:text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-[#f8fafc] dark:hover:bg-[#1e2530] transition-colors shrink-0"
          >
            {isChatOpen ? (
              <Minus className="size-4" />
            ) : (
              <>
                <ChevronUp className="size-4" />
                {messages.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-[#1c5da7] px-1 text-[9px] font-bold text-white shadow-xs">
                    {messages.length}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
