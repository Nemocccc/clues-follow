export type LeadStatus = "pending" | "contacted" | "booked";

export const STATUSES: { id: LeadStatus; label: string; color: string }[] = [
  { id: "pending", label: "待联系", color: "#f59e0b" },
  { id: "contacted", label: "已联系", color: "#10b981" },
  { id: "booked", label: "已约面", color: "#3b82f6" },
];

export const STATUS_LABEL: Record<LeadStatus, string> = {
  pending: "待联系",
  contacted: "已联系",
  booked: "已约面",
};

export interface Note {
  id: string;
  text: string;
  createdAt: number;
}

export interface Lead {
  id: string;
  name: string;
  contact: string;
  source: string;
  status: LeadStatus;
  createdAt: number;
  updatedAt: number;
  notes: Note[];
}

/** 未跟进提醒阈值（天）：超过后标红 */
export const STALE_DAYS = 3;
