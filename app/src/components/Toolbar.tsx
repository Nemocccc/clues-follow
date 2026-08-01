import { useRef, useState } from "react";
import { useLeadStore } from "../store/leadStore";

export default function Toolbar({
  onSearch,
}: {
  onSearch: (q: string) => void;
}) {
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const exportJson = useLeadStore((s) => s.exportJson);
  const importJson = useLeadStore((s) => s.importJson);

  const onExport = () => {
    const data = exportJson();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lead-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file
      .text()
      .then((text) => {
        try {
          const data = JSON.parse(text);
          const n = importJson(data);
          alert(`已导入 ${n} 条线索`);
        } catch {
          alert("导入失败：文件不是有效的 JSON");
        }
      })
      .catch(() => alert("导入失败：无法读取文件"));
    e.target.value = "";
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        className="w-56 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
        placeholder="搜索：名字 / 联系方式 / 来源"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value.trim().toLowerCase());
        }}
        data-testid="inp-search"
      />
      <button
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50"
        onClick={onExport}
        data-testid="btn-export"
      >
        导出 JSON
      </button>
      <button
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm hover:bg-gray-50"
        onClick={() => fileRef.current?.click()}
        data-testid="btn-import"
      >
        导入 JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onImportFile}
        data-testid="inp-file"
      />
    </div>
  );
}
