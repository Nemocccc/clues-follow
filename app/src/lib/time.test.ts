import { describe, it, expect } from "vitest";
import { fmtTime, daysSince, lastActiveAt } from "../lib/time";

describe("fmtTime", () => {
  it("格式化为 月日 时分", () => {
    const ts = new Date(2026, 2, 1, 9, 5).getTime();
    expect(fmtTime(ts)).toBe("3月1日 09:05");
  });

  it("小时分钟补零", () => {
    const ts = new Date(2026, 7, 1, 0, 0).getTime();
    expect(fmtTime(ts)).toBe("8月1日 00:00");
  });
});

describe("daysSince", () => {
  it("当天为 0 天", () => {
    expect(daysSince(Date.now())).toBe(0);
  });

  it("72 小时前为 3 天", () => {
    expect(daysSince(Date.now() - 72 * 3600 * 1000)).toBe(3);
  });
});

describe("lastActiveAt", () => {
  it("无跟进时取创建时间", () => {
    expect(lastActiveAt(1000, [])).toBe(1000);
  });

  it("有跟进时取最近一条跟进时间", () => {
    expect(lastActiveAt(1000, [5000, 3000])).toBe(5000);
  });
});
