import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getOrganizationSession } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const organization = await getOrganizationSession();

    if (!organization) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
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
        b.created_at,
        i.item_name,
        i.item_code,
        r.room_name,
        r.room_code
      FROM borrowings b
      LEFT JOIN inventory_items i ON i.id = b.item_id
      LEFT JOIN rooms r ON r.id = b.room_id
      WHERE b.organization_id = ${Number(organization.id)}
      ORDER BY b.created_at DESC
    `;

    return NextResponse.json({ borrowings });
  } catch (error) {
    console.error("GET PEMINJAMAN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil riwayat peminjaman." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const organization = await getOrganizationSession();

    if (!organization) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const type = String(body.borrowing_type || "").toUpperCase();
    const borrowingDate = String(body.borrowing_date || "");
    const returnDate = String(body.return_date || "");
    const startTime = String(body.start_time || "");
    const endTime = String(body.end_time || "");
    const purpose = String(body.purpose || "").trim();

    if (!["BARANG", "RUANGAN"].includes(type)) {
      return NextResponse.json(
        { message: "Jenis peminjaman tidak valid." },
        { status: 400 }
      );
    }

    if (!borrowingDate || !returnDate || !purpose) {
      return NextResponse.json(
        { message: "Tanggal dan keperluan wajib diisi." },
        { status: 400 }
      );
    }

    if (returnDate < borrowingDate) {
      return NextResponse.json(
        { message: "Tanggal pengembalian tidak boleh sebelum tanggal peminjaman." },
        { status: 400 }
      );
    }

    if (purpose.length < 5) {
      return NextResponse.json(
        { message: "Keperluan peminjaman minimal 5 karakter." },
        { status: 400 }
      );
    }

    let itemId: number | null = null;
    let roomId: number | null = null;
    let quantity = 1;

    if (type === "BARANG") {
      itemId = Number(body.item_id);
      quantity = Number(body.quantity);

      if (!Number.isInteger(itemId) || itemId <= 0) {
        return NextResponse.json(
          { message: "Silakan pilih barang." },
          { status: 400 }
        );
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { message: "Jumlah barang harus lebih dari 0." },
          { status: 400 }
        );
      }

      const items = await sql`
        SELECT id, item_name, stock
        FROM inventory_items
        WHERE id = ${itemId}
        LIMIT 1
      `;

      if (items.length === 0) {
        return NextResponse.json(
          { message: "Barang tidak ditemukan." },
          { status: 404 }
        );
      }

      if (Number(items[0].stock) < quantity) {
        return NextResponse.json(
          {
            message: `Stok ${items[0].item_name} tidak mencukupi. Stok tersedia: ${items[0].stock}.`,
          },
          { status: 400 }
        );
      }
    }

    if (type === "RUANGAN") {
      roomId = Number(body.room_id);

      if (!Number.isInteger(roomId) || roomId <= 0) {
        return NextResponse.json(
          { message: "Silakan pilih ruangan." },
          { status: 400 }
        );
      }

      if (!startTime || !endTime || startTime >= endTime) {
        return NextResponse.json(
          { message: "Waktu mulai dan selesai tidak valid." },
          { status: 400 }
        );
      }

      const rooms = await sql`
        SELECT id, room_name
        FROM rooms
        WHERE id = ${roomId}
          AND is_active = TRUE
        LIMIT 1
      `;

      if (rooms.length === 0) {
        return NextResponse.json(
          { message: "Ruangan tidak ditemukan atau tidak aktif." },
          { status: 404 }
        );
      }

      const conflicts = await sql`
        SELECT id
        FROM borrowings
        WHERE room_id = ${roomId}
          AND borrowing_date = ${borrowingDate}
          AND status IN ('MENUNGGU', 'DISETUJUI', 'DIPINJAM')
          AND start_time < ${endTime}
          AND end_time > ${startTime}
        LIMIT 1
      `;

      if (conflicts.length > 0) {
        return NextResponse.json(
          { message: "Ruangan sudah memiliki pengajuan atau peminjaman pada waktu tersebut." },
          { status: 409 }
        );
      }
    }

    const result = await sql`
      INSERT INTO borrowings (
        organization_id,
        borrowing_type,
        item_id,
        room_id,
        quantity,
        borrowing_date,
        return_date,
        start_time,
        end_time,
        purpose,
        status
      )
      VALUES (
        ${Number(organization.id)},
        ${type},
        ${itemId},
        ${roomId},
        ${quantity},
        ${borrowingDate},
        ${returnDate},
        ${type === "RUANGAN" ? startTime : null},
        ${type === "RUANGAN" ? endTime : null},
        ${purpose},
        'MENUNGGU'
      )
      RETURNING id, status
    `;

    return NextResponse.json(
      {
        message: "Pengajuan peminjaman berhasil dikirim.",
        borrowing: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST PEMINJAMAN ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat menyimpan pengajuan." },
      { status: 500 }
    );
  }
}