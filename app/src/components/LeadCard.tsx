import { useState } from "react";
import { STATUSES, STALE_DAYS, type Lead } from "../types";
import { useLeadStore } from "../store/leadStore";
import { fmtTime, daysSince, lastActiveAt } from "../lib/time";
import EditLeadModal from "./EditLeadModal";

export default function LeadCard({ lead }: { lead: Lead }) {
  const updateLead = useLeadStore((s) => s.updateLead);
  const deleteLead = useLeadStore((s) => s.deleteLead);
  const addNote = useLeadStore((s) => s.addNote);
  const [noteText, setNoteText] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const staleDays = daysSince(lastActiveAt(lead.createdAt, lead.notes.map((n) => n.createdAt)));
  const isStale = lead.status === "pending" && staleDays >= STALE_DAYS;

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNote(lead.id, noteText);
    setNoteText("");
  };

  const onDelete = () => {
    if (confirmDelete) {
      deleteLead(lead.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 mb-2 shadow-sm"
      data-testid="lead-card"
      data-lead-id={lead.id}
      data-status={lead.status}
    >
      <div className="flex justify-between items-center gap-2">
        <span className="font-bold text-sm break-all" data-testid="lead-name">
          {lead.name}
        </span>
        <select
          className="text-xs px-1.5 py-1 border border-gray-300 rounded bg-white"
          value={lead.status}
          onChange={(e) => updateLead(lead.id, { status: e.target.value as Lead["status"] })}
          data-testid="lead-status"
        >
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-gray-500 mt-1.5 leading-5 break-all" data-testid="lead-meta">
        {lead.contact ? <div>联系方式：{lead.contact}</div> : null}
        {lead.source ? <div>来源：{lead.source}</div> : null}
        <div>创建于 {fmtTime(lead.createdAt)}</div>
      </div>

      {isStale ? (
        <div
          className="mt-1.5 text-xs font-semibold text-red-600"
          data-testid="stale-badge"
        >
          ⚠ {staleDays} 天未跟进
        </div>
      ) : null}

      {lead.notes.length > 0 ? (
        <div className="mt-2 pt-2 border-t border-dashed border-gray-200" data-testid="notes">
          <div className="text-xs font-semibold text-gray-500 mb-1">跟进记录</div>
          {lead.notes.map((n) => (
            <div
              key={n.id}
              className="text-xs bg-gray-50 border-l-2 border-gray-300 rounded-r px-2 py-1 mb-1 break-all"
              data-testid="note"
            >
              <span className="block text-gray-400 text-[10px]">{fmtTime(n.createdAt)}</span>
              {n.text}
            </div>
          ))}
        </div>
      ) : null}

      <form className="flex gap-1.5 mt-2" onSubmit={submitNote}>
        <input
          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded outline-none focus:border-blue-500"
          placeholder="添加跟进，如：3月1日：加上微信了"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          data-testid="note-input"
        />
        <button
          type="submit"
          className="px-2.5 py-1.5 text-xs rounded bg-green-600 text-white hover:bg-green-700"
          data-testid="note-add"
        >
          添加
        </button>
      </form>

      <div className="flex gap-2 mt-2">
        <button
          className="text-xs text-gray-500 hover:text-blue-600"
          onClick={() => setEditing(true)}
          data-testid="btn-edit"
        >
          编辑
        </button>
        <button
          className="text-xs text-gray-500 hover:text-red-600"
          onClick={onDelete}
          data-testid="btn-delete"
        >
          {confirmDelete ? "确认删除？" : "删除"}
        </button>
      </div>

      {editing ? <EditLeadModal lead={lead} onClose={() => setEditing(false)} /> : null}
    </div>
  );
}
