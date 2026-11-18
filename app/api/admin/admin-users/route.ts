import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { getSuperAdminSession } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const superAdmin = await getSuperAdminSession();

    if (!superAdmin) {
      return NextResponse.json(
        { message: "Hanya Super Admin yang dapat membuat akun Admin." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const username = String(body.username || "").trim();
    const name = String(body.name || "").trim();
    const password = String(body.password || "");

    if (!username || !name || !password) {
      return NextResponse.json(
        { message: "Nama, username, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (username.length > 50) {
      return NextResponse.json(
        { message: "Username maksimal 50 karakter." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { message: "Nama maksimal 100 karakter." },
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
      INSERT INTO admin_users (
        username,
        password_hash,
        name,
        role,
        is_active
      )
      VALUES (
        ${username},
        ${passwordHash},
        ${name},
        'admin',
        TRUE
      )
      ON CONFLICT (username) DO NOTHING
      RETURNING id, username, name, role, is_active, created_at
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { message: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "Akun Admin Terbatas berhasil dibuat.",
        admin: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);

    return NextResponse.json(
      { message: "Gagal membuat akun Admin." },
      { status: 500 }
    );
  }
}