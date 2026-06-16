import { useEffect, useState } from "react";
import { Building2, Sparkles } from "lucide-react";
import type { Property, PropertyStatus, PropertyType, BuildingClass } from "../types";
import { useApp } from "../store/hooks";
import { buildingClasses, propertyStatuses, propertyTypes } from "../lib/meta";
import { Button, Field, Input, Modal, Select, Textarea } from "./ui";
import { cn } from "../utils/cn";

function emptyDraft(): Omit<Property, "id" | "dateAdded" | "lastUpdated"> {
  return {
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    type: "Office",
    status: "Active",
    classType: "Class A",
    yearBuilt: new Date().getFullYear(),
    totalSF: 0,
    stories: 1,
    askingRentPSF: 0,
    salePrice: 0,
    description: "",
    amenities: [],
    ownerId: null,
    occupancyPct: 0,
    availSF: 0,
    tags: [],
    building: {
      parkingRatio: "",
      ceilingHeight: "",
      hvac: "",
      ownershipType: "",
      zoning: "",
      lotSize: "",
      electric: "",
      energyStar: false,
    },
    notes: "",
    internalNotes: "",
    sharedWith: [],
    isStarred: false,
  };
}

export function PropertyForm({
  open,
  onClose,
  property,
}: {
  open: boolean;
  onClose: () => void;
  property?: Property | null;
}) {
  const { contacts, addProperty, updateProperty } = useApp();
  const [draft, setDraft] = useState(emptyDraft());
  const [amenitiesText, setAmenitiesText] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (property) {
        const { id, dateAdded, lastUpdated, ...rest } = property;
        void id;
        void dateAdded;
        void lastUpdated;
        setDraft(rest);
        setAmenitiesText(property.amenities.join(", "));
        setTagsText(property.tags.join(", "));
      } else {
        const d = emptyDraft();
        setDraft(d);
        setAmenitiesText("");
        setTagsText("");
      }
      setError("");
    }
  }, [open, property]);

  const set = <K extends keyof typeof draft>(key: K, val: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: val }));
  const setBuilding = (
    key: keyof Property["building"],
    val: string | number | boolean | undefined
  ) => setDraft((d) => ({ ...d, building: { ...d.building, [key]: val } }));

  const num = (v: string) => (v === "" ? 0 : Number(v));

  const submit = () => {
    if (!draft.name.trim()) {
      setError("Property name is required.");
      return;
    }
    const payload = {
      ...draft,
      amenities: amenitiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (property) updateProperty(property.id, payload);
    else addProperty(payload);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={property ? "Edit Property" : "Add Property"}
      subtitle="Capture full building intelligence in one record."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            {property ? "Save Changes" : "Add Property"}
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-7">
        <Section icon={<Building2 className="h-4 w-4" />} title="Basics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Property Name" required className="sm:col-span-2">
              <Input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Meridian Tower"
              />
            </Field>
            <Field label="Property Type">
              <Select
                value={draft.type}
                onChange={(e) => set("type", e.target.value as PropertyType)}
              >
                {propertyTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Status">
              <Select
                value={draft.status}
                onChange={(e) => set("status", e.target.value as PropertyStatus)}
              >
                {propertyStatuses.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Building Class">
              <Select
                value={draft.classType}
                onChange={(e) => set("classType", e.target.value as BuildingClass)}
              >
                {buildingClasses.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="Owner / Contact">
              <Select
                value={draft.ownerId ?? ""}
                onChange={(e) => set("ownerId", e.target.value || null)}
              >
                <option value="">— No linked owner —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.company}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Section>

        <Section icon={<Building2 className="h-4 w-4" />} title="Location">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
            <Field label="Street Address" className="sm:col-span-3">
              <Input
                value={draft.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="1200 Commerce St"
              />
            </Field>
            <Field label="City" className="sm:col-span-2">
              <Input value={draft.city} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field label="State" className="sm:col-span-1">
              <Input
                value={draft.state}
                onChange={(e) => set("state", e.target.value.toUpperCase().slice(0, 2))}
                placeholder="NY"
              />
            </Field>
            <Field label="ZIP" className="sm:col-span-2">
              <Input value={draft.zip} onChange={(e) => set("zip", e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section icon={<Building2 className="h-4 w-4" />} title="Size & Financials">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Total SF">
              <Input
                type="number"
                value={draft.totalSF || ""}
                onChange={(e) => set("totalSF", num(e.target.value))}
              />
            </Field>
            <Field label="Stories">
              <Input
                type="number"
                value={draft.stories || ""}
                onChange={(e) => set("stories", num(e.target.value))}
              />
            </Field>
            <Field label="Year Built">
              <Input
                type="number"
                value={draft.yearBuilt || ""}
                onChange={(e) => set("yearBuilt", num(e.target.value))}
              />
            </Field>
            <Field label="Occupancy %">
              <Input
                type="number"
                value={draft.occupancyPct || ""}
                onChange={(e) => set("occupancyPct", num(e.target.value))}
              />
            </Field>
            <Field label="Avail. SF">
              <Input
                type="number"
                value={draft.availSF || ""}
                onChange={(e) => set("availSF", num(e.target.value))}
              />
            </Field>
            <Field label="Asking Rent ($/sf)">
              <Input
                type="number"
                value={draft.askingRentPSF || ""}
                onChange={(e) => set("askingRentPSF", num(e.target.value))}
              />
            </Field>
            <Field label="Sale Price ($)" className="sm:col-span-2">
              <Input
                type="number"
                value={draft.salePrice || ""}
                onChange={(e) => set("salePrice", num(e.target.value))}
              />
            </Field>
          </div>
        </Section>

        <Section icon={<Sparkles className="h-4 w-4" />} title="Building Intelligence">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Parking Ratio">
              <Input
                value={draft.building.parkingRatio}
                onChange={(e) => setBuilding("parkingRatio", e.target.value)}
              />
            </Field>
            <Field label="Ceiling Height">
              <Input
                value={draft.building.ceilingHeight}
                onChange={(e) => setBuilding("ceilingHeight", e.target.value)}
              />
            </Field>
            <Field label="HVAC">
              <Input
                value={draft.building.hvac}
                onChange={(e) => setBuilding("hvac", e.target.value)}
              />
            </Field>
            <Field label="Year Renovated">
              <Input
                type="number"
                value={draft.building.yearRenovated ?? ""}
                onChange={(e) =>
                  setBuilding("yearRenovated", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </Field>
            <Field label="Ownership Type">
              <Input
                value={draft.building.ownershipType}
                onChange={(e) => setBuilding("ownershipType", e.target.value)}
              />
            </Field>
            <Field label="Zoning">
              <Input
                value={draft.building.zoning}
                onChange={(e) => setBuilding("zoning", e.target.value)}
              />
            </Field>
            <Field label="Lot Size">
              <Input
                value={draft.building.lotSize}
                onChange={(e) => setBuilding("lotSize", e.target.value)}
              />
            </Field>
            <Field label="Electric">
              <Input
                value={draft.building.electric}
                onChange={(e) => setBuilding("electric", e.target.value)}
              />
            </Field>
            <label className="col-span-2 flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 sm:col-span-1">
              <input
                type="checkbox"
                checked={draft.building.energyStar}
                onChange={(e) => setBuilding("energyStar", e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-ink-900">Energy Star</span>
            </label>
          </div>
        </Section>

        <Section icon={<Sparkles className="h-4 w-4" />} title="Details">
          <div className="space-y-4">
            <Field label="Description">
              <Textarea
                rows={3}
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="A short description of the asset…"
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Amenities" hint="Comma separated">
                <Input
                  value={amenitiesText}
                  onChange={(e) => setAmenitiesText(e.target.value)}
                  placeholder="Fitness center, 24/7 security, Café"
                />
              </Field>
              <Field label="Tags" hint="Comma separated">
                <Input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="Trophy, Value-add, LEED Gold"
                />
              </Field>
            </div>
            <Field label="Internal Notes" hint="Visible only to your team">
              <Textarea
                rows={2}
                value={draft.internalNotes}
                onChange={(e) => set("internalNotes", e.target.value)}
                placeholder="Strategy, pricing, off-market context…"
              />
            </Field>
          </div>
        </Section>
      </div>
    </Modal>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3.5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
          {icon}
        </span>
        <h4 className="text-sm font-bold text-ink-900">{title}</h4>
      </div>
      <div className={cn("")}>{children}</div>
    </div>
  );
}
