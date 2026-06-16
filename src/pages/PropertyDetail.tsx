import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Star,
  Pencil,
  Share2,
  Trash2,
  MapPin,
  Ruler,
  TrendingUp,
  Building2,
  Layers,
  CalendarDays,
  DollarSign,
  Plus,
  Mail,
  Phone,
  Lock,
  Leaf,
  Check,
  DoorOpen,
  Handshake,
  Users,
  Sparkles,
} from "lucide-react";
import { useApp } from "../store/hooks";
import { navigate } from "../lib/router";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  ProgressBar,
} from "../components/ui";
import { PropertyImage } from "../components/PropertyImage";
import { ActivityFeed } from "../components/ActivityFeed";
import { VacancyForm } from "../components/VacancyForm";
import { DealForm } from "../components/DealForm";
import { ContactForm } from "../components/ContactForm";
import {
  contactTypeTone,
  dealStageTone,
  dealTypeTone,
  propertyStatusTone,
  vacancyStatusTone,
} from "../lib/meta";
import {
  currency,
  formatCurrency,
  formatDate,
  formatSF,
  pct,
} from "../lib/format";
import { cn } from "../utils/cn";
import type { Property } from "../types";

type Tab = "overview" | "vacancies" | "contacts" | "deals" | "activity" | "sharing";

export function PropertyDetail({
  propertyId,
  onEdit,
}: {
  propertyId: string;
  onEdit: (p: Property) => void;
}) {
  const app = useApp();
  const property = app.getProperty(propertyId);
  const [tab, setTab] = useState<Tab>("overview");
  const [showVacancy, setShowVacancy] = useState(false);
  const [editVacancyId, setEditVacancyId] = useState<string | null>(null);
  const [showDeal, setShowDeal] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const vacancies = property ? app.vacanciesForProperty(property.id) : [];
  const deals = property ? app.dealsForProperty(property.id) : [];
  const contacts = property ? app.contactsForProperty(property.id) : [];

  const tabs: { id: Tab; label: string; count?: number }[] = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "vacancies", label: "Vacancies", count: vacancies.length },
      { id: "contacts", label: "Contacts", count: contacts.length },
      { id: "deals", label: "Deals", count: deals.length },
      { id: "sharing", label: "Sharing" },
      { id: "activity", label: "Activity" },
    ],
    [vacancies.length, contacts.length, deals.length]
  );

  if (!property) {
    return (
      <EmptyState
        icon={<Building2 className="h-6 w-6" />}
        title="Property not found"
        description="This property may have been removed."
        action={
          <Button variant="primary" onClick={() => navigate("/properties")}>
            Back to Properties
          </Button>
        }
      />
    );
  }

  const owner = app.getContact(property.ownerId ?? "");
  const sharedMembers = property.sharedWith
    .map((id) => app.team.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => navigate("/properties")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Properties
      </button>

      {/* Hero */}
      <Card className="overflow-hidden">
        <div className="relative">
          <PropertyImage
            src={property.imageUrl}
            type={property.type}
            rounded="rounded-none"
            className="h-52 w-full sm:h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
          <div className="absolute left-0 right-0 bottom-0 flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-white">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone={propertyStatusTone[property.status]} dot>
                  {property.status}
                </Badge>
                <Badge className="bg-white/15 text-white ring-white/25">{property.type}</Badge>
                <Badge className="bg-white/15 text-white ring-white/25">{property.classType}</Badge>
              </div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                {property.name}
              </h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-200">
                <MapPin className="h-4 w-4" />
                {property.address ? `${property.address}, ` : ""}
                {property.city}, {property.state} {property.zip}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => app.toggleStar(property.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                <Star className={cn("h-4 w-4", property.isStarred && "fill-amber-400 text-amber-400")} />
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(property)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-ink-900 transition-colors hover:bg-slate-100"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 divide-x divide-y-0 divide-slate-100 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
          <QuickStat icon={<Ruler className="h-4 w-4" />} label="Total SF" value={formatSF(property.totalSF)} />
          <QuickStat icon={<TrendingUp className="h-4 w-4" />} label="Occupancy" value={pct(property.occupancyPct)} />
          <QuickStat icon={<DollarSign className="h-4 w-4" />} label="Asking Rent" value={property.askingRentPSF ? `${currency(property.askingRentPSF)}/sf` : "—"} />
          <QuickStat icon={<Layers className="h-4 w-4" />} label="Stories" value={String(property.stories)} />
          <QuickStat icon={<CalendarDays className="h-4 w-4" />} label="Year Built" value={String(property.yearBuilt)} />
          <QuickStat icon={<Building2 className="h-4 w-4" />} label="Avail. SF" value={formatSF(property.availSF, { compact: true })} />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative whitespace-nowrap px-4 py-2.5 text-sm font-semibold transition-colors",
              tab === t.id ? "text-ink-900" : "text-slate-500 hover:text-ink-700"
            )}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600">
                {t.count}
              </span>
            )}
            {tab === t.id && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <OverviewTab property={property} ownerName={owner?.name} />
      )}
      {tab === "vacancies" && (
        <VacanciesTab
          vacancies={vacancies}
          onAdd={() => { setEditVacancyId(null); setShowVacancy(true); }}
          onEdit={(id) => { setEditVacancyId(id ?? null); setShowVacancy(true); }}
        />
      )}
      {tab === "contacts" && (
        <ContactsTab
          contacts={contacts}
          onAdd={() => setShowContact(true)}
        />
      )}
      {tab === "deals" && (
        <DealsTab deals={deals} onAdd={() => setShowDeal(true)} />
      )}
      {tab === "sharing" && (
        <SharingTab property={property} onManage={() => setShowShare(true)} />
      )}
      {tab === "activity" && (
        <Card className="p-5">
          <ActivityFeed items={app.activity.slice(0, 12)} />
        </Card>
      )}

      {/* Shared members strip */}
      {sharedMembers.length > 0 && tab !== "sharing" && (
        <Card className="flex items-center gap-3 p-3">
          <div className="flex -space-x-2">
            {sharedMembers.slice(0, 5).map((m) => (
              <Avatar key={m!.id} name={m!.name} color={m!.color} size={28} />
            ))}
          </div>
          <span className="text-sm text-slate-500">
            Shared with <span className="font-semibold text-ink-900">{sharedMembers.length}</span>{" "}
            {sharedMembers.length === 1 ? "teammate" : "teammates"}
          </span>
          <button onClick={() => setShowShare(true)} className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700">
            Manage
          </button>
        </Card>
      )}

      {/* Modals */}
      <VacancyForm
        open={showVacancy}
        onClose={() => { setShowVacancy(false); setEditVacancyId(null); }}
        propertyId={property.id}
        vacancy={editVacancyId ? vacancies.find((v) => v.id === editVacancyId) ?? null : null}
      />
      <DealForm open={showDeal} onClose={() => setShowDeal(false)} presetPropertyId={property.id} />
      <ContactForm open={showContact} onClose={() => setShowContact(false)} presetPropertyId={property.id} />
      <ShareModal open={showShare} onClose={() => setShowShare(false)} property={property} />
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        size="sm"
        title="Delete property?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                app.deleteProperty(property.id);
                navigate("/properties");
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This permanently removes <b>{property.name}</b> and its linked vacancies. Deals will be
          unlinked. This cannot be undone.
        </p>
      </Modal>

      <button
        onClick={() => setConfirmDelete(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-rose-600"
      >
        <Trash2 className="h-4 w-4" /> Delete this property
      </button>
    </div>
  );
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
        <div className="truncate text-sm font-bold text-ink-900">{value}</div>
      </div>
    </div>
  );
}

