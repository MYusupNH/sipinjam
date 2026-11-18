
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSuperAdminSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const sql = neon(process.env.DATABASE_URL!);

// GET: Mengambil seluruh data barang
export async function GET() {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Akses ditolak. Silakan login." },
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
        storage_location,
        description,
        image_url,
        image_public_id,
        created_at,
        updated_at
      FROM inventory_items
      ORDER BY created_at DESC
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

// POST: Menambahkan barang
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

    const itemCode = String(body.item_code || "").trim();
    const itemName = String(body.item_name || "").trim();
    const category = String(body.category || "").trim();
    const stock = Number(body.stock);
    const condition = String(body.condition || "Baik").trim();
    const storageLocation = String(body.storage_location || "").trim();
    const description = String(body.description || "").trim();
    const imageUrl = String(body.image_url || "").trim();
    const imagePublicId = String(body.image_public_id || "").trim();

    if (!itemCode || !itemName || !category) {
      return NextResponse.json(
        { message: "Kode, nama, dan kategori barang wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { message: "Stok harus berupa angka bulat minimal 0." },
        { status: 400 }
      );
    }

    if (!["Baik", "Rusak Ringan", "Rusak Berat"].includes(condition)) {
      return NextResponse.json(
        { message: "Kondisi barang tidak valid." },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO inventory_items (
        item_code,
        item_name,
        category,
        stock,
        condition,
        storage_location,
        description,
        image_url,
        image_public_id
      )
      VALUES (
        ${itemCode},
        ${itemName},
        ${category},
        ${stock},
        ${condition},
        ${storageLocation || null},
        ${description || null},
        ${imageUrl || null},
        ${imagePublicId || null}
      )
      RETURNING *
    `;

    return NextResponse.json(
      { message: "Barang berhasil ditambahkan.", item: result[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST BARANG ERROR:", error);

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unique")
    ) {
      return NextResponse.json(
        { message: "Kode barang sudah digunakan." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Gagal menambahkan barang." },
      { status: 500 }
    );
  }
}

// PATCH: Mengubah data barang
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

    const itemCode = String(body.item_code || "").trim();
    const itemName = String(body.item_name || "").trim();
    const category = String(body.category || "").trim();
    const stock = Number(body.stock);
    const condition = String(body.condition || "").trim();
    const storageLocation = String(body.storage_location || "").trim();
    const description = String(body.description || "").trim();

    const imageUrl =
      body.image_url === undefined
        ? undefined
        : String(body.image_url || "").trim();

    const imagePublicId =
      body.image_public_id === undefined
        ? undefined
        : String(body.image_public_id || "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID barang tidak valid." },
        { status: 400 }
      );
    }

    if (!itemCode || !itemName || !category) {
      return NextResponse.json(
        { message: "Kode, nama, dan kategori barang wajib diisi." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { message: "Stok harus berupa angka bulat minimal 0." },
        { status: 400 }
      );
    }

    if (!["Baik", "Rusak Ringan", "Rusak Berat"].includes(condition)) {
      return NextResponse.json(
        { message: "Kondisi barang tidak valid." },
        { status: 400 }
      );
    }

    const oldItem = await sql`
      SELECT image_public_id
      FROM inventory_items
      WHERE id = ${id}
    `;

    if (oldItem.length === 0) {
      return NextResponse.json(
        { message: "Barang tidak ditemukan." },
        { status: 404 }
      );
    }

    const result = await sql`
      UPDATE inventory_items
      SET
        item_code = ${itemCode},
        item_name = ${itemName},
        category = ${category},
        stock = ${stock},
        condition = ${condition},
        storage_location = ${storageLocation || null},
        description = ${description || null},
        image_url = ${imageUrl === undefined ? null : imageUrl || null},
        image_public_id = ${imagePublicId === undefined ? null : imagePublicId || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    // Hapus foto lama jika foto diganti atau dihapus
    const oldPublicId = oldItem[0].image_public_id;
    const newPublicId = result[0].image_public_id;

    if (oldPublicId && oldPublicId !== newPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);
      } catch (cloudinaryError) {
        console.error("HAPUS FOTO LAMA ERROR:", cloudinaryError);
      }
    }

    return NextResponse.json({
      message: "Data barang berhasil diperbarui.",
      item: result[0],
    });
  } catch (error) {
    console.error("PATCH BARANG ERROR:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui data barang. Pastikan kode barang tidak duplikat." },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus barang
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
        { message: "ID barang tidak valid." },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM inventory_items
      WHERE id = ${id}
      RETURNING id, image_public_id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Barang tidak ditemukan." },
        { status: 404 }
      );
    }

    // Hapus foto dari Cloudinary jika tersedia
    if (result[0].image_public_id) {
      try {
        await cloudinary.uploader.destroy(result[0].image_public_id);
      } catch (cloudinaryError) {
        console.error("HAPUS FOTO CLOUDINARY ERROR:", cloudinaryError);
      }
    }

    return NextResponse.json({
      message: "Barang berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE BARANG ERROR:", error);
    return NextResponse.json(
      { message: "Gagal menghapus barang." },
      { status: 500 }
    );
  }
}

