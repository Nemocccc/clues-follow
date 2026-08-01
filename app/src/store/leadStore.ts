import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Lead, LeadStatus, Note } from "../types";
import { createLocalStorage, type LeadStorage } from "../lib/storage";

const STORAGE_KEY = "lead-tracker-v1";

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export interface LeadState {
  leads: Lead[];
  addLead: (input: { name: string; contact: string; source: string; status: LeadStatus }) => void;
  updateLead: (id: string, input: Partial<Pick<Lead, "name" | "contact" | "source" | "status">>) => void;
  deleteLead: (id: string) => void;
  addNote: (leadId: string, text: string) => void;
  deleteNote: (leadId: string, noteId: string) => void;
  exportJson: () => { version: number; exportedAt: string; leads: Lead[] };
  importJson: (data: unknown) => number;
}

const storage: LeadStorage = createLocalStorage();

export const useLeadStore = create<LeadState>()(
  persist(
    (set, get) => ({
      leads: [],

      addLead: ({ name, contact, source, status }) =>
        set((s) => ({
          leads: [
            {
              id: uid(),
              name: name.trim(),
              contact: contact.trim(),
              source: source.trim(),
              status,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              notes: [],
            },
            ...s.leads,
          ],
        })),

      updateLead: (id, input) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id
              ? { ...l, ...input, name: input.name?.trim() ?? l.name, updatedAt: Date.now() }
              : l,
          ),
        })),

      deleteLead: (id) =>
        set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),

      addNote: (leadId, text) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  updatedAt: Date.now(),
                  notes: [
                    { id: uid(), text: text.trim(), createdAt: Date.now() } as Note,
                    ...l.notes,
                  ],
                }
              : l,
          ),
        })),

      deleteNote: (leadId, noteId) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === leadId
              ? { ...l, updatedAt: Date.now(), notes: l.notes.filter((n) => n.id !== noteId) }
              : l,
          ),
        })),

      exportJson: () => ({
        version: 1,
        exportedAt: new Date().toISOString(),
        leads: get().leads,
      }),

      importJson: (data) => {
        const raw = data as { leads?: unknown[] } | null;
        const list = Array.isArray(raw?.leads) ? raw.leads : [];
        const incoming = list
          .map((x) => x as Partial<Lead>)
          .filter((x) => x && typeof x.id === "string")
          .map((x) => ({
            id: x.id as string,
            name: typeof x.name === "string" ? x.name : "未命名",
            contact: typeof x.contact === "string" ? x.contact : "",
            source: typeof x.source === "string" ? x.source : "",
            status: (["pending", "contacted", "booked"] as string[]).includes(x.status as string)
              ? (x.status as LeadStatus)
              : "pending",
            createdAt: typeof x.createdAt === "number" ? x.createdAt : Date.now(),
            updatedAt: typeof x.updatedAt === "number" ? x.updatedAt : Date.now(),
            notes: Array.isArray(x.notes)
              ? x.notes
                  .filter((n) => n && typeof (n as Note).id === "string")
                  .map((n) => ({
                    id: (n as Note).id,
                    text: typeof (n as Note).text === "string" ? (n as Note).text : "",
                    createdAt: typeof (n as Note).createdAt === "number" ? (n as Note).createdAt : Date.now(),
                  }))
              : [],
          }));
        set((s) => {
          const existing = new Set(s.leads.map((l) => l.id));
          const fresh = incoming.filter((l) => !existing.has(l.id));
          return { leads: [...fresh, ...s.leads] };
        });
        return incoming.length;
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      version: 1,
      migrate: (persisted) => {
        // 容错：字段缺失/格式不合法时补默认值，不丢数据
        const raw = persisted as { leads?: unknown[] } | null;
        const list = Array.isArray(raw?.leads) ? raw.leads : [];
        const leads = list
          .map((x) => x as Partial<Lead>)
          .filter((x) => x && typeof x.id === "string")
          .map((x) => ({
            id: x.id as string,
            name: typeof x.name === "string" ? x.name : "未命名",
            contact: typeof x.contact === "string" ? x.contact : "",
            source: typeof x.source === "string" ? x.source : "",
            status: (["pending", "contacted", "booked"] as string[]).includes(x.status as string)
              ? (x.status as LeadStatus)
              : "pending",
            createdAt: typeof x.createdAt === "number" ? x.createdAt : Date.now(),
            updatedAt: typeof x.updatedAt === "number" ? x.updatedAt : Date.now(),
            notes: Array.isArray(x.notes)
              ? x.notes
                  .filter((n) => n && typeof (n as Note).id === "string")
                  .map((n) => ({
                    id: (n as Note).id,
                    text: typeof (n as Note).text === "string" ? (n as Note).text : "",
                    createdAt: typeof (n as Note).createdAt === "number" ? (n as Note).createdAt : Date.now(),
                  }))
              : [],
          }));
        return { leads } as LeadState;
      },
    },
  ),
);
