import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  Star,
  Mail,
  Phone,
  Link2,
  Pencil,
  Trash2,
  Building2,
  Handshake,
  Briefcase,
} from "lucide-react";
import { useApp } from "../store/hooks";
import { Avatar, Badge, Button, Card, EmptyState, Modal } from "../components/ui";
import { ContactForm } from "../components/ContactForm";
import { navigate, useHashRoute } from "../lib/router";
import { contactTypeTone, contactTypes } from "../lib/meta";
import { formatDate } from "../lib/format";
import { cn } from "../utils/cn";
import type { Contact } from "../types";

const palette = ["#2563eb", "#0d9488", "#7c3aed", "#db2777", "#ea580c", "#0891b2", "#16a34a", "#ca8a04"];
function colorFor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

export function Contacts() {
  const { contacts, properties, deals, toggleContactStar, deleteContact } = useApp();
  const route = useHashRoute();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);

  useEffect(() => {
    if (route.view === "contacts" && route.param) setDetailId(route.param);
  }, [route.view, route.param]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return contacts.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (starredOnly && !c.isStarred) return false;
      if (query) {
        const hay = `${c.name} ${c.company} ${c.email} ${c.title}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [contacts, q, type, starredOnly]);

  const detail = detailId ? contacts.find((c) => c.id === detailId) : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Filters */}
      <Card className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, company, email…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={cn(
              "h-10 rounded-xl border bg-white pl-3 pr-8 text-sm font-medium focus:border-blue-400 focus:outline-none",
              type !== "all" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
            )}
          >
            <option value="all">All types</option>
            {contactTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={() => setStarredOnly((s) => !s)}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-colors",
              starredOnly ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            <Star className={cn("h-4 w-4", starredOnly && "fill-amber-400 text-amber-500")} /> Starred
          </button>
          <Button variant="primary" onClick={() => { setEditContact(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Contact
          </Button>
        </div>
      </Card>

      <p className="px-1 text-sm text-slate-500">
        <span className="font-bold text-ink-900">{filtered.length}</span> contacts
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No contacts found"
          description="Add owners, brokers, tenants or investors to your network."
          action={<Button variant="primary" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Add Contact</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="group p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <button onClick={() => setDetailId(c.id)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <Avatar name={c.name} color={colorFor(c.name)} size={44} />
                  <div className="min-w-0">
                    <h4 className="truncate font-bold text-ink-900 group-hover:text-blue-700">{c.name}</h4>
                    <p className="truncate text-sm text-slate-500">{c.title}</p>
                    <p className="truncate text-xs text-slate-400">{c.company}</p>
                  </div>
                </button>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge tone={contactTypeTone[c.type]}>{c.type}</Badge>
                  <button onClick={() => toggleContactStar(c.id)}>
                    <Star className={cn("h-4 w-4", c.isStarred ? "fill-amber-400 text-amber-500" : "text-slate-300 hover:text-amber-400")} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-sm">
                {c.email && (
                  <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 truncate text-slate-500 hover:text-blue-600">
                    <Mail className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{c.email}</span>
                  </a>
                )}
                <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                  <Building2 className="h-3 w-3" /> {c.propertyIds.length}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetailId(null)}
        size="lg"
        footer={
          detail && (
            <>
              <Button variant="ghost" onClick={() => { if (confirm("Delete this contact?")) { deleteContact(detail.id); setDetailId(null); } }}>
                <Trash2 className="h-4 w-4 text-rose-500" /> Delete
              </Button>
              <Button variant="secondary" onClick={() => { setEditContact(detail); setShowForm(true); setDetailId(null); }}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            </>
          )
        }
      >
        {detail && (
          <ContactDetail contact={detail} color={colorFor(detail.name)} />
        )}
      </Modal>

      <ContactForm open={showForm} onClose={() => setShowForm(false)} contact={editContact} />
    </div>
  );

  function ContactDetail({ contact, color }: { contact: Contact; color: string }) {
    const linkedProps = properties.filter((p) => contact.propertyIds.includes(p.id));
    const linkedDeals = deals.filter((d) => d.contactIds.includes(contact.id));
    return (
      <div>
        <div className="flex items-start gap-4">
          <Avatar name={contact.name} color={color} size={56} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-extrabold text-ink-900">{contact.name}</h3>
              <Badge tone={contactTypeTone[contact.type]}>{contact.type}</Badge>
            </div>
            <p className="text-sm text-slate-600">{contact.title}{contact.company ? ` · ${contact.company}` : ""}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600">
                  <Mail className="h-4 w-4 text-slate-400" /> {contact.email}
                </a>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" /> {contact.phone}
                </span>
              )}
              {contact.linkedin && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Link2 className="h-4 w-4 text-slate-400" /> {contact.linkedin}
                </span>
              )}
            </div>
          </div>
        </div>

        {contact.notes && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-sm text-slate-700">{contact.notes}</p>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Briefcase className="h-3.5 w-3.5" /> Linked Properties
            </div>
            {linkedProps.length === 0 ? (
              <p className="text-sm text-slate-400">None</p>
            ) : (
              <div className="space-y-1">
                {linkedProps.map((p) => (
                  <button key={p.id} onClick={() => navigate(`/properties/${p.id}`)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-sm font-medium text-ink-900 hover:text-blue-600">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Handshake className="h-3.5 w-3.5" /> Involved Deals
            </div>
            {linkedDeals.length === 0 ? (
              <p className="text-sm text-slate-400">None</p>
            ) : (
              <div className="space-y-1">
                {linkedDeals.map((d) => (
                  <button key={d.id} onClick={() => navigate(`/deals?focus=${d.id}`)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-slate-50">
                    <span className="truncate text-sm font-medium text-ink-900 hover:text-blue-600">{d.title}</span>
                    <span className="text-xs text-slate-400">{d.stage}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-400">
          Added {formatDate(contact.dateAdded)}
          {contact.lastContacted && ` · Last contacted ${formatDate(contact.lastContacted)}`}
        </div>
      </div>
    );
  }
}