function OverviewTab({ property, ownerName }: { property: Property; ownerName?: string }) {
  const b = property.building;
  const intel: { label: string; value?: string | number | boolean }[] = [
    { label: "Parking Ratio", value: b.parkingRatio },
    { label: "Ceiling Height", value: b.ceilingHeight },
    { label: "HVAC", value: b.hvac },
    { label: "Year Renovated", value: b.yearRenovated },
    { label: "Ownership Type", value: b.ownershipType },
    { label: "Zoning", value: b.zoning },
    { label: "Lot Size", value: b.lotSize },
    { label: "Electric", value: b.electric },
  ];
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card className="p-5">
          <SectionLabel icon={<Building2 className="h-4 w-4" />} title="Description" />
          <p className="text-sm leading-relaxed text-slate-600">
            {property.description || "No description provided."}
          </p>
          {property.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {property.tags.map((t) => (
                <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {t}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionLabel icon={<Sparkles className="h-4 w-4" />} title="Building Intelligence" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {intel.map((it) => (
              <div key={it.label}>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {it.label}
                </div>
                <div className="mt-0.5 text-sm font-bold text-ink-900">
                  {it.value === undefined || it.value === "" || it.value === false ? "—" : String(it.value)}
                </div>
              </div>
            ))}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Energy Star</div>
              <div className="mt-0.5 inline-flex items-center gap-1 text-sm font-bold text-ink-900">
                {b.energyStar ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Leaf className="h-3.5 w-3.5" /> Certified
                  </span>
                ) : (
                  "—"
                )}
              </div>
            </div>
          </div>
        </Card>

        {property.amenities.length > 0 && (
          <Card className="p-5">
            <SectionLabel icon={<Check className="h-4 w-4" />} title="Amenities" />
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                  <Check className="h-3.5 w-3.5" /> {a}
                </span>
              ))}
            </div>
          </Card>
        )}

        {property.internalNotes && (
          <Card className="border-amber-200 bg-amber-50/50 p-5">
            <SectionLabel icon={<Lock className="h-4 w-4" />} title="Internal Notes" />
            <p className="text-sm leading-relaxed text-ink-800">{property.internalNotes}</p>
          </Card>
        )}
      </div>

      <div className="space-y-5">
        <Card className="p-5">
          <SectionLabel icon={<DollarSign className="h-4 w-4" />} title="Financials" />
          <div className="space-y-3">
            <Row label="Asking Rent" value={property.askingRentPSF ? formatCurrency(property.askingRentPSF * property.totalSF) + "/yr" : "—"} sub={property.askingRentPSF ? `${currency(property.askingRentPSF)}/sf` : ""} />
            <Row label="Sale Price" value={property.salePrice ? formatCurrency(property.salePrice) : "Not for sale"} />
            <Row label="Price / SF" value={property.salePrice ? currency(Math.round(property.salePrice / property.totalSF)) : "—"} />
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel icon={<TrendingUp className="h-4 w-4" />} title="Occupancy" />
          <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-ink-900">{pct(property.occupancyPct)}</div>
            <div className="text-right text-sm text-slate-500">
              <div className="font-bold text-ink-900">{formatSF(property.availSF, { compact: true })} sf</div>
              available
            </div>
          </div>
          <ProgressBar value={property.occupancyPct} tone={property.occupancyPct >= 90 ? "emerald" : property.occupancyPct >= 75 ? "amber" : "rose"} className="mt-3" />
        </Card>

        <Card className="p-5">
          <SectionLabel icon={<Users className="h-4 w-4" />} title="Ownership" />
          <div className="text-sm font-bold text-ink-900">{ownerName ?? "No linked owner"}</div>
          {b.ownershipType && (
            <div className="text-xs text-slate-500">{b.ownershipType}</div>
          )}
          <div className="mt-3 text-xs text-slate-400">
            Added {formatDate(property.dateAdded)} · Updated {formatDate(property.lastUpdated)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function VacanciesTab({
  vacancies,
  onAdd,
  onEdit,
}: {
  vacancies: ReturnType<ReturnType<typeof useApp>["vacanciesForProperty"]>;
  onAdd: () => void;
  onEdit: (id?: string) => void;
}) {
  const app = useApp();
  if (vacancies.length === 0) {
    return (
      <EmptyState
        icon={<DoorOpen className="h-6 w-6" />}
        title="No vacancies tracked"
        description="Add available space, subleases and suites to track this building's availability."
        action={
          <Button variant="primary" onClick={onAdd}>
            <Plus className="h-4 w-4" /> Add Vacancy
          </Button>
        }
      />
    );
  }
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <h3 className="font-display text-base font-bold text-ink-900">
          Vacancies & Availability
        </h3>
        <Button variant="secondary" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      <div className="divide-y divide-slate-100">
        {vacancies.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-4 p-4 hover:bg-slate-50/60">
            <div className="min-w-[120px]">
              <div className="font-bold text-ink-900">{v.suite}</div>
              <div className="text-xs text-slate-500">{v.floor ? `Floor ${v.floor}` : ""}{v.divisible ? " · Divisible" : ""}</div>
            </div>
            <div className="min-w-[90px]">
              <div className="font-bold text-ink-900">{formatSF(v.sf, { compact: true })} sf</div>
              <div className="text-xs text-slate-500">{v.askingRentPSF ? `${currency(v.askingRentPSF)}/sf` : "—"}</div>
            </div>
            <div className="min-w-[110px]">
              <div className="text-xs text-slate-400">Available</div>
              <div className="text-sm font-medium text-ink-900">{formatDate(v.availableDate)}</div>
            </div>
            <Badge tone="slate">{v.type}</Badge>
            <Badge tone={vacancyStatusTone[v.status]} dot>{v.status}</Badge>
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => app.updateVacancy(v.id, { status: v.status === "Leased" ? "Available" : "Leased" })}>
                {v.status === "Leased" ? "Reopen" : "Mark leased"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(v.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => app.deleteVacancy(v.id)}>
                <Trash2 className="h-4 w-4 text-rose-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ContactsTab({ contacts, onAdd }: { contacts: ReturnType<ReturnType<typeof useApp>["contactsForProperty"]>; onAdd: () => void }) {
  const app = useApp();
  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No contacts linked"
        description="Add owners, brokers or tenants connected to this property."
        action={
          <Button variant="primary" onClick={onAdd}>
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        }
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {contacts.map((c) => (
        <Card key={c.id} className="p-4">
          <div className="flex items-start gap-3">
            <Avatar name={c.name} color="#475569" size={42} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-bold text-ink-900">{c.name}</h4>
                <Badge tone={contactTypeTone[c.type]}>{c.type}</Badge>
              </div>
              <div className="truncate text-sm text-slate-500">{c.title}{c.company ? ` · ${c.company}` : ""}</div>
            </div>
            <button onClick={() => app.toggleContactStar(c.id)}>
              <Star className={cn("h-4 w-4", c.isStarred ? "fill-amber-400 text-amber-500" : "text-slate-300")} />
            </button>
          </div>
          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> {c.email}
              </a>
            )}
            {c.phone && (
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> {c.phone}
              </div>
            )}
          </div>
        </Card>
      ))}
      <button
        onClick={onAdd}
        className="flex min-h-[120px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600"
      >
        <Plus className="h-4 w-4" /> Add Contact
      </button>
    </div>
  );
}

