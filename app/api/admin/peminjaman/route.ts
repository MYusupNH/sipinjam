
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getAdminSession } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak. Silakan login." },
        { status: 401 }
      );
    }

    const borrowings = await sql`
      SELECT
        b.id,
        b.organization_id,
        b.borrowing_type,
        b.item_id,
        b.room_id,
        b.quantity,
        b.borrowing_date,
        b.return_date,
        b.start_time,
        b.end_time,
        b.purpose,
        b.status,
        b.admin_note,
        b.created_at,
        o.organization_name,
        o.organization_type,
        o.username,
        i.item_code,
        i.item_name,
        r.room_code,
        r.room_name,
        r.building
      FROM borrowings b
      LEFT JOIN organization_users o
        ON b.organization_id = o.id
      LEFT JOIN inventory_items i
        ON b.item_id = i.id
      LEFT JOIN rooms r
        ON b.room_id = r.id
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json({ borrowings });
  } catch (error) {
    console.error("GET PEMINJAMAN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data peminjaman." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak. Silakan login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID peminjaman tidak valid." },
        { status: 400 }
      );
    }

    // Hapus data dalam satu transaksi.
    // Data pengembalian dihapus terlebih dahulu karena
    // borrowing_handover_returns memiliki foreign key ke borrowings.

    const results = await sql.transaction([
      sql`
        DELETE FROM borrowing_handover_returns
        WHERE borrowing_id = ${id}
      `,
      sql`
        DELETE FROM borrowings
        WHERE id = ${id}
        RETURNING id, status
      `,
    ]);

    const deleted = results[1];

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { message: "Data peminjaman tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Data peminjaman dan riwayat pengembaliannya berhasil dihapus.",
      borrowing: deleted[0],
    });
  } catch (error) {
    console.error("DELETE PEMINJAMAN ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Gagal menghapus peminjaman. Masih terdapat relasi data lain yang perlu diperiksa.",
      },
      { status: 500 }
    );
  }
}
