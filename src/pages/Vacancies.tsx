import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  DoorOpen,
  MapPin,
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../store/hooks";
import { Badge, Button, Card, EmptyState, Modal, Select } from "../components/ui";
import { VacancyForm } from "../components/VacancyForm";
import { navigate } from "../lib/router";
import { currency, formatDate, formatSF } from "../lib/format";
import { propertyStatusTone, vacancyStatusTone } from "../lib/meta";
import { cn } from "../utils/cn";

type SortKey = "sf" | "rent" | "date";

export function Vacancies() {
  const { vacancies, properties, getProperty, deleteVacancy } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState<SortKey>("sf");
  const [pickProperty, setPickProperty] = useState(false);
  const [vacancyPropertyId, setVacancyPropertyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = vacancies.filter((v) => {
      const p = getProperty(v.propertyId);
      if (status !== "all" && v.status !== status) return false;
      if (type !== "all" && v.type !== type) return false;
      if (query) {
        const hay = `${v.suite} ${p?.name ?? ""} ${p?.city ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "rent") return b.askingRentPSF - a.askingRentPSF;
      if (sort === "date") return a.availableDate.localeCompare(b.availableDate);
      return b.sf - a.sf;
    });
    return list;
  }, [vacancies, q, status, type, sort, getProperty]);

  const totalAvail = vacancies
    .filter((v) => v.status === "Available")
    .reduce((s, v) => s + v.sf, 0);

  const editing = editId ? vacancies.find((v) => v.id === editId) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Total vacancies" value={String(vacancies.length)} tone="bg-slate-100 text-slate-600" />
        <SummaryCard label="Available now" value={String(vacancies.filter((v) => v.status === "Available").length)} tone="bg-emerald-50 text-emerald-600" />
        <SummaryCard label="Negotiating" value={String(vacancies.filter((v) => v.status === "Negotiating").length)} tone="bg-amber-50 text-amber-600" />
        <SummaryCard label="Available SF" value={`${formatSF(totalAvail, { compact: true })} sf`} tone="bg-blue-50 text-blue-600" />
      </div>

      {/* Filters */}
      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search suite or property…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-auto text-sm font-medium">
            <option value="all">All statuses</option>
            <option>Available</option>
            <option>Negotiating</option>
            <option>Hold</option>
            <option>Leased</option>
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="h-10 w-auto text-sm font-medium">
            <option value="all">All types</option>
            <option>Direct</option>
            <option>Sublease</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 w-auto text-sm font-medium">
            <option value="sf">Sort: Largest</option>
            <option value="rent">Sort: Highest rent</option>
            <option value="date">Sort: Soonest</option>
          </Select>
          <Button variant="primary" size="md" onClick={() => setPickProperty(true)}>
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Vacancy
          </Button>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<DoorOpen className="h-6 w-6" />}
          title="No vacancies match"
          description="Adjust filters or add available space to the database."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 lg:grid">
            <div className="col-span-3">Suite / Property</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Rent</div>
            <div className="col-span-2">Available</div>
            <div className="col-span-1">Type</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.map((v) => {
              const p = getProperty(v.propertyId);
              return (
                <div
                  key={v.id}
                  className="grid grid-cols-1 gap-3 px-4 py-3 transition-colors hover:bg-slate-50/60 lg:grid-cols-12 lg:items-center"
                >
                  <div className="col-span-3 min-w-0">
                    <div className="font-bold text-ink-900">{v.suite}</div>
                    {p && (
                      <button onClick={() => navigate(`/properties/${p.id}`)} className="inline-flex items-center gap-1 truncate text-xs text-slate-500 hover:text-blue-600">
                        <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{p.name}</span>
                      </button>
                    )}
                  </div>
                  <div className="col-span-2 text-sm">
                    <span className="font-bold text-ink-900 lg:hidden">Size: </span>
                    <span className="font-bold text-ink-900">{formatSF(v.sf, { compact: true })} sf</span>
                    {v.divisible && <span className="ml-1 text-xs text-slate-400">· div.</span>}
                  </div>
                  <div className="col-span-2 text-sm font-semibold text-ink-900">
                    {v.askingRentPSF ? `${currency(v.askingRentPSF)}/sf` : "—"}
                  </div>
                  <div className="col-span-2 text-sm text-slate-600">{formatDate(v.availableDate)}</div>
                  <div className="col-span-1"><Badge tone="slate">{v.type}</Badge></div>
                  <div className="col-span-1"><Badge tone={vacancyStatusTone[v.status]} dot>{v.status}</Badge></div>
                  <div className="col-span-1 flex items-center justify-start gap-0.5 lg:justify-end">
                    <button onClick={() => { setEditId(v.id); setVacancyPropertyId(v.propertyId); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink-900">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteVacancy(v.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Property picker for new vacancy */}
      <Modal
        open={pickProperty}
        onClose={() => setPickProperty(false)}
        size="md"
        title="Add Vacancy"
        subtitle="Select the property this space belongs to."
      >
        <div className="max-h-[50vh] space-y-1.5 overflow-y-auto">
          {properties.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setVacancyPropertyId(p.id);
                setPickProperty(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-2.5 text-left hover:border-blue-300 hover:bg-blue-50/50"
            >
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white")} style={{ backgroundColor: propertyStatusTone[p.status] ? "#3b82f6" : "#3b82f6" }}>
                {p.type.slice(0, 2)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink-900">{p.name}</div>
                <div className="truncate text-xs text-slate-500">{p.city}, {p.state}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </button>
          ))}
        </div>
      </Modal>

      {vacancyPropertyId && (
        <VacancyForm
          open={!!vacancyPropertyId && pickProperty === false}
          onClose={() => { setVacancyPropertyId(null); setEditId(null); }}
          propertyId={vacancyPropertyId}
          vacancy={editing}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <Card className="p-4">
      <div className={cn("mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg", tone)}>
        <DoorOpen className="h-4 w-4" />
      </div>
      <div className="text-xl font-extrabold text-ink-900">{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </Card>
  );
}
