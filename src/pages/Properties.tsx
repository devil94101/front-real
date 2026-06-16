import { useMemo, useState } from "react";
import {
  Search,
  Star,
  MapPin,
  Ruler,
  TrendingUp,
  Plus,
  ArrowUpDown,
  SlidersHorizontal,
  Building2,
} from "lucide-react";
import { useApp } from "../store/hooks";
import { Badge, Button, Card, EmptyState, Select } from "../components/ui";
import { PropertyImage } from "../components/PropertyImage";
import { Link } from "../lib/router";
import {
  currency,
  formatSF,
  pct,
} from "../lib/format";
import {
  propertyStatusTone,
  propertyTypes,
  propertyStatuses,
} from "../lib/meta";
import { cn } from "../utils/cn";
import type { Property } from "../types";

type SortKey = "recent" | "name" | "size" | "occupancy" | "rent";

export function Properties({ onAddProperty }: { onAddProperty: () => void }) {
  const { properties, toggleStar } = useApp();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [starredOnly, setStarredOnly] = useState(false);

  const cities = useMemo(
    () => Array.from(new Set(properties.map((p) => p.city))).sort(),
    [properties]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = properties.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (status !== "all" && p.status !== status) return false;
      if (city !== "all" && p.city !== city) return false;
      if (starredOnly && !p.isStarred) return false;
      if (query) {
        const hay = `${p.name} ${p.address} ${p.city} ${p.state} ${p.type} ${p.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.totalSF - a.totalSF;
        case "occupancy":
          return b.occupancyPct - a.occupancyPct;
        case "rent":
          return b.askingRentPSF - a.askingRentPSF;
        default:
          return b.dateAdded.localeCompare(a.dateAdded);
      }
    });
    return list;
  }, [properties, q, type, status, city, sort, starredOnly]);

  const activeFilters = [type !== "all", status !== "all", city !== "all", starredOnly].filter(
    Boolean
  ).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filter bar */}
      <Card className="p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, address, city, tag…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-ink-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect value={type} onChange={setType} label="Type" all="All types">
              {propertyTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </FilterSelect>
            <FilterSelect value={status} onChange={setStatus} label="Status" all="All statuses">
              {propertyStatuses.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </FilterSelect>
            <FilterSelect value={city} onChange={setCity} label="City" all="All cities">
              {cities.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </FilterSelect>
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 w-auto pl-8 text-sm font-medium"
              >
                <option value="recent">Recently added</option>
                <option value="name">Name A–Z</option>
                <option value="size">Largest</option>
                <option value="occupancy">Occupancy</option>
                <option value="rent">Asking rent</option>
              </Select>
            </div>
            <button
              onClick={() => setStarredOnly((s) => !s)}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors",
                starredOnly
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              )}
            >
              <Star className={cn("h-4 w-4", starredOnly && "fill-amber-400 text-amber-500")} />
              Starred
            </button>
          </div>
        </div>
      </Card>

      {/* Result count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-slate-500">
          <span className="font-bold text-ink-900">{filtered.length}</span> properties
          {activeFilters > 0 && (
            <span className="ml-1.5 text-slate-400">
              · {activeFilters} filter{activeFilters > 1 ? "s" : ""} applied
            </span>
          )}
        </p>
        <Button variant="primary" size="sm" onClick={onAddProperty}>
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add Property
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No properties found"
          description="Try adjusting your filters or add a new property to the database."
          action={
            <Button variant="primary" onClick={onAddProperty}>
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} onStar={() => toggleStar(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  all,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  all: string;
  children: React.ReactNode;
}) {
  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 w-auto text-sm font-medium",
        value !== "all" ? "border-blue-300 bg-blue-50 text-blue-700" : ""
      )}
      aria-label={label}
    >
      <option value="all">{all}</option>
      {children}
    </Select>
  );
}

function PropertyCard({ property: p, onStar }: { property: Property; onStar: () => void }) {
  const ownerName = useApp().getContact(p.ownerId ?? "");
  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="relative">
        <PropertyImage
          src={p.imageUrl}
          type={p.type}
          rounded="rounded-none"
          className="h-40 w-full"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <Badge tone={propertyStatusTone[p.status]} dot>
            {p.status}
          </Badge>
        </div>
        <button
          onClick={onStar}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 backdrop-blur transition-colors hover:text-amber-500"
          aria-label="Star property"
        >
          <Star className={cn("h-4 w-4", p.isStarred && "fill-amber-400 text-amber-500")} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-950/80 to-transparent p-3 pt-8">
          <div className="flex items-center gap-2">
            <Badge tone="slate" className="bg-white/90 ring-white/20">
              {p.type}
            </Badge>
            <Badge tone="slate" className="bg-white/90 ring-white/20">
              {p.classType}
            </Badge>
          </div>
        </div>
      </div>

      <Link to={`/properties/${p.id}`} className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight text-ink-900 group-hover:text-blue-700">
            {p.name}
          </h3>
        </div>
        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {p.address ? `${p.address}, ` : ""}
            {p.city}, {p.state}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
          <Metric icon={<Ruler className="h-3.5 w-3.5" />} label="Total SF" value={formatSF(p.totalSF, { compact: true })} />
          <Metric
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            label="Occ."
            value={pct(p.occupancyPct)}
          />
          <Metric
            icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            label="Rent"
            value={p.askingRentPSF ? `${currency(p.askingRentPSF)}` : "—"}
          />
        </div>

        {ownerName && (
          <div className="mt-3 truncate text-xs text-slate-400">
            Owner: <span className="font-medium text-slate-500">{ownerName.name}</span>
          </div>
        )}

        {p.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {p.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </Link>
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-ink-900">{value}</div>
    </div>
  );
}
