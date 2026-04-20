"use client";

import ImageUploader from "@/components/ImageUploader";
import { Achievement, PedigreeAction, PedigreeData } from "@/lib/types";
import { Dispatch, useState } from "react";

type InputFormProps = {
  data: PedigreeData;
  dispatch: Dispatch<PedigreeAction>;
};

type PersonPath = string;

type PersonSectionProps = {
  label: string;
  path: PersonPath;
  person: {
    ringId: string;
    name: string;
    color: string;
    owner: string;
    notes: string;
    achievements: Achievement[];
  };
  dispatch: Dispatch<PedigreeAction>;
  defaultOpen?: boolean;
};

function PersonSection({ label, path, person, dispatch, defaultOpen = true }: PersonSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const setField = (field: string, value: string) => {
    dispatch({ type: "SET_FIELD", path: `${path}.${field}`, value });
  };

  return (
    <section className="rounded-xl border border-white/35 bg-white/30 p-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mb-2 flex w-full items-center justify-between text-left text-sm font-semibold text-slate-900"
      >
        <span>{label}</span>
        <span>{open ? "-" : "+"}</span>
      </button>

      {open ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input value={person.ringId} onChange={(e) => setField("ringId", e.target.value)} className="form-input" placeholder="ID / Ring" />
            <input value={person.name} onChange={(e) => setField("name", e.target.value)} className="form-input" placeholder="Name" />
            <input value={person.color} onChange={(e) => setField("color", e.target.value)} className="form-input" placeholder="Color" />
            <input value={person.owner} onChange={(e) => setField("owner", e.target.value)} className="form-input" placeholder="Owner" />
          </div>
          <textarea value={person.notes} onChange={(e) => setField("notes", e.target.value)} className="form-input min-h-[56px]" placeholder="Notes / highlights" />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-700">
              <span>Achievements</span>
              <button
                type="button"
                onClick={() => dispatch({ type: "ADD_ACHIEVEMENT", personPath: path })}
                className="rounded border border-slate-400 px-2 py-0.5 text-[11px]"
              >
                + Add
              </button>
            </div>
            {person.achievements.map((achievement, index) => (
              <div key={`${path}-ach-${index}`} className="grid grid-cols-[1fr_1fr_72px_36px] gap-1.5">
                <input
                  value={achievement.position}
                  onChange={(e) => dispatch({ type: "SET_ACHIEVEMENT_FIELD", personPath: path, index, key: "position", value: e.target.value })}
                  className="form-input"
                  placeholder="Position"
                />
                <input
                  value={achievement.location}
                  onChange={(e) => dispatch({ type: "SET_ACHIEVEMENT_FIELD", personPath: path, index, key: "location", value: e.target.value })}
                  className="form-input"
                  placeholder="Location"
                />
                <input
                  value={achievement.points}
                  onChange={(e) => dispatch({ type: "SET_ACHIEVEMENT_FIELD", personPath: path, index, key: "points", value: e.target.value })}
                  className="form-input"
                  placeholder="Points"
                />
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REMOVE_ACHIEVEMENT", personPath: path, index })}
                  className="rounded border border-red-300 bg-red-100 text-xs font-semibold text-red-700"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default function InputForm({ data, dispatch }: InputFormProps) {
  return (
    <div className="space-y-4">
      <ImageUploader imageDataUrl={data.imageDataUrl} onChange={(value) => dispatch({ type: "SET_IMAGE", value })} />

      <section className="rounded-xl border border-white/35 bg-white/30 p-3">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Address (Print footer)</h3>
        <div className="space-y-2">
          <input
            value={data.contact.name}
            onChange={(e) => dispatch({ type: "SET_FIELD", path: "contact.name", value: e.target.value })}
            className="form-input"
            placeholder="Name"
          />
          <input
            value={data.contact.addressLine1}
            onChange={(e) => dispatch({ type: "SET_FIELD", path: "contact.addressLine1", value: e.target.value })}
            className="form-input"
            placeholder="Address line 1 (e.g. Add: ...)"
          />
          <input
            value={data.contact.addressLine2}
            onChange={(e) => dispatch({ type: "SET_FIELD", path: "contact.addressLine2", value: e.target.value })}
            className="form-input"
            placeholder="Address line 2"
          />
          <input
            value={data.contact.phone}
            onChange={(e) => dispatch({ type: "SET_FIELD", path: "contact.phone", value: e.target.value })}
            className="form-input"
            placeholder="Phone (without Tel:)"
          />
        </div>
      </section>

      <PersonSection label="Main Pigeon" path="main" person={data.main} dispatch={dispatch} />
      <PersonSection label="Father" path="father" person={data.father} dispatch={dispatch} />
      <PersonSection label="Mother" path="mother" person={data.mother} dispatch={dispatch} />
      <section className="rounded-xl border border-white/35 bg-white/25 p-3">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Grandparents (Expandable)</h3>
        <div className="space-y-2">
          <PersonSection label="Father's Father" path="grandparents.fatherFather" person={data.grandparents.fatherFather} dispatch={dispatch} defaultOpen={true} />
          <div className="pl-3 space-y-2">
            <PersonSection label="Father's Father's Father" path="lineage.0" person={data.lineage[0]} dispatch={dispatch} defaultOpen={true} />
            <PersonSection label="Father's Father's Mother" path="lineage.1" person={data.lineage[1]} dispatch={dispatch} defaultOpen={true} />
          </div>

          <PersonSection label="Father's Mother" path="grandparents.fatherMother" person={data.grandparents.fatherMother} dispatch={dispatch} defaultOpen={true} />
          <div className="pl-3 space-y-2">
            <PersonSection label="Father's Mother's Father" path="lineage.2" person={data.lineage[2]} dispatch={dispatch} defaultOpen={true} />
            <PersonSection label="Father's Mother's Mother" path="lineage.3" person={data.lineage[3]} dispatch={dispatch} defaultOpen={true} />
          </div>

          <PersonSection label="Mother's Father" path="grandparents.motherFather" person={data.grandparents.motherFather} dispatch={dispatch} defaultOpen={true} />
          <div className="pl-3 space-y-2">
            <PersonSection label="Mother's Father's Father" path="lineage.4" person={data.lineage[4]} dispatch={dispatch} defaultOpen={true} />
            <PersonSection label="Mother's Father's Mother" path="lineage.5" person={data.lineage[5]} dispatch={dispatch} defaultOpen={true} />
          </div>

          <PersonSection label="Mother's Mother" path="grandparents.motherMother" person={data.grandparents.motherMother} dispatch={dispatch} defaultOpen={true} />
          <div className="pl-3 space-y-2">
            <PersonSection label="Mother's Mother's Father" path="lineage.6" person={data.lineage[6]} dispatch={dispatch} defaultOpen={true} />
            <PersonSection label="Mother's Mother's Mother" path="lineage.7" person={data.lineage[7]} dispatch={dispatch} defaultOpen={true} />
          </div>
        </div>
      </section>
    </div>
  );
}
