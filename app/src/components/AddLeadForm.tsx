import { useState } from "react";
import { STATUSES, type LeadStatus } from "../types";
import { useLeadStore } from "../store/leadStore";

export default function AddLeadForm() {
  const addLead = useLeadStore((s) => s.addLead);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<LeadStatus>("pending");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addLead({ name, contact, source, status });
    setName("");
    setContact("");
    setSource("");
    setStatus("pending");
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap gap-2 items-center bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
      data-testid="add-form"
    >
      <input
        className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
        placeholder="名字 *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        data-testid="inp-name"
        required
      />
      <input
        className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
        placeholder="联系方式（微信 / 手机号）"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        data-testid="inp-contact"
      />
      <input
        className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
        placeholder="来源渠道"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        data-testid="inp-source"
      />
      <select
        className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none"
        value={status}
        onChange={(e) => setStatus(e.target.value as LeadStatus)}
        data-testid="inp-status"
      >
        {STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
        data-testid="btn-add"
      >
        + 添加线索
      </button>
    </form>
  );
}
