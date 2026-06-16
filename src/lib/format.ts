// Formatting helpers used across the app

export function formatCurrency(value: number, opts?: { compact?: boolean }) {
  if (value == null || isNaN(value)) return "—";
  if (opts?.compact) {
    if (Math.abs(value) >= 1_000_000)
      return "$" + (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1) + "M";
    if (Math.abs(value) >= 1_000)
      return "$" + (value / 1_000).toFixed(0) + "K";
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatSF(value: number, opts?: { compact?: boolean }) {
  if (value == null || isNaN(value)) return "—";
  if (opts?.compact) {
    if (Math.abs(value) >= 1_000_000)
      return (value / 1_000_000).toFixed(1) + "M";
    if (Math.abs(value) >= 1_000)
      return (value / 1_000).toFixed(value % 1000 === 0 ? 0 : 1) + "K";
  }
  return value.toLocaleString("en-US");
}

export function formatPSF(value: number) {
  if (value == null || isNaN(value)) return "—";
  return "$" + value.toLocaleString("en-US") + "/sf";
}

export function currency(value: number) {
  if (value == null || isNaN(value)) return "—";
  return "$" + value.toLocaleString("en-US");
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return Math.floor(day / 365) + "y ago";
}

export function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  if (isNaN(d)) return null;
  return Math.round((d - Date.now()) / 86400000);
}

export function pct(value: number) {
  return Math.round(value) + "%";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

let counter = 0;
export function uid(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
