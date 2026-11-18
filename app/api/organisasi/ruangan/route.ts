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

    const rooms = await sql`
      SELECT
        id,
        room_code,
        room_name,
        building,
        capacity,
        facilities,
        description,
        image_url
      FROM rooms
      WHERE is_active = TRUE
      ORDER BY room_name ASC
    `;

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("GET RUANGAN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data ruangan." },
      { status: 500 }
    );
  }
}