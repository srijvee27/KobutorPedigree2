import { dbQuery, isDbConfigured } from "@/lib/db";
import { EMPTY_DATA } from "@/lib/defaultData";
import { PedigreeData } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

type PigeonRow = {
  id: number;
  name: string;
  color: string;
  owner: string;
  image_url: string;
};

type PedigreeRow = {
  type: string;
  details: string;
};

export async function GET(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: "Load failed. Configure DB env for API persistence." },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const latest = request.nextUrl.searchParams.get("latest");
    const idParam = request.nextUrl.searchParams.get("id");

    let pigeonRows: PigeonRow[] = [];
    if (latest || !idParam) {
      pigeonRows = await dbQuery<PigeonRow[]>("SELECT id, name, color, owner, image_url FROM pigeons ORDER BY id DESC LIMIT 1");
    } else if (idParam) {
      pigeonRows = await dbQuery<PigeonRow[]>("SELECT id, name, color, owner, image_url FROM pigeons WHERE id = ? LIMIT 1", [idParam]);
    }

    if (!pigeonRows.length) return NextResponse.json({ success: true, data: EMPTY_DATA }, { headers: NO_STORE_HEADERS });

    const pigeon = pigeonRows[0];
    const pedigreeRows = await dbQuery<PedigreeRow[]>("SELECT type, details FROM pedigree_data WHERE pigeon_id = ?", [pigeon.id]);

    const data: PedigreeData = JSON.parse(JSON.stringify(EMPTY_DATA));
    data.imageDataUrl = pigeon.image_url || "";

    for (const row of pedigreeRows) {
      const details = JSON.parse(row.details);
      if (row.type === "main") data.main = details;
      if (row.type === "father") data.father = details;
      if (row.type === "mother") data.mother = details;
      if (row.type === "grandparent") {
        const relation = details.relation as keyof PedigreeData["grandparents"];
        delete details.relation;
        data.grandparents[relation] = details;
      }
      if (row.type === "lineage") {
        const index = Number(details.index);
        delete details.index;
        if (Number.isFinite(index) && index >= 0 && index < data.lineage.length) {
          data.lineage[index] = details;
        }
      }
      if (row.type === "contact") {
        data.contact = { ...data.contact, ...details };
      }
    }

    return NextResponse.json({ success: true, data }, { headers: NO_STORE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Load failed. Configure DB env for API persistence.",
        error: error?.message || "Unknown error"
      },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }
}
