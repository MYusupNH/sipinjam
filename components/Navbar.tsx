

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { name: "Beranda", href: "/" },
  { name: "Inventaris", href: "/inventaris" },
  { name: "Ruangan", href: "/ruangan" },
  { name: "Cara Peminjaman", href: "/alur" },
  { name: "Tentang", href: "/tentang" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <Image
              src="/logo.png"
              alt="Logo BRAMASTRA"
              fill
              priority
              className="object-contain"
              sizes="48px"
            />
          </div>

          <div>
            <h1 className="text-lg font-extrabold text-gray-900">
              BRAMASTRA
            </h1>
            <p className="text-xs text-gray-500">
              Sistem Informasi Peminjaman
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`text-sm font-semibold transition ${
                pathname === menu.href
                  ? "text-blue-700"
                  : "text-gray-600 hover:text-blue-700"
              }`}
            >
              {menu.name}
            </Link>
          ))}

          <Link
            href="/login"
            className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}