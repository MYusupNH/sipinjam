"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

type Room = {
  id: number;
  room_code: string;
  room_name: string;
  building: string | null;
  capacity: number;
  facilities: string | null;
  description: string | null;
  is_active: boolean;
  image_url: string | null;
  image_public_id: string | null;
};

const initialForm = {
  room_code: "",
  room_name: "",
  building: "",
  capacity: "0",
  facilities: "",
  description: "",
  is_active: true,
};

export default function RuanganPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  async function loadRooms() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/ruangan");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data.");
      }

      setRooms(data.rooms || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  function resetImage() {
    setImageFile(null);
    setImageUrl(null);
    setImagePublicId(null);
    setImagePreview(null);
  }

  function openAddModal() {
    setEditId(null);
    setForm(initialForm);
    resetImage();
    setModalOpen(true);
    setError("");
  }

  function openEditModal(room: Room) {
    setEditId(room.id);

    setForm({
      room_code: room.room_code,
      room_name: room.room_name,
      building: room.building || "",
      capacity: String(room.capacity),
      facilities: room.facilities || "",
      description: room.description || "",
      is_active: room.is_active,
    });

    setImageFile(null);
    setImageUrl(room.image_url);
    setImagePublicId(room.image_public_id);
    setImagePreview(room.image_url);

    setModalOpen(true);
    setError("");
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Format foto harus JPG, PNG, atau WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto maksimal 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!imageFile) {
      return {
        image_url: imageUrl,
        image_public_id: imagePublicId,
      };
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("type", "ruangan");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengunggah foto.");
      }

      return {
        image_url: data.image_url,
        image_public_id: data.image_public_id,
      };
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      // Upload foto baru jika admin memilih foto
      const uploadedImage = await uploadImage();

      const response = await fetch("/api/admin/ruangan", {
        method: editId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
          image_url: uploadedImage.image_url,
          image_public_id: uploadedImage.image_public_id,
          ...(editId ? { id: editId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan ruangan.");
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditId(null);
      resetImage();

      setMessage(data.message);
      await loadRooms();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete(room: Room) {
    if (
      !window.confirm(
        `Yakin ingin menghapus ruangan "${room.room_name}"?`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/ruangan", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: room.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus ruangan.");
      }

      setMessage(data.message);
      await loadRooms();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    }
  }

  const filteredRooms = rooms.filter((room) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      room.room_code.toLowerCase().includes(keyword) ||
      room.room_name.toLowerCase().includes(keyword) ||
      (room.building || "").toLowerCase().includes(keyword);

    const matchesStatus =
      filterStatus === "Semua" ||
      (filterStatus === "Aktif" && room.is_active) ||
      (filterStatus === "Nonaktif" && !room.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeRooms = rooms.filter((room) => room.is_active).length;
  const inactiveRooms = rooms.length - activeRooms;

  const totalCapacity = rooms.reduce(
    (total, room) => total + Number(room.capacity),
    0
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-[#071A3E] via-[#123B78] to-[#2368C5] px-4 py-3 text-white shadow-md shadow-blue-950/10 md:px-5 md:py-4">

        <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />
        <div className="absolute -bottom-16 right-28 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />

        <div className="relative z-10">

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[8px] font-bold tracking-[0.15em] text-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
            BRAMASTRA ADMINISTRATOR
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-lg font-black tracking-tight md:text-xl">
                Data Ruangan
              </h1>

              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-blue-100 md:text-xs">
                Kelola fasilitas dan ruangan untuk peminjaman organisasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Total Ruangan
                </p>
                <p className="text-sm font-black">{rooms.length}</p>
              </div>

              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Ruangan Aktif
                </p>
                <p className="text-sm font-black text-orange-300">
                  {activeRooms}
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                + Tambah Ruangan
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* NOTIFICATION */}
      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && !modalOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-3 font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Ruangan</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {rooms.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ruangan Aktif</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeRooms}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ruangan Nonaktif</p>
          <p className="mt-2 text-3xl font-bold text-red-500">
            {inactiveRooms}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Kapasitas</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {totalCapacity}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Kapasitas gabungan seluruh ruangan
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-bold text-gray-800">
            Daftar Ruangan
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Cari kode, nama, atau gedung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">No.</th>
                <th className="px-5 py-4">Foto</th>
                <th className="px-5 py-4">Kode</th>
                <th className="px-5 py-4">Nama Ruangan</th>
                <th className="px-5 py-4">Gedung</th>
                <th className="px-5 py-4">Kapasitas</th>
                <th className="px-5 py-4">Fasilitas</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Memuat data ruangan...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Belum ada data ruangan.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room, index) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-500">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      {room.image_url ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedImage({
                              url: room.image_url!,
                              name: room.room_name,
                            })
                          }
                          className="group"
                          title="Klik untuk memperbesar foto"
                        >
                          <img
                            src={room.image_url}
                            alt={room.room_name}
                            className="h-14 w-14 cursor-zoom-in rounded-lg border border-gray-200 object-cover transition group-hover:scale-105 group-hover:shadow-md"
                          />
                        </button>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                          No Foto
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 font-semibold text-orange-600">
                      {room.room_code}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {room.room_name}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {room.building || "-"}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {room.capacity} orang
                    </td>

                    <td className="max-w-[200px] px-5 py-4 text-gray-600">
                      {room.facilities || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          room.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {room.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(room)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(room)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-5 py-4 text-xs text-gray-500">
          Menampilkan {filteredRooms.length} dari {rooms.length} ruangan
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editId ? "Edit Ruangan" : "Tambah Ruangan"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Lengkapi informasi dan foto ruangan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kode Ruangan *
                  </label>
                  <input
                    required
                    value={form.room_code}
                    onChange={(e) =>
                      setForm({ ...form, room_code: e.target.value })
                    }
                    placeholder="Contoh: R-001"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Ruangan *
                  </label>
                  <input
                    required
                    value={form.room_name}
                    onChange={(e) =>
                      setForm({ ...form, room_name: e.target.value })
                    }
                    placeholder="Contoh: Aula Utama"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Gedung / Lokasi
                  </label>
                  <input
                    value={form.building}
                    onChange={(e) =>
                      setForm({ ...form, building: e.target.value })
                    }
                    placeholder="Contoh: Gedung A Lantai 2"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kapasitas (orang) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              {/* FOTO RUANGAN */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Foto Ruangan
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-orange-50 file:px-4 file:py-2 file:font-semibold file:text-orange-600 hover:file:bg-orange-100"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Format JPG, PNG, atau WEBP. Maksimal 5 MB.
                </p>

                {imagePreview && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-medium text-gray-600">
                      Preview foto:
                    </p>

                    <img
                      src={imagePreview}
                      alt="Preview foto ruangan"
                      className="h-44 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fasilitas Ruangan
                </label>
                <textarea
                  rows={2}
                  value={form.facilities}
                  onChange={(e) =>
                    setForm({ ...form, facilities: e.target.value })
                  }
                  placeholder="Contoh: Proyektor, AC, kursi, meja, sound system"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Keterangan
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Keterangan tambahan..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />
              </div>

              {editId && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="h-4 w-4 accent-orange-500"
                  />
                  Ruangan aktif dan dapat diajukan untuk peminjaman
                </label>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                >
                  {uploading
                    ? "Mengunggah foto..."
                    : saving
                    ? "Menyimpan..."
                    : editId
                    ? "Simpan Perubahan"
                    : "Tambah Ruangan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP FOTO BESAR */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-2xl bg-white p-3 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between px-2">
              <h3 className="font-semibold text-gray-800">
                {selectedImage.name}
              </h3>

              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-600 hover:bg-red-100 hover:text-red-600"
              >
                ×
              </button>
            </div>

            <div className="flex max-h-[75vh] items-center justify-center overflow-hidden rounded-xl bg-gray-100">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-h-[75vh] w-full object-contain"
              />
            </div>

            <p className="mt-3 text-center text-xs text-gray-400">
              Klik area luar foto atau tombol × untuk menutup.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}