"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Borrowing = {
  id: number;
  borrowing_type: string;
  organization_name: string | null;
  organization_type: string | null;
  item_name: string | null;
  room_name: string | null;
  quantity: number;
  borrowing_date: string;
  return_date: string | null;
  purpose: string;
  status: string;
  handover_photo_url: string | null;
  handover_note: string | null;
  handed_over_at: string | null;
  return_photo_url: string | null;
  return_note: string | null;
  return_submitted_at: string | null;
  return_rejection_note: string | null;
  received_note: string | null;
  received_at: string | null;
};

const filters = [
  { label: "Semua", value: "SEMUA" },
  { label: "Sedang Dipinjam", value: "DIPINJAM" },
  { label: "Menunggu Verifikasi", value: "MENUNGGU_PENGEMBALIAN" },
  { label: "Ditolak", value: "DITOLAK_PENGEMBALIAN" },
  { label: "Selesai", value: "SELESAI" },
];

function formatDate(value: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; style: string }> = {
    DISETUJUI: {
      label: "Disetujui",
      style: "bg-blue-50 text-blue-700 border-blue-100",
    },
    DIPINJAM: {
      label: "Sedang Dipinjam",
      style: "bg-violet-50 text-violet-700 border-violet-100",
    },
    MENUNGGU_PENGEMBALIAN: {
      label: "Menunggu Verifikasi",
      style: "bg-amber-50 text-amber-700 border-amber-100",
    },
    DITOLAK_PENGEMBALIAN: {
      label: "Pengembalian Ditolak",
      style: "bg-rose-50 text-rose-700 border-rose-100",
    },
    SELESAI: {
      label: "Selesai",
      style: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
  };

  const item = config[status] || {
    label: status,
    style: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-bold ${item.style}`}
    >
      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}

export default function AdminPengembalianPage() {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Borrowing | null>(null);
  const [action, setAction] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("SEMUA");

  async function loadData() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/pengembalian", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data.");
      }

      setBorrowings(data.borrowings || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAction(item: Borrowing, type: string) {
    setSelected(item);
    setAction(type);
    setNote("");
    setPhoto(null);
    setPreview("");
    setMessage("");
  }

  function closeModal() {
    setSelected(null);
    setAction("");
    setNote("");
    setPhoto(null);
    setPreview("");
  }

  function handlePhoto(file: File | undefined) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Gunakan foto JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 5 MB.");
      return;
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  }

  async function submitAction() {
    if (!selected) return;

    if (action === "SERAH_TERIMA" && !photo) {
      setMessage("Foto serah terima wajib diunggah.");
      return;
    }

    if (action === "TOLAK_PENGEMBALIAN" && !note.trim()) {
      setMessage("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      let photoUrl = "";

      if (action === "SERAH_TERIMA" && photo) {
        const formData = new FormData();
        formData.append("file", photo);
        formData.append("type", "serah_terima");
        formData.append("borrowing_id", String(selected.id));

        const uploadResponse = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Upload foto gagal.");
        }

        photoUrl = uploadData.url;
      }

      const response = await fetch("/api/admin/pengembalian", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          action,
          photo_url: photoUrl,
          note: note.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memproses data.");
      }

      closeModal();
      await loadData();
      setMessage(data.message || "Berhasil diproses.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const waiting = borrowings.filter(
    (item) => item.status === "MENUNGGU_PENGEMBALIAN"
  ).length;

  const borrowed = borrowings.filter(
    (item) => item.status === "DIPINJAM"
  ).length;

  const rejected = borrowings.filter(
    (item) => item.status === "DITOLAK_PENGEMBALIAN"
  ).length;

  const completed = borrowings.filter(
    (item) => item.status === "SELESAI"
  ).length;

  const filtered = borrowings.filter((item) => {
    if (filter === "SEMUA") return true;
    return item.status === filter;
  });

  const statistics = [
    {
      label: "Sedang Dipinjam",
      value: borrowed,
      icon: "⇄",
      color: "blue",
    },
    {
      label: "Menunggu Verifikasi",
      value: waiting,
      icon: "◷",
      color: "orange",
    },
    {
      label: "Pengembalian Ditolak",
      value: rejected,
      icon: "×",
      color: "rose",
    },
    {
      label: "Selesai",
      value: completed,
      icon: "✓",
      color: "green",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F7FC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* HEADER */}
        <section className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-[#071A3E] via-[#123B78] to-[#2368C5] px-4 py-3 text-white shadow-md shadow-blue-950/10 md:px-5 md:py-4">

          <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />
          <div className="absolute -bottom-16 right-28 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />

          <div className="relative z-10">

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-100 transition hover:text-white"
              >
                ← Kembali ke Dashboard
              </Link>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[8px] font-bold tracking-[0.15em] text-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
                BRAMASTRA ADMINISTRATOR
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-lg font-black tracking-tight md:text-xl">
                  Pengelolaan Pengembalian
                </h1>

                <p className="mt-1 max-w-2xl text-[11px] leading-5 text-blue-100 md:text-xs">
                  Kelola dan verifikasi proses pengembalian inventaris
                  maupun ruangan dari ORMAWA dan UKM. Periksa bukti foto,
                  kondisi barang, serta konfirmasi pengembalian.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                    Total Data
                  </p>
                  <p className="text-sm font-black">{borrowings.length}</p>
                </div>

                <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                    Perlu Verifikasi
                  </p>
                  <p className="text-sm font-black text-orange-300">
                    {waiting}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* MESSAGE */}
        {message && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-700">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="font-bold text-blue-500"
            >
              ×
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <section>
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1 w-7 rounded-full bg-[#FB923C]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2368C5]">
                Overview
              </span>
            </div>

            <h2 className="text-xl font-black text-[#071A3E]">
              Ringkasan Pengembalian
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Statistik seluruh proses pengembalian peminjaman.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((item) => (
              <div
                key={item.label}
                className="group relative overflow-hidden rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-slate-50 transition group-hover:scale-125" />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      {item.label}
                    </p>

                    <p className="mt-4 text-3xl font-black text-[#071A3E]">
                      {item.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl font-bold ${
                      item.color === "blue"
                        ? "bg-blue-50 text-blue-600"
                        : item.color === "orange"
                        ? "bg-orange-50 text-orange-500"
                        : item.color === "rose"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {item.icon}
                  </div>
                </div>

                <div className="relative mt-5 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    Data pengembalian BRAMASTRA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FILTER */}
        <section className="rounded-[22px] border border-slate-100 bg-white p-5 shadow-sm md:p-6">

          <div className="mb-5">
            <h2 className="text-base font-black text-[#071A3E]">
              Daftar Pengembalian
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Pilih kategori untuk melihat data pengembalian.
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  filter === item.value
                    ? "bg-[#123B78] text-white shadow-md shadow-blue-900/15"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-[#2368C5]"
                }`}
              >
                {item.label}
                {item.value === "MENUNGGU_PENGEMBALIAN" && (
                  <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                    {waiting}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* LIST */}
        {loading ? (
          <div className="rounded-[22px] border border-slate-100 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-blue-100 border-t-[#2368C5]" />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Memuat data pengembalian...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[22px] border border-slate-100 bg-white px-5 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl text-[#2368C5]">
              ▤
            </div>

            <h3 className="mt-4 font-bold text-[#071A3E]">
              Tidak Ada Data Pengembalian
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Belum ada data pada kategori yang dipilih.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {filtered.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
              >

                {/* CARD HEADER */}
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between md:p-6">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-[#2368C5]">
                      {item.borrowing_type === "BARANG" ? "▣" : "▤"}
                    </div>

                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        Peminjaman #{item.id}
                      </p>

                      <h2 className="mt-1 text-lg font-black text-[#071A3E]">
                        {item.borrowing_type === "BARANG"
                          ? item.item_name || "Barang"
                          : item.room_name || "Ruangan"}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.organization_name || "Organisasi"}
                        <span className="mx-2 text-slate-300">•</span>
                        {item.organization_type || "ORMAWA / UKM"}
                      </p>
                    </div>

                  </div>

                  <StatusBadge status={item.status} />

                </div>

                {/* DETAIL */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 bg-[#FAFBFE] px-5 py-4 md:grid-cols-4 md:px-6">

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Jenis Peminjaman
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#071A3E]">
                      {item.borrowing_type}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Jumlah
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#071A3E]">
                      {item.quantity} unit
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tanggal Pinjam
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#071A3E]">
                      {formatDate(item.borrowing_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tanggal Kembali
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#071A3E]">
                      {formatDate(item.return_date)}
                    </p>
                  </div>

                </div>

                {/* PHOTO SECTION */}
                <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">

                  {/* HANDOVER */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-[#071A3E]">
                          Foto Serah Terima
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Bukti penyerahan dari admin.
                        </p>
                      </div>

                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                        SERAH TERIMA
                      </span>
                    </div>

                    {item.handover_photo_url ? (
                      <a
                        href={item.handover_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block overflow-hidden rounded-2xl bg-slate-100"
                      >
                        <Image
                          src={item.handover_photo_url}
                          alt="Foto serah terima"
                          width={600}
                          height={400}
                          unoptimized
                          className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                          <span className="text-xs font-bold text-white">
                            Lihat Foto →
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                        <span className="text-3xl text-slate-300">▧</span>
                        <p className="mt-2 text-xs text-slate-400">
                          Belum ada foto serah terima
                        </p>
                      </div>
                    )}

                    {item.handover_note && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Catatan Admin
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {item.handover_note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RETURN */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black text-[#071A3E]">
                          Foto Pengembalian
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Bukti kondisi dari organisasi.
                        </p>
                      </div>

                      <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-600">
                        PENGEMBALIAN
                      </span>
                    </div>

                    {item.return_photo_url ? (
                      <a
                        href={item.return_photo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block overflow-hidden rounded-2xl bg-slate-100"
                      >
                        <Image
                          src={item.return_photo_url}
                          alt="Foto pengembalian"
                          width={600}
                          height={400}
                          unoptimized
                          className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                          <span className="text-xs font-bold text-white">
                            Lihat Foto →
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                        <span className="text-3xl text-slate-300">▧</span>
                        <p className="mt-2 text-xs text-slate-400">
                          Belum ada foto pengembalian
                        </p>
                      </div>
                    )}

                    {item.return_note && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Keterangan Organisasi
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {item.return_note}
                        </p>
                      </div>
                    )}
                  </div>

                </div>

                {/* REJECTION NOTE */}
                {item.status === "DITOLAK_PENGEMBALIAN" &&
                  item.return_rejection_note && (
                    <div className="mx-5 mb-5 rounded-2xl border border-rose-100 bg-rose-50 p-4 md:mx-6">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 font-bold text-rose-600">
                          !
                        </span>

                        <div>
                          <p className="text-xs font-black text-rose-800">
                            Alasan Penolakan Sebelumnya
                          </p>
                          <p className="mt-1 text-sm leading-6 text-rose-700">
                            {item.return_rejection_note}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* ACTIONS */}
                <div className="flex flex-col gap-3 border-t border-slate-100 bg-[#FAFBFE] p-5 sm:flex-row sm:items-center sm:justify-between md:px-6">

                  <div>
                    <p className="text-xs font-bold text-[#071A3E]">
                      Tindakan Administrator
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.status === "DISETUJUI"
                        ? "Catat proses penyerahan barang atau ruangan."
                        : item.status === "DIPINJAM"
                        ? "Menunggu organisasi mengajukan pengembalian."
                        : item.status === "MENUNGGU_PENGEMBALIAN"
                        ? "Periksa foto dan kondisi sebelum melakukan verifikasi."
                        : item.status === "DITOLAK_PENGEMBALIAN"
                        ? "Menunggu organisasi memperbaiki pengajuan."
                        : "Proses pengembalian telah selesai."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    {item.status === "DISETUJUI" && (
                      <button
                        onClick={() => openAction(item, "SERAH_TERIMA")}
                        className="rounded-xl bg-[#2368C5] px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#123B78]"
                      >
                        Catat Serah Terima →
                      </button>
                    )}

                    {item.status === "MENUNGGU_PENGEMBALIAN" && (
                      <>
                        <button
                          onClick={() =>
                            openAction(item, "SETUJUI_PENGEMBALIAN")
                          }
                          className="rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-emerald-700"
                        >
                          ✓ Setujui Pengembalian
                        </button>

                        <button
                          onClick={() =>
                            openAction(item, "TOLAK_PENGEMBALIAN")
                          }
                          className="rounded-xl border border-rose-200 bg-white px-5 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
                        >
                          Tolak Pengembalian
                        </button>
                      </>
                    )}

                    {item.status === "DIPINJAM" && (
                      <span className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs font-semibold text-violet-700">
                        Menunggu pengembalian
                      </span>
                    )}

                    {item.status === "DITOLAK_PENGEMBALIAN" && (
                      <span className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
                        Perlu diperbaiki organisasi
                      </span>
                    )}

                    {item.status === "SELESAI" && (
                      <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
                        ✓ Pengembalian terverifikasi
                      </span>
                    )}

                  </div>
                </div>

              </article>
            ))}

          </div>
        )}

        {/* FOOTER */}
        <section className="flex flex-col justify-between gap-4 rounded-[22px] border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-5 sm:flex-row sm:items-center md:p-6">

          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#071A3E] text-sm font-black text-white">
                S
              </span>

              <h3 className="font-black text-[#071A3E]">
                BRAMASTRA Information System
              </h3>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Sistem Informasi Peminjaman Inventaris Kampus.
            </p>
          </div>

          <span className="w-fit rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-xs font-extrabold text-[#2368C5]">
            SUPER ADMIN PANEL
          </span>

        </section>

      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#071A3E]/60 p-4 backdrop-blur-sm">

          <div className="my-6 w-full max-w-lg overflow-hidden rounded-[24px] bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#071A3E] to-[#2368C5] p-6 text-white">

              <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border-[18px] border-white/10" />

              <div className="relative flex items-start justify-between">

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200">
                    BRAMASTRA ADMINISTRATOR
                  </span>

                  <h2 className="mt-3 text-xl font-black">
                    {action === "SERAH_TERIMA"
                      ? "Catat Serah Terima"
                      : action === "TOLAK_PENGEMBALIAN"
                      ? "Tolak Pengembalian"
                      : "Setujui Pengembalian"}
                  </h2>

                  <p className="mt-1 text-xs text-blue-100">
                    Peminjaman #{selected.id}
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-xl text-white transition hover:bg-white/20 disabled:opacity-50"
                >
                  ×
                </button>

              </div>
            </div>

            {/* MODAL BODY */}
            <div className="space-y-5 p-6">

              {action === "SERAH_TERIMA" && (
                <div>
                  <label className="mb-2 block text-xs font-bold text-[#071A3E]">
                    Foto Serah Terima *
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 text-center transition hover:bg-blue-50">

                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-[#2368C5] shadow-sm">
                      ↑
                    </span>

                    <span className="mt-3 text-sm font-bold text-[#071A3E]">
                      Pilih Foto
                    </span>

                    <span className="mt-1 text-[11px] text-slate-400">
                      JPG, PNG, WEBP · Maksimal 5 MB
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        handlePhoto(event.target.files?.[0])
                      }
                      className="hidden"
                    />
                  </label>

                  {photo && (
                    <p className="mt-2 text-xs font-medium text-emerald-600">
                      ✓ {photo.name}
                    </p>
                  )}

                  {preview && (
                    <Image
                      src={preview}
                      alt="Preview foto"
                      width={600}
                      height={400}
                      unoptimized
                      className="mt-4 h-48 w-full rounded-2xl object-cover"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold text-[#071A3E]">
                  {action === "TOLAK_PENGEMBALIAN"
                    ? "Alasan Penolakan *"
                    : "Catatan Admin"}
                </label>

                <textarea
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    action === "TOLAK_PENGEMBALIAN"
                      ? "Jelaskan alasan penolakan pengembalian..."
                      : "Tambahkan catatan jika diperlukan..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#2368C5] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {action === "TOLAK_PENGEMBALIAN" && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
                  Alasan penolakan akan ditampilkan kepada organisasi
                  agar mereka dapat memperbaiki kekurangan dan
                  mengajukan pengembalian ulang.
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                  {message}
                </div>
              )}

              {/* MODAL BUTTONS */}
              <div className="flex gap-3 border-t border-slate-100 pt-5">

                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  onClick={submitAction}
                  disabled={submitting}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 ${
                    action === "TOLAK_PENGEMBALIAN"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : action === "SETUJUI_PENGEMBALIAN"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-[#2368C5] hover:bg-[#123B78]"
                  }`}
                >
                  {submitting
                    ? "Memproses..."
                    : action === "TOLAK_PENGEMBALIAN"
                    ? "Kirim Penolakan"
                    : action === "SERAH_TERIMA"
                    ? "Simpan Serah Terima"
                    : "Setujui Pengembalian"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}