
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  stock: number;
  condition: string;
  image_url: string | null;
};

type Room = {
  id: number;
  room_code: string;
  room_name: string;
  building: string | null;
  facilities: string | null;
  image_url: string | null;
};

export default function PeminjamanPage() {
  const router = useRouter();

  const [jenis, setJenis] = useState("barang");
  const [items, setItems] = useState<Item[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [itemId, setItemId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [borrowingDate, setBorrowingDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedType = params.get("jenis");

    if (selectedType === "ruangan") {
      setJenis("ruangan");
    } else {
      setJenis("barang");
    }

    async function loadData() {
      try {
        const [itemResponse, roomResponse] = await Promise.all([
          fetch("/api/organisasi/barang"),
          fetch("/api/organisasi/ruangan"),
        ]);

        const itemData = await itemResponse.json();
        const roomData = await roomResponse.json();

        if (itemResponse.status === 401 || roomResponse.status === 401) {
          router.push("/login");
          return;
        }

        if (!itemResponse.ok) {
          throw new Error(itemData.message || "Gagal mengambil barang.");
        }

        if (!roomResponse.ok) {
          throw new Error(roomData.message || "Gagal mengambil ruangan.");
        }

        setItems(itemData.items || []);
        setRooms(roomData.rooms || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal mengambil data."
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        borrowing_type: jenis === "barang" ? "BARANG" : "RUANGAN",
        item_id: jenis === "barang" ? Number(itemId) : null,
        room_id: jenis === "ruangan" ? Number(roomId) : null,
        quantity: jenis === "barang" ? Number(quantity) : 1,
        borrowing_date: borrowingDate,
        return_date: returnDate,
        start_time: jenis === "ruangan" ? startTime : null,
        end_time: jenis === "ruangan" ? endTime : null,
        purpose,
      };

      const response = await fetch("/api/organisasi/peminjaman", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Pengajuan gagal.");
      }

      setSuccess("Pengajuan berhasil dikirim. Mengalihkan ke riwayat...");

      setTimeout(() => {
        router.push("/organisasi/riwayat");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3.5 text-sm text-slate-800 outline-none transition duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

  const labelClass =
    "mb-2.5 block text-sm font-bold text-slate-700";

  const today = new Date().toLocaleDateString("en-CA");
  const selectedItem = items.find((item) => item.id === Number(itemId));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07152e]">

      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#061329] via-[#0b1d42] to-[#101d46]" />

      <div className="pointer-events-none fixed -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-500/[0.12] blur-[140px]" />

      <div className="pointer-events-none fixed -bottom-48 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-500/[0.14] blur-[140px]" />

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* HEADER */}
      <header className="relative z-20 border-b border-white/[0.08] bg-[#07152e]/50 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">

          <a href="/organisasi" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-black text-white shadow-lg shadow-blue-500/20">
              S
            </div>

            <div>
              <h1 className="text-xl font-black tracking-[0.12em] text-white">
                BRAMASTRA
              </h1>
              <p className="mt-0.5 text-[10px] font-medium tracking-[0.16em] text-blue-200/70">
                CAMPUS INVENTORY SYSTEM
              </p>
            </div>
          </a>

          <a
            href="/organisasi"
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:border-blue-400/40 hover:bg-white/10 hover:text-white sm:text-sm"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Kembali
          </a>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-12 pt-8 md:px-8 md:pt-10">

        {/* MINIMALIST PAGE INTRO */}
        <div className="mb-7">
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Formulir{" "}
            <span className="bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">
              Peminjaman
            </span>
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400 md:text-base">
            Lengkapi formulir untuk mengajukan peminjaman barang atau ruangan.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="overflow-hidden rounded-[28px] border border-white/50 bg-white shadow-[0_30px_100px_-30px_rgba(0,0,0,0.5)]">

          {/* CARD TOP */}
          <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-[#f8faff] via-white to-[#f0f5ff] px-6 py-7 md:px-10">

            <div className="absolute -right-10 -top-20 h-48 w-48 rounded-full bg-blue-100/70 blur-3xl" />

            <div className="relative flex items-center justify-between gap-4">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl text-white shadow-lg shadow-blue-600/20">
                  📋
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-900 md:text-xl">
                    Detail Pengajuan
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 md:text-sm">
                    Lengkapi informasi peminjaman Anda.
                  </p>
                </div>

              </div>

              <div className="hidden rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:block">
                <span className="text-[10px] font-bold tracking-wider text-emerald-700">
                  ● FORM ONLINE
                </span>
              </div>

            </div>
          </div>

          <div className="p-6 md:p-10">

            {/* TYPE SELECTION */}
            <div className="mb-9">

              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-extrabold text-slate-800">
                  Pilih Jenis Peminjaman
                </label>

                <span className="text-[10px] font-semibold tracking-wider text-slate-400">
                  STEP 01
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* BARANG */}
                <button
                  type="button"
                  onClick={() => setJenis("barang")}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                    jenis === "barang"
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-[0_8px_25px_-12px_rgba(37,99,235,0.3)]"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5"
                  }`}
                >
                  {jenis === "barang" && (
                    <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-blue-100/60" />
                  )}

                  <div className="relative flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${
                      jenis === "barang"
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-slate-100 text-slate-600 group-hover:bg-blue-50"
                    }`}>
                      📦
                    </div>

                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      jenis === "barang"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}>
                      {jenis === "barang" && (
                        <span className="text-[10px] font-black text-white">✓</span>
                      )}
                    </div>
                  </div>

                  <h4 className="relative mt-5 text-base font-extrabold text-slate-900">
                    Peminjaman Barang
                  </h4>

                  <p className="relative mt-1.5 text-xs leading-6 text-slate-500">
                    Peralatan, perlengkapan, dan inventaris kampus.
                  </p>

                  {jenis === "barang" && (
                    <p className="relative mt-3 text-[10px] font-extrabold tracking-wider text-blue-700">
                      TERPILIH ✓
                    </p>
                  )}
                </button>

                {/* RUANGAN */}
                <button
                  type="button"
                  onClick={() => setJenis("ruangan")}
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                    jenis === "ruangan"
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-[0_8px_25px_-12px_rgba(37,99,235,0.3)]"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5"
                  }`}
                >
                  {jenis === "ruangan" && (
                    <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-blue-100/60" />
                  )}

                  <div className="relative flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${
                      jenis === "ruangan"
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                        : "bg-slate-100 text-slate-600 group-hover:bg-blue-50"
                    }`}>
                      🏢
                    </div>

                    <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      jenis === "ruangan"
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300"
                    }`}>
                      {jenis === "ruangan" && (
                        <span className="text-[10px] font-black text-white">✓</span>
                      )}
                    </div>
                  </div>

                  <h4 className="relative mt-5 text-base font-extrabold text-slate-900">
                    Peminjaman Ruangan
                  </h4>

                  <p className="relative mt-1.5 text-xs leading-6 text-slate-500">
                    Fasilitas ruangan untuk kegiatan organisasi kampus.
                  </p>

                  {jenis === "ruangan" && (
                    <p className="relative mt-3 text-[10px] font-extrabold tracking-wider text-blue-700">
                      TERPILIH ✓
                    </p>
                  )}
                </button>

              </div>
            </div>

            {/* FORM */}
            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600" />

                <p className="mt-5 text-sm font-semibold text-slate-600">
                  Sedang memuat data...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Mohon tunggu sebentar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">

                {/* INFORMASI PEMINJAMAN */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800">
                      Informasi Peminjaman
                    </h4>
                    <p className="mt-1 text-xs text-slate-400">
                      Masukkan detail barang atau ruangan.
                    </p>
                  </div>

                  <span className="text-[10px] font-bold tracking-wider text-slate-400">
                    STEP 02
                  </span>
                </div>

                {/* BARANG */}
                {jenis === "barang" ? (
                  <>
                    <div>
                      <label className={labelClass}>
                        Pilih Barang <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={itemId}
                        onChange={(e) => {
                          setItemId(e.target.value);
                          setQuantity("1");
                        }}
                        required
                        className={inputClass}
                      >
                        <option value="">Pilih barang yang ingin dipinjam</option>

                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.item_name} ({item.item_code}) - Stok: {item.stock}
                          </option>
                        ))}
                      </select>

                      {selectedItem && (
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
                          <div>
                            <p className="text-xs font-bold text-blue-900">
                              {selectedItem.item_name}
                            </p>
                            <p className="mt-1 text-[10px] text-blue-600">
                              Kode: {selectedItem.item_code}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-black text-blue-700">
                              {selectedItem.stock}
                            </p>
                            <p className="text-[10px] text-blue-500">
                              Stok tersedia
                            </p>
                          </div>
                        </div>
                      )}

                      {items.length === 0 && (
                        <p className="mt-2 text-xs font-medium text-amber-600">
                          Belum ada barang dengan stok tersedia.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={labelClass}>
                        Jumlah Barang <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="number"
                        min="1"
                        max={selectedItem?.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Masukkan jumlah barang"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className={labelClass}>
                      Pilih Ruangan <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      required
                      className={inputClass}
                    >
                      <option value="">Pilih ruangan yang ingin digunakan</option>

                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.room_name} ({room.room_code})
                          {room.building ? ` - ${room.building}` : ""}
                        </option>
                      ))}
                    </select>

                    {rooms.length === 0 && (
                      <p className="mt-2 text-xs font-medium text-amber-600">
                        Belum ada ruangan yang aktif.
                      </p>
                    )}
                  </div>
                )}

                {/* JADWAL */}
                <div>
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">
                        Jadwal Peminjaman
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">
                        Tentukan tanggal penggunaan.
                      </p>
                    </div>

                    <span className="text-[10px] font-bold tracking-wider text-slate-400">
                      STEP 03
                    </span>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Tanggal Peminjaman <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="date"
                        value={borrowingDate}
                        onChange={(e) => {
                          setBorrowingDate(e.target.value);

                          if (returnDate && returnDate < e.target.value) {
                            setReturnDate("");
                          }
                        }}
                        min={today}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Tanggal Pengembalian <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={borrowingDate || today}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* WAKTU RUANGAN */}
                {jenis === "ruangan" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Waktu Mulai <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Waktu Selesai <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                {/* KEPERLUAN */}
                <div>
                  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800">
                        Keperluan Peminjaman
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">
                        Jelaskan tujuan penggunaan.
                      </p>
                    </div>

                    <span className="text-[10px] font-bold tracking-wider text-slate-400">
                      STEP 04
                    </span>
                  </div>

                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={4}
                    required
                    minLength={5}
                    placeholder="Contoh: Digunakan untuk kegiatan seminar organisasi mahasiswa..."
                    className={`${inputClass} resize-none leading-7`}
                  />

                  <p className="mt-2 text-[11px] text-slate-400">
                    Pastikan tujuan peminjaman ditulis dengan jelas.
                  </p>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    <span className="text-lg">⚠️</span>
                    <p>{error}</p>
                  </div>
                )}

                {/* SUCCESS */}
                {success && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                    <span className="text-lg">✓</span>
                    <p>{success}</p>
                  </div>
                )}

                {/* SUBMIT */}
                <div className="border-t border-slate-100 pt-7">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      (jenis === "barang" && items.length === 0) ||
                      (jenis === "ruangan" && rooms.length === 0)
                    }
                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-4 text-sm font-extrabold tracking-wide text-white shadow-[0_10px_25px_-10px_rgba(37,99,235,0.6)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_30px_-10px_rgba(37,99,235,0.7)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Mengirim Pengajuan...
                      </>
                    ) : (
                      <>
                        Kirim Pengajuan
                        <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-center text-[11px] leading-6 text-slate-400">
                    Dengan mengirim pengajuan, pastikan seluruh informasi
                    yang dimasukkan telah sesuai.
                  </p>
                </div>

              </form>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-10 text-center">
          <p className="text-xs font-medium text-slate-400">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-slate-300">BRAMASTRA</span>
          </p>
          <p className="mt-1 text-[10px] tracking-wider text-slate-500">
            SISTEM INFORMASI PEMINJAMAN INVENTARIS KAMPUS
          </p>
        </footer>

      </div>
    </main>
  );
}
