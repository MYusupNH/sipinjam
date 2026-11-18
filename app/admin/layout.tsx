
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/auth";

export const instant = false;

const menu = [
  {
    name: "Dashboard",
    icon: "▦",
    href: "/admin",
    roles: ["super_admin", "admin"],
  },
  {
    name: "Data Barang",
    icon: "▣",
    href: "/admin/barang",
    roles: ["super_admin"],
  },
  {
    name: "Data Ruangan",
    icon: "▤",
    href: "/admin/ruangan",
    roles: ["super_admin"],
  },
  {
    name: "ORMAWA & UKM",
    icon: "♙",
    href: "/admin/organisasi",
    roles: ["super_admin"],
  },
  {
    name: "Peminjaman",
    icon: "⇧",
    href: "/admin/peminjaman",
    roles: ["super_admin", "admin"],
  },
  {
    name: "Persetujuan",
    icon: "✓",
    href: "/admin/persetujuan",
    roles: ["super_admin", "admin"],
  },
  {
    name: "Serah Terima & Pengembalian",
    icon: "⇩",
    href: "/admin/pengembalian",
    roles: ["super_admin", "admin"],
  },
  {
    name: "Laporan",
    icon: "▤",
    href: "/admin/laporan",
    roles: ["super_admin"],
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Periksa sesi administrator
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/login");
  }

  // Ambil pathname dari request header
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "";

  // Pembatasan akses untuk Admin biasa
  if (admin.role === "admin") {
    const allowedPaths = [
      "/admin",
      "/admin/peminjaman",
      "/admin/persetujuan",
      "/admin/pengembalian",
    ];

    const allowed = allowedPaths.some((path) =>
      path === "/admin"
        ? pathname === "/admin"
        : pathname === path || pathname.startsWith(path + "/")
    );

    if (!allowed) {
      redirect("/admin");
    }
  }

  // Tampilkan menu sesuai hak akses
  const visibleMenu = menu.filter((item) =>
    item.roles.includes(admin.role)
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800 md:flex">
      {/* SIDEBAR */}
      <aside className="flex w-full flex-col bg-[#101b35] text-white md:fixed md:inset-y-0 md:w-[260px] md:overflow-y-auto">
        {/* LOGO */}
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5">
            <Image
              src="/logo.png"
              alt="Logo BRAMASTRA"
              fill
              priority
              sizes="48px"
              className="object-contain p-1"
            />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide">
              BRAMASTRA
            </h1>

            <p className="text-xs text-slate-400">
              Borrowing Reservation Asset Management
            </p>
          </div>
        </div>

        {/* MENU NAVIGASI */}
        <div className="flex-1 px-5 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
            Main Menu
          </p>

          <nav className="space-y-1">
            {visibleMenu.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-lg">
                    {item.icon}
                  </span>

                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* INFORMASI ADMIN */}
        <div className="mt-auto p-5">
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold">
              BRAMASTRA SYSTEM
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              Sistem Informasi Peminjaman Inventaris Kampus
            </p>
          </div>

          <div className="mb-3 px-2">
            <p className="text-sm font-semibold">
              {admin.username}
            </p>

            <p className="text-xs text-slate-400">
              {admin.role === "super_admin"
                ? "Super Administrator"
                : "Administrator"}
            </p>
          </div>

          {/* LOGOUT */}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10"
            >
              ↪ Keluar dari Dashboard
            </button>
          </form>
        </div>
      </aside>

      {/* KONTEN HALAMAN */}
      <main className="min-w-0 flex-1 p-5 md:ml-[260px] md:p-9">
        {children}
      </main>
    </div>
  );
}
