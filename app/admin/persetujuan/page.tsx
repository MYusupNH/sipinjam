"use client";

import { useEffect, useState } from "react";

type Borrowing = {
  id: number;
  borrowing_type: string;
  quantity: number;
  borrowing_date: string;
  return_date: string | null;
  start_time: string | null;
  end_time: string | null;
  purpose: string;
  organization_name: string | null;
  organization_type: string | null;
  username: string | null;
  item_name: string | null;
  item_code: string | null;
  room_name: string | null;
  room_code: string | null;
  building: string | null;
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

export default function PersetujuanPage() {
  const [data, setData] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selected, setSelected] = useState<Borrowing | null>(null);
  const [action, setAction] = useState<"DISETUJUI" | "DITOLAK">("DISETUJUI");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/persetujuan", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setData(result.borrowings || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function processApproval() {
    if (!selected) return;

    if (action === "DITOLAK" && !note.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }

    const confirmation =
      action === "DISETUJUI"
        ? "Yakin ingin menyetujui pengajuan ini?"
        : "Yakin ingin menolak pengajuan ini?";

    if (!window.confirm(confirmation)) return;

    try {
      setProcessing(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/persetujuan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          action,
          admin_note: note,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message);

      setMessage(result.message);
      setSelected(null);
      setNote("");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memproses pengajuan."
      );
    } finally {
      setProcessing(false);
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
              Dashboard / Persetujuan
            </span>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[8px] font-bold tracking-[0.15em] text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
              BRAMASTRA ADMINISTRATOR
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-lg font-black tracking-tight md:text-xl">
                Persetujuan Peminjaman
              </h1>

              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-blue-100 md:text-xs">
                Periksa dan proses pengajuan dari ORMAWA dan UKM.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Menunggu Persetujuan
                </p>
                <p className="text-sm font-black text-orange-300">
                  {data.length}
                </p>
              </div>

              <button
                onClick={loadData}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                ↻ Refresh Data
              </button>
            </div>
          </div>

        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Menunggu Persetujuan</p>
        <p className="mt-2 text-3xl font-bold text-amber-600">
          {data.length}
        </p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">
            Daftar Pengajuan Menunggu
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pengajuan yang belum diputuskan oleh admin.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Memuat data...
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            Belum ada pengajuan yang menunggu persetujuan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">No.</th>
                  <th className="px-5 py-4">Organisasi</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Barang / Ruangan</th>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">{index + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {item.organization_name || "-"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.organization_type || "-"} · {item.username || "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4">{item.borrowing_type}</td>
                    <td className="px-5 py-4">
                      {item.borrowing_type === "BARANG"
                        ? item.item_name || "-"
                        : item.room_name || "-"}
                    </td>
                    <td className="px-5 py-4">
                      {formatDate(item.borrowing_date)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => {
                          setSelected(item);
                          setAction("DISETUJUI");
                          setNote("");
                          setError("");
                        }}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Periksa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Periksa Pengajuan</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl text-slate-500"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Organisasi</p>
                <p className="font-semibold">
                  {selected.organization_name || "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Jenis Peminjaman</p>
                <p className="font-semibold">{selected.borrowing_type}</p>
              </div>

              <div>
                <p className="text-slate-500">Barang / Ruangan</p>
                <p className="font-semibold">
                  {selected.borrowing_type === "BARANG"
                    ? selected.item_name || "-"
                    : selected.room_name || "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500">Tanggal Mulai</p>
                  <p className="font-semibold">
                    {formatDate(selected.borrowing_date)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Tanggal Selesai</p>
                  <p className="font-semibold">
                    {formatDate(selected.return_date)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-slate-500">Waktu</p>
                <p className="font-semibold">
                  {selected.start_time || "-"} sampai {selected.end_time || "-"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Jumlah</p>
                <p className="font-semibold">
                  {selected.borrowing_type === "BARANG"
                    ? `${selected.quantity} unit`
                    : "1 ruangan"}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Keperluan</p>
                <p className="whitespace-pre-wrap font-medium">
                  {selected.purpose}
                </p>
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Keputusan Admin
                </label>
                <select
                  value={action}
                  onChange={(e) =>
                    setAction(e.target.value as "DISETUJUI" | "DITOLAK")
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                >
                  <option value="DISETUJUI">Setujui Pengajuan</option>
                  <option value="DITOLAK">Tolak Pengajuan</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Catatan Admin {action === "DITOLAK" ? "(Wajib)" : "(Opsional)"}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder={
                    action === "DITOLAK"
                      ? "Tuliskan alasan penolakan..."
                      : "Tambahkan catatan jika diperlukan..."
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setSelected(null)}
                disabled={processing}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold"
              >
                Batal
              </button>
              <button
                onClick={processApproval}
                disabled={processing}
                className={`flex-1 rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-50 ${
                  action === "DISETUJUI"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {processing
                  ? "Memproses..."
                  : action === "DISETUJUI"
                    ? "Setujui Pengajuan"
                    : "Tolak Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}