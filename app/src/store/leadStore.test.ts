import { describe, it, expect, beforeEach } from "vitest";
import { useLeadStore } from "../store/leadStore";

beforeEach(() => {
  useLeadStore.setState({ leads: [] });
  window.localStorage.clear();
});

describe("leadStore", () => {
  it("addLead 添加线索，默认字段齐全", () => {
    useLeadStore.getState().addLead({ name: "小美", contact: "wx:xiaomei", source: "抖音", status: "pending" });
    const leads = useLeadStore.getState().leads;
    expect(leads).toHaveLength(1);
    expect(leads[0]).toMatchObject({
      name: "小美",
      contact: "wx:xiaomei",
      source: "抖音",
      status: "pending",
    });
    expect(leads[0].notes).toEqual([]);
    expect(leads[0].id).toBeTruthy();
  });

  it("addLead 去除首尾空格", () => {
    useLeadStore.getState().addLead({ name: "  阿强  ", contact: "", source: "", status: "contacted" });
    expect(useLeadStore.getState().leads[0].name).toBe("阿强");
  });

  it("updateLead 修改状态与字段", () => {
    useLeadStore.getState().addLead({ name: "小美", contact: "", source: "", status: "pending" });
    const id = useLeadStore.getState().leads[0].id;
    useLeadStore.getState().updateLead(id, { status: "booked", source: "快手" });
    const l = useLeadStore.getState().leads[0];
    expect(l.status).toBe("booked");
    expect(l.source).toBe("快手");
  });

  it("deleteLead 删除线索", () => {
    useLeadStore.getState().addLead({ name: "小美", contact: "", source: "", status: "pending" });
    const id = useLeadStore.getState().leads[0].id;
    useLeadStore.getState().deleteLead(id);
    expect(useLeadStore.getState().leads).toHaveLength(0);
  });

  it("addNote 给指定线索追加跟进记录", () => {
    useLeadStore.getState().addLead({ name: "小美", contact: "", source: "", status: "pending" });
    const id = useLeadStore.getState().leads[0].id;
    useLeadStore.getState().addNote(id, "3月1日：加上微信了");
    const l = useLeadStore.getState().leads[0];
    expect(l.notes).toHaveLength(1);
    expect(l.notes[0].text).toBe("3月1日：加上微信了");
  });

  it("addNote 只影响目标线索", () => {
    useLeadStore.getState().addLead({ name: "甲", contact: "", source: "", status: "pending" });
    useLeadStore.getState().addLead({ name: "乙", contact: "", source: "", status: "pending" });
    const [a, b] = useLeadStore.getState().leads;
    useLeadStore.getState().addNote(a.id, "跟进甲");
    const after = useLeadStore.getState().leads;
    expect(after.find((l) => l.id === a.id)?.notes).toHaveLength(1);
    expect(after.find((l) => l.id === b.id)?.notes).toHaveLength(0);
  });

  it("exportJson / importJson 往返一致", () => {
    useLeadStore.getState().addLead({ name: "小美", contact: "wx", source: "抖音", status: "pending" });
    const id = useLeadStore.getState().leads[0].id;
    useLeadStore.getState().addNote(id, "跟进1");
    const exported = useLeadStore.getState().exportJson();
    expect(exported.leads).toHaveLength(1);

    useLeadStore.setState({ leads: [] });
    const n = useLeadStore.getState().importJson(exported);
    expect(n).toBe(1);
    const restored = useLeadStore.getState().leads[0];
    expect(restored.name).toBe("小美");
    expect(restored.notes).toHaveLength(1);
  });

  it("importJson 跳过重复 id，只加新线索", () => {
    useLeadStore.getState().addLead({ name: "小美", contact: "", source: "", status: "pending" });
    const id = useLeadStore.getState().leads[0].id;
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      leads: [
        { ...useLeadStore.getState().leads[0] },
        { id: "new-id-2", name: "新人", contact: "", source: "", status: "pending", createdAt: 1, updatedAt: 1, notes: [] },
      ],
    };
    const n = useLeadStore.getState().importJson(payload);
    expect(n).toBe(2);
    expect(useLeadStore.getState().leads).toHaveLength(2);
    expect(useLeadStore.getState().leads.some((l) => l.id === id)).toBe(true);
  });
});
