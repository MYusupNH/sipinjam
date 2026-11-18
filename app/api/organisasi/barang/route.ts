import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getOrganizationSession } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const organization = await getOrganizationSession();

    if (!organization) {
      return NextResponse.json(
        { message: "Silakan login sebagai ORMAWA atau UKM." },
        { status: 401 }
      );
    }

    const items = await sql`
      SELECT
        id,
        item_code,
        item_name,
        category,
        stock,
        condition,
        description,
        image_url
      FROM inventory_items
      WHERE stock > 0
      ORDER BY item_name ASC
    `;

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET BARANG ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data barang." },
      { status: 500 }
    );
  }
}