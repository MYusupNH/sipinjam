import PageLayout from "@/components/PageLayout";
import Link from "next/link";

export default function TentangPage() {
  return (
    <PageLayout
      eyebrow="ABOUT BRAMASTRA"
      title="Tentang BRAMASTRA"
      description="Sistem informasi peminjaman barang dan ruangan untuk mendukung kegiatan organisasi mahasiswa."
    >
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:py-16">
        {/* KONTEN TENTANG */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <p className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
              ABOUT OUR SYSTEM
            </p>
          </div>

          <h2 className="mt-5 text-3xl font-black leading-tight text-[#071A3E] sm:text-4xl">
            Satu Platform untuk Mendukung Kegiatan Organisasi.
          </h2>

          <div className="mt-5 h-1.5 w-20 rounded-full bg-[#FB923C]" />

          <p className="mt-6 text-sm leading-8 text-slate-600">
            BRAMASTRA merupakan sistem informasi yang dirancang untuk membantu
            pengelolaan peminjaman inventaris kampus oleh Organisasi Mahasiswa
            (ORMAWA) dan Unit Kegiatan Mahasiswa (UKM).
          </p>

          <p className="mt-4 text-sm leading-8 text-slate-600">
            Setiap organisasi mendapatkan akun tersendiri dari Admin Kampus.
            Melalui akun tersebut, organisasi dapat mengajukan peminjaman,
            melihat status pengajuan, mengelola pengembalian, dan memantau
            riwayat peminjaman.
          </p>

          <Link
            href="/login?akses=organisasi"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#2368C5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#123B78]"
          >
            Login Organisasi
            <span className="text-lg">→</span>
          </Link>
        </div>

        {/* KARTU HAK AKSES */}
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#071A3E] via-[#123B78] to-[#2368C5] p-5 text-white shadow-lg shadow-blue-950/10 sm:p-6">
          {/* Dekorasi */}
          <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full border-[18px] border-white/[0.06]" />
          <div className="absolute -bottom-20 -left-14 h-44 w-44 rounded-full border-[18px] border-white/[0.06]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
              <p className="text-[10px] font-extrabold tracking-[0.15em] text-blue-100">
                USER ACCESS
              </p>
            </div>

            <h2 className="mt-3 text-xl font-black leading-tight sm:text-2xl">
              Satu Sistem, Akses Sesuai Peran.
            </h2>

            <p className="mt-2 text-xs leading-6 text-blue-100 sm:text-sm">
              Setiap pengguna memiliki akses sesuai dengan peran dan tanggung
              jawabnya dalam pengelolaan peminjaman.
            </p>

            <div className="mt-5 space-y-3">
              {/* ADMIN */}
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/[0.15]">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FB923C] text-xl shadow-md shadow-orange-950/20">
                    🏛️
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold">Admin Kampus</h3>
                    <p className="mt-1 text-xs leading-5 text-blue-100">
                      Mengelola inventaris, data ruangan, akun organisasi,
                      persetujuan peminjaman, dan pengembalian.
                    </p>

                    <Link
                      href="/login?akses=admin"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-white transition hover:text-orange-300"
                    >
                      Login Admin <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* ORGANISASI */}
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/[0.15]">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2368C5] text-xl shadow-md shadow-blue-950/20">
                    👥
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold">ORMAWA dan UKM</h3>
                    <p className="mt-1 text-xs leading-5 text-blue-100">
                      Mengajukan peminjaman barang dan ruangan, memantau
                      status, serta mengajukan pengembalian.
                    </p>

                    <Link
                      href="/login?akses=organisasi"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-white transition hover:text-orange-300"
                    >
                      Login Organisasi <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFORMASI TAMBAHAN */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-3 sm:px-8">
          <div className="rounded-2xl border border-slate-200 bg-[#F5F7FC] p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl">
              📋
            </div>
            <h3 className="font-extrabold text-[#071A3E]">
              Pengajuan Terstruktur
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Proses pengajuan peminjaman barang dan ruangan dalam satu sistem.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F5F7FC] p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-xl">
              🔍
            </div>
            <h3 className="font-extrabold text-[#071A3E]">
              Pemantauan Status
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Memudahkan organisasi memantau status pengajuan peminjaman.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-[#F5F7FC] p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl">
              📦
            </div>
            <h3 className="font-extrabold text-[#071A3E]">
              Pengelolaan Pengembalian
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Mendukung proses pengembalian barang dan ruangan melalui
              verifikasi Admin Kampus.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}