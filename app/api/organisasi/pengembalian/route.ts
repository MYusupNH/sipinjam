import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getOrganizationSession } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

// GET: Mengambil riwayat peminjaman organisasi
export async function GET() {
  try {
    const organization = await getOrganizationSession();

    if (!organization) {
      return NextResponse.json(
        { message: "Silakan login sebagai HIMA/ORMAWA." },
        { status: 401 }
      );
    }

    const borrowings = await sql`
      SELECT
        b.*,
        i.item_name,
        r.room_name,
        h.handover_photo_url,
        h.handover_note,
        h.handed_over_at,
        h.return_photo_url,
        h.return_note,
        h.return_submitted_at,
        h.received_photo_url,
        h.received_note,
        h.received_at
      FROM borrowings b
      LEFT JOIN inventory_items i
        ON b.item_id = i.id
      LEFT JOIN rooms r
        ON b.room_id = r.id
      LEFT JOIN borrowing_handover_returns h
        ON h.borrowing_id = b.id
      WHERE b.organization_id = ${organization.id}
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json({ borrowings });
  } catch (error) {
    console.error("GET RIWAYAT PENGEMBALIAN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil riwayat peminjaman." },
      { status: 500 }
    );
  }
}

// POST: HIMA/ORMAWA mengajukan pengembalian
export async function POST(request: NextRequest) {
  try {
    const organization = await getOrganizationSession();

    if (!organization) {
      return NextResponse.json(
        { message: "Silakan login sebagai HIMA/ORMAWA." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const photoUrl = String(body.photo_url || "").trim();
    const note = String(body.note || "").trim();

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID peminjaman tidak valid." },
        { status: 400 }
      );
    }

    if (!photoUrl) {
      return NextResponse.json(
        { message: "Foto kondisi barang atau ruangan wajib diunggah." },
        { status: 400 }
      );
    }

    if (!note) {
      return NextResponse.json(
        { message: "Keterangan pengembalian wajib diisi." },
        { status: 400 }
      );
    }

    const borrowing = await sql`
      SELECT id
      FROM borrowings
      WHERE id = ${id}
        AND organization_id = ${organization.id}
        AND status = 'DIPINJAM'
      LIMIT 1
    `;

    if (borrowing.length === 0) {
      return NextResponse.json(
        {
          message:
            "Peminjaman tidak ditemukan atau tidak dapat diajukan pengembaliannya.",
        },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO borrowing_handover_returns (
        borrowing_id,
        return_photo_url,
        return_note,
        return_submitted_at,
        updated_at
      )
      VALUES (
        ${id},
        ${photoUrl},
        ${note},
        NOW(),
        NOW()
      )
      ON CONFLICT (borrowing_id)
      DO UPDATE SET
        return_photo_url = EXCLUDED.return_photo_url,
        return_note = EXCLUDED.return_note,
        return_submitted_at = NOW(),
        received_photo_url = NULL,
        received_note = NULL,
        received_at = NULL,
        updated_at = NOW()
    `;

    const updated = await sql`
      UPDATE borrowings
      SET
        status = 'MENUNGGU_PENGEMBALIAN',
        updated_at = NOW()
      WHERE id = ${id}
        AND organization_id = ${organization.id}
        AND status = 'DIPINJAM'
      RETURNING id, status
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { message: "Status peminjaman berubah. Muat ulang halaman." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message:
        "Pengajuan pengembalian berhasil dikirim ke Super Admin.",
      borrowing: updated[0],
    });
  } catch (error) {
    console.error("POST PENGAJUAN PENGEMBALIAN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengajukan pengembalian." },
      { status: 500 }
    );
  }
}