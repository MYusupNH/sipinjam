import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PageLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white text-[#071A3E]">
      <Navbar />

      <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#071A3E] via-[#123B78] to-[#2368C5] text-white">
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full border-[18px] border-white/[0.06]" />
        <div className="absolute -bottom-20 right-32 h-44 w-44 rounded-full border-[18px] border-white/[0.06]" />

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-100 transition hover:text-white"
            >
              ← Kembali ke Beranda
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.15em] text-blue-100">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
              {eyebrow}
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            {title}
          </h1>

          <p className="mt-2 max-w-2xl text-xs leading-6 text-blue-100 sm:text-sm">
            {description}
          </p>
        </div>
      </section>

      {children}

      <footer className="bg-gradient-to-br from-[#071A3E] via-[#123B78] to-[#2368C5] px-5 py-6 text-center text-xs text-blue-100">
        © 2026 BRAMASTRA. All rights reserved.
      </footer>
    </main>
  );
}