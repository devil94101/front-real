import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Contact, Deal, DealStage, DealType } from "../types";
import { useApp } from "../store/hooks";
import { dealStages } from "../lib/meta";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui";
import { cn } from "../utils/cn";

const dealTypes: DealType[] = ["Lease", "Sale", "Acquisition", "Disposition"];

function emptyDeal(propertyId: string | null): Omit<Deal, "id" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    propertyId,
    type: "Lease",
    stage: "Sourcing",
    value: 0,
    probability: 10,
    assignedTo: "",
    contactIds: [],
    keyDates: [],
    notes: "",
    expectedClose: new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10),
  };
}

export function DealForm({
  open,
  onClose,
  deal,
  presetPropertyId,
}: {
  open: boolean;
  onClose: () => void;
  deal?: Deal | null;
  presetPropertyId?: string | null;
}) {
  const { properties, contacts, team, currentUser, addDeal, updateDeal } = useApp();
  const [draft, setDraft] = useState(emptyDeal(presetPropertyId ?? null));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (deal) {
        const { id, createdAt, updatedAt, ...rest } = deal;
        void id;
        void createdAt;
        void updatedAt;
        setDraft(rest);
      } else {
        setDraft(emptyDeal(presetPropertyId ?? null));
      }
      setError("");
    }
  }, [open, deal, presetPropertyId]);

  const num = (v: string) => (v === "" ? 0 : Number(v));
  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const toggleContact = (id: string) =>
    setDraft((d) => ({
      ...d,
      contactIds: d.contactIds.includes(id)
        ? d.contactIds.filter((x) => x !== id)
        : [...d.contactIds, id],
    }));

  const submit = () => {
    if (!draft.title.trim()) {
      setError("Deal title is required.");
      return;
    }
    const payload = { ...draft, assignedTo: draft.assignedTo || currentUser.name };
    if (deal) updateDeal(deal.id, payload);
    else addDeal(payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={deal ? "Edit Deal" : "New Deal"}
      subtitle="Add a transaction to the pipeline."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            {deal ? "Save Deal" : "Create Deal"}
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Deal Title" required className="sm:col-span-2">
          <Input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Meridian Tower — Fl 28 Lease"
          />
        </Field>
        <Field label="Property">
          <Select
            value={draft.propertyId ?? ""}
            onChange={(e) => set("propertyId", e.target.value || null)}
          >
            <option value="">— No linked property —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Deal Type">
          <Select
            value={draft.type}
            onChange={(e) => set("type", e.target.value as DealType)}
          >
            {dealTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Stage">
          <Select
            value={draft.stage}
            onChange={(e) => set("stage", e.target.value as DealStage)}
          >
            {dealStages.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Deal Value ($)">
          <Input
            type="number"
            value={draft.value || ""}
            onChange={(e) => set("value", num(e.target.value))}
          />
        </Field>
        <Field label={`Probability — ${draft.probability}%`}>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={draft.probability}
            onChange={(e) => set("probability", Number(e.target.value))}
            className="mt-2 w-full accent-blue-600"
          />
        </Field>
        <Field label="Assigned To">
          <Select
            value={draft.assignedTo || currentUser.name}
            onChange={(e) => set("assignedTo", e.target.value)}
          >
            {team.map((m) => (
              <option key={m.id}>{m.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Expected Close">
          <Input
            type="date"
            value={draft.expectedClose}
            onChange={(e) => set("expectedClose", e.target.value)}
          />
        </Field>
      </div>

      {/* Contacts */}
      <div className="mt-5">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Involved Contacts
        </span>
        <div className="flex flex-wrap gap-1.5">
          {contacts.map((c: Contact) => {
            const on = draft.contactIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleContact(c.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all",
                  on
                    ? "bg-blue-50 text-blue-700 ring-blue-300"
                    : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Key dates */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Key Dates
          </span>
          <button
            type="button"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                keyDates: [
                  ...d.keyDates,
                  { label: "", date: new Date().toISOString().slice(0, 10) },
                ],
              }))
            }
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add date
          </button>
        </div>
        <div className="space-y-2">
          {draft.keyDates.length === 0 && (
            <p className="text-xs text-slate-400">No key dates added.</p>
          )}
          {draft.keyDates.map((kd, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={kd.label}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    keyDates: d.keyDates.map((x, j) =>
                      j === i ? { ...x, label: e.target.value } : x
                    ),
                  }))
                }
                placeholder="LOI Executed"
                className="flex-1"
              />
              <Input
                type="date"
                value={kd.date}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    keyDates: d.keyDates.map((x, j) =>
                      j === i ? { ...x, date: e.target.value } : x
                    ),
                  }))
                }
                className="w-44"
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({ ...d, keyDates: d.keyDates.filter((_, j) => j !== i) }))
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Notes" className="mt-5">
        <Textarea
          rows={2}
          value={draft.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Terms, counterparties, strategy…"
        />
      </Field>
    </Modal>
  );
}
