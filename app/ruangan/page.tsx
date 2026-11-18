
import { neon } from "@neondatabase/serverless";
import { connection } from "next/server";
import PageLayout from "@/components/PageLayout";
import Link from "next/link";

export default async function RuanganPage() {
  let rooms: any[] = [];

  // Menjalankan halaman saat ada request, bukan saat build.
  await connection();

  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL belum dikonfigurasi.");
    }

    const sql = neon(databaseUrl);

    rooms = await sql`
      SELECT id, room_code, room_name, building, image_url
      FROM rooms
      ORDER BY id DESC
    `;
  } catch (error) {
    console.error("Gagal mengambil data ruangan:", error);
  }

  return (
    <PageLayout
      eyebrow="Campus Facilities"
      title="Ruangan Kampus"
      description="Lihat informasi fasilitas dan ruangan kampus yang dapat diajukan untuk mendukung kegiatan organisasi mahasiswa."
    >
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Daftar Ruangan
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Total {rooms.length} data ruangan.
            </p>
          </div>

          <Link
            href="/login?akses=organisasi&tujuan=ruangan"
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Ajukan Peminjaman →
          </Link>
        </div>

        {rooms.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room) => (
              <article
                key={room.id}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-56 bg-slate-100">
                  {room.image_url ? (
                    <img
                      src={room.image_url}
                      alt={room.room_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🏢
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    {room.room_code}
                  </p>

                  <h3 className="mt-2 text-lg font-extrabold text-slate-900">
                    {room.room_name}
                  </h3>

                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
                    📍 Gedung: {room.building || "-"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
            <div className="text-5xl">🏢</div>
            <h3 className="mt-5 font-bold text-slate-800">
              Belum Ada Data Ruangan
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Data ruangan akan ditampilkan setelah ditambahkan oleh Admin.
            </p>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
