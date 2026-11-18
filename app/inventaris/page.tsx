
import { neon } from "@neondatabase/serverless";
import { connection } from "next/server";
import { Suspense } from "react";
import PageLayout from "@/components/PageLayout";
import Link from "next/link";

export const instant = false;

async function InventarisContent() {
  await connection();

  let items: any[] = [];

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL belum dikonfigurasi.");
    }

    const sql = neon(databaseUrl);

    items = await sql`
      SELECT
        id,
        item_code,
        item_name,
        category,
        stock,
        image_url
      FROM inventory_items
      ORDER BY id DESC
    `;
  } catch (error) {
    console.error("Gagal mengambil inventaris:", error);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Daftar Barang
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Total {items.length} data inventaris.
          </p>
        </div>

        <Link
          href="/login?akses=organisasi&tujuan=barang"
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Ajukan Peminjaman →
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-56 bg-slate-100">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">
                    📦
                  </div>
                )}
              </div>

              <div className="p-5">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                  {item.category || "Inventaris"}
                </span>

                <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                  {item.item_name}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Kode: {item.item_code}
                </p>

                <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500">
                    Stok tersedia
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {item.stock} Unit
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <div className="text-5xl">📦</div>

          <h3 className="mt-5 font-bold text-slate-800">
            Belum Ada Data Inventaris
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Data barang akan ditampilkan setelah ditambahkan oleh Admin.
          </p>
        </div>
      )}
    </section>
  );
}

function InventarisLoading() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900">
          Daftar Barang
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Sedang memuat data inventaris...
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-3xl bg-slate-100"
          />
        ))}
      </div>
    </section>
  );
}

export default function InventarisPage() {
  return (
    <PageLayout
      eyebrow="Campus Inventory"
      title="Inventaris Barang"
      description="Temukan berbagai perlengkapan kampus yang dikelola Admin untuk menunjang kegiatan organisasi mahasiswa."
    >
      <Suspense fallback={<InventarisLoading />}>
        <InventarisContent />
      </Suspense>
    </PageLayout>
  );
}
