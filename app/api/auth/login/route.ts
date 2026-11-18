
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    const akses = String(body.akses || "");

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (akses !== "admin" && akses !== "organisasi") {
      return NextResponse.json(
        { message: "Jenis akses login tidak valid." },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("JWT_SECRET belum dikonfigurasi dengan benar.");
    }

    // LOGIN SUPERADMIN DAN ADMIN
    if (akses === "admin") {
      const admins = await sql`
        SELECT id, username, password_hash, name, role
        FROM admin_users
        WHERE username = ${username}
          AND is_active = TRUE
          AND role IN ('super_admin', 'admin')
        LIMIT 1
      `;

      if (admins.length === 0) {
        return NextResponse.json(
          { message: "Akun Admin tidak ditemukan atau tidak aktif." },
          { status: 401 }
        );
      }

      const admin = admins[0];

      const validPassword = await bcrypt.compare(
        password,
        admin.password_hash
      );

      if (!validPassword) {
        return NextResponse.json(
          { message: "Username atau password salah." },
          { status: 401 }
        );
      }

      const role = String(admin.role);

      const token = await new SignJWT({
        adminId: String(admin.id),
        username: admin.username,
        name: admin.name,
        role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(new TextEncoder().encode(secret));

      const response = NextResponse.json({
        message:
          role === "super_admin"
            ? "Login Superadmin berhasil."
            : "Login Admin berhasil.",
        user: {
          name: admin.name,
          username: admin.username,
          role,
        },
        redirect:
          role === "super_admin"
            ? "/admin"
            : "/admin/peminjaman",
      });

      response.cookies.set("BRAMASTRA_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      });

      return response;
    }

    // LOGIN ORMAWA / UKM
    if (akses === "organisasi") {
      const organizations = await sql`
        SELECT
          id,
          organization_name,
          organization_type,
          username,
          password_hash
        FROM organization_users
        WHERE username = ${username}
          AND is_active = TRUE
        LIMIT 1
      `;

      if (organizations.length === 0) {
        return NextResponse.json(
          { message: "Akun tidak terdaftar sebagai UKM / ORMAWA." },
          { status: 401 }
        );
      }

      const organization = organizations[0];

      const validPassword = await bcrypt.compare(
        password,
        organization.password_hash
      );

      if (!validPassword) {
        return NextResponse.json(
          { message: "Username atau password salah." },
          { status: 401 }
        );
      }

      const token = await new SignJWT({
        organizationId: String(organization.id),
        organizationName: organization.organization_name,
        organizationType: organization.organization_type,
        username: organization.username,
        role: "organization",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("8h")
        .sign(new TextEncoder().encode(secret));

      const response = NextResponse.json({
        message: "Login organisasi berhasil.",
        user: {
          organizationName: organization.organization_name,
          organizationType: organization.organization_type,
          username: organization.username,
          role: "organization",
        },
        redirect: "/organisasi",
      });

      response.cookies.set("BRAMASTRA_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 8,
      });

      return response;
    }

    return NextResponse.json(
      { message: "Akses tidak diizinkan." },
      { status: 403 }
    );
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
