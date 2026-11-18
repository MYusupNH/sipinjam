import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSuperAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const sql = neon(process.env.DATABASE_URL!);

// GET: Mengambil daftar ruangan
export async function GET() {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak. Silakan login." },
        { status: 401 }
      );
    }

    const rooms = await sql`
      SELECT *
      FROM rooms
      ORDER BY created_at DESC
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

// POST: Menambahkan ruangan
export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak. Silakan login." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const roomCode = String(body.room_code || "").trim();
    const roomName = String(body.room_name || "").trim();
    const building = String(body.building || "").trim();
    const capacity = Number(body.capacity);
    const facilities = String(body.facilities || "").trim();
    const description = String(body.description || "").trim();
    const imageUrl = body.image_url ? String(body.image_url) : null;
    const imagePublicId = body.image_public_id
      ? String(body.image_public_id)
      : null;

    if (!roomCode || !roomName) {
      return NextResponse.json(
        { message: "Kode dan nama ruangan wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(capacity) || capacity < 0) {
      return NextResponse.json(
        { message: "Kapasitas harus berupa angka bulat minimal 0." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO rooms (
        room_code,
        room_name,
        building,
        capacity,
        facilities,
        description,
        image_url,
        image_public_id
      )
      VALUES (
        ${roomCode},
        ${roomName},
        ${building || null},
        ${capacity},
        ${facilities || null},
        ${description || null},
        ${imageUrl},
        ${imagePublicId}
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        message: "Ruangan berhasil ditambahkan.",
        room: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST RUANGAN ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Gagal menambahkan ruangan. Pastikan kode ruangan belum digunakan.",
      },
      { status: 500 }
    );
  }
}

// PATCH: Memperbarui ruangan
export async function PATCH(request: NextRequest) {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak. Silakan login." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id = Number(body.id);
    const roomCode = String(body.room_code || "").trim();
    const roomName = String(body.room_name || "").trim();
    const building = String(body.building || "").trim();
    const capacity = Number(body.capacity);
    const facilities = String(body.facilities || "").trim();
    const description = String(body.description || "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID ruangan tidak valid." },
        { status: 400 }
      );
    }

    if (!roomCode || !roomName) {
      return NextResponse.json(
        { message: "Kode dan nama ruangan wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(capacity) || capacity < 0) {
      return NextResponse.json(
        { message: "Kapasitas harus berupa angka bulat minimal 0." },
        { status: 400 }
      );
    }

    // Ambil foto lama sebelum diperbarui
    const oldRoom = await sql`
      SELECT image_public_id
      FROM rooms
      WHERE id = ${id}
      LIMIT 1
    `;

    if (oldRoom.length === 0) {
      return NextResponse.json(
        { message: "Ruangan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Jika image_url tidak dikirim, foto lama tetap dipakai
    const imageUrl =
      body.image_url !== undefined
        ? body.image_url || null
        : null;

    const imagePublicId =
      body.image_public_id !== undefined
        ? body.image_public_id || null
        : null;

    const result = await sql`
      UPDATE rooms
      SET
        room_code = ${roomCode},
        room_name = ${roomName},
        building = ${building || null},
        capacity = ${capacity},
        facilities = ${facilities || null},
        description = ${description || null},
        is_active = ${body.is_active !== false},
        image_url = ${
          body.image_url !== undefined
            ? imageUrl
            : sql`image_url`
        },
        image_public_id = ${
          body.image_public_id !== undefined
            ? imagePublicId
            : sql`image_public_id`
        },
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Hapus foto lama dari Cloudinary jika foto diganti
    const oldPublicId = oldRoom[0].image_public_id;

    if (
      oldPublicId &&
      imagePublicId &&
      oldPublicId !== imagePublicId
    ) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (cloudinaryError) {
        console.error(
          "GAGAL MENGHAPUS FOTO LAMA:",
          cloudinaryError
        );
      }
    }

    return NextResponse.json({
      message: "Data ruangan berhasil diperbarui.",
      room: result[0],
    });
  } catch (error) {
    console.error("PATCH RUANGAN ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Gagal memperbarui data ruangan. Periksa kode ruangan.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus ruangan dan foto Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak. Silakan login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID ruangan tidak valid." },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM rooms
      WHERE id = ${id}
      RETURNING id, image_public_id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Ruangan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Hapus foto dari Cloudinary jika tersedia
    const imagePublicId = result[0].image_public_id;

    if (imagePublicId) {
      try {
        await cloudinary.uploader.destroy(imagePublicId);
      } catch (cloudinaryError) {
        console.error(
          "GAGAL MENGHAPUS FOTO CLOUDINARY:",
          cloudinaryError
        );
      }
    }

    return NextResponse.json({
      message: "Ruangan berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE RUANGAN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal menghapus ruangan." },
      { status: 500 }
    );
  }
}
