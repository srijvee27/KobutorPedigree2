"use client";

import PedigreeBox from "@/components/PedigreeBox";
import { PedigreeData, PedigreePerson } from "@/lib/types";
import { RefObject, useEffect, useRef, useState } from "react";

type PedigreePreviewProps = {
  data: PedigreeData;
  previewRef: RefObject<HTMLDivElement>;
};

type Side = "top" | "bottom" | "left" | "right";
type Anchor = { x: number; y: number };
type Anchors = Record<Side, Anchor>;

type BoxId =
  | "main"
  | "father"
  | "mother"
  | "fatherFather"
  | "fatherMother"
  | "motherFather"
  | "motherMother"
  | "lineage0"
  | "lineage1"
  | "lineage2"
  | "lineage3"
  | "lineage4"
  | "lineage5"
  | "lineage6"
  | "lineage7";

type Connection = {
  from: BoxId;
  to: BoxId;
  fromSide: Side;
  toSide: Side;
};

type Geometry = {
  width: number;
  height: number;
  paths: string[];
};

const BOX_IDS: BoxId[] = [
  "main",
  "father",
  "mother",
  "fatherFather",
  "fatherMother",
  "motherFather",
  "motherMother",
  "lineage0",
  "lineage1",
  "lineage2",
  "lineage3",
  "lineage4",
  "lineage5",
  "lineage6",
  "lineage7"
];

const CONNECTIONS: Connection[] = [
  { from: "main", to: "father", fromSide: "right", toSide: "left" },
  { from: "main", to: "mother", fromSide: "right", toSide: "left" },
  { from: "father", to: "fatherFather", fromSide: "right", toSide: "left" },
  { from: "father", to: "fatherMother", fromSide: "right", toSide: "left" },
  { from: "mother", to: "motherFather", fromSide: "right", toSide: "left" },
  { from: "mother", to: "motherMother", fromSide: "right", toSide: "left" },
  { from: "fatherFather", to: "lineage0", fromSide: "right", toSide: "left" },
  { from: "fatherFather", to: "lineage1", fromSide: "right", toSide: "left" },
  { from: "fatherMother", to: "lineage2", fromSide: "right", toSide: "left" },
  { from: "fatherMother", to: "lineage3", fromSide: "right", toSide: "left" },
  { from: "motherFather", to: "lineage4", fromSide: "right", toSide: "left" },
  { from: "motherFather", to: "lineage5", fromSide: "right", toSide: "left" },
  { from: "motherMother", to: "lineage6", fromSide: "right", toSide: "left" },
  { from: "motherMother", to: "lineage7", fromSide: "right", toSide: "left" }
];

const renderAchievements = (person: PedigreePerson) =>
  person.achievements
    .map((item, index) => {
      const left = (item.position || "").trim();
      const mid = (item.location || "").trim();
      const right = (item.points || "").trim();

      const rest = [mid, right].filter(Boolean).join(" ");
      if (!left && !rest) return null;

      return (
        <p key={`${person.ringId}-${index}`}>
          {left ? <span className="font-semibold">{left}</span> : null} {rest}
        </p>
      );
    })
    .filter((node): node is JSX.Element => node !== null);

const sexTone = (ringId: string): "male" | "female" | "default" => {
  const match = ringId.trim().match(/(?:^|\s)(M|V)\s*$/i);
  const suffix = match?.[1]?.toUpperCase();
  if (suffix === "M") return "male";
  if (suffix === "V") return "female";
  return "default";
};

