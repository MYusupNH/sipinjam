import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import {
  getAdminSession,
  getOrganizationSession,
} from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const type = String(formData.get("type") || "");
    const borrowingId = String(formData.get("borrowing_id") || "");

    // Validasi jenis unggahan
    const allowedTypes = [
      "barang",
      "ruangan",
      "serah_terima",
      "pengembalian",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { message: "Jenis unggahan tidak valid." },
        { status: 400 }
      );
    }

    // Validasi file
    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "File foto wajib diunggah." },
        { status: 400 }
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          message: "Format foto harus JPG, PNG, atau WEBP.",
        },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          message: "Ukuran foto maksimal 5 MB.",
        },
        { status: 400 }
      );
    }

    let folder = "";

    // =====================================================
    // UPLOAD FOTO PENGEMBALIAN OLEH ORMAWA / UKM
    // =====================================================
    if (type === "pengembalian") {
      const organization = await getOrganizationSession();

      if (!organization) {
        return NextResponse.json(
          {
            message: "Akses hanya untuk akun ORMAWA atau UKM.",
          },
          { status: 401 }
        );
      }

      if (!borrowingId) {
        return NextResponse.json(
          {
            message: "ID peminjaman wajib diisi.",
          },
          { status: 400 }
        );
      }

      const borrowing = await sql`
        SELECT id
        FROM borrowings
        WHERE id = ${borrowingId}
          AND organization_id = ${organization.id}
          AND status IN ('DIPINJAM', 'DITOLAK_PENGEMBALIAN')
        LIMIT 1
      `;

      if (borrowing.length === 0) {
        return NextResponse.json(
          {
            message:
              "Peminjaman tidak ditemukan atau tidak dapat melakukan pengembalian.",
          },
          { status: 403 }
        );
      }

      folder = "BRAMASTRA/pengembalian";
    }

    // =====================================================
    // UPLOAD FOTO SERAH TERIMA OLEH ADMIN
    // SUPER ADMIN DAN ADMIN TERBATAS
    // =====================================================
    else if (type === "serah_terima") {
      const admin = await getAdminSession();

      if (!admin) {
        return NextResponse.json(
          {
            message: "Akses Admin diperlukan.",
          },
          { status: 401 }
        );
      }

      if (!borrowingId) {
        return NextResponse.json(
          {
            message: "ID peminjaman wajib diisi.",
          },
          { status: 400 }
        );
      }

      const borrowing = await sql`
        SELECT id
        FROM borrowings
        WHERE id = ${borrowingId}
          AND status = 'DISETUJUI'
        LIMIT 1
      `;

      if (borrowing.length === 0) {
        return NextResponse.json(
          {
            message:
              "Peminjaman tidak ditemukan atau belum disetujui.",
          },
          { status: 403 }
        );
      }

      folder = "BRAMASTRA/serah-terima";
    }

    // =====================================================
    // UPLOAD FOTO BARANG DAN RUANGAN
    // KHUSUS SUPER ADMIN
    // =====================================================
    else {
      const admin = await getAdminSession();

      if (!admin) {
        return NextResponse.json(
          {
            message: "Akses Admin diperlukan.",
          },
          { status: 401 }
        );
      }

      if (admin.role !== "super_admin") {
        return NextResponse.json(
          {
            message:
              "Hanya Super Admin yang dapat mengunggah foto barang dan ruangan.",
          },
          { status: 403 }
        );
      }

      folder = `BRAMASTRA/${type}`;
    }

    // =====================================================
    // PROSES UPLOAD KE CLOUDINARY
    // =====================================================
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64 = buffer.toString("base64");

    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
    });

    return NextResponse.json({
      message: "Foto berhasil diunggah.",
      url: result.secure_url,
      public_id: result.public_id,

      // Disediakan juga untuk kompatibilitas dengan kode lama
      image_url: result.secure_url,
      image_public_id: result.public_id,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengunggah foto ke Cloudinary.",
      },
      { status: 500 }
    );
  }
}