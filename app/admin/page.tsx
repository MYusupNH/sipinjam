
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type DashboardData = {
  success: boolean;
  statistics: {
    inventory: {
      total: number;
      total_stock: number;
      good: number;
      damaged: number;
    };
    rooms: {
      total: number;
      active: number;
    };
    organizations: {
      total: number;
      active: number;
    };
    borrowings: {
      total: number;
    };
  };
  statuses: {
    MENUNGGU: number;
    DISETUJUI: number;
    DITOLAK: number;
    DIPINJAM: number;
    SELESAI: number;
  };
  monthly: {
    month: string;
    month_number: number;
    year: number;
    total: number;
  }[];
  recent: {
    id: number;
    borrowing_type: string;
    quantity: number;
    borrowing_date: string;
    start_time: string | null;
    end_time: string | null;
    status: string;
    created_at: string;
    organization_name: string;
    target_name: string;
  }[];
  updatedAt: string;
};

const statusConfig = [
  { key: "MENUNGGU", label: "Menunggu", color: "#f59e0b" },
  { key: "DISETUJUI", label: "Disetujui", color: "#3b82f6" },
  { key: "DITOLAK", label: "Ditolak", color: "#f43f5e" },
  { key: "DIPINJAM", label: "Sedang Dipinjam", color: "#8b5cf6" },
  { key: "SELESAI", label: "Selesai", color: "#10b981" },
] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string | null) {
  return value ? value.slice(0, 5) : "-";
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    MENUNGGU: "bg-amber-50 text-amber-700",
    DISETUJUI: "bg-blue-50 text-blue-700",
    DITOLAK: "bg-rose-50 text-rose-700",
    DIPINJAM: "bg-violet-50 text-violet-700",
    SELESAI: "bg-emerald-50 text-emerald-700",
  };

  const labels: Record<string, string> = {
    MENUNGGU: "Menunggu",
    DISETUJUI: "Disetujui",
    DITOLAK: "Ditolak",
    DIPINJAM: "Dipinjam",
    SELESAI: "Selesai",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Sesi admin berakhir. Silakan login kembali.");
        }
        throw new Error("Gagal mengambil data dashboard.");
      }

      const result: DashboardData = await response.json();

      if (!result.success) {
        throw new Error("Data dashboard tidak tersedia.");
      }

      setData(result);
      setLastUpdated(new Date().toLocaleTimeString("id-ID"));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(fetchDashboard, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const statistics = data
    ? [
        {
          title: "Total Barang",
          value: data.statistics.inventory.total,
          note: `${data.statistics.inventory.total_stock} unit stok`,
          icon: "▣",
          color: "blue",
          href: "/admin/barang",
        },
        {
          title: "Total Ruangan",
          value: data.statistics.rooms.total,
          note: `${data.statistics.rooms.active} ruangan aktif`,
          icon: "▤",
          color: "violet",
          href: "/admin/ruangan",
        },
        {
          title: "ORMAWA & UKM",
          value: data.statistics.organizations.total,
          note: `${data.statistics.organizations.active} akun aktif`,
          icon: "♙",
          color: "emerald",
          href: "/admin/organisasi",
        },
        {
          title: "Peminjaman",
          value: data.statistics.borrowings.total,
          note: "Total pengajuan",
          icon: "⇄",
          color: "amber",
          href: "/admin/peminjaman",
        },
      ]
    : [];

  const maxMonthly = Math.max(
    1,
    ...(data?.monthly.map((item) => item.total) || [])
  );

  const totalStatuses = data
    ? Object.values(data.statuses).reduce((sum, value) => sum + value, 0)
    : 0;

  const statusColors = data
    ? statusConfig.map((item) => ({
        ...item,
        value: data.statuses[item.key],
        percentage:
          totalStatuses > 0
            ? (data.statuses[item.key] / totalStatuses) * 100
            : 0,
      }))
    : [];

  const pieBackground =
    totalStatuses > 0
      ? (() => {
          let current = 0;
          const segments = statusColors.map((item) => {
            const start = current;
            current += item.percentage;
            return `${item.color} ${start}% ${current}%`;
          });
          return `conic-gradient(${segments.join(", ")})`;
        })()
      : "#e2e8f0";

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#14264b] via-[#1d3970] to-[#2563a8] p-7 text-white shadow-lg md:p-9">
        <div className="relative z-10 max-w-2xl">
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
            BRAMASTRA ADMINISTRATOR
          </span>

          <h1 className="mt-5 text-3xl font-bold md:text-4xl">
            Dashboard Admin
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-blue-100 md:text-base">
            Pantau inventaris, peminjaman barang, reservasi
            ruangan, dan aktivitas organisasi mahasiswa
            melalui satu halaman.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/peminjaman"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-900 transition hover:bg-blue-50"
            >
              Lihat Peminjaman →
            </Link>

            <Link
              href="/admin/barang"
              className="rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Kelola Inventaris
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-32 right-36 h-72 w-72 rounded-full border-[35px] border-white/5" />

        <div className="absolute right-10 top-1/2 hidden -translate-y-1/2 text-8xl font-black text-white/10 xl:block">
          S
        </div>
      </section>

      {/* UPDATE STATUS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Ringkasan Sistem
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Statistik berdasarkan data PostgreSQL Neon.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Auto refresh 10 detik
          </span>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            ↻ Perbarui
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* STATISTICS */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <Link
            href={item.href}
            key={item.title}
            className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {item.title}
                </p>
                <h3 className="mt-3 text-3xl font-bold text-slate-800">
                  {loading ? "..." : item.value.toLocaleString("id-ID")}
                </h3>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                  item.color === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : item.color === "violet"
                    ? "bg-violet-50 text-violet-600"
                    : item.color === "emerald"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {item.icon}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400">
                {loading ? "Memuat data..." : item.note}
              </span>
              <span className="text-xs font-semibold text-blue-600">
                Detail →
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* CHARTS */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* MONTHLY CHART */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2 md:p-6">
          <div>
            <h2 className="font-bold text-slate-800">
              Aktivitas Peminjaman
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Jumlah pengajuan enam bulan terakhir.
            </p>
          </div>

          <div className="mt-8">
            <div className="relative flex h-56">
              <div className="flex flex-col justify-between pb-7 pr-3 text-xs text-slate-400">
                <span>{maxMonthly}</span>
                <span>{Math.ceil(maxMonthly * 0.75)}</span>
                <span>{Math.ceil(maxMonthly * 0.5)}</span>
                <span>{Math.ceil(maxMonthly * 0.25)}</span>
                <span>0</span>
              </div>

              <div className="relative flex flex-1 items-end justify-between gap-2 border-b border-l border-slate-200 px-2 pb-0">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-0">
                  {[0, 1, 2, 3].map((line) => (
                    <div
                      key={line}
                      className="w-full border-t border-dashed border-slate-100"
                    />
                  ))}
                </div>

                {data?.monthly.map((item) => (
                  <div
                    key={`${item.year}-${item.month_number}`}
                    className="relative z-10 flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-1 text-[10px] font-semibold text-slate-500">
                      {item.total > 0 ? item.total : ""}
                    </span>

                    <div
                      title={`${item.month} ${item.year}: ${item.total} pengajuan`}
                      style={{
                        height: `${(item.total / maxMonthly) * 82}%`,
                        minHeight: item.total > 0 ? "4px" : "0px",
                      }}
                      className="w-full max-w-9 rounded-t-md bg-gradient-to-t from-blue-700 to-blue-400 transition-all duration-500"
                    />

                    <span className="absolute -bottom-6 text-[10px] text-slate-400">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              Pengajuan peminjaman
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total: {data?.statistics.borrowings.total ?? 0}
            </span>
          </div>
        </div>

        {/* STATUS CHART */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <h2 className="font-bold text-slate-800">
            Status Peminjaman
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Distribusi status pengajuan.
          </p>

          <div className="my-8 flex justify-center">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full transition-all duration-500"
              style={{ background: pieBackground }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-800">
                  {totalStatuses}
                </span>
                <span className="text-xs text-slate-400">
                  Pengajuan
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {statusColors.map((item) => (
              <div key={item.key}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="font-semibold text-slate-800">
                    {item.value}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITIES */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 md:p-6">
          <div>
            <h2 className="font-bold text-slate-800">
              Aktivitas Peminjaman Terbaru
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Delapan pengajuan terakhir dari database.
            </p>
          </div>

          <Link
            href="/admin/peminjaman"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Lihat semua →
          </Link>
        </div>

        {data?.recent.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Organisasi</th>
                  <th className="px-5 py-4 font-semibold">Jenis</th>
                  <th className="px-5 py-4 font-semibold">Barang / Ruangan</th>
                  <th className="px-5 py-4 font-semibold">Tanggal</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.recent.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {item.organization_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.borrowing_type}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {item.target_name}
                      {item.borrowing_type === "BARANG" && (
                        <span className="ml-1 text-xs text-slate-400">
                          ({item.quantity} unit)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(item.borrowing_date)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <div className="text-4xl text-slate-300">▤</div>
            <h3 className="mt-3 font-semibold text-slate-700">
              Belum Ada Aktivitas Peminjaman
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Pengajuan peminjaman akan muncul di sini.
            </p>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <section className="flex flex-col justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-bold text-blue-900">
            BRAMASTRA Information System
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            Sistem Informasi Peminjaman Inventaris Kampus.
          </p>
          <p className="mt-2 text-xs text-blue-600">
            {lastUpdated
              ? `Terakhir diperbarui: ${lastUpdated}`
              : "Menunggu data..."}
          </p>
        </div>

        <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-semibold text-blue-700">
          Super Admin Panel
        </span>
      </section>
    </div>
  );
}
