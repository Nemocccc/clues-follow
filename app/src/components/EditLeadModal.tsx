import { useState } from "react";
import { STATUSES, type Lead, type LeadStatus } from "../types";
import { useLeadStore } from "../store/leadStore";

export default function EditLeadModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const updateLead = useLeadStore((s) => s.updateLead);
  const [name, setName] = useState(lead.name);
  const [contact, setContact] = useState(lead.contact);
  const [source, setSource] = useState(lead.source);
  const [status, setStatus] = useState<LeadStatus>(lead.status);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateLead(lead.id, { name, contact, source, status });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      data-testid="edit-modal"
    >
      <form
        className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <h3 className="text-base font-bold mb-4">编辑线索</h3>
        <label className="block text-sm text-gray-600 mb-1">名字 *</label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="edit-name"
          required
        />
        <label className="block text-sm text-gray-600 mb-1">联系方式</label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 mb-3"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          data-testid="edit-contact"
        />
        <label className="block text-sm text-gray-600 mb-1">来源渠道</label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 mb-3"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          data-testid="edit-source"
        />
        <label className="block text-sm text-gray-600 mb-1">状态</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none mb-4"
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          data-testid="edit-status"
        >
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
            onClick={onClose}
            data-testid="edit-cancel"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            data-testid="edit-save"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