export default function PedigreePreview({ data, previewRef }: PedigreePreviewProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const boxRefs = useRef<Partial<Record<BoxId, HTMLDivElement | null>>>({});
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [screenScale, setScreenScale] = useState(1);
  const [geometry, setGeometry] = useState<Geometry>({ width: 0, height: 0, paths: [] });

  const setBoxRef = (id: BoxId) => (node: HTMLDivElement | null) => {
    boxRefs.current[id] = node;
  };

  const getAnchors = (rect: DOMRect, containerRect: DOMRect, scaleX: number, scaleY: number): Anchors => {
    // Use getBoundingClientRect() (includes CSS transforms) but normalize back into the
    // unscaled coordinate space so the SVG path math stays correct under preview scaling.
    const xLeft = Math.round((rect.left - containerRect.left) / scaleX);
    const xRight = Math.round((rect.right - containerRect.left) / scaleX);
    const yTop = Math.round((rect.top - containerRect.top) / scaleY);
    const yBottom = Math.round((rect.bottom - containerRect.top) / scaleY);
    const xMid = Math.round((rect.left + rect.width / 2 - containerRect.left) / scaleX);
    const yMid = Math.round((rect.top + rect.height / 2 - containerRect.top) / scaleY);

    return {
      top: { x: xMid + 0.5, y: yTop + 0.5 },
      bottom: { x: xMid + 0.5, y: yBottom + 0.5 },
      left: { x: xLeft + 0.5, y: yMid + 0.5 },
      right: { x: xRight + 0.5, y: yMid + 0.5 }
    };
  };

  const buildPath = (start: Anchor, end: Anchor, fromSide: Side, toSide: Side) => {
    if (fromSide === "bottom" && toSide === "top") {
      const yMid = Math.round((start.y + end.y) / 2) + 0.5;
      return `M ${start.x} ${start.y} L ${start.x} ${yMid} L ${end.x} ${yMid} L ${end.x} ${end.y}`;
    }

    if (fromSide === "top" && toSide === "bottom") {
      const yMid = Math.round((start.y + end.y) / 2) + 0.5;
      return `M ${start.x} ${start.y} L ${start.x} ${yMid} L ${end.x} ${yMid} L ${end.x} ${end.y}`;
    }

    const xMid = Math.round((start.x + end.x) / 2) + 0.5;
    return `M ${start.x} ${start.y} L ${xMid} ${start.y} L ${xMid} ${end.y} L ${end.x} ${end.y}`;
  };

  useEffect(() => {
    const shell = shellRef.current;
    const certificate = previewRef.current;
    const canvas = canvasRef.current;
    if (!shell || !certificate || !canvas) return;

    const recalculate = () => {
      // The SVG overlay is positioned relative to `canvas`, so measure everything relative to that.
      // getBoundingClientRect() includes transforms; offsetWidth/Height do not.
      const canvasRect = canvas.getBoundingClientRect();
      const baseWidth = canvas.offsetWidth || canvas.clientWidth;
      const baseHeight = canvas.offsetHeight || canvas.clientHeight;
      const scaleX = baseWidth ? canvasRect.width / baseWidth : 1;
      const scaleY = baseHeight ? canvasRect.height / baseHeight : 1;
      const anchorMap: Partial<Record<BoxId, Anchors>> = {};

      for (const id of BOX_IDS) {
        const element = boxRefs.current[id];
        if (!element) continue;
        anchorMap[id] = getAnchors(element.getBoundingClientRect(), canvasRect, scaleX || 1, scaleY || 1);
      }

      const paths: string[] = [];

      const grouped = new Map<string, Connection[]>();
      for (const connection of CONNECTIONS) {
        const key = `${connection.from}-${connection.fromSide}`;
        const existing = grouped.get(key) || [];
        existing.push(connection);
        grouped.set(key, existing);
      }

      for (const [, group] of grouped) {
        const first = group[0];
        const fromAnchors = anchorMap[first.from];
        if (!fromAnchors) continue;
        const start = fromAnchors[first.fromSide];

        const targets = group
          .map((connection) => {
            const toAnchors = anchorMap[connection.to];
            if (!toAnchors) return null;
            return {
              end: toAnchors[connection.toSide],
              toSide: connection.toSide
            };
          })
          .filter((target): target is { end: Anchor; toSide: Side } => target !== null);

        if (!targets.length) continue;

        if (targets.length === 1) {
          paths.push(buildPath(start, targets[0].end, first.fromSide, targets[0].toSide));
          continue;
        }

        if ((first.fromSide === "right" || first.fromSide === "left") && targets.every((target) => target.toSide === "left" || target.toSide === "right")) {
          const targetXs = targets.map((target) => target.end.x);
          const targetYs = targets.map((target) => target.end.y);
          const branchX =
            first.fromSide === "right"
              ? Math.round((start.x + Math.min(...targetXs)) / 2) + 0.5
              : Math.round((start.x + Math.max(...targetXs)) / 2) + 0.5;
          const minY = Math.round(Math.min(...targetYs)) + 0.5;
          const maxY = Math.round(Math.max(...targetYs)) + 0.5;

          paths.push(`M ${start.x} ${start.y} L ${branchX} ${start.y}`);
          paths.push(`M ${branchX} ${minY} L ${branchX} ${maxY}`);
          for (const target of targets) {
            paths.push(`M ${branchX} ${target.end.y} L ${target.end.x} ${target.end.y}`);
          }
          continue;
        }

        for (const target of targets) {
          paths.push(buildPath(start, target.end, first.fromSide, target.toSide));
        }
      }

      setGeometry({
        width: Math.max(1, Math.round(baseWidth)),
        height: Math.max(1, Math.round(baseHeight)),
        paths
      });
    };

    const recalcSoon = () => {
      requestAnimationFrame(recalculate);
      setTimeout(recalculate, 50);
      setTimeout(recalculate, 250);
    };

    recalcSoon();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(recalculate);
    });

    const recalcScale = () => {
      const available = shell.clientWidth;
      const base = certificate.offsetWidth || 1;
      const next = Math.min(1, Math.max(0.2, (available - 8) / base));
      setScreenScale(Number(next.toFixed(3)));
    };

    const scaleObserver = new ResizeObserver(() => {
      requestAnimationFrame(recalcScale);
    });

    scaleObserver.observe(shell);
    scaleObserver.observe(certificate);
    requestAnimationFrame(recalcScale);

    observer.observe(canvas);
    for (const id of BOX_IDS) {
      const element = boxRefs.current[id];
      if (element) observer.observe(element);
    }

    const handleBeforePrint = () => recalcSoon();
    const handleAfterPrint = () => recalcSoon();

    window.addEventListener("resize", recalculate);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    const mediaQuery = typeof window !== "undefined" && "matchMedia" in window ? window.matchMedia("print") : null;
    const handleMediaChange = () => recalcSoon();
    mediaQuery?.addEventListener?.("change", handleMediaChange);

    return () => {
      observer.disconnect();
      scaleObserver.disconnect();
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      mediaQuery?.removeEventListener?.("change", handleMediaChange);
    };
  }, [data, previewRef]);

  const rightColumn = data.lineage;

  return (
    <div ref={shellRef} className="preview-shell">
      <div className="preview-scale" style={{ transform: `scale(${screenScale})` }}>
      <div ref={previewRef} id="pedigree-print-area" className="pedigree-certificate flex flex-col">
        <div ref={canvasRef} className="relative h-full w-full flex-1">
          <svg
            className="absolute inset-0 z-[1] pointer-events-none"
            width={geometry.width}
            height={geometry.height}
            style={{
              top: 0,
              left: 0,
              overflow: "visible"
            }}
            shapeRendering="crispEdges"
          >
            {geometry.paths.map((path, index) => (
              <path key={`path-${index}`} d={path} stroke="#5b5b5b" strokeWidth="1" fill="none" />
            ))}
          </svg>

          <h1 className="certificate-title relative z-10">PEDIGREE FOR PIGEON: {data.main.ringId || "-"}</h1>

          <div className="certificate-grid relative z-10 mt-16">
            <div className="col-main">
              <div className="mb-2 h-[185px] w-[175px] overflow-hidden border-2 border-slate-300 bg-white">
                {data.imageDataUrl ? (
                  <img src={data.imageDataUrl} alt="Main pigeon" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">Main image</div>
                )}
              </div>

              <div ref={setBoxRef("main")} className="relative">
                <PedigreeBox title={data.main.ringId} subtitle={data.main.name} tone={sexTone(data.main.ringId)} className="h-[520px]">
                  <p>{data.main.color}</p>
                  <p>{data.main.owner}</p>
                  {data.main.notes ? <p className="pt-1 font-semibold whitespace-pre-line">{data.main.notes}</p> : null}
                  {renderAchievements(data.main)}
                </PedigreeBox>
              </div>
            </div>

            <div className="col-parents flex flex-col gap-0">
              <div ref={setBoxRef("father")} className="relative mt-0">
                <PedigreeBox title={data.father.ringId} subtitle={data.father.name} tone={sexTone(data.father.ringId)} className="h-[406px]">
                  <p>{data.father.color}</p>
                  <p>{data.father.owner}</p>
                  {data.father.notes ? <p className="pt-1 font-semibold whitespace-pre-line">{data.father.notes}</p> : null}
                  {renderAchievements(data.father)}
                </PedigreeBox>
              </div>

              <div ref={setBoxRef("mother")} className="relative mt-6">
                <PedigreeBox title={data.mother.ringId} subtitle={data.mother.name} tone={sexTone(data.mother.ringId)} className="h-[406px]">
                  <p>{data.mother.color}</p>
                  <p>{data.mother.owner}</p>
                  {data.mother.notes ? <p className="pt-1 font-semibold whitespace-pre-line">{data.mother.notes}</p> : null}
                  {renderAchievements(data.mother)}
                </PedigreeBox>
              </div>
            </div>

            <div className="col-grandparents flex flex-col gap-2">
              <div ref={setBoxRef("fatherFather")} className="relative">
                <PedigreeBox title={data.grandparents.fatherFather.ringId} subtitle={data.grandparents.fatherFather.name} tone={sexTone(data.grandparents.fatherFather.ringId)} className="h-[202px]">
                  <p>{data.grandparents.fatherFather.color}</p>
                  <p>{data.grandparents.fatherFather.owner}</p>
                  {data.grandparents.fatherFather.notes ? <p className="font-semibold whitespace-pre-line">{data.grandparents.fatherFather.notes}</p> : null}
                  {renderAchievements(data.grandparents.fatherFather)}
                </PedigreeBox>
              </div>
              <div ref={setBoxRef("fatherMother")} className="relative">
                <PedigreeBox title={data.grandparents.fatherMother.ringId} subtitle={data.grandparents.fatherMother.name} tone={sexTone(data.grandparents.fatherMother.ringId)} className="h-[202px]">
                  <p>{data.grandparents.fatherMother.color}</p>
                  <p>{data.grandparents.fatherMother.owner}</p>
                  {data.grandparents.fatherMother.notes ? <p className="font-semibold whitespace-pre-line">{data.grandparents.fatherMother.notes}</p> : null}
                  {renderAchievements(data.grandparents.fatherMother)}
                </PedigreeBox>
              </div>
              <div ref={setBoxRef("motherFather")} className="relative">
                <PedigreeBox title={data.grandparents.motherFather.ringId} subtitle={data.grandparents.motherFather.name} tone={sexTone(data.grandparents.motherFather.ringId)} className="h-[202px]">
                  <p>{data.grandparents.motherFather.color}</p>
                  <p>{data.grandparents.motherFather.owner}</p>
                  {data.grandparents.motherFather.notes ? <p className="font-semibold whitespace-pre-line">{data.grandparents.motherFather.notes}</p> : null}
                  {renderAchievements(data.grandparents.motherFather)}
                </PedigreeBox>
              </div>
              <div ref={setBoxRef("motherMother")} className="relative">
                <PedigreeBox title={data.grandparents.motherMother.ringId} subtitle={data.grandparents.motherMother.name} tone={sexTone(data.grandparents.motherMother.ringId)} className="h-[202px]">
                  <p>{data.grandparents.motherMother.color}</p>
                  <p>{data.grandparents.motherMother.owner}</p>
                  {data.grandparents.motherMother.notes ? <p className="font-semibold whitespace-pre-line">{data.grandparents.motherMother.notes}</p> : null}
                  {renderAchievements(data.grandparents.motherMother)}
                </PedigreeBox>
              </div>
            </div>

            <div className="col-lineage flex flex-col gap-2">
              {rightColumn.map((person, index) => (
                <div key={`${person.ringId}-${index}`} ref={setBoxRef(`lineage${index}` as BoxId)} className="relative">
                  <PedigreeBox title={person.ringId} subtitle={person.name} tone={sexTone(person.ringId)} className="h-[100px]">
                    {person.color ? <p>{person.color}</p> : null}
                    {person.owner ? <p>{person.owner}</p> : null}
                    {person.notes ? <p className="font-semibold whitespace-pre-line">{person.notes}</p> : null}
                    {renderAchievements(person)}
                  </PedigreeBox>
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="certificate-contact px-3.5 pb-7 mt-auto">
            <p className="font-bold">{data.contact.name || data.main.owner || "Owner Name"}</p>
            {data.contact.addressLine1 ? <p>{data.contact.addressLine1}</p> : null}
            {data.contact.addressLine2 ? <p>{data.contact.addressLine2}</p> : null}
            {data.contact.phone ? <p className="font-semibold text-[#b85757]">Tel: {data.contact.phone}</p> : null}
            {data.contact.email ? <p className="font-semibold text-[#b85757]">Email: {data.contact.email}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
