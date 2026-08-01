import { useState } from "react";
import { useLeadStore } from "./store/leadStore";
import AddLeadForm from "./components/AddLeadForm";
import Toolbar from "./components/Toolbar";
import KanbanBoard from "./components/KanbanBoard";

export default function App() {
  const leads = useLeadStore((s) => s.leads);
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-bold">线索跟进记录</h1>
            <p className="text-xs text-gray-400">星探线索管理 · 数据保存在本机浏览器</p>
          </div>
          <Toolbar onSearch={setQuery} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4">
        <AddLeadForm />
        <div className="mt-4">
          <KanbanBoard leads={leads} query={query} />
        </div>
      </main>
    </div>
  );
}
