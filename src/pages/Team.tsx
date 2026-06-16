import { useState } from "react";
import {
  Share2,
  Plus,
  Trash2,
  Building2,
  Users,
  RotateCcw,
  Database,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../store/hooks";
import { Avatar, Badge, Button, Card, Field, Input, Modal } from "../components/ui";
import { navigate } from "../lib/router";
import { formatDate } from "../lib/format";
import { cn } from "../utils/cn";

const swatches = ["#2563eb", "#0d9488", "#7c3aed", "#db2777", "#ea580c", "#0891b2", "#16a34a", "#ca8a04"];

export function Team() {
  const { team, properties, addTeamMember, removeTeamMember, resetData } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState(swatches[0]);
  const [confirmReset, setConfirmReset] = useState(false);

  const add = () => {
    if (!name.trim()) return;
    addTeamMember({ name: name.trim(), role: role.trim() || "Team Member", email: email.trim() || `${name.split(" ")[0].toLowerCase()}@stackline.co`, color });
    setName(""); setRole(""); setEmail(""); setColor(swatches[0]);
  };

  const sharedProperties = properties.filter((p) => p.sharedWith.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Intro */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-ink-900 to-blue-900 p-6 text-white">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold">Internal Collaboration</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Properties you add stay in your firm's private database. Share specific buildings
              with teammates so brokers can collaborate on deals without exposing data outside the firm.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Team list */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-ink-900">Team Members</h3>
                <p className="text-sm text-slate-500">{team.length} people with database access</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {team.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <Avatar name={m.name} color={m.color} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-ink-900">{m.name}</div>
                    <div className="truncate text-xs text-slate-500">{m.role}</div>
                  </div>
                  <button
                    onClick={() => removeTeamMember(m.id)}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add member */}
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-4">
              <div className="mb-3 text-sm font-bold text-ink-900">Invite a teammate</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" /></Field>
                <Field label="Role"><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Associate Broker" /></Field>
                <Field label="Email" className="sm:col-span-2"><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@stackline.co" /></Field>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {swatches.map((s) => (
                  <button key={s} onClick={() => setColor(s)} className={cn("h-7 w-7 rounded-full ring-2 ring-offset-2 transition-all", color === s ? "ring-ink-900" : "ring-transparent")} style={{ backgroundColor: s }} />
                ))}
              </div>
              <Button variant="primary" className="mt-4" onClick={add}>
                <Plus className="h-4 w-4" /> Add Member
              </Button>
            </div>
          </Card>
        </div>

        {/* Sharing + data */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <h3 className="font-display text-base font-bold text-ink-900">Access Model</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex gap-2"><Badge tone="emerald" dot>Firm</Badge> Every member sees the full property database.</li>
              <li className="flex gap-2"><Badge tone="blue" dot>Shared</Badge> Flag buildings for specific deal teams.</li>
              <li className="flex gap-2"><Badge tone="slate" dot>Private</Badge> Internal notes stay internal by default.</li>
            </ul>
          </Card>

          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-400" />
              <h3 className="font-display text-base font-bold text-ink-900">Data Management</h3>
            </div>
            <p className="mb-3 text-sm text-slate-500">
              Your data is saved locally in this browser. Reset to reload the demo dataset.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="h-4 w-4" /> Reset to demo data
            </Button>
          </Card>
        </div>
      </div>

      {/* Shared properties */}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-slate-400" />
          <h3 className="font-display text-base font-bold text-ink-900">Shared Properties</h3>
        </div>
        {sharedProperties.length === 0 ? (
          <p className="text-sm text-slate-400">No properties are currently shared with specific teammates.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {sharedProperties.map((p) => {
              const members = p.sharedWith.map((id) => team.find((t) => t.id === id)).filter(Boolean);
              return (
                <div key={p.id} className="flex flex-wrap items-center gap-4 py-3">
                  <button onClick={() => navigate(`/properties/${p.id}`)} className="flex min-w-[200px] flex-1 items-center gap-2 text-left">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-sm font-bold text-ink-900 hover:text-blue-600">{p.name}</div>
                      <div className="text-xs text-slate-500">Updated {formatDate(p.lastUpdated)}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {members.map((m) => (
                        <Avatar key={m!.id} name={m!.name} color={m!.color} size={28} />
                      ))}
                    </div>
                    <Badge tone="blue">Shared with {members.length}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        size="sm"
        title="Reset all data?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { resetData(); setConfirmReset(false); }}>Reset</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          This restores the original demo dataset and discards any changes you've made in this browser.
        </p>
      </Modal>
    </div>
  );
}
