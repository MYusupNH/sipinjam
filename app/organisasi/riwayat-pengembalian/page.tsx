
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Borrowing = {
  id: number;
  borrowing_type: string;
  item_name: string | null;
  room_name: string | null;
  quantity: number;
  borrowing_date: string;
  return_date: string | null;
  purpose: string;
  status: string;
  return_photo_url: string | null;
  return_note: string | null;
  return_submitted_at: string | null;
  return_rejection_note: string | null;
  return_rejected_at: string | null;
  received_note: string | null;
  received_at: string | null;
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DIPINJAM: "Sedang Dipinjam",
    MENUNGGU_PENGEMBALIAN: "Menunggu Verifikasi",
    DITOLAK_PENGEMBALIAN: "Pengembalian Ditolak",
    SELESAI: "Pengembalian Selesai",
    DISETUJUI: "Disetujui",
  };

  return labels[status] || status.replaceAll("_", " ");
}

function statusColor(status: string) {
  if (status === "SELESAI") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "MENUNGGU_PENGEMBALIAN") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "DITOLAK_PENGEMBALIAN") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-blue-200 bg-blue-50 text-blue-700";
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RiwayatPengembalianPage() {
  const router = useRouter();

  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Borrowing | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  async function loadData() {
    try {
      setLoading(true);

      const response = await fetch("/api/organisasi/pengembalian", {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data.");
      }

      setBorrowings(data.borrowings || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openForm(borrowing: Borrowing) {
    setSelected(borrowing);
    setPhoto(null);
    setPreview("");
    setNote("");
    setMessage("");
  }

  function closeForm() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setSelected(null);
    setPhoto(null);
    setPreview("");
    setNote("");
  }

  function handlePhoto(file: File | undefined) {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Gunakan foto JPG, PNG, atau WEBP.");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 5 MB.");
      setMessageType("error");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  }

  async function submitReturn() {
    if (!selected || !photo || !note.trim()) {
      setMessage("Foto dan keterangan kondisi wajib diisi.");
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", photo);
      formData.append("type", "pengembalian");
      formData.append("borrowing_id", String(selected.id));

      const uploadResponse = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Upload foto gagal.");
      }

      if (!uploadData.url) {
        throw new Error("URL foto tidak ditemukan dari hasil upload.");
      }

      const response = await fetch("/api/organisasi/pengembalian", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selected.id,
          photo_url: uploadData.url,
          note: note.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pengajuan gagal.");
      }

      closeForm();
      await loadData();

      setMessage("Pengajuan pengembalian berhasil dikirim.");
      setMessageType("success");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  const total = borrowings.length;

  const waiting = borrowings.filter(
    (item) => item.status === "MENUNGGU_PENGEMBALIAN"
  ).length;

  const rejected = borrowings.filter(
    (item) => item.status === "DITOLAK_PENGEMBALIAN"
  ).length;

  const completed = borrowings.filter(
    (item) => item.status === "SELESAI"
  ).length;

  const statistics = [
    {
      label: "Total Riwayat",
      value: total,
      icon: "📋",
      color: "from-blue-100 to-indigo-100",
    },
    {
      label: "Menunggu Verifikasi",
      value: waiting,
      icon: "⏳",
      color: "from-amber-100 to-orange-100",
    },
    {
      label: "Pengembalian Ditolak",
      value: rejected,
      icon: "⚠️",
      color: "from-red-100 to-rose-100",
    },
    {
      label: "Pengembalian Selesai",
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
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#071a3e] via-[#103d83] to-[#2368c5] shadow-2xl">
          <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full border-[50px] border-white/[0.04]" />
          <div className="absolute -bottom-40 left-[35%] h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute right-10 top-5 h-32 w-32 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative flex min-h-[240px] flex-col justify-center px-7 py-10 sm:px-10 lg:px-14">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-blue-100">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              ORGANIZATION RETURN HISTORY
            </div>

            <p className="mt-7 text-sm font-semibold text-blue-200">
              Layanan Organisasi
            </p>

            <h2 className="mt-1 text-3xl font-black leading-tight text-white sm:text-5xl">
              Riwayat Pengembalian
              <span className="text-orange-400">.</span>
            </h2>

            <div className="mt-4 flex max-w-2xl gap-3">
              <div className="w-1 shrink-0 rounded-full bg-orange-400" />
              <p className="text-sm leading-7 text-blue-50 sm:text-base">
                Kelola pengembalian barang dan ruangan yang telah dipinjam.
                Unggah foto kondisi pengembalian dan pantau proses verifikasi
                oleh Super Admin melalui BRAMASTRA.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white">
                📦 Pengembalian Barang
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white">
                🏢 Pengembalian Ruangan
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white">
                ✓ Verifikasi Admin
              </span>
            </div>
          </div>
        </section>

        {/* STATISTIK */}
        <section className="mt-10">
          <div className="mb-6">
            <div className="mb-3 h-1.5 w-16 rounded-full bg-orange-400" />
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
              RETURN OVERVIEW
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#0b1d43] sm:text-3xl">
              Ringkasan Pengembalian
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Informasi status seluruh pengembalian organisasi Anda.
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

        {/* DAFTAR PENGEMBALIAN */}
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-3 h-1.5 w-16 rounded-full bg-orange-400" />

              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                RETURN MANAGEMENT
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#0b1d43] sm:text-3xl">
                Daftar Pengembalian
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Pantau pengajuan dan bukti foto pengembalian barang maupun
                ruangan.
              </p>
            </div>

            <Link
              href="/organisasi/riwayat"
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-5 py-3 text-xs font-bold text-[#0b285b] shadow-sm transition hover:bg-blue-50"
            >
              ← Riwayat Peminjaman
            </Link>
          </div>

          {message && (
            <div
              className={`mt-6 rounded-2xl border p-4 text-sm font-medium ${
                messageType === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {loading ? (
            <div className="mt-7 rounded-[1.8rem] border border-blue-100 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
              <p className="mt-4 text-sm font-semibold text-slate-500">
                Memuat riwayat pengembalian...
              </p>
            </div>
          ) : borrowings.length === 0 ? (
            <div className="mt-7 rounded-[1.8rem] border border-blue-100 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 text-5xl">
                📦
              </div>

              <span className="mt-6 inline-flex rounded-full bg-blue-100 px-4 py-2 text-[10px] font-black text-blue-700">
                NO RETURN HISTORY
              </span>

              <h3 className="mt-4 text-xl font-black text-[#0b1d43]">
                Belum Ada Riwayat Pengembalian
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Riwayat pengembalian akan muncul setelah organisasi memiliki
                peminjaman yang sudah disetujui dan diserahkan.
              </p>

              <Link
                href="/organisasi/riwayat"
                className="mt-6 inline-flex rounded-full bg-[#0b285b] px-6 py-3 text-xs font-bold text-white transition hover:bg-blue-600"
              >
                Lihat Riwayat Peminjaman →
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
                  <div className="absolute -right-12 -top-28 h-64 w-64 rounded-full bg-blue-100/40 blur-2xl" />

                  {/* INFORMASI PEMINJAMAN */}
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
                          {" · "}Tanggal pinjam:{" "}
                          {formatDate(item.borrowing_date)}
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

                  {/* TANGGAL */}
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
                        RENCANA PENGEMBALIAN
                      </p>

                      <p className="mt-2 text-sm font-bold text-[#0b1d43]">
                        {formatDate(item.return_date)}
                      </p>
                    </div>
                  </div>

                  {/* HANYA FOTO PENGEMBALIAN ORGANISASI */}
                  <div className="relative mx-6 mb-6 overflow-hidden rounded-[1.5rem] border border-orange-200 bg-white sm:mx-8">
                    <div className="flex items-center gap-3 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-amber-50 p-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl">
                        📦
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600">
                          RETURN SUBMISSION
                        </p>

                        <h4 className="mt-1 text-sm font-black text-[#0b1d43]">
                          Bukti Foto Pengembalian
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Foto kondisi barang atau ruangan yang diunggah oleh
                          Organisasi/UKM.
                        </p>
                      </div>
                    </div>

                    <div className="p-5">
                      {item.return_photo_url ? (
                        <div className="grid gap-5 md:grid-cols-[280px_1fr]">
                          <a
                            href={item.return_photo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="group/image relative block overflow-hidden rounded-2xl border border-orange-100"
                          >
                            <Image
                              src={item.return_photo_url}
                              alt="Foto bukti pengembalian"
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
                            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1.5 text-[10px] font-black text-orange-700">
                              BUKTI PENGEMBALIAN
                            </span>

                            <p className="mt-4 text-[10px] font-black uppercase tracking-wide text-slate-400">
                              KETERANGAN ORGANISASI
                            </p>

                            <p className="mt-2 text-sm leading-6 text-slate-700">
                              {item.return_note || "Tidak ada catatan."}
                            </p>

                            <p className="mt-4 text-[10px] text-slate-400">
                              Waktu pengajuan:{" "}
                              {formatDateTime(item.return_submitted_at)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-5 py-10 text-center">
                          <span className="text-4xl">📷</span>

                          <p className="mt-3 text-sm font-bold text-[#0b1d43]">
                            Belum Ada Foto Pengembalian
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Unggah foto kondisi barang atau ruangan saat
                            mengajukan pengembalian.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* JIKA DITOLAK */}
                  {item.status === "DITOLAK_PENGEMBALIAN" && (
                    <div className="relative mx-6 mb-5 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-5 sm:mx-8">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg">
                          ⚠️
                        </div>

                        <div>
                          <p className="text-sm font-black text-red-800">
                            Pengembalian Ditolak
                          </p>

                          <p className="mt-2 text-xs leading-6 text-red-700">
                            <strong>Alasan:</strong>{" "}
                            {item.return_rejection_note ||
                              "Tidak ada alasan yang dicantumkan."}
                          </p>

                          {item.return_rejected_at && (
                            <p className="mt-2 text-[10px] text-red-500">
                              Ditolak: {formatDateTime(item.return_rejected_at)}
                            </p>
                          )}

                          <p className="mt-2 text-xs leading-6 text-red-600">
                            Silakan perbaiki kondisi barang atau lengkapi
                            kekurangan, kemudian ajukan pengembalian kembali.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* JIKA SELESAI */}
                  {item.status === "SELESAI" && (
                    <div className="relative mx-6 mb-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-5 sm:mx-8">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-lg">
                          ✓
                        </div>

                        <div>
                          <p className="text-sm font-black text-emerald-800">
                            Pengembalian Telah Disetujui
                          </p>

                          {item.received_note && (
                            <p className="mt-2 text-xs leading-6 text-emerald-700">
                              Catatan Admin: {item.received_note}
                            </p>
                          )}

                          {item.received_at && (
                            <p className="mt-2 text-[10px] text-emerald-600">
                              Diverifikasi: {formatDateTime(item.received_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STATUS DAN TOMBOL */}
                  <div className="relative flex flex-col gap-4 border-t border-blue-50 bg-gradient-to-r from-white to-blue-50/70 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                        STATUS PENGEMBALIAN
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {item.return_submitted_at
                          ? `Diajukan pada ${formatDateTime(
                              item.return_submitted_at
                            )}`
                          : "Belum ada pengajuan pengembalian"}
                      </p>
                    </div>

                    {(item.status === "DIPINJAM" ||
                      item.status === "DITOLAK_PENGEMBALIAN") && (
                      <button
                        onClick={() => openForm(item)}
                        className={`inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 text-xs font-bold text-white shadow-lg transition ${
                          item.status === "DITOLAK_PENGEMBALIAN"
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-[#0b285b] hover:bg-blue-600"
                        }`}
                      >
                        {item.status === "DITOLAK_PENGEMBALIAN"
                          ? "Ajukan Ulang Pengembalian"
                          : "Ajukan Pengembalian"}

                        <span className="text-base">→</span>
                      </button>
                    )}

                    {item.status === "MENUNGGU_PENGEMBALIAN" && (
                      <div className="inline-flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-5 py-3">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />

                        <span className="text-xs font-bold text-amber-700">
                          Menunggu Verifikasi Super Admin
                        </span>
                      </div>
                    )}

                    {item.status === "SELESAI" && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3">
                        <span className="text-sm text-emerald-600">✓</span>

                        <span className="text-xs font-bold text-emerald-700">
                          Pengembalian Selesai
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-slate-200 py-7 text-center sm:flex-row sm:gap-6">
          <div className="hidden h-px flex-1 bg-slate-200 sm:block" />

          <p className="text-xs font-medium text-slate-500">
            © 2026 BRAMASTRA · Sistem Informasi Peminjaman
          </p>

          <div className="hidden h-px flex-1 bg-slate-200 sm:block" />
        </footer>
      </div>

      {/* MODAL FORMULIR PENGEMBALIAN */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#071a3e]/70 p-4 backdrop-blur-sm">
          <div className="my-6 w-full max-w-xl overflow-hidden rounded-[1.8rem] border border-blue-100 bg-white shadow-2xl">
            <div className="relative overflow-hidden bg-gradient-to-r from-[#071a3e] via-[#103d83] to-[#2368c5] px-6 py-7 text-white sm:px-8">
              <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-orange-400/20 blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[9px] font-black tracking-widest text-blue-100">
                    RETURN FORM
                  </span>

                  <h2 className="mt-3 text-xl font-black sm:text-2xl">
                    Formulir Pengembalian
                    <span className="text-orange-400">.</span>
                  </h2>

                  <p className="mt-2 text-xs text-blue-100">
                    Peminjaman #{selected.id}
                  </p>
                </div>

                <button
                  onClick={closeForm}
                  disabled={submitting}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xl transition hover:bg-orange-500 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8">
              {selected.status === "DITOLAK_PENGEMBALIAN" && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-black text-red-800">
                    Perbaiki Pengembalian Sebelumnya
                  </p>

                  <p className="mt-2 text-xs leading-6 text-red-700">
                    {selected.return_rejection_note ||
                      "Tidak ada alasan yang dicantumkan."}
                  </p>
                </div>
              )}

              {/* INPUT FOTO */}
              <div>
                <label className="mb-2 block text-sm font-black text-[#0b1d43]">
                  Foto Kondisi Barang/Ruangan
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      handlePhoto(event.target.files?.[0])
                    }
                    className="w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-[#0b285b] file:px-4 file:py-2.5 file:text-xs file:font-bold file:text-white hover:file:bg-blue-600"
                  />

                  <p className="mt-3 text-[10px] leading-5 text-slate-400">
                    Format JPG, PNG, atau WEBP. Ukuran maksimal 5 MB.
                    Unggah foto terbaru yang memperlihatkan kondisi barang
                    atau ruangan saat dikembalikan.
                  </p>

                  {preview && (
                    <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-white p-2">
                      <Image
                        src={preview}
                        alt="Preview foto pengembalian"
                        width={600}
                        height={400}
                        unoptimized
                        className="h-52 w-full rounded-xl object-cover"
                      />

                      <p className="mt-2 text-center text-[10px] font-semibold text-emerald-600">
                        ✓ Foto siap diunggah
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* KETERANGAN */}
              <div>
                <label className="mb-2 block text-sm font-black text-[#0b1d43]">
                  Keterangan Kondisi Pengembalian
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  rows={4}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Jelaskan kondisi barang/ruangan, jumlah yang dikembalikan, serta informasi lainnya..."
                  className="w-full rounded-2xl border border-blue-100 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />

                <p className="mt-2 text-[10px] text-slate-400">
                  Pastikan keterangan sesuai dengan kondisi barang atau
                  ruangan yang dikembalikan.
                </p>
              </div>

              {message && messageType === "error" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  {message}
                </div>
              )}

              {/* TOMBOL FORM */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  onClick={closeForm}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  onClick={submitReturn}
                  disabled={submitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0b285b] px-5 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Mengirim Pengajuan...
                    </>
                  ) : (
                    <>
                      Kirim Pengajuan
                      <span className="text-base">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
