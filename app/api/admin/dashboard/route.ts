
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getAdminSession } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Superadmin dan Admin boleh mengakses Dashboard
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Tidak memiliki akses." },
        { status: 403 }
      );
    }

    const [
      inventoryResult,
      roomResult,
      organizationResult,
      borrowingResult,
      statusResult,
      monthlyResult,
      recentResult,
    ] = await Promise.all([
      // Statistik barang
      sql`
        SELECT
          COUNT(*)::int AS total,
          COALESCE(SUM(stock), 0)::int AS total_stock,
          COUNT(*) FILTER (
            WHERE condition = 'Baik'
          )::int AS good,
          COUNT(*) FILTER (
            WHERE condition <> 'Baik'
          )::int AS damaged
        FROM inventory_items
      `,

      // Statistik ruangan
      sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (
            WHERE is_active = TRUE
          )::int AS active
        FROM rooms
      `,

      // Statistik organisasi
      sql`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (
            WHERE is_active = TRUE
          )::int AS active
        FROM organization_users
      `,

      // Total peminjaman
      sql`
        SELECT COUNT(*)::int AS total
        FROM borrowings
      `,

      // Statistik status peminjaman
      sql`
        SELECT
          status,
          COUNT(*)::int AS total
        FROM borrowings
        GROUP BY status
      `,

      // Statistik peminjaman per bulan
      sql`
        SELECT
          TO_CHAR(month_date, 'Mon') AS month,
          EXTRACT(MONTH FROM month_date)::int AS month_number,
          EXTRACT(YEAR FROM month_date)::int AS year,
          COUNT(b.id)::int AS total
        FROM generate_series(
          DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months',
          DATE_TRUNC('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) AS month_date
        LEFT JOIN borrowings b
          ON DATE_TRUNC('month', b.created_at) =
             DATE_TRUNC('month', month_date)
        GROUP BY month_date
        ORDER BY month_date
      `,

      // Peminjaman terbaru
      sql`
        SELECT
          b.id,
          b.borrowing_type,
          b.quantity,
          b.borrowing_date,
          b.start_time,
          b.end_time,
          b.status,
          b.created_at,
          o.organization_name,
          CASE
            WHEN b.borrowing_type = 'BARANG'
              THEN i.item_name
            WHEN b.borrowing_type = 'RUANGAN'
              THEN r.room_name
            ELSE '-'
          END AS target_name
        FROM borrowings b
        LEFT JOIN organization_users o
          ON o.id = b.organization_id
        LEFT JOIN inventory_items i
          ON i.id = b.item_id
        LEFT JOIN rooms r
          ON r.id = b.room_id
        ORDER BY b.created_at DESC
        LIMIT 8
      `,
    ]);

    const statusCounts = {
      MENUNGGU: 0,
      DISETUJUI: 0,
      DITOLAK: 0,
      DIPINJAM: 0,
      SELESAI: 0,
    };

    for (const row of statusResult) {
      if (row.status in statusCounts) {
        statusCounts[row.status as keyof typeof statusCounts] =
          Number(row.total);
      }
    }

    return NextResponse.json({
      success: true,
      statistics: {
        inventory: inventoryResult[0],
        rooms: roomResult[0],
        organizations: organizationResult[0],
        borrowings: borrowingResult[0],
      },
      statuses: statusCounts,
      monthly: monthlyResult,
      recent: recentResult,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data dashboard." },
      { status: 500 }
    );
  }
}
