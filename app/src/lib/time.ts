/** 时间工具：格式化与"未跟进天数"计算 */

export function fmtTime(ts: number): string {
  const d = new Date(ts);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m}月${day}日 ${hh}:${mm}`;
}

export function daysSince(ts: number): number {
  return Math.floor((Date.now() - ts) / 86_400_000);
}

/** 线索最后活跃时间 = max(创建时间, 最近一条跟进时间) */
export function lastActiveAt(createdAt: number, noteTimes: number[]): number {
  const lastNote = noteTimes.length ? Math.max(...noteTimes) : 0;
  return Math.max(createdAt, lastNote);
}
