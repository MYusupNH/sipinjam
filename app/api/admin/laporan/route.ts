
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSuperAdminSession } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak. Silakan login." },
        { status: 401 }
      );
    }

    const borrowings = await sql`
      SELECT
        b.id,
        b.borrowing_type,
        b.quantity,
        b.borrowing_date,
        b.return_date,
        b.start_time,
        b.end_time,
        b.purpose,
        b.status,
        b.admin_note,
        b.approved_at,
        b.created_at,
        ou.organization_name,
        ii.item_name,
        ii.item_code,
        r.room_name,
        r.room_code
      FROM borrowings b
      LEFT JOIN organization_users ou
        ON b.organization_id = ou.id
      LEFT JOIN inventory_items ii
        ON b.item_id = ii.id
      LEFT JOIN rooms r
        ON b.room_id = r.id
      ORDER BY b.created_at DESC
    `;

    const summary = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'MENUNGGU')::int AS menunggu,
        COUNT(*) FILTER (WHERE status = 'DISETUJUI')::int AS disetujui,
        COUNT(*) FILTER (WHERE status = 'DITOLAK')::int AS ditolak,
        COUNT(*) FILTER (WHERE status = 'DIPINJAM')::int AS dipinjam,
        COUNT(*) FILTER (WHERE status = 'SELESAI')::int AS selesai
      FROM borrowings
    `;

    return NextResponse.json({
      borrowings,
      summary: summary[0],
    });
  } catch (error) {
    console.error("Laporan API Error:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data laporan." },
      { status: 500 }
    );
  }
}

