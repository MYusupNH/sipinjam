
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
        r.building,
        h.handover_photo_url,
        h.handover_note,
        h.handed_over_at,
        h.return_photo_url,
        h.return_note,
        h.return_submitted_at,
        h.return_rejection_note,
        h.received_photo_url,
        h.received_note,
        h.received_at
      FROM borrowings b
      LEFT JOIN organization_users o
        ON b.organization_id = o.id
      LEFT JOIN inventory_items i
        ON b.item_id = i.id
      LEFT JOIN rooms r
        ON b.room_id = r.id
      LEFT JOIN borrowing_handover_returns h
        ON h.borrowing_id = b.id
      WHERE b.status IN (
        'DISETUJUI',
        'DIPINJAM',
        'MENUNGGU_PENGEMBALIAN',
        'DITOLAK_PENGEMBALIAN',
        'SELESAI'
      )
      ORDER BY b.borrowing_date ASC, b.created_at ASC
    `;

    return NextResponse.json({
      success: true,
      borrowings,
    });
  } catch (error) {
    console.error("GET PENGEMBALIAN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data pengembalian." },
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
    const photoUrl = String(body.photo_url || "").trim();
    const note = String(body.note || "").trim();

    if (!Number.isSafeInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID peminjaman tidak valid." },
        { status: 400 }
      );
    }

    // ==========================================
    // 1. SERAH TERIMA BARANG / RUANGAN
    // ==========================================

    if (action === "SERAH_TERIMA") {
      if (!photoUrl) {
        return NextResponse.json(
          { message: "Foto bukti penyerahan wajib diunggah." },
          { status: 400 }
        );
      }

      const borrowing = await sql`
        SELECT id
        FROM borrowings
        WHERE id = ${id}
          AND status = 'DISETUJUI'
        LIMIT 1
      `;

      if (borrowing.length === 0) {
        return NextResponse.json(
          {
            message:
              "Peminjaman tidak ditemukan atau status sudah berubah.",
          },
          { status: 409 }
        );
      }

      await sql`
        INSERT INTO borrowing_handover_returns (
          borrowing_id,
          handover_photo_url,
          handover_note,
          handed_over_at,
          updated_at
        )
        VALUES (
          ${id},
          ${photoUrl},
          ${note || null},
          NOW(),
          NOW()
        )
        ON CONFLICT (borrowing_id)
        DO UPDATE SET
          handover_photo_url = EXCLUDED.handover_photo_url,
          handover_note = EXCLUDED.handover_note,
          handed_over_at = NOW(),
          updated_at = NOW()
      `;

      const updated = await sql`
        UPDATE borrowings
        SET
          status = 'DIPINJAM',
          updated_at = NOW()
        WHERE id = ${id}
          AND status = 'DISETUJUI'
        RETURNING id, status
      `;

      if (updated.length === 0) {
        return NextResponse.json(
          {
            message:
              "Status peminjaman berubah. Muat ulang halaman.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Serah terima berhasil dicatat.",
        borrowing: updated[0],
      });
    }

    // ==========================================
    // 2. MENYETUJUI PENGEMBALIAN
    // ==========================================

    if (action === "SETUJUI_PENGEMBALIAN") {
      const borrowing = await sql`
        SELECT
          b.id,
          b.status,
          h.return_photo_url
        FROM borrowings b
        INNER JOIN borrowing_handover_returns h
          ON h.borrowing_id = b.id
        WHERE b.id = ${id}
          AND b.status = 'MENUNGGU_PENGEMBALIAN'
        LIMIT 1
      `;

      if (
        borrowing.length === 0 ||
        !borrowing[0].return_photo_url
      ) {
        return NextResponse.json(
          {
            message:
              "Pengajuan pengembalian atau foto buktinya tidak ditemukan.",
          },
          { status: 409 }
        );
      }

      await sql`
        UPDATE borrowing_handover_returns
        SET
          received_note = ${note || null},
          received_at = NOW(),
          return_rejection_note = NULL,
          updated_at = NOW()
        WHERE borrowing_id = ${id}
      `;

      const updated = await sql`
        UPDATE borrowings
        SET
          status = 'SELESAI',
          approved_by = ${admin.id},
          approved_at = NOW(),
          updated_at = NOW()
        WHERE id = ${id}
          AND status = 'MENUNGGU_PENGEMBALIAN'
        RETURNING id, status
      `;

      if (updated.length === 0) {
        return NextResponse.json(
          {
            message:
              "Status pengembalian berubah. Muat ulang halaman.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Pengembalian berhasil disetujui. Peminjaman selesai.",
        borrowing: updated[0],
      });
    }

    // ==========================================
    // 3. MENOLAK PENGEMBALIAN
    // ==========================================

    if (action === "TOLAK_PENGEMBALIAN") {
      if (!note) {
        return NextResponse.json(
          {
            message: "Alasan penolakan wajib diisi.",
          },
          { status: 400 }
        );
      }

      const borrowing = await sql`
        SELECT
          b.id,
          b.status,
          h.return_photo_url
        FROM borrowings b
        INNER JOIN borrowing_handover_returns h
          ON h.borrowing_id = b.id
        WHERE b.id = ${id}
          AND b.status = 'MENUNGGU_PENGEMBALIAN'
        LIMIT 1
      `;

      if (
        borrowing.length === 0 ||
        !borrowing[0].return_photo_url
      ) {
        return NextResponse.json(
          {
            message:
              "Pengajuan pengembalian tidak ditemukan atau sudah berubah.",
          },
          { status: 409 }
        );
      }

      await sql`
        UPDATE borrowing_handover_returns
        SET
          return_rejection_note = ${note},
          received_note = NULL,
          received_at = NULL,
          updated_at = NOW()
        WHERE borrowing_id = ${id}
      `;

      const updated = await sql`
        UPDATE borrowings
        SET
          status = 'DITOLAK_PENGEMBALIAN',
          updated_at = NOW()
        WHERE id = ${id}
          AND status = 'MENUNGGU_PENGEMBALIAN'
        RETURNING id, status
      `;

      if (updated.length === 0) {
        return NextResponse.json(
          {
            message:
              "Status pengembalian berubah. Muat ulang halaman.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          "Pengembalian ditolak. Alasan penolakan berhasil dikirim kepada organisasi.",
        borrowing: updated[0],
      });
    }

    // ==========================================
    // 4. AKSI TIDAK DIKENAL
    // ==========================================

    return NextResponse.json(
      {
        message: "Aksi pengembalian tidak valid.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH PENGEMBALIAN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal memproses pengembalian." },
      { status: 500 }
    );
  }
}
