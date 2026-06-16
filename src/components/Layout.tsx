import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Building2,
  DoorOpen,
  Handshake,
  Users,
  Share2,
  LayoutDashboard,
  Search,
  Plus,
  Menu,
  X,
  ChevronDown,
  CornerDownLeft,
  LogOut,
} from "lucide-react";
import { cn } from "../utils/cn";
import { Link, navigate, useHashRoute } from "../lib/router";
import { useApp } from "../store/hooks";
import { Avatar, Badge } from "./ui";
import { propertyStatusTone } from "../lib/meta";

const navItems = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { view: "properties", label: "Properties", icon: Building2, path: "/properties" },
  { view: "vacancies", label: "Vacancies", icon: DoorOpen, path: "/vacancies" },
  { view: "deals", label: "Deal Pipeline", icon: Handshake, path: "/deals" },
  { view: "contacts", label: "Contacts", icon: Users, path: "/contacts" },
  { view: "team", label: "Team & Sharing", icon: Share2, path: "/team" },
];

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-900/40">
        <Building2 className="h-5 w-5 text-white" strokeWidth={2.2} />
      </div>
      <div className="leading-tight">
        <div className="font-display text-[15px] font-extrabold tracking-tight text-white">
          Stackline
        </div>
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Property Intel
        </div>
      </div>
    </Link>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const route = useHashRoute();
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = route.view === item.view;
        const Icon = item.icon;
        return (
          <Link
            key={item.view}
            to={item.path}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              active
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-400" />
            )}
            <Icon
              className={cn("h-[18px] w-[18px]", active ? "text-blue-400" : "")}
              strokeWidth={2}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const { currentUser, team, setCurrentUserId, isDemoMode, logout } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative px-3 pb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-2.5 text-left hover:bg-white/10"
      >
        <Avatar name={currentUser.name} color={currentUser.color} size={36} />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-semibold text-white">
            {currentUser.name}
          </div>
          <div className="truncate text-xs text-slate-400">{currentUser.role}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute bottom-[72px] left-3 right-3 z-20 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-2xl">
          {isDemoMode && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Switch user
              </div>
              {team.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setCurrentUserId(m.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50",
                    m.id === currentUser.id ? "bg-slate-50" : ""
                  )}
                >
                  <Avatar name={m.name} color={m.color} size={28} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate font-semibold text-ink-900">{m.name}</div>
                    <div className="truncate text-xs text-slate-500">{m.role}</div>
                  </div>
                </button>
              ))}
              <div className="my-1 border-t border-slate-100" />
            </>
          )}
          {!isDemoMode && (
            <div className="px-3 py-2 text-sm">
              <div className="font-semibold text-ink-900">{currentUser.name}</div>
              <div className="text-xs text-slate-500">{currentUser.email}</div>
              <div className="my-1 border-t border-slate-100" />
            </div>
          )}
          <button
            onClick={() => {
              logout();
              setOpen(false);
              navigate("/login");
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function GlobalSearch({ onPick }: { onPick?: () => void }) {
  const { properties, contacts, deals } = useApp();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return { properties: [], contacts: [], deals: [] };
    return {
      properties: properties
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.city.toLowerCase().includes(query) ||
            p.state.toLowerCase().includes(query) ||
            p.type.toLowerCase().includes(query)
        )
        .slice(0, 4),
      contacts: contacts
        .filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.company.toLowerCase().includes(query)
        )
        .slice(0, 3),
      deals: deals
        .filter((d) => d.title.toLowerCase().includes(query))
        .slice(0, 3),
    };
  }, [q, properties, contacts, deals]);

  const total =
    results.properties.length + results.contacts.length + results.deals.length;

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search properties, contacts, deals…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-ink-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
        />
        {q && (
          <button
            onClick={() => {
              setQ("");
              setOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-ink-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl animate-scale-in">
          {total === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No matches for “{q}”.
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto py-1.5">
              {results.properties.length > 0 && (
                <SearchGroup label="Properties">
                  {results.properties.map((p) => (
                    <SearchRow
                      key={p.id}
                      icon={<Building2 className="h-4 w-4" />}
                      title={p.name}
                      sub={`${p.city}, ${p.state}`}
                      badge={
                        <Badge tone={propertyStatusTone[p.status]} dot>
                          {p.type}
                        </Badge>
                      }
                      onClick={() => {
                        navigate(`/properties/${p.id}`);
                        setOpen(false);
                        setQ("");
                        onPick?.();
                      }}
                    />
                  ))}
                </SearchGroup>
              )}
              {results.contacts.length > 0 && (
                <SearchGroup label="Contacts">
                  {results.contacts.map((c) => (
                    <SearchRow
                      key={c.id}
                      icon={<Users className="h-4 w-4" />}
                      title={c.name}
                      sub={c.company}
                      badge={<Badge tone="slate">{c.type}</Badge>}
                      onClick={() => {
                        navigate(`/contacts/${c.id}`);
                        setOpen(false);
                        setQ("");
                        onPick?.();
                      }}
                    />
                  ))}
                </SearchGroup>
              )}
              {results.deals.length > 0 && (
                <SearchGroup label="Deals">
                  {results.deals.map((d) => (
                    <SearchRow
                      key={d.id}
                      icon={<Handshake className="h-4 w-4" />}
                      title={d.title}
                      sub={d.stage}
                      onClick={() => {
                        navigate(`/deals?focus=${d.id}`);
                        setOpen(false);
                        setQ("");
                        onPick?.();
                      }}
                    />
                  ))}
                </SearchGroup>
              )}
              <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 px-4 py-2 text-[11px] text-slate-400">
                <CornerDownLeft className="h-3 w-3" /> Press Enter to open the first result
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="px-1.5">
      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function SearchRow({
  icon,
  title,
  sub,
  badge,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  badge?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-ink-900">{title}</div>
        <div className="truncate text-xs text-slate-500">{sub}</div>
      </div>
      {badge}
    </button>
  );
}

export function Layout({
  children,
  onAddProperty,
}: {
  children: ReactNode;
  onAddProperty: () => void;
}) {
  const route = useHashRoute();
  const [mobileOpen, setMobileOpen] = useState(false);

  const titleMap: Record<string, { title: string; sub: string }> = {
    dashboard: { title: "Dashboard", sub: "Your portfolio at a glance" },
    properties: { title: "Properties", sub: "Centralized building database" },
    vacancies: { title: "Vacancies", sub: "Available space across the portfolio" },
    deals: { title: "Deal Pipeline", sub: "Track every transaction" },
    contacts: { title: "Contacts", sub: "Owners, brokers, tenants & investors" },
    team: { title: "Team & Sharing", sub: "Internal collaboration & access" },
  };
  const head = titleMap[route.view] ?? { title: "Stackline", sub: "" };

  return (
    <div className="flex min-h-screen bg-[#eef1f6]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink-950 lg:flex">
        <div className="flex h-16 items-center px-2">
          <Brand />
        </div>
        <div className="mt-2 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <SidebarFooter />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-ink-950 animate-scale-in">
            <div className="flex h-16 items-center justify-between px-2">
              <Brand />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </div>
            <SidebarFooter />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block">
            <h1 className="font-display text-base font-bold leading-tight text-ink-900">
              {head.title}
            </h1>
            <p className="text-xs text-slate-500">{head.sub}</p>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden sm:block sm:w-72 lg:w-80">
              <GlobalSearch />
            </div>
            <button
              onClick={onAddProperty}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition-colors hover:bg-blue-700 sm:px-4"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span className="hidden sm:inline">Add Property</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
