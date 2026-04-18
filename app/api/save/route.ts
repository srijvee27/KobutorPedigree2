import { getDbPool, isDbConfigured } from "@/lib/db";
import { PedigreeData } from "@/lib/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, message: "Save failed. Configure DB env for API persistence." },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const data = body.data as PedigreeData;

    const pool = getDbPool();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        "INSERT INTO pigeons (name, color, owner, image_url) VALUES (?, ?, ?, ?)",
        [data.main.name, data.main.color, data.main.owner, data.imageDataUrl]
      );
      const pigeonId = (result as any).insertId as number;

      const rows = [
        { type: "father", details: data.father },
        { type: "mother", details: data.mother },
        { type: "grandparent", details: { relation: "fatherFather", ...data.grandparents.fatherFather } },
        { type: "grandparent", details: { relation: "fatherMother", ...data.grandparents.fatherMother } },
        { type: "grandparent", details: { relation: "motherFather", ...data.grandparents.motherFather } },
        { type: "grandparent", details: { relation: "motherMother", ...data.grandparents.motherMother } },
        ...(data.lineage || []).map((person, index) => ({ type: "lineage", details: { index, ...person } })),
        { type: "contact", details: data.contact },
        { type: "main", details: data.main }
      ];

      for (const row of rows) {
        await connection.query("INSERT INTO pedigree_data (pigeon_id, type, details) VALUES (?, ?, ?)", [
          pigeonId,
          row.type,
          JSON.stringify(row.details)
        ]);
      }

      await connection.commit();
      return NextResponse.json({ success: true, pigeonId }, { headers: NO_STORE_HEADERS });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Save failed. Configure DB env for API persistence.",
        error: error?.message || "Unknown error"
      },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }
}
