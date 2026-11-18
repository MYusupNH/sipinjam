
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type LoginAccess = "admin" | "organisasi";

export default function LoginPage() {
  const router = useRouter();

  const [akses, setAkses] = useState<LoginAccess>("organisasi");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("akses");

    setAkses(access === "admin" ? "admin" : "organisasi");
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const tujuan = params.get("tujuan");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          akses,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login gagal.");
        return;
      }

      if (tujuan && akses === "organisasi") {
        sessionStorage.setItem("BRAMASTRA_tujuan", tujuan);
      }

      router.push(result.redirect || "/");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = akses === "admin";

  const features = isAdmin
    ? [
        "Pengelolaan inventaris kampus",
        "Pengelolaan akun UKM dan ORMAWA",
        "Persetujuan peminjaman",
        "Monitoring pengembalian",
      ]
    : [
        "Pengajuan peminjaman barang",
        "Pengajuan penggunaan ruangan",
        "Pemantauan status pengajuan",
        "Riwayat peminjaman organisasi",
      ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fc] px-4 py-8 sm:px-6">

      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_25px_80px_rgba(15,40,90,0.15)] lg:grid-cols-[1.05fr_0.95fr]">

        {/* LEFT PANEL */}
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#071a3e] via-[#103d83] to-[#2368c5] p-8 text-white sm:p-12 lg:min-h-[690px] lg:p-14">

          {/* DECORATION */}
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute right-10 top-1/2 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />

          <div className="relative z-10">

            {/* LOGO */}
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-xl">
                <Image
                  src="/logo.png"
                  alt="Logo BRAMASTRA"
                  fill
                  sizes="56px"
                  className="object-contain p-1.5"
                />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-wide">
                  BRAMASTRA<span className="text-orange-400">.</span>
                </h1>
                <p className="text-[10px] font-semibold tracking-[0.16em] text-blue-200">
                  SISTEM INFORMASI PEMINJAMAN
                </p>
              </div>
            </div>

            {/* WELCOME */}
            <div className="mt-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-black tracking-wider text-blue-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                {isAdmin ? "ADMINISTRATOR ACCESS" : "ORGANIZATION ACCESS"}
              </div>

              <h2 className="mt-7 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Selamat Datang
                <span className="mt-2 block text-blue-300">
                  {isAdmin ? "Admin Kampus." : "Organisasi Mahasiswa."}
                </span>
              </h2>

              <div className="mt-5 h-1.5 w-20 rounded-full bg-orange-400" />

              <p className="mt-6 max-w-md text-sm leading-8 text-blue-100">
                {isAdmin
                  ? "Kelola inventaris, data ruangan, akun organisasi, serta persetujuan peminjaman kampus melalui satu sistem terintegrasi."
                  : "Ajukan peminjaman barang dan ruangan kampus, pantau status pengajuan, serta kelola aktivitas organisasi dengan lebih mudah."}
              </p>
            </div>

            {/* FEATURES */}
            <div className="mt-10 space-y-4">
              {features.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-black text-orange-300">
                    ✓
                  </span>
                  <span className="text-sm font-medium text-blue-50">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM */}
          <div className="relative z-10 mt-12 border-t border-white/15 pt-6">
            <p className="text-xs font-semibold text-blue-200">
              MUDAH · TERTIB · TERINTEGRASI
            </p>
            <p className="mt-2 text-[11px] text-blue-300/80">
              Sistem Informasi Peminjaman Inventaris Kampus
            </p>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-12 lg:px-14">

          <div className="w-full max-w-md">

            {/* HEADING */}
            <div className="mb-8">
              <div className="mb-4 h-1.5 w-14 rounded-full bg-orange-400" />

              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                ACCOUNT AUTHENTICATION
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#0b1d43] sm:text-4xl">
                Masuk Akun
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Silakan masuk menggunakan akun yang telah terdaftar
                untuk mengakses layanan BRAMASTRA.
              </p>
            </div>

            {/* ACCOUNT TYPE */}
            <div className="mb-8">
              <label className="mb-3 block text-xs font-black uppercase tracking-wider text-slate-600">
                Pilih Jenis Akun
              </label>

              <div className="grid grid-cols-2 gap-3">

                <a
                  href="/login?akses=admin"
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                    isAdmin
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-2xl">⚙</span>
                  <span className="text-xs font-black">Admin</span>
                </a>

                <a
                  href="/login?akses=organisasi"
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition ${
                    !isAdmin
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-2xl">👥</span>
                  <span className="text-xs font-black">UKM / ORMAWA</span>
                </a>

              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-bold text-[#0b1d43]">
                  Username
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-blue-500">
                    ♙
                  </span>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#0b1d43]">
                  Password
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-blue-500">
                    ◈
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-24 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-700 hover:text-orange-500"
                  >
                    {showPassword ? "Sembunyikan" : "Lihat"}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  <span className="font-black">!</span>
                  <p>{error}</p>
                </div>
              )}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#0b285b] to-blue-700 px-5 py-4 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk sebagai {isAdmin ? "Admin" : "Organisasi"}
                    <span className="text-lg text-orange-300 transition group-hover:translate-x-1">
                      →
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* BACK */}
            <a
              href="/"
              className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-700"
            >
              <span>←</span>
              Kembali ke Beranda
            </a>

            <div className="mt-8 border-t border-slate-100 pt-5 text-center">
              <p className="text-[11px] font-medium text-slate-400">
                © 2026 BRAMASTRA · Sistem Informasi Peminjaman
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
