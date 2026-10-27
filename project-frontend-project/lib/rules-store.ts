import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { WorkspaceRule, DEFAULT_RULES } from "./workspace-types"

interface RulesStoreState {
  rules: WorkspaceRule[]
  hasHydrated: boolean
  setHasHydrated: (val: boolean) => void
  toggleRule: (id: string) => void
  addRule: (rule: Omit<WorkspaceRule, "id">) => void
  deleteRule: (id: string) => void
  updateRule: (id: string, updates: Partial<WorkspaceRule>) => void
  resetToDefaults: () => void
  getActiveRules: () => WorkspaceRule[]
  getDoRules: () => WorkspaceRule[]
  getAvoidRules: () => WorkspaceRule[]
}

export const useRulesStore = create<RulesStoreState>()(
  persist(
    (set, get) => ({
      rules: DEFAULT_RULES,
      hasHydrated: false,
      setHasHydrated: (val) => set({ hasHydrated: val }),

      toggleRule: (id) => {
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
          ),
        }))
      },

      addRule: (newRule) => {
        const id = `rule-${Date.now()}`
        set((state) => ({
          rules: [{ ...newRule, id }, ...state.rules],
        }))
      },

      deleteRule: (id) => {
        set((state) => ({
          rules: state.rules.filter((rule) => rule.id !== id),
        }))
      },

      updateRule: (id, updates) => {
        set((state) => ({
          rules: state.rules.map((rule) =>
            rule.id === id ? { ...rule, ...updates } : rule
          ),
        }))
      },

      resetToDefaults: () => {
        set({ rules: DEFAULT_RULES })
      },

      getActiveRules: () => {
        return get().rules.filter((r) => r.enabled)
      },

      getDoRules: () => {
        return get().rules.filter((r) => r.type === "do")
      },

      getAvoidRules: () => {
        return get().rules.filter((r) => r.type === "avoid")
      },
    }),
    {
      name: "project-p-rules",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.rules || state.rules.length === 0) {
            state.rules = DEFAULT_RULES
          }
          state.setHasHydrated(true)
        }
      },
    }
  )
)
