import PageLayout from "@/components/PageLayout";

const categories = [
  {
    name: "Peralatan Multimedia",
    icon: "🎥",
    desc: "Proyektor, layar, kamera, dan perlengkapan multimedia.",
    number: "01",
  },
  {
    name: "Peralatan Kegiatan",
    icon: "🎤",
    desc: "Speaker, mikrofon, kabel, dan perlengkapan acara.",
    number: "02",
  },
  {
    name: "Perlengkapan Organisasi",
    icon: "🪑",
    desc: "Meja, kursi, tenda, dan perlengkapan pendukung.",
    number: "03",
  },
  {
    name: "Peralatan Lainnya",
    icon: "📦",
    desc: "Berbagai inventaris kampus untuk kebutuhan kegiatan.",
    number: "04",
  },
];

export default function KategoriPage() {
  return (
    <PageLayout
      eyebrow="Inventory Categories"
      title="Kategori Inventaris"
      description="Berbagai kategori perlengkapan kampus untuk menunjang aktivitas ORMAWA dan UKM."
    >
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <article
              key={category.number}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 transition hover:-translate-y-2 hover:border-blue-200 hover:shadow-xl"
            >
              <span className="absolute right-6 top-5 text-4xl font-black text-slate-100 group-hover:text-blue-50">
                {category.number}
              </span>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl transition group-hover:bg-blue-600">
                {category.icon}
              </div>

              <h2 className="mt-7 font-extrabold text-slate-900">
                {category.name}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {category.desc}
              </p>

              <div className="mt-6 h-1 w-10 rounded-full bg-blue-600 transition-all group-hover:w-20" />
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}