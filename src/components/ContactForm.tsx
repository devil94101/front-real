import { useEffect, useState } from "react";
import type { Contact, ContactType } from "../types";
import { useApp } from "../store/hooks";
import { contactTypes } from "../lib/meta";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui";
import { cn } from "../utils/cn";

function emptyContact(presetPropertyId?: string): Omit<Contact, "id" | "dateAdded"> {
  return {
    name: "",
    company: "",
    title: "",
    type: "Owner",
    email: "",
    phone: "",
    linkedin: "",
    propertyIds: presetPropertyId ? [presetPropertyId] : [],
    notes: "",
    lastContacted: undefined,
    isStarred: false,
  };
}

export function ContactForm({
  open,
  onClose,
  contact,
  presetPropertyId,
}: {
  open: boolean;
  onClose: () => void;
  contact?: Contact | null;
  presetPropertyId?: string;
}) {
  const { properties, addContact, updateContact } = useApp();
  const [draft, setDraft] = useState(emptyContact(presetPropertyId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (contact) {
        const { id, dateAdded, ...rest } = contact;
        void id;
        void dateAdded;
        setDraft(rest);
      } else {
        setDraft(emptyContact(presetPropertyId));
      }
      setError("");
    }
  }, [open, contact, presetPropertyId]);

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const toggleProperty = (id: string) =>
    setDraft((d) => ({
      ...d,
      propertyIds: d.propertyIds.includes(id)
        ? d.propertyIds.filter((x) => x !== id)
        : [...d.propertyIds, id],
    }));

  const submit = () => {
    if (!draft.name.trim()) {
      setError("Contact name is required.");
      return;
    }
    if (contact) updateContact(contact.id, draft);
    else addContact(draft);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={contact ? "Edit Contact" : "New Contact"}
      subtitle="Owners, brokers, tenants and investors."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            {contact ? "Save Contact" : "Add Contact"}
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
        <Field label="Full Name" required>
          <Input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Eleanor Whitfield" />
        </Field>
        <Field label="Company">
          <Input value={draft.company} onChange={(e) => set("company", e.target.value)} placeholder="Whitfield Capital Partners" />
        </Field>
        <Field label="Title / Role">
          <Input value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Managing Director" />
        </Field>
        <Field label="Contact Type">
          <Select value={draft.type} onChange={(e) => set("type", e.target.value as ContactType)}>
            {contactTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Email">
          <Input type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} placeholder="name@company.com" />
        </Field>
        <Field label="Phone">
          <Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(212) 555-0100" />
        </Field>
        <Field label="LinkedIn" className="sm:col-span-2">
          <Input value={draft.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="linkedin.com/in/…" />
        </Field>
      </div>

      <div className="mt-5">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Linked Properties
        </span>
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {properties.map((p) => {
            const on = draft.propertyIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleProperty(p.id)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all",
                  on
                    ? "bg-blue-50 text-blue-700 ring-blue-300"
                    : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Notes" className="mt-5">
        <Textarea rows={2} value={draft.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Relationship context, holdings, preferences…" />
      </Field>
    </Modal>
  );
}
