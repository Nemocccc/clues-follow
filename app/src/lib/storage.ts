/**
 * 存储层抽象：目前使用 localStorage 实现。
 * 未来需要多人共享/云同步时，实现同一个 Storage 接口换成远程后端即可，
 * 前端 store 与组件代码无需改动。
 */

export interface LeadStorage {
  getItem(name: string): string | null;
  setItem(name: string, value: string): void;
  removeItem(name: string): void;
}

/** localStorage 不可用时（隐私模式/部分浏览器 file://）降级为内存，页面不崩 */
function memoryStorage(): LeadStorage {
  const mem = new Map<string, string>();
  return {
    getItem: (name) => mem.get(name) ?? null,
    setItem: (name, value) => void mem.set(name, value),
    removeItem: (name) => void mem.delete(name),
  };
}

export function createLocalStorage(): LeadStorage {
  try {
    const probe = "__lead_tracker_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return memoryStorage();
  }
}
