"use client";

import Controls from "@/components/Controls";
import InputForm from "@/components/InputForm";
import PedigreePreview from "@/components/PedigreePreview";
import { EMPTY_DATA, TEMPLATE_DATA } from "@/lib/defaultData";
import { PedigreeAction, PedigreeData } from "@/lib/types";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useReducer, useRef, useState } from "react";

const emptyAchievement = { position: "", location: "", points: "" };

const cloneData = (value: PedigreeData): PedigreeData => JSON.parse(JSON.stringify(value));

const getByPath = (obj: unknown, path: string): any => path.split(".").reduce((acc: any, key) => acc[key], obj as any);

const setByPath = (obj: unknown, path: string, value: unknown) => {
  const keys = path.split(".");
  const last = keys.pop();
  if (!last) return;
  const target = keys.reduce((acc: any, key) => acc[key], obj as any);
  target[last] = value;
};

const pedigreeReducer = (state: PedigreeData, action: PedigreeAction): PedigreeData => {
  const next = cloneData(state);
  switch (action.type) {
    case "SET_FIELD":
      setByPath(next, action.path, action.value);
      return next;
    case "SET_IMAGE":
      next.imageDataUrl = action.value;
      return next;
    case "ADD_ACHIEVEMENT": {
      const person = getByPath(next, action.personPath);
      person.achievements.push({ ...emptyAchievement });
      return next;
    }
    case "REMOVE_ACHIEVEMENT": {
      const person = getByPath(next, action.personPath);
      person.achievements.splice(action.index, 1);
      if (!person.achievements.length) person.achievements = [{ ...emptyAchievement }];
      return next;
    }
    case "SET_ACHIEVEMENT_FIELD": {
      const person = getByPath(next, action.personPath);
      person.achievements[action.index][action.key] = action.value;
      return next;
    }
    case "RESET_TEMPLATE":
      return cloneData(TEMPLATE_DATA);
    case "CLEAR_FORM":
      return cloneData(EMPTY_DATA);
    case "LOAD_DATA": {
      const merged = cloneData(EMPTY_DATA);
      Object.assign(merged, action.payload);
      merged.grandparents = { ...merged.grandparents, ...action.payload.grandparents };
      merged.contact = { ...merged.contact, ...(action.payload as any).contact };
      if (!Array.isArray((action.payload as any).lineage) || (action.payload as any).lineage.length !== 8) {
        merged.lineage = cloneData(EMPTY_DATA).lineage;
      }
      if (!(action.payload as any).contact) {
        merged.contact = cloneData(EMPTY_DATA).contact;
      }
      return merged;
    }
    default:
      return state;
  }
};

export default function HomePage() {
  const [data, dispatch] = useReducer(pedigreeReducer, cloneData(TEMPLATE_DATA));
  const previewRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Ready");

  const handleSave = async () => {
    try {
      const response = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      if (!response.ok) throw new Error("API unavailable");
      setStatus("Saved to MySQL successfully.");
    } catch {
      localStorage.setItem("pedigree-fallback", JSON.stringify(data));
      setStatus("Saved to browser fallback (API unavailable on this host).");
    }
  };

  const handleLoad = async () => {
    try {
      const response = await fetch("/api/load?latest=1");
      if (!response.ok) throw new Error("API unavailable");
      const payload = await response.json();
      dispatch({ type: "LOAD_DATA", payload: payload.data as PedigreeData });
      setStatus("Loaded latest from MySQL.");
    } catch {
      const local = localStorage.getItem("pedigree-fallback");
      if (!local) {
        setStatus("No local fallback data found.");
        return;
      }
      dispatch({ type: "LOAD_DATA", payload: JSON.parse(local) as PedigreeData });
      setStatus("Loaded from browser fallback.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;

    // Apply a small PDF-export-only buffer so html2canvas doesn't clip the last text line.
    document.documentElement.classList.add("exporting-pdf");
    window.dispatchEvent(new Event("pdf-export"));
    await new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(() => resolve(), 80)));

    const canvas = await html2canvas(previewRef.current, { scale: 3.125, backgroundColor: "#ffffff", useCORS: true });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(image, "PNG", 0, 0, 210, 297, undefined, "FAST");
    pdf.save(`pedigree-${Date.now()}.pdf`);

    document.documentElement.classList.remove("exporting-pdf");
    window.dispatchEvent(new Event("pdf-export"));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-100 to-indigo-200 p-4 md:p-6">
      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-4 xl:grid-cols-[540px_1fr]">
        <section className="no-print max-h-[96vh] overflow-y-auto rounded-2xl border border-white/30 bg-white/25 p-4 shadow-glass backdrop-blur-md md:p-5">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Pigeon Pedigree Generator</h2>
            <p className="text-sm text-slate-700">Real-time certificate builder with MySQL persistence and print-ready A4 output.</p>
          </div>
          <InputForm data={data} dispatch={dispatch} />
          <div className="mt-4">
            <Controls
              onResetTemplate={() => dispatch({ type: "RESET_TEMPLATE" })}
              onClear={() => dispatch({ type: "CLEAR_FORM" })}
              onPrint={handlePrint}
              onDownloadPdf={handleDownloadPdf}
              onSave={handleSave}
              onLoad={handleLoad}
            />
          </div>
          <p className="mt-3 rounded-md bg-slate-900/80 px-3 py-2 text-xs text-white">{status}</p>
        </section>

        <section className="print-only-area overflow-x-hidden overflow-y-auto rounded-2xl border border-slate-300 bg-slate-100 p-3 md:p-5">
          <PedigreePreview data={data} previewRef={previewRef} />
        </section>
      </div>
    </main>
  );
}
