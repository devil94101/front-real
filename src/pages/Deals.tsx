import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Pencil,
  Trash2,
  Building2,
  Users,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../store/hooks";
import { Avatar, Badge, Button, Card, EmptyState, Modal, ProgressBar } from "../components/ui";
import { DealForm } from "../components/DealForm";
import { navigate, useHashRoute } from "../lib/router";
import { dealStages, dealStageTone, dealTypeTone } from "../lib/meta";
import { formatCurrency, formatDate } from "../lib/format";
import { cn } from "../utils/cn";
import type { Deal } from "../types";

export function Deals() {
  const { deals, getProperty, team, moveDeal, deleteDeal } = useApp();
  const route = useHashRoute();
  const [view, setView] = useState<"board" | "list">("board");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);

  const focusId = useMemo(() => {
    const i = route.path.indexOf("?");
    if (i < 0) return null;
    return new URLSearchParams(route.path.slice(i + 1)).get("focus");
  }, [route.path]);

  useEffect(() => {
    if (focusId && deals.some((d) => d.id === focusId)) setDetailId(focusId);
  }, [focusId, deals]);

  const stats = useMemo(() => {
    const open = deals.filter((d) => d.stage !== "Closed" && d.stage !== "Lost");
    const pipeline = open.reduce((s, d) => s + d.value, 0);
    const weighted = open.reduce((s, d) => s + (d.value * d.probability) / 100, 0);
    const won = deals.filter((d) => d.stage === "Closed").reduce((s, d) => s + d.value, 0);
    return { pipeline, weighted, won, openCount: open.length };
  }, [deals]);

  const byStage = (stage: Deal["stage"]) => deals.filter((d) => d.stage === stage);

  const detail = detailId ? deals.find((d) => d.id === detailId) : null;

  const stageIndex = (s: Deal["stage"]) => dealStages.indexOf(s);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatBox label="Open Pipeline" value={formatCurrency(stats.pipeline, { compact: true })} sub={`${stats.openCount} active deals`} tone="text-blue-600" />
        <StatBox label="Weighted Forecast" value={formatCurrency(stats.weighted, { compact: true })} sub="Probability-adjusted" tone="text-violet-600" />
        <StatBox label="Closed (YTD)" value={formatCurrency(stats.won, { compact: true })} sub={`${deals.filter((d) => d.stage === "Closed").length} deals`} tone="text-emerald-600" />
        <StatBox label="Win-Stage" value={String(deals.filter((d) => ["LOI", "Under Contract"].includes(d.stage)).length)} sub="In LOI / contract" tone="text-amber-600" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {(["board", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-semibold capitalize transition-colors",
                view === v ? "bg-ink-900 text-white" : "text-slate-500 hover:text-ink-900"
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={() => { setEditDeal(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" strokeWidth={2.5} /> New Deal
        </Button>
      </div>

      {/* Board */}
      {view === "board" ? (
        <div className="overflow-x-auto pb-3">
          <div className="flex min-w-max gap-4">
            {dealStages.map((stage) => {
              const items = byStage(stage);
              const sum = items.reduce((s, d) => s + d.value, 0);
              return (
                <div key={stage} className="w-72 shrink-0">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", dotColor(stage))} />
                      <span className="text-sm font-bold text-ink-900">{stage}</span>
                      <span className="rounded-full bg-slate-100 px-1.5 text-xs font-bold text-slate-500">{items.length}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{formatCurrency(sum, { compact: true })}</span>
                  </div>
                  <div className="space-y-2.5 rounded-2xl bg-slate-100/70 p-2">
                    {items.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">No deals</div>
                    )}
                    {items.map((d) => {
                      const p = getProperty(d.propertyId ?? "");
                      const broker = team.find((t) => t.name === d.assignedTo);
                      const idx = stageIndex(d.stage);
                      return (
                        <div
                          key={d.id}
                          onClick={() => setDetailId(d.id)}
                          className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <Badge tone={dealTypeTone[d.type]}>{d.type}</Badge>
                            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{d.probability}%</span>
                          </div>
                          <h4 className="mt-1.5 line-clamp-2 text-sm font-bold leading-tight text-ink-900 group-hover:text-blue-700">
                            {d.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{p ? p.name : "No property"}</span>
                          </div>
                          <div className="mt-2 text-lg font-extrabold text-ink-900">{formatCurrency(d.value, { compact: true })}</div>
                          <ProgressBar value={d.probability} tone={dealStageTone[d.stage] === "rose" ? "rose" : "blue"} className="mt-2" />
                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {broker ? <Avatar name={broker.name} color={broker.color} size={22} /> : <span className="text-xs text-slate-400">{d.assignedTo}</span>}
                              <span className="text-[11px] text-slate-400">{formatDate(d.expectedClose).replace(/, .*$/, "")}</span>
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={(e) => { e.stopPropagation(); if (idx > 0) moveDeal(d.id, dealStages[idx - 1]); }}
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-ink-900"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); if (idx < dealStages.length - 1) moveDeal(d.id, dealStages[idx + 1]); }}
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-ink-900"
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <Card className="overflow-hidden">
          <div className="divide-y divide-slate-100">
            {[...deals].sort((a, b) => b.value - a.value).map((d) => {
              const p = getProperty(d.propertyId ?? "");
              const broker = team.find((t) => t.name === d.assignedTo);
              return (
                <button key={d.id} onClick={() => setDetailId(d.id)} className="flex w-full flex-wrap items-center gap-4 px-4 py-3 text-left hover:bg-slate-50/60">
                  <Badge tone={dealStageTone[d.stage]} dot>{d.stage}</Badge>
                  <div className="min-w-[180px] flex-1">
                    <div className="font-bold text-ink-900">{d.title}</div>
                    <div className="text-xs text-slate-500">{p ? p.name : "No property"} · {d.type}</div>
                  </div>
                  <div className="text-sm font-extrabold text-ink-900">{formatCurrency(d.value, { compact: true })}</div>
                  <div className="w-24"><ProgressBar value={d.probability} tone="blue" /></div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    {broker && <Avatar name={broker.name} color={broker.color} size={22} />}
                    {d.assignedTo}
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {deals.length === 0 && (
        <EmptyState
          icon={<Handshake className="h-6 w-6" />}
          title="No deals yet"
          description="Create your first deal to start tracking it through the pipeline."
          action={<Button variant="primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> New Deal</Button>}
        />
      )}

      {/* Detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetailId(null)}
        size="lg"
        title={detail?.title}
        subtitle={detail ? `${detail.type} · ${detail.stage}` : ""}
        footer={
          detail && (
            <>
              <Button variant="ghost" onClick={() => { if (window.confirm("Delete this deal?")) { deleteDeal(detail.id); setDetailId(null); } }}>
                <Trash2 className="h-4 w-4 text-rose-500" /> Delete
              </Button>
              <Button variant="secondary" onClick={() => { setEditDeal(detail); setShowForm(true); setDetailId(null); }}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </>
          )
        }
      >
        {detail && (
          <DealDetailContent
            deal={detail}
            onMove={(stage) => moveDeal(detail.id, stage)}
          />
        )}
      </Modal>

      <DealForm open={showForm} onClose={() => setShowForm(false)} deal={editDeal} />
    </div>
  );
}

function DealDetailContent({ deal, onMove }: { deal: Deal; onMove: (s: Deal["stage"]) => void }) {
  const { getProperty, getContact, team } = useApp();
  const p = getProperty(deal.propertyId ?? "");
  const broker = team.find((t) => t.name === deal.assignedTo);
  const contacts = deal.contactIds.map((id) => getContact(id)).filter(Boolean);
  const idx = dealStages.indexOf(deal.stage);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Detail label="Deal Value" value={formatCurrency(deal.value, { compact: true })} big />
        <Detail label="Probability" value={`${deal.probability}%`} />
        <Detail label="Type" value={deal.type} />
        <Detail label="Expected Close" value={formatDate(deal.expectedClose)} />
      </div>

      <div>
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Move to stage</span>
        <div className="flex flex-wrap gap-1.5">
          {dealStages.map((s) => (
            <button
              key={s}
              onClick={() => onMove(s)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all",
                deal.stage === s ? "bg-ink-900 text-white ring-ink-900" : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          <Button size="sm" variant="secondary" disabled={idx === 0} onClick={() => onMove(dealStages[idx - 1])}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button size="sm" variant="secondary" disabled={idx === dealStages.length - 1} onClick={() => onMove(dealStages[idx + 1])}>
            Advance <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {p && (
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Property</div>
          <button onClick={() => navigate(`/properties/${p.id}`)} className="flex items-center gap-2 text-left hover:text-blue-600">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="font-bold text-ink-900">{p.name}</span>
            <span className="text-sm text-slate-500">· {p.city}, {p.state}</span>
          </button>
        </div>
      )}

      {deal.keyDates.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" /> Key Dates
          </div>
          <div className="space-y-2">
            {deal.keyDates.map((kd, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-ink-900">{kd.label}</span>
                <span className="text-sm text-slate-500">{formatDate(kd.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <TrendingUp className="h-3.5 w-3.5" /> Assigned
          </div>
          <div className="flex items-center gap-2">
            {broker && <Avatar name={broker.name} color={broker.color} size={32} />}
            <div>
              <div className="text-sm font-bold text-ink-900">{deal.assignedTo}</div>
              {broker && <div className="text-xs text-slate-500">{broker.role}</div>}
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Users className="h-3.5 w-3.5" /> Contacts
          </div>
          {contacts.length === 0 ? (
            <span className="text-sm text-slate-400">None linked</span>
          ) : (
            <div className="space-y-1">
              {contacts.map((c) => (
                <div key={c!.id} className="flex items-center gap-2">
                  <Avatar name={c!.name} color="#475569" size={24} />
                  <span className="text-sm font-medium text-ink-900">{c!.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deal.notes && (
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</div>
          <p className="text-sm text-slate-700">{deal.notes}</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={cn("mt-1 text-2xl font-extrabold", tone)}>{value}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </Card>
  );
}

function Detail({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className={cn("font-extrabold text-ink-900", big ? "text-xl" : "text-sm")}>{value}</div>
    </div>
  );
}

function dotColor(stage: Deal["stage"]): string {
  const map: Record<Deal["stage"], string> = {
    Sourcing: "bg-slate-400",
    Qualified: "bg-blue-500",
    Touring: "bg-cyan-500",
    LOI: "bg-violet-500",
    "Under Contract": "bg-amber-500",
    Closed: "bg-emerald-500",
    Lost: "bg-rose-500",
  };
  return map[stage];
}
