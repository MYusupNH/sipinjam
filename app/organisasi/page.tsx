import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrganizationSession } from "@/lib/auth";

function CampusIllustration() {
  return (
    <div className="relative flex h-full min-h-[240px] items-center justify-center overflow-hidden">
      <div className="absolute right-8 top-5 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-blue-950/50 to-transparent" />

      <div className="relative z-10 w-full max-w-[440px] px-5">
        <div className="absolute -right-1 top-0 h-24 w-24 rounded-full border-[15px] border-orange-400/30" />

        <div className="relative mx-auto max-w-[350px]">
          <div className="absolute -bottom-5 left-0 h-5 w-full skew-x-[-20deg] rounded-b-xl bg-slate-950/50" />

          <div className="relative overflow-hidden rounded-t-xl border border-white/30 bg-gradient-to-br from-slate-100 to-blue-200 shadow-2xl">
            <div className="flex h-9 items-center justify-between bg-[#0b2855] px-4">
              <span className="text-[10px] font-black tracking-widest text-white">
                UNIVERSITAS BSI
              </span>
              <span className="text-[8px] font-bold text-orange-300">
                CAMPUS
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 bg-gradient-to-b from-slate-200 to-blue-100 p-4">
              {Array.from({ length: 15 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 rounded-sm border border-blue-300/50 bg-gradient-to-b from-blue-500 to-blue-900 shadow-inner"
                >
                  <div className="mx-auto mt-2 h-7 w-1 bg-white/20" />
                </div>
              ))}
            </div>

            <div className="flex h-12 items-center justify-center bg-[#123568]">
              <span className="text-lg font-black tracking-[0.3em] text-white">
                UBSI
              </span>
            </div>
          </div>

          <div className="absolute -left-8 bottom-0 h-20 w-5 rounded-t-full bg-emerald-800" />
          <div className="absolute -left-12 bottom-5 h-16 w-16 rounded-full bg-emerald-700/80 blur-sm" />
          <div className="absolute -right-7 bottom-0 h-24 w-5 rounded-t-full bg-emerald-900" />
          <div className="absolute -right-12 bottom-8 h-16 w-16 rounded-full bg-emerald-600/80 blur-sm" />
        </div>

        <div className="absolute bottom-0 left-1/2 h-2 w-4/5 -translate-x-1/2 rounded-full bg-blue-300/30 blur-md" />
      </div>
    </div>
  );
}

