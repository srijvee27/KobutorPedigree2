"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type PedigreeBoxProps = {
  title: string;
  subtitle?: string;
  tone?: "default" | "male" | "female" | "orange";
  className?: string;
  children?: ReactNode;
  minFontPx?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export default function PedigreeBox({ title, subtitle, tone = "default", className = "", children, minFontPx = 7 }: PedigreeBoxProps) {
  const toneClass = tone === "male" ? "highlight-male" : tone === "female" ? "highlight-female" : tone === "orange" ? "highlight-orange" : "bg-white";
  const articleRef = useRef<HTMLElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [bodyFontPx, setBodyFontPx] = useState(13);

  useEffect(() => {
    const article = articleRef.current;
    const body = bodyRef.current;
    if (!article || !body) return;

    const recalc = () => {
      const computed = window.getComputedStyle(article);
      const paddingBottom = parseFloat(computed.paddingBottom || "0") || 0;

      // html2canvas/jsPDF rasterization can clip the last text line when we fit "too perfectly".
      // Keep a tiny safety buffer so the bottom line isn't cut in the exported PDF.
      const exportingPdf = document.documentElement.classList.contains("exporting-pdf");
      const safetyPx = exportingPdf ? 10 : 5;
      const available = Math.max(0, article.clientHeight - body.offsetTop - paddingBottom - safetyPx);

      const base = 13;
      if (available <= 0) {
        setBodyFontPx(base);
        return;
      }

      let size = base;
      // Iteratively shrink until it fits (scrollHeight depends on font size).
      for (let i = 0; i < 6; i++) {
        const sizeInt = Math.max(minFontPx, Math.floor(size));
        body.style.fontSize = `${sizeInt}px`;
        const needed = body.scrollHeight;
        if (needed <= available) {
          size = sizeInt;
          break;
        }
        const ratio = available / needed;
        size = clamp(Math.floor(size * ratio), minFontPx, base);
      }

      // Keep as integer px to avoid sub-pixel clipping in canvas exports.
      setBodyFontPx(Math.max(minFontPx, Math.floor(size)));
    };

    const ro = new ResizeObserver(() => requestAnimationFrame(recalc));
    ro.observe(article);
    ro.observe(body);

    const mo = new MutationObserver(() => requestAnimationFrame(recalc));
    mo.observe(body, { subtree: true, childList: true, characterData: true });

    const handlePdfExport = () => requestAnimationFrame(recalc);

    window.addEventListener("pdf-export", handlePdfExport);

    // initial
    requestAnimationFrame(recalc);

    return () => {
      window.removeEventListener("pdf-export", handlePdfExport);
      ro.disconnect();
      mo.disconnect();
    };
  }, [minFontPx]);

  return (
    <article ref={articleRef} className={`pedigree-box relative ${toneClass} ${className}`}>
      <h4 className="text-[12px] font-bold uppercase tracking-[0.01em] text-black">{title || "-"}</h4>
      <div ref={bodyRef} className="pedigree-box-body" style={{ fontSize: `${bodyFontPx}px` }}>
        {subtitle ? <p className="mt-0.5 font-semibold leading-tight">{subtitle}</p> : null}
        {children ? <div className="mt-1 space-y-0.5 leading-tight">{children}</div> : null}
      </div>
    </article>
  );
}
