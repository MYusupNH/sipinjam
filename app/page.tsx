
import Link from "next/link";
import Navbar from "@/components/Navbar";

const highlights = [
  { title: "Mudah", desc: "Akses informasi", icon: "✨" },
  { title: "Terstruktur", desc: "Proses pengajuan", icon: "📋" },
  { title: "Terintegrasi", desc: "Pengelolaan data", icon: "🔗" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07152e]">
      {/* HERO SECTION */}
      <section className="relative flex min-h-screen flex-col overflow-hidden text-white">

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#07152e] via-[#0d2250] to-[#07152e]" />

        {/* FOTO BACKGROUND */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bsi.jpg')" }}
        />

        {/* Overlay navy */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07152e]/95 via-[#07152e]/75 to-[#07152e]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07152e]/80 via-transparent to-[#07152e]/50" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        {/* Glow */}
        <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute -bottom-48 -left-32 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-sky-400/10 blur-[100px]" />

        {/* NAVBAR */}
        <div className="relative z-20">
          <Navbar />
        </div>

        {/* HERO CONTENT */}
        <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center px-6 py-16 lg:py-20">

          {/* KIRI */}
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-blue-300/20 bg-white/[0.06] px-4 py-2 text-xs font-bold tracking-wider text-blue-200 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              SISTEM INFORMASI PEMINJAMAN
            </div>

            <h1 className="mt-8 text-4xl font-black leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
              Sistem Peminjaman
              <span className="mt-1 block bg-gradient-to-r from-blue-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Inventaris Kampus
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 md:text-lg">
              Platform informasi dan pengajuan peminjaman barang serta
              fasilitas ruangan kampus untuk mendukung kegiatan organisasi
              mahasiswa secara lebih mudah, tertib, dan terstruktur.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/inventaris"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/30 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/40"
              >
                Lihat Inventaris
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/ruangan"
                className="rounded-full border border-white/20 bg-white/[0.06] px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/10"
              >
                Lihat Ruangan
              </Link>
            </div>

            {/* Highlights */}
            <div className="mt-14 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition duration-300 hover:border-blue-400/40 hover:bg-white/[0.08]"
                >
                  <div className="text-xl">{item.icon}</div>
                  <p className="mt-3 text-base font-extrabold text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SCROLL HINT */}
        <div className="relative z-10 flex justify-center pb-3">
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/25 p-1">
            <span className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
          </div>
        </div>

        {/* FOOTER HERO */}
        <div className="relative z-10 border-t border-white/10 px-6 py-5 text-center">
          <p className="text-xs text-slate-400">
            © 2026 Sistem Informasi Peminjaman Inventaris Kampus
          </p>
        </div>
      </section>
    </main>
  );
}