export default async function OrganisasiPage() {
  const organization = await getOrganizationSession();

  if (!organization) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fc] text-slate-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071a3e] text-white shadow-lg shadow-blue-950/10">
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
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-5 py-2.5 text-xs font-bold transition hover:border-orange-400 hover:bg-orange-500 hover:text-white"
            >
              <span>↪</span>
              Keluar
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-7 lg:px-10 lg:pt-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#071a3e] via-[#103d83] to-[#2368c5] shadow-xl shadow-blue-950/15">
          <div className="absolute -left-24 -top-32 h-96 w-96 rounded-full border-[50px] border-white/[0.04]" />
          <div className="absolute -bottom-40 left-[35%] h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative grid min-h-[260px] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="relative z-20 flex flex-col justify-center px-6 py-7 sm:px-8 lg:px-12 lg:py-8">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-blue-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_10px_#fb923c]" />
                PANEL ORGANISASI MAHASISWA
              </div>

              <p className="mt-5 text-xs font-semibold text-blue-200">
                Selamat Datang,
              </p>

              <h2 className="mt-1 break-words text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {organization.organizationName}
                <span className="text-orange-400">.</span>
              </h2>

              <div className="mt-3 flex items-center gap-2 text-xs text-blue-100">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                  ✉
                </span>
                {organization.username}
              </div>

              <div className="mt-4 flex max-w-lg gap-3">
                <div className="w-1 shrink-0 rounded-full bg-orange-400" />
                <p className="text-xs leading-6 text-blue-50 sm:text-sm">
                  Kelola kebutuhan peminjaman barang dan ruangan organisasi
                  Anda dengan lebih mudah melalui BRAMASTRA.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white">
                  👥 {organization.organizationType}
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white">
                  ✓ Aktif & Terpercaya
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold text-white">
                  ★ Bersama Membangun Kampus
                </span>
              </div>
            </div>

            <div className="relative hidden min-h-[260px] lg:block">
              <div className="h-full origin-center scale-90">
                <CampusIllustration />
              </div>
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#103d83] to-transparent" />
            </div>

            <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-orange-400/20 blur-2xl lg:hidden" />
          </div>
        </section>

        {/* LAYANAN BRAMASTRA */}
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-3 h-1.5 w-16 rounded-full bg-orange-400" />

              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">
                LAYANAN BRAMASTRA
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0b1d43] sm:text-4xl">
                Layanan Peminjaman
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Pilih jenis peminjaman yang dibutuhkan organisasi Anda.
              </p>
            </div>

            <div className="hidden max-w-[260px] text-right md:block">
              <p className="text-sm font-semibold italic leading-6 text-blue-700">
                Dukung Kegiatan Organisasi dengan Fasilitas Terbaik
              </p>
              <div className="ml-auto mt-2 h-1 w-20 rounded-full bg-orange-400" />
            </div>
          </div>

          {/* SERVICE CARDS */}
          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            {/* BARANG */}
            <Link
              href="/organisasi/peminjaman?jenis=barang"
              className="group relative flex min-h-[245px] flex-col justify-between overflow-hidden rounded-[1.8rem] border border-blue-100 bg-white p-7 shadow-[0_8px_30px_rgba(37,99,235,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-[0_18px_40px_rgba(37,99,235,0.15)] sm:p-8"
            >
              <div className="absolute -left-16 -top-20 h-60 w-60 rounded-full bg-blue-50 transition duration-500 group-hover:scale-125" />
              <div className="absolute -right-10 -bottom-20 h-52 w-52 rounded-full bg-indigo-50/80" />

              <div className="relative flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex h-36 w-full shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-7xl sm:h-40 sm:w-40">
                  <span className="transition duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    📦
                  </span>
                </div>

                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-[10px] font-black text-blue-700">
                    <span>◆</span>
                    INVENTORY SERVICE
                  </span>

                  <h3 className="mt-4 text-2xl font-black tracking-tight text-[#0b1d43]">
                    Peminjaman Barang
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Ajukan peminjaman berbagai perlengkapan kampus seperti
                    proyektor, mikrofon, kamera, dan lainnya.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-[#0b285b] px-5 py-3 text-xs font-bold text-white transition group-hover:bg-blue-600">
                    Buat Pengajuan
                    <span className="text-base transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </div>

              <span className="absolute right-6 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm sm:flex">
                →
              </span>
            </Link>

            {/* RUANGAN */}
            <Link
              href="/organisasi/peminjaman?jenis=ruangan"
              className="group relative flex min-h-[245px] flex-col justify-between overflow-hidden rounded-[1.8rem] border border-indigo-100 bg-white p-7 shadow-[0_8px_30px_rgba(99,102,241,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-indigo-300 hover:shadow-[0_18px_40px_rgba(99,102,241,0.15)] sm:p-8"
            >
              <div className="absolute -left-16 -top-20 h-60 w-60 rounded-full bg-indigo-50 transition duration-500 group-hover:scale-125" />
              <div className="absolute -right-10 -bottom-20 h-52 w-52 rounded-full bg-blue-50/80" />

              <div className="relative flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="flex h-36 w-full shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-7xl sm:h-40 sm:w-40">
                  <span className="transition duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    🏢
                  </span>
                </div>

                <div className="flex-1">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-[10px] font-black text-indigo-700">
                    <span>◆</span>
                    ROOM RESERVATION
                  </span>

                  <h3 className="mt-4 text-2xl font-black tracking-tight text-[#0b1d43]">
                    Peminjaman Ruangan
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Ajukan penggunaan ruangan kampus untuk rapat, kegiatan
                    organisasi, diskusi, maupun acara.
                  </p>

                  <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-[#0b285b] px-5 py-3 text-xs font-bold text-white transition group-hover:bg-indigo-600">
                    Buat Pengajuan
                    <span className="text-base transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </div>

              <span className="absolute right-6 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-indigo-100 bg-white text-indigo-700 shadow-sm sm:flex">
                →
              </span>
            </Link>
          </div>
        </section>

        {/* RIWAYAT PEMINJAMAN */}
        <section className="mt-8">
          <div className="group relative overflow-hidden rounded-[1.8rem] border border-blue-100 bg-white shadow-[0_8px_30px_rgba(37,99,235,0.06)] transition hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-blue-50" />
            <div className="absolute -right-10 -top-28 h-72 w-72 rounded-full bg-blue-100/60 blur-2xl" />

            <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 text-5xl transition group-hover:scale-105">
                  📋
                </div>

                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black text-emerald-700">
                    <span>●</span>
                    HISTORY ACCESS
                  </span>

                  <h3 className="mt-3 text-xl font-black text-[#0b1d43] sm:text-2xl">
                    Riwayat Peminjaman
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Pantau status pengajuan, lihat informasi peminjaman, dan
                    periksa riwayat transaksi organisasi Anda.
                  </p>
                </div>
              </div>

              <Link
                href="/organisasi/riwayat"
                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#0b285b] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-blue-600"
              >
                Lihat Riwayat
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* RIWAYAT PENGEMBALIAN */}
        <section className="mt-6">
          <div className="group relative overflow-hidden rounded-[1.8rem] border border-orange-100 bg-white shadow-[0_8px_30px_rgba(249,115,22,0.06)] transition hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-orange-50" />
            <div className="absolute -right-10 -top-28 h-72 w-72 rounded-full bg-orange-100/60 blur-2xl" />

            <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 text-5xl transition group-hover:scale-105">
                  📦
                </div>

                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-[10px] font-black text-orange-700">
                    <span>●</span>
                    RETURN HISTORY
                  </span>

                  <h3 className="mt-3 text-xl font-black text-[#0b1d43] sm:text-2xl">
                    Riwayat Pengembalian
                  </h3>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Pantau pengajuan pengembalian barang dan ruangan, lihat
                    foto kondisi saat pengembalian, serta periksa status
                    persetujuan dari Super Admin.
                  </p>
                </div>
              </div>

              <Link
                href="/organisasi/riwayat-pengembalian"
                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-orange-900/10 transition hover:bg-orange-600"
              >
                Lihat Pengembalian
                <span className="text-lg">→</span>
              </Link>
            </div>
          </div>
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
    </main>
  );
}