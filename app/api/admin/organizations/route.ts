
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { getSuperAdminSession } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

// ==========================================
// GET: DAFTAR ORGANISASI DAN SUPER ADMIN
// ==========================================

export async function GET() {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Tidak memiliki akses." },
        { status: 401 }
      );
    }

    const organizations = await sql`
      SELECT
        id,
        organization_name,
        organization_type,
        username,
        is_active,
        created_at
      FROM organization_users
      ORDER BY created_at DESC
    `;

    const superAdmins = await sql`
      SELECT
        id,
        username,
        name,
        role,
        is_active,
        created_at
      FROM admin_users
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      organizations,
      superAdmins,
      currentAdminId: Number(admin.id),
    });
  } catch (error) {
    console.error("GET ORGANIZATIONS ERROR:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data akun." },
      { status: 500 }
    );
  }
}

// ==========================================
// POST: TAMBAH AKUN ORMAWA / UKM
// ==========================================

export async function POST(request: NextRequest) {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Tidak memiliki akses." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const organizationName = String(
      body.organization_name || ""
    ).trim();

    const organizationType = String(
      body.organization_type || ""
    ).trim();

    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!organizationName || !username || !password) {
      return NextResponse.json(
        { message: "Semua data wajib diisi." },
        { status: 400 }
      );
    }

    if (
      organizationType !== "ORMAWA" &&
      organizationType !== "UKM"
    ) {
      return NextResponse.json(
        { message: "Jenis organisasi tidak valid." },
        { status: 400 }
      );
    }

    if (username.length > 50) {
      return NextResponse.json(
        { message: "Username maksimal 50 karakter." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await sql`
      INSERT INTO organization_users (
        organization_name,
        organization_type,
        username,
        password_hash
      )
      VALUES (
        ${organizationName},
        ${organizationType},
        ${username},
        ${passwordHash}
      )
      ON CONFLICT (username) DO NOTHING
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Akun organisasi berhasil dibuat.",
    });
  } catch (error) {
    console.error("POST ORGANIZATION ERROR:", error);

    return NextResponse.json(
      { message: "Gagal membuat akun organisasi." },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH: UBAH PASSWORD ORGANISASI
// ATAU USERNAME / PASSWORD SUPER ADMIN
// ==========================================

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Tidak memiliki akses." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // --------------------------------------
    // UBAH AKUN SUPER ADMIN YANG LOGIN
    // --------------------------------------

    if (body.accountType === "super_admin") {
      const id = Number(body.id);
      const username = String(body.username || "").trim();
      const password = String(body.password || "");

      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json(
          { message: "ID akun tidak valid." },
          { status: 400 }
        );
      }

      // Super Admin hanya boleh mengubah akunnya sendiri.
      if (String(admin.id) !== String(id)) {
        return NextResponse.json(
          { message: "Tidak boleh mengubah akun Super Admin lain." },
          { status: 403 }
        );
      }

      if (!username) {
        return NextResponse.json(
          { message: "Username wajib diisi." },
          { status: 400 }
        );
      }

      if (username.length > 50) {
        return NextResponse.json(
          { message: "Username maksimal 50 karakter." },
          { status: 400 }
        );
      }

      if (password && password.length < 8) {
        return NextResponse.json(
          { message: "Password minimal 8 karakter." },
          { status: 400 }
        );
      }

      const duplicate = await sql`
        SELECT id
        FROM admin_users
        WHERE username = ${username}
          AND id != ${id}
        LIMIT 1
      `;

      if (duplicate.length > 0) {
        return NextResponse.json(
          { message: "Username sudah digunakan." },
          { status: 409 }
        );
      }

      const passwordHash = password
        ? await bcrypt.hash(password, 12)
        : null;

      await sql`
        UPDATE admin_users
        SET
          username = ${username},
          password_hash = COALESCE(
            ${passwordHash},
            password_hash
          ),
          updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({
        success: true,
        message: "Akun Super Admin berhasil diperbarui.",
      });
    }

    // --------------------------------------
    // UBAH PASSWORD ORGANISASI
    // --------------------------------------

    const id = Number(body.id);
    const password = String(body.password || "");

    if (!Number.isInteger(id) || id <= 0 || !password) {
      return NextResponse.json(
        { message: "Data tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await sql`
      UPDATE organization_users
      SET
        password_hash = ${passwordHash},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Akun organisasi tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password organisasi berhasil diubah.",
    });
  } catch (error) {
    console.error("PATCH ACCOUNT ERROR:", error);

    return NextResponse.json(
      { message: "Gagal memperbarui akun." },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE: HAPUS AKUN ORGANISASI
// ==========================================

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getSuperAdminSession();

    if (!admin) {
      return NextResponse.json(
        { message: "Tidak memiliki akses." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "ID akun tidak valid." },
        { status: 400 }
      );
    }

    const result = await sql`
      DELETE FROM organization_users
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Akun tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Akun organisasi berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE ORGANIZATION ERROR:", error);

    return NextResponse.json(
      { message: "Gagal menghapus akun organisasi." },
      { status: 500 }
    );
  }
}