function DealsTab({ deals, onAdd }: { deals: ReturnType<ReturnType<typeof useApp>["dealsForProperty"]>; onAdd: () => void }) {
  if (deals.length === 0) {
    return (
      <EmptyState
        icon={<Handshake className="h-6 w-6" />}
        title="No deals on this property"
        description="Create a lease, sale or acquisition deal to track it through your pipeline."
        action={
          <Button variant="primary" onClick={onAdd}>
            <Plus className="h-4 w-4" /> New Deal
          </Button>
        }
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {deals.map((d) => (
        <button
          key={d.id}
          onClick={() => navigate(`/deals?focus=${d.id}`)}
          className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <Badge tone={dealStageTone[d.stage]} dot>{d.stage}</Badge>
            <Badge tone={dealTypeTone[d.type]}>{d.type}</Badge>
          </div>
          <h4 className="mt-2 font-bold text-ink-900 group-hover:text-blue-700">{d.title}</h4>
          <div className="mt-2 text-2xl font-extrabold text-ink-900">{formatCurrency(d.value, { compact: true })}</div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{d.assignedTo}</span>
            <span>{formatDate(d.expectedClose)}</span>
          </div>
          <ProgressBar value={d.probability} tone="blue" className="mt-2" />
        </button>
      ))}
      <button
        onClick={onAdd}
        className="flex min-h-[140px] items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 transition-colors hover:border-blue-400 hover:text-blue-600"
      >
        <Plus className="h-4 w-4" /> New Deal
      </button>
    </div>
  );
}

function SharingTab({ property, onManage }: { property: Property; onManage: () => void }) {
  const app = useApp();
  const members = app.team.map((t) => ({ ...t, on: property.sharedWith.includes(t.id) }));
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <SectionLabel icon={<Share2 className="h-4 w-4" />} title="Internal Sharing" />
          <p className="mt-1 text-sm text-slate-500">
            Control which teammates can see and collaborate on this property.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={onManage}>
          <Pencil className="h-3.5 w-3.5" /> Manage
        </Button>
      </div>
      <div className="mt-4 divide-y divide-slate-100">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 py-2.5">
            <Avatar name={m.name} color={m.color} size={36} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-ink-900">{m.name}</div>
              <div className="text-xs text-slate-500">{m.role}</div>
            </div>
            {m.on ? (
              <Badge tone="emerald" dot>Shared</Badge>
            ) : (
              <Badge tone="slate">Not shared</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ShareModal({ open, onClose, property }: { open: boolean; onClose: () => void; property: Property }) {
  const app = useApp();
  const [selected, setSelected] = useState<string[]>(property.sharedWith);
  // reset on open
  useMemo(() => {
    if (open) setSelected(property.sharedWith);
  }, [open, property.sharedWith]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={`Share ${property.name}`}
      subtitle="Choose teammates to share with internally."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { app.shareProperty(property.id, selected); onClose(); }}>
            <Share2 className="h-4 w-4" /> Share with {selected.length}
          </Button>
        </>
      }
    >
      <div className="space-y-1.5">
        {app.team.map((m) => {
          const on = selected.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
                on ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
              )}
            >
              <Avatar name={m.name} color={m.color} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink-900">{m.name}</div>
                <div className="truncate text-xs text-slate-500">{m.role} · {m.email}</div>
              </div>
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md border",
                on ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300"
              )}>
                {on && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-3.5 flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500">{icon}</span>
      <h3 className="font-display text-base font-bold text-ink-900">{title}</h3>
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-end justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="text-right">
        <div className="text-sm font-bold text-ink-900">{value}</div>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}
