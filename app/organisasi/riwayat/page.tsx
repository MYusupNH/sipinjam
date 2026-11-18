"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Borrowing = {
  id: number;
  borrowing_type: string;
  quantity: number;
  borrowing_date: string;
  return_date: string | null;
  start_time: string | null;
  end_time: string | null;
  purpose: string;
  status: string;
  admin_note: string | null;
  item_name: string | null;
  room_name: string | null;
  handover_photo_url: string | null;
  handover_note: string | null;
  handed_over_at: string | null;
};

export default function RiwayatPage() {
  const router = useRouter();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/organisasi/pengembalian", {
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil riwayat.");
        }

        setBorrowings(result.borrowings || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  function statusLabel(status: string) {
    const labels: Record<string, string> = {
      MENUNGGU: "Menunggu Persetujuan",
      DISETUJUI: "Disetujui",
      DITOLAK: "Ditolak",
      DIPINJAM: "Sedang Dipinjam",
      MENUNGGU_PENGEMBALIAN: "Menunggu Verifikasi Pengembalian",
      DITOLAK_PENGEMBALIAN: "Pengembalian Ditolak",
      SELESAI: "Selesai",
    };

    return labels[status] || status.replaceAll("_", " ");
  }

  function statusColor(status: string) {
    if (status === "DISETUJUI") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (status === "DIPINJAM") {
      return "border-blue-200 bg-blue-50 text-blue-700";
    }

    if (status === "MENUNGGU" || status === "MENUNGGU_PENGEMBALIAN") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }

    if (status === "SELESAI") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "DITOLAK" || status === "DITOLAK_PENGEMBALIAN") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  function formatDate(value: string | null) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  function formatDateTime(value: string | null) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("id-ID");
  }

  const total = borrowings.length;
  const waiting = borrowings.filter(
    (item) => item.status === "MENUNGGU"
  ).length;
  const borrowed = borrowings.filter(
    (item) => item.status === "DIPINJAM"
  ).length;
  const completed = borrowings.filter(
    (item) => item.status === "SELESAI"
  ).length;

  const statistics = [
    {
      label: "Total Pengajuan",
      value: total,
      icon: "📋",
      color: "from-blue-100 to-indigo-100",
    },
    {
      label: "Menunggu Persetujuan",
      value: waiting,
      icon: "⏳",
      color: "from-amber-100 to-orange-100",
    },
    {
      label: "Sedang Dipinjam",
      value: borrowed,
      icon: "📦",
      color: "from-indigo-100 to-blue-100",
    },
    {
      label: "Selesai",
      value: completed,
      icon: "✓",
      color: "from-emerald-100 to-green-100",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fc] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071a3e] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-3.5 lg:px-10">
          <Link href="/organisasi" className="flex shrink-0 items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white p-1">
              <Image
                src="/logo.png"
                alt="Logo BRAMASTRA"
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-wide">BRAMASTRA</h1>
              <p className="text-[10px] text-blue-200">
                Sistem Informasi Peminjaman
              </p>
            </div>
          </Link>

          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-full border border-white/30 bg-white/5 px-5 py-2.5 text-xs font-bold transition hover:border-orange-400 hover:bg-orange-500"
            >
              Keluar
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-7 lg:px-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071a3e] via-[#103d83] to-[#2368c5] shadow-2xl">
          <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full border-[50px] border-white/[0.04]" />
          <div className="absolute -bottom-40 left-[35%] h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute right-10 top-5 h-32 w-32 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative flex min-h-[240px] flex-col justify-center px-7 py-10 sm:px-10 lg:px-14">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-blue-100">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              ORGANIZATION BORROWING HISTORY
            </div>

            <p className="mt-7 text-sm font-semibold text-blue-200">
              Layanan Organisasi
            </p>

            <h2 className="mt-1 text-3xl font-black leading-tight text-white sm:text-5xl">
              Riwayat Peminjaman
              <span className="text-orange-400">.</span>
            </h2>

            <div className="mt-4 flex max-w-2xl gap-3">
              <div className="w-1 shrink-0 rounded-full bg-orange-400" />
              <p className="text-sm leading-7 text-blue-50 sm:text-base">
                Pantau seluruh pengajuan peminjaman barang dan ruangan serta
                lihat bukti serah terima dari Super Admin melalui BRAMASTRA.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white">
                📦 Peminjaman Barang
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white">
                🏢 Peminjaman Ruangan
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white">
                ✓ Bukti Serah Terima
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <div className="mb-3 h-1.5 w-16 rounded-full bg-orange-400" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
              BORROWING OVERVIEW
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#0b1d43] sm:text-3xl">
              Ringkasan Peminjaman
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Informasi status seluruh transaksi peminjaman organisasi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statistics.map((item) => (
              <div
                key={item.label}
                className="group relative overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
              >
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-blue-50 transition group-hover:scale-125" />
                <div className="relative flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 sm:text-sm">
                    {item.label}
                  </span>
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-xl`}
                  >
                    {item.icon}
                  </div>
                </div>
                <p className="relative mt-5 text-3xl font-black text-[#0b1d43]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-3 h-1.5 w-16 rounded-full bg-orange-400" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                BORROWING MANAGEMENT
              </p>
              <h2 className="mt-2 text-2xl font-black text-[#0b1d43] sm:text-3xl">
                Daftar Riwayat Peminjaman
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Informasi pengajuan dan bukti serah terima peminjaman.
              </p>
            </div>

            <Link
              href="/organisasi/peminjaman"
              className="inline-flex items-center gap-3 rounded-full bg-[#0b285b] px-6 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-blue-600"
            >
              + Pengajuan Baru
              <span className="text-base">→</span>
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-7 rounded-[1.8rem] border border-blue-100 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Memuat riwayat peminjaman...
              </p>
            </div>
          ) : borrowings.length === 0 ? (
            <div className="mt-7 rounded-[1.8rem] border border-blue-100 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 text-5xl">
                📋
              </div>
              <span className="mt-6 inline-flex rounded-full bg-blue-100 px-4 py-2 text-[10px] font-black text-blue-700">
                NO BORROWING HISTORY
              </span>
              <h3 className="mt-4 text-xl font-black text-[#0b1d43]">
                Belum Ada Pengajuan
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Pengajuan peminjaman barang dan ruangan organisasi Anda akan
                ditampilkan di halaman ini.
              </p>
              <Link
                href="/organisasi/peminjaman"
                className="mt-6 inline-flex rounded-full bg-[#0b285b] px-6 py-3 text-xs font-bold text-white transition hover:bg-blue-600"
              >
                Buat Pengajuan →
              </Link>
            </div>
          ) : (
            <div className="mt-7 space-y-6">
              {borrowings.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-[1.8rem] border border-blue-100 bg-white shadow-sm transition hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-blue-50/50" />

                  <div className="relative flex flex-col gap-4 border-b border-blue-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-3xl">
                        {item.borrowing_type === "BARANG" ? "📦" : "🏢"}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600">
                          PEMINJAMAN #{item.id}
                        </p>
                        <h3 className="mt-1 text-lg font-black text-[#0b1d43] sm:text-xl">
                          {item.borrowing_type === "BARANG"
                            ? item.item_name || "Barang"
                            : item.room_name || "Ruangan"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.borrowing_type === "BARANG"
                            ? `Jumlah: ${item.quantity} unit`
                            : "Peminjaman ruangan"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-4 py-2 text-[10px] font-black ${statusColor(
                        item.status
                      )}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  <div className="relative grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5">
                      <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">
                        TANGGAL PEMINJAMAN
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#0b1d43]">
                        {formatDate(item.borrowing_date)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-5">
                      <p className="text-[10px] font-black uppercase tracking-wide text-orange-600">
                        TANGGAL RENCANA PENGEMBALIAN
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#0b1d43]">
                        {formatDate(item.return_date)}
                      </p>
                    </div>

                    {item.borrowing_type === "RUANGAN" && (
                      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                        <p className="text-[10px] font-black uppercase tracking-wide text-indigo-600">
                          WAKTU PENGGUNAAN
                        </p>
                        <p className="mt-2 text-sm font-bold text-[#0b1d43]">
                          {item.start_time || "-"} - {item.end_time || "-"}
                        </p>
                      </div>
                    )}

                    <div className="rounded-2xl border border-blue-100 bg-white p-5">
                      <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">
                        JENIS PEMINJAMAN
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#0b1d43]">
                        {item.borrowing_type}
                      </p>
                    </div>
                  </div>

                  <div className="relative mx-6 mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/70 to-white p-5 sm:mx-8">
                    <p className="text-[10px] font-black uppercase tracking-wide text-blue-600">
                      KEPERLUAN PEMINJAMAN
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {item.purpose}
                    </p>
                  </div>

                  {/* HANYA FOTO SERAH TERIMA */}
                  <div className="relative mx-6 mb-6 overflow-hidden rounded-[1.5rem] border border-blue-200 bg-white sm:mx-8">
                    <div className="flex items-center gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                        📋
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                          BORROWING HANDOVER
                        </p>
                        <h4 className="mt-1 text-sm font-black text-[#0b1d43]">
                          Bukti Serah Terima Peminjaman
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Foto yang diunggah Super Admin saat menyerahkan
                          barang atau ruangan.
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      {item.handover_photo_url ? (
                        <div className="grid gap-5 md:grid-cols-[280px_1fr]">
                          <a
                            href={item.handover_photo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="group/image relative block overflow-hidden rounded-2xl border border-blue-100"
                          >
                            <Image
                              src={item.handover_photo_url}
                              alt="Foto serah terima peminjaman"
                              width={600}
                              height={400}
                              unoptimized
                              className="h-52 w-full object-cover transition duration-500 group-hover/image:scale-105"
                            />
                            <span className="absolute bottom-3 right-3 rounded-full bg-[#071a3e]/85 px-3 py-2 text-[10px] font-bold text-white">
                              Lihat Foto →
                            </span>
                          </a>

                          <div>
                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                              ✓ BUKTI SERAH TERIMA
                            </span>
                            <p className="mt-4 text-[10px] font-black uppercase tracking-wide text-slate-400">
                              CATATAN SERAH TERIMA
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {item.handover_note || "Tidak ada catatan."}
                            </p>
                            <p className="mt-4 text-[10px] text-slate-400">
                              Waktu serah terima:{" "}
                              {formatDateTime(item.handed_over_at)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-5 py-10 text-center">
                          <span className="text-4xl">📷</span>
                          <p className="mt-3 text-sm font-bold text-[#0b1d43]">
                            Belum Ada Bukti Serah Terima
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Foto akan muncul setelah Super Admin menyerahkan
                            barang atau ruangan.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {item.admin_note && (
                    <div className="relative mx-6 mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:mx-8">
                      <p className="text-[10px] font-black uppercase tracking-wide text-indigo-600">
                        CATATAN ADMIN
                      </p>
                      <p className="mt-2 text-sm leading-6 text-indigo-900">
                        {item.admin_note}
                      </p>
                    </div>
                  )}

                  <div className="relative flex flex-col gap-3 border-t border-blue-50 bg-gradient-to-r from-white to-blue-50/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <p className="text-xs text-slate-500">
                      Nomor transaksi:{" "}
                      <span className="font-black text-[#0b1d43]">
                        #{item.id}
                      </span>
                    </p>

                    {(item.status === "DIPINJAM" ||
                      item.status === "DITOLAK_PENGEMBALIAN") && (
                      <Link
                        href="/organisasi/riwayat-pengembalian"
                        className="inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-6 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-orange-600"
                      >
                        {item.status === "DITOLAK_PENGEMBALIAN"
                          ? "Perbaiki Pengembalian"
                          : "Ajukan Pengembalian"}
                        <span className="text-base">→</span>
                      </Link>
                    )}

                    {item.status === "MENUNGGU_PENGEMBALIAN" && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-5 py-3 text-xs font-bold text-amber-700">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                        Menunggu Verifikasi Pengembalian
                      </span>
                    )}

                    {item.status === "SELESAI" && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-700">
                        ✓ Transaksi Selesai
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-slate-200 py-7 text-center sm:flex-row sm:gap-6">
          <div className="hidden h-px flex-1 bg-slate-200 sm:block" />
          <p className="text-xs font-medium text-slate-500">
            © 2026 BRAMASTRA · Sistem Informasi Peminjaman
          </p>
          <div className="hidden h-px flex-1 bg-slate-200 sm:block" />
        </footer>
      </div>
    </main>
  );
}