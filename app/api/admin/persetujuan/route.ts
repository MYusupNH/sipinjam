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
        b.*,
        o.organization_name,
        o.organization_type,
        o.username,
        i.item_name,
        i.item_code,
        r.room_name,
        r.room_code,
        r.building
      FROM borrowings b
      LEFT JOIN organization_users o ON b.organization_id = o.id
      LEFT JOIN inventory_items i ON b.item_id = i.id
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.status = 'MENUNGGU'
      ORDER BY b.created_at ASC
    `;

    return NextResponse.json({ borrowings });
  } catch (error) {
    console.error("GET PERSETUJUAN ERROR:", error);
    return NextResponse.json(
      { message: "Gagal mengambil pengajuan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const action = String(body.action || "").toUpperCase();
    const note = String(body.admin_note || "").trim();
    const adminId = Number(admin.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID peminjaman tidak valid." },
        { status: 400 }
      );
    }

    if (!Number.isSafeInteger(adminId) || adminId <= 0) {
      return NextResponse.json(
        { message: "Identitas admin tidak valid." },
        { status: 400 }
      );
    }

    if (!["DISETUJUI", "DITOLAK"].includes(action)) {
      return NextResponse.json(
        { message: "Aksi persetujuan tidak valid." },
        { status: 400 }
      );
    }

    if (action === "DITOLAK" && !note) {
      return NextResponse.json(
        { message: "Catatan alasan penolakan wajib diisi." },
        { status: 400 }
      );
    }

    const result = await sql`
      UPDATE borrowings
      SET
        status = ${action},
        admin_note = ${note || null},
        approved_by = ${action === "DISETUJUI" ? adminId : null},
        approved_at = ${action === "DISETUJUI" ? sql`NOW()` : null},
        updated_at = NOW()
      WHERE id = ${id}
        AND status = 'MENUNGGU'
      RETURNING id, status
    `;

    if (result.length === 0) {
      return NextResponse.json(
        {
          message:
            "Pengajuan tidak ditemukan atau sudah diproses sebelumnya.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message:
        action === "DISETUJUI"
          ? "Pengajuan berhasil disetujui."
          : "Pengajuan berhasil ditolak.",
      borrowing: result[0],
    });
  } catch (error) {
    console.error("PATCH PERSETUJUAN ERROR:", error);
    return NextResponse.json(
      { message: "Gagal memproses persetujuan." },
      { status: 500 }
    );
  }
}