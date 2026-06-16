import {
  Building2,
  Handshake,
  Users,
  DoorOpen,
  Share2,
  StickyNote,
} from "lucide-react";
import type { ActivityLog, ActivityType } from "../types";
import { timeAgo } from "../lib/format";
import { cn } from "../utils/cn";

const meta: Record<
  ActivityType,
  { icon: typeof Building2; ring: string; text: string }
> = {
  property: { icon: Building2, ring: "bg-blue-50 text-blue-600", text: "" },
  contact: { icon: Users, ring: "bg-violet-50 text-violet-600", text: "" },
  deal: { icon: Handshake, ring: "bg-emerald-50 text-emerald-600", text: "" },
  vacancy: { icon: DoorOpen, ring: "bg-amber-50 text-amber-600", text: "" },
  share: { icon: Share2, ring: "bg-cyan-50 text-cyan-600", text: "" },
  note: { icon: StickyNote, ring: "bg-slate-100 text-slate-600", text: "" },
};

export function ActivityFeed({
  items,
  limit,
}: {
  items: ActivityLog[];
  limit?: number;
}) {
  const list = limit ? items.slice(0, limit) : items;
  return (
    <ol className="relative space-y-1">
      {list.map((a, i) => {
        const m = meta[a.type];
        const Icon = m.icon;
        const last = i === list.length - 1;
        return (
          <li key={a.id} className="relative flex gap-3 pb-1">
            {!last && (
              <span className="absolute left-[15px] top-9 h-[calc(100%-12px)] w-px bg-slate-200" />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                m.ring
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className="text-sm leading-snug text-slate-700"
                dangerouslySetInnerHTML={{ __html: a.description }}
              />
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-medium text-slate-500">{a.user}</span>
                <span>·</span>
                <span>{timeAgo(a.timestamp)}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
