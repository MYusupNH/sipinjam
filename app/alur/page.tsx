import PageLayout from "@/components/PageLayout";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: "📝",
    title: "Pilih Peminjaman",
    desc: "Tentukan apakah ingin meminjam barang atau menggunakan ruangan kampus.",
  },
  {
    number: "02",
    icon: "🔐",
    title: "Login Organisasi",
    desc: "Masuk menggunakan akun ORMAWA atau UKM yang telah diberikan.",
  },
  {
    number: "03",
    icon: "📋",
    title: "Isi Pengajuan",
    desc: "Lengkapi data peminjaman, tanggal, waktu, dan keperluan kegiatan.",
  },
  {
    number: "04",
    icon: "✓",
    title: "Persetujuan Admin",
    desc: "Admin kampus melakukan pemeriksaan dan persetujuan pengajuan.",
  },
  {
    number: "05",
    icon: "🤝",
    title: "Pengambilan",
    desc: "Gunakan fasilitas dan lakukan pengembalian sesuai jadwal.",
  },
];

export default function AlurPage() {
  return (
    <PageLayout
      eyebrow="How It Works"
      title="Cara Peminjaman"
      description="Ikuti tahapan berikut untuk mengajukan peminjaman barang maupun ruangan kampus."
    >
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-blue-200">
                  {step.number}
                </span>
                <span className="text-3xl">{step.icon}</span>
              </div>

              <h2 className="mt-7 font-extrabold text-slate-900">
                {step.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {step.desc}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-blue-50 p-8 text-center">
          <h2 className="text-2xl font-black text-slate-900">
            Siap Mengajukan Peminjaman?
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Login menggunakan akun organisasi untuk memulai pengajuan.
          </p>

          <Link
            href="/login?akses=organisasi"
            className="mt-6 inline-block rounded-full bg-blue-600 px-7 py-3 font-bold text-white hover:bg-blue-700"
          >
            Login Organisasi →
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}