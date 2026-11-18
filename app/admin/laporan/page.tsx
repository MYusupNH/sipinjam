"use client";

import { useEffect, useMemo, useState } from "react";

type Borrowing = {
  id: number;
  borrowing_type: "BARANG" | "RUANGAN";
  quantity: number;
  borrowing_date: string;
  return_date: string | null;
  start_time: string | null;
  end_time: string | null;
  purpose: string;
  status: string;
  admin_note: string | null;
  created_at: string;
  organization_name: string | null;
  organization_type: string | null;
  username: string | null;
  item_code: string | null;
  item_name: string | null;
  room_code: string | null;
  room_name: string | null;
  building: string | null;
};

type Summary = {
  total: number;
  menunggu: number;
  disetujui: number;
  ditolak: number;
  dipinjam: number;
  selesai: number;
  barang: number;
  ruangan: number;
};

const emptySummary: Summary = {
  total: 0,
  menunggu: 0,
  disetujui: 0,
  ditolak: 0,
  dipinjam: 0,
  selesai: 0,
  barang: 0,
  ruangan: 0,
};

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDateInput(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function LaporanPage() {
  const [data, setData] = useState<Borrowing[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("SEMUA");
  const [type, setType] = useState("SEMUA");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  async function loadReport() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/laporan", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil laporan.");
      }

      setData(result.borrowings || []);
      setSummary({
        ...emptySummary,
        ...(result.summary || {}),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil laporan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const target = [
        item.organization_name,
        item.organization_type,
        item.username,
        item.item_name,
        item.item_code,
        item.room_name,
        item.room_code,
        item.purpose,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = target.includes(search.toLowerCase());

      const matchesStatus =
        status === "SEMUA" || item.status === status;

      const matchesType =
        type === "SEMUA" || item.borrowing_type === type;

      const borrowingDate = formatDateInput(item.borrowing_date);

      const matchesStart =
        !startDate || borrowingDate >= startDate;

      const matchesEnd =
        !endDate || borrowingDate <= endDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [data, search, status, type, startDate, endDate]);

  const filteredSummary = useMemo(() => {
    return {
      total: filtered.length,
      menunggu: filtered.filter((item) => item.status === "MENUNGGU").length,
      disetujui: filtered.filter((item) => item.status === "DISETUJUI").length,
      ditolak: filtered.filter((item) => item.status === "DITOLAK").length,
      dipinjam: filtered.filter((item) => item.status === "DIPINJAM").length,
      selesai: filtered.filter((item) => item.status === "SELESAI").length,
      barang: filtered.filter((item) => item.borrowing_type === "BARANG").length,
      ruangan: filtered.filter((item) => item.borrowing_type === "RUANGAN").length,
    };
  }, [filtered]);

  function exportCsv() {
    if (filtered.length === 0) {
      alert("Tidak ada data yang dapat diekspor.");
      return;
    }

    const headers = [
      "ID",
      "Nama Organisasi",
      "Jenis Organisasi",
      "Username",
      "Jenis Peminjaman",
      "Kode Barang/Ruangan",
      "Nama Barang/Ruangan",
      "Jumlah",
      "Tanggal Peminjaman",
      "Tanggal Pengembalian",
      "Waktu Mulai",
      "Waktu Selesai",
      "Keperluan",
      "Status",
      "Catatan Admin",
    ];

    const rows = filtered.map((item) => [
      item.id,
      item.organization_name,
      item.organization_type,
      item.username,
      item.borrowing_type,
      item.borrowing_type === "BARANG"
        ? item.item_code
        : item.room_code,
      item.borrowing_type === "BARANG"
        ? item.item_name
        : item.room_name,
      item.quantity,
      formatDate(item.borrowing_date),
      formatDate(item.return_date),
      item.start_time,
      item.end_time,
      item.purpose,
      item.status,
      item.admin_note,
    ]);

    const csv = [
      headers.map(escapeCsv).join(";"),
      ...rows.map((row) => row.map(escapeCsv).join(";")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `laporan-peminjaman-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function resetFilters() {
    setSearch("");
    setStatus("SEMUA");
    setType("SEMUA");
    setStartDate("");
    setEndDate("");
  }

  const cards = [
    {
      label: "Total Peminjaman",
      value: filteredSummary.total,
      color: "text-slate-900",
    },
    {
      label: "Menunggu",
      value: filteredSummary.menunggu,
      color: "text-amber-600",
    },
    {
      label: "Disetujui",
      value: filteredSummary.disetujui,
      color: "text-blue-600",
    },
    {
      label: "Ditolak",
      value: filteredSummary.ditolak,
      color: "text-red-600",
    },
    {
      label: "Sedang Dipinjam",
      value: filteredSummary.dipinjam,
      color: "text-purple-600",
    },
    {
      label: "Selesai",
      value: filteredSummary.selesai,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-[#071A3E] via-[#123B78] to-[#2368C5] px-4 py-3 text-white shadow-md shadow-blue-950/10 md:px-5 md:py-4">

        <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />
        <div className="absolute -bottom-16 right-28 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />

        <div className="relative z-10">

          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-100">
              Dashboard / Laporan
            </span>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[8px] font-bold tracking-[0.15em] text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
              BRAMASTRA ADMINISTRATOR
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-lg font-black tracking-tight md:text-xl">
                Laporan Peminjaman
              </h1>

              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-blue-100 md:text-xs">
                Rekapitulasi seluruh transaksi peminjaman barang dan ruangan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Total Peminjaman
                </p>
                <p className="text-sm font-black">
                  {loading ? "..." : filteredSummary.total}
                </p>
              </div>

              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Menunggu
                </p>
                <p className="text-sm font-black text-orange-300">
                  {loading ? "..." : filteredSummary.menunggu}
                </p>
              </div>

              <button
                onClick={loadReport}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                ↻ Refresh
              </button>

              <button
                onClick={() => window.print()}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Cetak
              </button>

              <button
                onClick={exportCsv}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                ↓ Export Excel (CSV)
              </button>
            </div>
          </div>

        </div>
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold ${card.color}`}>
              {loading ? "..." : card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Berdasarkan Jenis Peminjaman
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm text-blue-700">Peminjaman Barang</p>
              <p className="mt-2 text-2xl font-bold text-blue-700">
                {loading ? "..." : filteredSummary.barang}
              </p>
            </div>

            <div className="rounded-xl bg-purple-50 p-4">
              <p className="text-sm text-purple-700">Peminjaman Ruangan</p>
              <p className="mt-2 text-2xl font-bold text-purple-700">
                {loading ? "..." : filteredSummary.ruangan}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">
            Ringkasan Status
          </h2>

          <div className="mt-4 space-y-3">
            {[
              ["Menunggu", filteredSummary.menunggu, "bg-amber-500"],
              ["Disetujui", filteredSummary.disetujui, "bg-blue-500"],
              ["Ditolak", filteredSummary.ditolak, "bg-red-500"],
              ["Dipinjam", filteredSummary.dipinjam, "bg-purple-500"],
              ["Selesai", filteredSummary.selesai, "bg-emerald-500"],
            ].map(([label, value, color]) => {
              const percentage =
                filteredSummary.total > 0
                  ? (Number(value) / filteredSummary.total) * 100
                  : 0;

              return (
                <div key={String(label)}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-800">
                      {loading ? "..." : value}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">
            Filter Laporan
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tentukan periode dan kategori laporan yang ingin ditampilkan.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
              <option value="DIPINJAM">Dipinjam</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Jenis Peminjaman
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
            >
              <option value="SEMUA">Semua Jenis</option>
              <option value="BARANG">Barang</option>
              <option value="RUANGAN">Ruangan</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Detail Laporan Peminjaman
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Menampilkan {filtered.length} dari {data.length} transaksi.
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari organisasi, barang..."
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Memuat laporan...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            Tidak ada data sesuai filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">No.</th>
                  <th className="px-5 py-4">Organisasi</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Barang / Ruangan</th>
                  <th className="px-5 py-4">Tanggal Pinjam</th>
                  <th className="px-5 py-4">Tanggal Kembali</th>
                  <th className="px-5 py-4">Jumlah</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">{index + 1}</td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {item.organization_name || "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.organization_type || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">{item.borrowing_type}</td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {item.borrowing_type === "BARANG"
                          ? item.item_name || "-"
                          : item.room_name || "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.borrowing_type === "BARANG"
                          ? item.item_code || "-"
                          : item.room_code || item.building || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {formatDate(item.borrowing_date)}
                    </td>

                    <td className="px-5 py-4">
                      {formatDate(item.return_date)}
                    </td>

                    <td className="px-5 py-4">
                      {item.borrowing_type === "BARANG"
                        ? `${item.quantity} unit`
                        : "1 ruangan"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "MENUNGGU"
                            ? "bg-amber-100 text-amber-700"
                            : item.status === "DISETUJUI"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "DITOLAK"
                                ? "bg-red-100 text-red-700"
                                : item.status === "DIPINJAM"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          aside,
          button,
          input,
          select {
            display: none !important;
          }

          main {
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            background: white !important;
          }

          .rounded-2xl {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}