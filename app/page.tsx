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

    // Create a high-resolution off-screen A4 clone and inline box-shadows so html2canvas captures them.
    const targetW = 2480;
    const targetH = 3508;
    const original = previewRef.current;
    const clone = original.cloneNode(true) as HTMLElement;
    clone.style.width = `${targetW}px`;
    clone.style.height = `${targetH}px`;
    clone.style.transform = "none";
    clone.style.boxSizing = "border-box";
    clone.style.background = "#ffffff";

    clone.querySelectorAll('svg').forEach((s) => {
      try { s.setAttribute('width', `${targetW}`); s.setAttribute('height', `${targetH}`); } catch (e) {}
    });

    const container = document.createElement('div');
    container.style.position = 'fixed'; container.style.left = '-10000px'; container.style.top = '0'; container.style.width = `${targetW}px`; container.style.height = `${targetH}px`; container.style.overflow = 'visible';
    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // Create literal DOM nodes for shadows since html2canvas drops or miniaturizes CSS shadows on scaled clones
      const cloneBoxes = Array.from(clone.querySelectorAll('.pedigree-box')) as HTMLElement[];
      const scaleFactor = targetW / original.offsetWidth; // ~3.125
      const shadowOffset = Math.round(3 * scaleFactor); // scale up the 3px shadow

      for (const cl of cloneBoxes) {
        const shadowDiv = document.createElement('div');
        shadowDiv.style.position = 'absolute';
        shadowDiv.style.left = (cl.offsetLeft + shadowOffset) + 'px';
        shadowDiv.style.top = (cl.offsetTop + shadowOffset) + 'px';
        shadowDiv.style.width = cl.offsetWidth + 'px';
        shadowDiv.style.height = cl.offsetHeight + 'px';
        shadowDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.28)';
        // Insert behind the cloned box in the DOM structure
        if (cl.parentNode) {
          cl.parentNode.insertBefore(shadowDiv, cl);
        }
        // Remove the CSS shadow so we don't render it twice
        cl.style.boxShadow = 'none';
      }
    } catch (e) {
      // ignore mapping errors
    }

    try {
      const canvas = await html2canvas(clone, { scale: 1, backgroundColor: '#ffffff', useCORS: true, allowTaint: true, width: targetW, height: targetH, windowWidth: targetW, windowHeight: targetH });
      const image = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(image, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      pdf.save(`pedigree-${Date.now()}.pdf`);
    } finally {
      document.body.removeChild(container);
    }

    document.documentElement.classList.remove("exporting-pdf");
    window.dispatchEvent(new Event("pdf-export"));
  };

  // Original PDF export preserved for users who prefer previous output format
  const handleDownloadPdfOriginal = async () => {
    if (!previewRef.current) return;
    document.documentElement.classList.add("exporting-pdf");
    window.dispatchEvent(new Event("pdf-export"));
    await new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(() => resolve(), 80)));
    const canvas = await html2canvas(previewRef.current, {
      scale: 3.125,
      backgroundColor: "#ffffff",
      useCORS: true,
      onclone: (doc) => {
        // Ensure export-only CSS (drop-shadow fallback) is applied inside the cloned document.
        doc.documentElement.classList.add("exporting-pdf");
      }
    });
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
              onDownloadPdf={handleDownloadPdfOriginal}
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
