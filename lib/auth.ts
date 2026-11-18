import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function getSessionPayload() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("BRAMASTRA_session")?.value;
    const secret = process.env.JWT_SECRET;

    if (!token || !secret || secret.length < 32) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    return payload;
  } catch {
    return null;
  }
}

// SUPER ADMIN DAN ADMIN TERBATAS
export async function getAdminSession() {
  const payload = await getSessionPayload();

  if (
    !payload ||
    !["super_admin", "admin"].includes(String(payload.role)) ||
    !payload.adminId ||
    !payload.username
  ) {
    return null;
  }

  return {
    id: String(payload.adminId),
    username: String(payload.username),
    name: String(payload.name || payload.username),
    role: String(payload.role) as "super_admin" | "admin",
  };
}

// KHUSUS SUPER ADMIN
export async function getSuperAdminSession() {
  const admin = await getAdminSession();

  if (!admin || admin.role !== "super_admin") {
    return null;
  }

  return admin;
}

// ORGANISASI
export async function getOrganizationSession() {
  const payload = await getSessionPayload();

  if (
    !payload ||
    payload.role !== "organization" ||
    !payload.organizationId ||
    !payload.username
  ) {
    return null;
  }

  return {
    id: String(payload.organizationId),
    username: String(payload.username),
    organizationName: String(payload.organizationName || ""),
    organizationType: String(payload.organizationType || ""),
    role: "organization",
  };
}