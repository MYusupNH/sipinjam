
"use client";

import { useEffect, useMemo, useState } from "react";

type Borrowing = {
  id: number;
  organization_id: number;
  borrowing_type: "BARANG" | "RUANGAN";
  item_id: number | null;
  room_id: number | null;
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

const dateFormat = (value: string | null) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

const statusStyle = (status: string) => {
  switch (status) {
    case "MENUNGGU":
      return "bg-amber-100 text-amber-700";
    case "DISETUJUI":
      return "bg-blue-100 text-blue-700";
    case "DITOLAK":
      return "bg-red-100 text-red-700";
    case "DIPINJAM":
      return "bg-purple-100 text-purple-700";
    case "MENUNGGU_PENGEMBALIAN":
      return "bg-orange-100 text-orange-700";
    case "SELESAI":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function PeminjamanPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [filterType, setFilterType] = useState("SEMUA");
  const [selected, setSelected] = useState<Borrowing | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notification, setNotification] = useState("");

  async function loadBorrowings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/peminjaman", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data.");
      }

      setBorrowings(data.borrowings || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBorrowings();
  }, []);

  const filtered = useMemo(() => {
    return borrowings.filter((item) => {
      const target =
        `${item.organization_name || ""} ${item.username || ""} ` +
        `${item.item_name || ""} ${item.room_name || ""} ${item.purpose}`;

      const matchesSearch = target
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "SEMUA" || item.status === filterStatus;

      const matchesType =
        filterType === "SEMUA" || item.borrowing_type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [borrowings, search, filterStatus, filterType]);

  const counts = {
    total: borrowings.length,
    waiting: borrowings.filter((item) => item.status === "MENUNGGU").length,
    approved: borrowings.filter((item) => item.status === "DISETUJUI").length,
    finished: borrowings.filter((item) => item.status === "SELESAI").length,
  };

  async function handleDelete(id: number) {
    const borrowing = borrowings.find((item) => item.id === id);

    if (!borrowing) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus peminjaman ini?\n\n` +
      `Organisasi: ${borrowing.organization_name || "-"}\n` +
      `Status: ${borrowing.status}\n\n` +
      "Data yang sudah dihapus tidak dapat dikembalikan."
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setNotification("");
      setError("");

      const response = await fetch("/api/admin/peminjaman", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus data.");
      }

      setBorrowings((previous) =>
        previous.filter((item) => item.id !== id)
      );

      if (selected?.id === id) {
        setSelected(null);
      }

      setNotification(data.message || "Data berhasil dihapus.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menghapus data."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-[#071A3E] via-[#123B78] to-[#2368C5] px-4 py-3 text-white shadow-md shadow-blue-950/10 md:px-5 md:py-4">

        <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />
        <div className="absolute -bottom-16 right-28 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />

        <div className="relative z-10">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-100">
              Dashboard / Peminjaman
            </span>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[8px] font-bold tracking-[0.15em] text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
              BRAMASTRA ADMINISTRATOR
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-lg font-black tracking-tight md:text-xl">
                Manajemen Peminjaman
              </h1>

              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-blue-100 md:text-xs">
                Kelola seluruh pengajuan peminjaman barang dan ruangan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Total Pengajuan
                </p>
                <p className="text-sm font-black">{counts.total}</p>
              </div>

              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Menunggu
                </p>
                <p className="text-sm font-black text-orange-300">
                  {counts.waiting}
                </p>
              </div>

              <button
                onClick={loadBorrowings}
                disabled={loading}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
              >
                ↻ Refresh Data
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NOTIFIKASI */}
      {notification && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span>✓ {notification}</span>
          <button
            onClick={() => setNotification("")}
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* STATISTIK */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Pengajuan</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {counts.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Menunggu Persetujuan</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {counts.waiting}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Disetujui</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {counts.approved}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Selesai</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {counts.finished}
          </p>
        </div>
      </div>

      {/* DAFTAR PEMINJAMAN */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Daftar Peminjaman
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Seluruh pengajuan dari ORMAWA dan UKM.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari organisasi atau barang..."
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
            >
              <option value="SEMUA">Semua Jenis</option>
              <option value="BARANG">Barang</option>
              <option value="RUANGAN">Ruangan</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
            >
              <option value="SEMUA">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
              <option value="DIPINJAM">Dipinjam</option>
              <option value="MENUNGGU_PENGEMBALIAN">
                Menunggu Pengembalian
              </option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Memuat data peminjaman...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
              ◈
            </div>

            <p className="font-semibold text-slate-700">
              Belum ada data peminjaman
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Data pengajuan akan muncul di halaman ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">No.</th>
                  <th className="px-5 py-4">Organisasi</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Barang / Ruangan</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Jumlah</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {item.organization_name || "Organisasi tidak ditemukan"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.organization_type || "-"} · {item.username || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {item.borrowing_type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {item.borrowing_type === "BARANG"
                          ? item.item_name || "-"
                          : item.room_name || "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.borrowing_type === "BARANG"
                          ? item.item_code || "-"
                          : item.room_code || item.building || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p>{dateFormat(item.borrowing_date)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        s.d. {dateFormat(item.return_date)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {item.borrowing_type === "BARANG"
                        ? `${item.quantity} unit`
                        : "1 ruangan"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === item.id ? "Menghapus..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  BRAMASTRA ADMINISTRATOR
                </p>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  Detail Peminjaman
                </h2>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg px-3 py-1 text-2xl text-slate-500 transition hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Organisasi</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selected.organization_name || "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selected.organization_type || "-"} · {selected.username || "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Jenis Peminjaman</p>
                  <p className="mt-1 font-semibold">
                    {selected.borrowing_type}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Status</p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                      selected.status
                    )}`}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-slate-500">Barang / Ruangan</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selected.borrowing_type === "BARANG"
                    ? selected.item_name || "-"
                    : selected.room_name || "-"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selected.borrowing_type === "BARANG"
                    ? selected.item_code || "-"
                    : selected.room_code || selected.building || "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Tanggal Mulai</p>
                  <p className="mt-1 font-semibold">
                    {dateFormat(selected.borrowing_date)}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Tanggal Selesai</p>
                  <p className="mt-1 font-semibold">
                    {dateFormat(selected.return_date)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Waktu Mulai</p>
                  <p className="mt-1 font-semibold">
                    {selected.start_time || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-slate-500">Waktu Selesai</p>
                  <p className="mt-1 font-semibold">
                    {selected.end_time || "-"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-500">Jumlah</p>
                <p className="mt-1 font-semibold">
                  {selected.borrowing_type === "BARANG"
                    ? `${selected.quantity} unit`
                    : "1 ruangan"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Keperluan</p>
                <p className="mt-1 whitespace-pre-wrap font-medium text-slate-800">
                  {selected.purpose}
                </p>
              </div>

              {selected.admin_note && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-slate-500">Catatan Admin</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {selected.admin_note}
                  </p>
                </div>
              )}

              <div>
                <p className="text-slate-500">Tanggal Pengajuan</p>
                <p className="mt-1 font-medium">
                  {dateFormat(selected.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => handleDelete(selected.id)}
                disabled={deletingId === selected.id}
                className="flex-1 rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                {deletingId === selected.id ? "Menghapus..." : "Hapus Peminjaman"}
              </button>

              <button
                onClick={() => setSelected(null)}
                className="flex-1 rounded-xl bg-[#071A3E] px-4 py-3 font-semibold text-white transition hover:bg-[#123B78]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
