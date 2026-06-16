import { useEffect, useState } from "react";
import type { Vacancy, VacancyStatus } from "../types";
import { useApp } from "../store/hooks";
import { vacancyStatusTone } from "../lib/meta";
import { Badge, Button, Field, Input, Modal, Select, Textarea } from "./ui";
import { cn } from "../utils/cn";

const statuses: VacancyStatus[] = ["Available", "Negotiating", "Hold", "Leased"];

export function VacancyForm({
  open,
  onClose,
  propertyId,
  vacancy,
}: {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  vacancy?: Vacancy | null;
}) {
  const { addVacancy, updateVacancy, getProperty } = useApp();
  const [draft, setDraft] = useState<Omit<Vacancy, "id">>({
    propertyId,
    suite: "",
    floor: "",
    sf: 0,
    askingRentPSF: 0,
    availableDate: new Date().toISOString().slice(0, 10),
    type: "Direct",
    status: "Available",
    divisible: false,
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setDraft(
        vacancy
          ? { ...vacancy }
          : {
              propertyId,
              suite: "",
              floor: "",
              sf: 0,
              askingRentPSF: 0,
              availableDate: new Date().toISOString().slice(0, 10),
              type: "Direct",
              status: "Available",
              divisible: false,
              notes: "",
            }
      );
    }
  }, [open, vacancy, propertyId]);

  const num = (v: string) => (v === "" ? 0 : Number(v));
  const property = getProperty(propertyId);

  const submit = () => {
    if (!draft.suite.trim()) return;
    if (vacancy) updateVacancy(vacancy.id, draft);
    else addVacancy(draft);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={vacancy ? "Edit Vacancy" : "Add Vacancy"}
      subtitle={property ? `at ${property.name}` : ""}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            {vacancy ? "Save" : "Add Vacancy"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Suite / Unit" required className="sm:col-span-2">
          <Input
            value={draft.suite}
            onChange={(e) => setDraft((d) => ({ ...d, suite: e.target.value }))}
            placeholder="Suite 2800"
          />
        </Field>
        <Field label="Floor">
          <Input
            value={draft.floor}
            onChange={(e) => setDraft((d) => ({ ...d, floor: e.target.value }))}
          />
        </Field>
        <Field label="Square Feet">
          <Input
            type="number"
            value={draft.sf || ""}
            onChange={(e) => setDraft((d) => ({ ...d, sf: num(e.target.value) }))}
          />
        </Field>
        <Field label="Asking Rent ($/sf)">
          <Input
            type="number"
            value={draft.askingRentPSF || ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, askingRentPSF: num(e.target.value) }))
            }
          />
        </Field>
        <Field label="Available Date">
          <Input
            type="date"
            value={draft.availableDate}
            onChange={(e) => setDraft((d) => ({ ...d, availableDate: e.target.value }))}
          />
        </Field>
        <Field label="Type">
          <Select
            value={draft.type}
            onChange={(e) =>
              setDraft((d) => ({ ...d, type: e.target.value as Vacancy["type"] }))
            }
          >
            <option>Direct</option>
            <option>Sublease</option>
          </Select>
        </Field>
        <Field label="Status" className="sm:col-span-2">
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, status: s }))}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-all",
                  draft.status === s
                    ? "ring-2 " + toneRing(s)
                    : "ring-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Notes" className="col-span-2 sm:col-span-4">
          <Textarea
            rows={2}
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            placeholder="Pre-built, divisible, sublease terms…"
          />
        </Field>
        <label className="col-span-2 flex cursor-pointer items-center gap-2 sm:col-span-4">
          <input
            type="checkbox"
            checked={draft.divisible}
            onChange={(e) => setDraft((d) => ({ ...d, divisible: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-ink-900">Divisible space</span>
        </label>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-slate-400">Preview:</span>
        <Badge tone={vacancyStatusTone[draft.status]} dot>
          {draft.status}
        </Badge>
        <span className="text-xs text-slate-500">{draft.type}</span>
      </div>
    </Modal>
  );
}

function toneRing(s: VacancyStatus): string {
  const map: Record<VacancyStatus, string> = {
    Available: "bg-emerald-50 text-emerald-700 ring-emerald-300",
    Negotiating: "bg-amber-50 text-amber-700 ring-amber-300",
    Hold: "bg-slate-100 text-slate-700 ring-slate-300",
    Leased: "bg-blue-50 text-blue-700 ring-blue-300",
  };
  return map[s];
}
