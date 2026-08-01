import { useMemo } from "react";
import { STATUSES, type Lead } from "../types";
import { lastActiveAt } from "../lib/time";
import LeadCard from "./LeadCard";

export default function KanbanBoard({ leads, query }: { leads: Lead[]; query: string }) {
  const filtered = useMemo(() => {
    if (!query) return leads;
    return leads.filter((l) =>
      [l.name, l.contact, l.source].some((f) => f.toLowerCase().includes(query)),
    );
  }, [leads, query]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
      {STATUSES.map((st) => {
        const list = filtered
          .filter((l) => l.status === st.id)
          .sort((a, b) => {
            // 待联系列按"最后活跃时间"升序（最久没跟进的排最前），其余按创建时间倒序
            if (st.id === "pending") {
              const aAct = lastActiveAt(a.createdAt, a.notes.map((n) => n.createdAt));
              const bAct = lastActiveAt(b.createdAt, b.notes.map((n) => n.createdAt));
              return aAct - bAct;
            }
            return b.createdAt - a.createdAt;
          });

        return (
          <section
            key={st.id}
            className="bg-gray-100/70 border border-gray-200 rounded-xl p-3"
            data-testid="column"
            data-status={st.id}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: st.color }}
                data-testid="column-dot"
              />
              <h2 className="text-sm font-bold" data-testid="column-title">
                {st.label}
              </h2>
              <span
                className="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5"
                data-testid="column-count"
              >
                {list.length}
              </span>
            </div>
            {list.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-6" data-testid="column-empty">
                暂无线索
              </div>
            ) : (
              list.map((lead) => <LeadCard key={lead.id} lead={lead} />)
            )}
          </section>
        );
      })}
    </div>
  );
}
