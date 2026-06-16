import {
  Building2,
  Ruler,
  DoorOpen,
  Handshake,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Plus,
  Clock,
} from "lucide-react";
import { useMemo } from "react";
import { useApp } from "../store/hooks";
import { Badge, Button, Card } from "../components/ui";
import { DonutChart, HBarChart } from "../components/charts";
import { ActivityFeed } from "../components/ActivityFeed";
import { Link, navigate } from "../lib/router";
import {
  currency,
  formatCurrency,
  formatSF,
  pct,
} from "../lib/format";
import { vacancyStatusTone } from "../lib/meta";
import type { PropertyType } from "../types";

const typeColor: Record<PropertyType, string> = {
  Office: "#2563eb",
  Industrial: "#f59e0b",
  Retail: "#f43f5e",
  Multifamily: "#10b981",
  "Mixed-Use": "#8b5cf6",
  Medical: "#06b6d4",
  Flex: "#14b8a6",
  Land: "#84cc16",
};

export function Dashboard({ onAddProperty }: { onAddProperty: () => void }) {
  const { properties, vacancies, deals, activity, getProperty } = useApp();

  const stats = useMemo(() => {
    const totalSF = properties.reduce((s, p) => s + p.totalSF, 0);
    const availSF = vacancies
      .filter((v) => v.status === "Available")
      .reduce((s, v) => s + v.sf, 0);
    const pipeline = deals
      .filter((d) => d.stage !== "Closed" && d.stage !== "Lost")
      .reduce((s, d) => s + d.value, 0);
    const closed = deals
      .filter((d) => d.stage === "Closed")
      .reduce((s, d) => s + d.value, 0);
    const avgOcc =
      properties.length > 0
        ? properties.reduce((s, p) => s + p.occupancyPct, 0) / properties.length
        : 0;
    return { totalSF, availSF, pipeline, closed, avgOcc };
  }, [properties, vacancies, deals]);

  const pipelineByStage = useMemo(() => {
    const stages = ["Sourcing", "Qualified", "Touring", "LOI", "Under Contract"];
    const colors = ["#94a3b8", "#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b"];
    return stages.map((st, i) => ({
      label: st,
      value: deals
        .filter((d) => d.stage === st)
        .reduce((s, d) => s + d.value, 0),
      color: colors[i],
    }));
  }, [deals]);

  const mix = useMemo(() => {
    const map = new Map<PropertyType, number>();
    properties.forEach((p) => map.set(p.type, (map.get(p.type) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([label, value]) => ({
        label,
        value,
        color: typeColor[label],
      }))
      .sort((a, b) => b.value - a.value);
  }, [properties]);

  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const items: {
      date: string;
      label: string;
      dealId: string;
      propertyId: string | null;
      title: string;
    }[] = [];
    deals.forEach((d) => {
      d.keyDates.forEach((kd) => {
        items.push({
          date: kd.date,
          label: kd.label,
          dealId: d.id,
          propertyId: d.propertyId,
          title: d.title,
        });
      });
      items.push({
        date: d.expectedClose,
        label: "Expected close",
        dealId: d.id,
        propertyId: d.propertyId,
        title: d.title,
      });
    });
    return items
      .filter((it) => new Date(it.date).getTime() >= now.getTime())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [deals]);

  const topVacancies = useMemo(
    () =>
      vacancies
        .filter((v) => v.status === "Available" || v.status === "Negotiating")
        .sort((a, b) => b.sf - a.sf)
        .slice(0, 4),
    [vacancies]
  );

  const kpis = [
    {
      label: "Properties Tracked",
      value: String(properties.length),
      icon: Building2,
      tint: "bg-blue-50 text-blue-600",
      foot: "In the long-term database",
    },
    {
      label: "Total Square Feet",
      value: formatSF(stats.totalSF, { compact: true }) + " sf",
      icon: Ruler,
      tint: "bg-violet-50 text-violet-600",
      foot: `${properties.length} assets under coverage`,
    },
    {
      label: "Available Space",
      value: formatSF(stats.availSF, { compact: true }) + " sf",
      icon: DoorOpen,
      tint: "bg-amber-50 text-amber-600",
      foot: `${vacancies.filter((v) => v.status === "Available").length} active vacancies`,
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(stats.pipeline, { compact: true }),
      icon: Handshake,
      tint: "bg-emerald-50 text-emerald-600",
      foot: `${deals.filter((d) => d.stage !== "Closed" && d.stage !== "Lost").length} open deals`,
    },
    {
      label: "Avg Occupancy",
      value: pct(stats.avgOcc),
      icon: TrendingUp,
      tint: "bg-teal-50 text-teal-600",
      foot: `${formatCurrency(stats.closed, { compact: true })} closed YTD`,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome strip */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-ink-900 via-ink-900 to-blue-900 text-white">
        <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute right-32 top-10 h-32 w-32 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-medium text-blue-200">Welcome back 👋</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
              Your commercial property intelligence, centralized.
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-slate-300">
              Track buildings, owners and vacancies, then move deals forward — all in
              one long-term database your whole team can search and share.
            </p>
          </div>
          <div className="relative flex shrink-0 gap-3">
            <Button
              variant="secondary"
              className="bg-white/10 text-white border-white/15 hover:bg-white/20 hover:border-white/25"
              onClick={() => navigate("/properties")}
            >
              Browse Properties
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-400 border-blue-400"
              onClick={onAddProperty}
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add Property
            </Button>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-4">
              <div className="flex items-start justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.tint}`}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
              </div>
              <div className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">
                {k.value}
              </div>
              <div className="text-xs font-semibold text-slate-500">{k.label}</div>
              <div className="mt-2 truncate text-[11px] text-slate-400">{k.foot}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink-900">
                Deal Pipeline by Stage
              </h3>
              <p className="text-sm text-slate-500">
                Weighted value across open transactions
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/deals")}>
              View pipeline <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
          {stats.pipeline > 0 ? (
            <HBarChart
              data={pipelineByStage}
              format={(v) => formatCurrency(v, { compact: true })}
            />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">
              No open deals yet.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-bold text-ink-900">
            Portfolio Mix
          </h3>
          <p className="text-sm text-slate-500">Assets by property type</p>
          <div className="mt-6">
            <DonutChart
              data={mix}
              centerValue={String(properties.length)}
              centerLabel="Properties"
            />
          </div>
        </Card>
      </div>

      {/* Activity + key dates */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink-900">
              Recent Activity
            </h3>
            <Badge tone="slate">Live feed</Badge>
          </div>
          <ActivityFeed items={activity} limit={7} />
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <h3 className="font-display text-base font-bold text-ink-900">
              Upcoming Key Dates
            </h3>
          </div>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              No upcoming dates scheduled.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {upcoming.map((u, i) => {
                const d = new Date(u.date);
                return (
                  <li key={i}>
                    <button
                      onClick={() => navigate(`/deals?focus=${u.dealId}`)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-2.5 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-900 text-white">
                        <span className="text-[9px] font-bold uppercase leading-none">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-base font-extrabold leading-none">
                          {d.getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-ink-900">
                          {u.label}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {u.title}
                        </div>
                      </div>
                      <Clock className="h-4 w-4 shrink-0 text-slate-300" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Available space */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-ink-900">
              Available Space
            </h3>
            <p className="text-sm text-slate-500">Largest vacancies on the market</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/vacancies")}>
            All vacancies <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {topVacancies.map((v) => {
            const p = getProperty(v.propertyId);
            if (!p) return null;
            return (
              <Link
                key={v.id}
                to={`/properties/${p.id}`}
                className="group rounded-xl border border-slate-100 p-3.5 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Badge tone={vacancyStatusTone[v.status]} dot>
                    {v.status}
                  </Badge>
                  <span className="text-xs font-medium text-slate-400">{v.type}</span>
                </div>
                <div className="mt-2.5 text-xl font-extrabold text-ink-900">
                  {formatSF(v.sf, { compact: true })}
                  <span className="ml-1 text-sm font-semibold text-slate-400">sf</span>
                </div>
                <div className="mt-0.5 text-sm font-semibold text-slate-600 group-hover:text-blue-600">
                  {p.name}
                </div>
                <div className="text-xs text-slate-400">
                  {v.suite} · {currency(v.askingRentPSF)}/sf
                </div>
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
