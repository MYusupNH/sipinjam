"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";

type Item = {
  id: number;
  item_code: string;
  item_name: string;
  category: string;
  stock: number;
  condition: string;
  storage_location: string | null;
  description: string | null;
  image_url: string | null;
  image_public_id: string | null;
  created_at: string;
};

const initialForm = {
  item_code: "",
  item_name: "",
  category: "Peralatan Multimedia",
  stock: "0",
  condition: "Baik",
  storage_location: "",
  description: "",
};

const categories = [
  "Peralatan Multimedia",
  "Peralatan Kegiatan",
  "Perlengkapan Organisasi",
  "Peralatan Lainnya",
];

export default function BarangPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [filterCondition, setFilterCondition] = useState("Semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");

  // State untuk popup foto besar
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadItems() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/barang");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data barang.");
      }

      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetImage() {
    setSelectedFile(null);
    setPreviewImage("");
    setImageUrl("");
    setImagePublicId("");
  }

  function openAddModal() {
    setEditId(null);
    setForm(initialForm);
    resetImage();
    setError("");
    setMessage("");
    setModalOpen(true);
  }

  function openEditModal(item: Item) {
    setEditId(item.id);

    setForm({
      item_code: item.item_code,
      item_name: item.item_name,
      category: item.category,
      stock: String(item.stock),
      condition: item.condition,
      storage_location: item.storage_location || "",
      description: item.description || "",
    });

    setSelectedFile(null);
    setImageUrl(item.image_url || "");
    setImagePublicId(item.image_public_id || "");
    setPreviewImage(item.image_url || "");

    setError("");
    setMessage("");
    setModalOpen(true);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

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
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!selectedFile) {
      return {
        image_url: imageUrl,
        image_public_id: imagePublicId,
      };
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("type", "barang");

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

    try {
      const uploadedImage = await uploadImage();

      const response = await fetch("/api/admin/barang", {
        method: editId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          stock: Number(form.stock),
          image_url: uploadedImage.image_url,
          image_public_id: uploadedImage.image_public_id,
          ...(editId ? { id: editId } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan barang.");
      }

      setModalOpen(false);
      setForm(initialForm);
      setEditId(null);
      resetImage();

      setMessage(data.message);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete(item: Item) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus barang "${item.item_name}"?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/barang", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: item.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus barang.");
      }

      setMessage(data.message);
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  const filteredItems = items.filter((item) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      item.item_code.toLowerCase().includes(keyword) ||
      item.item_name.toLowerCase().includes(keyword) ||
      item.category.toLowerCase().includes(keyword);

    const matchesCategory =
      filterCategory === "Semua" || item.category === filterCategory;

    const matchesCondition =
      filterCondition === "Semua" || item.condition === filterCondition;

    return matchesSearch && matchesCategory && matchesCondition;
  });

  const totalStock = items.reduce(
    (total, item) => total + Number(item.stock),
    0
  );

  const goodItems = items.filter(
    (item) => item.condition === "Baik"
  ).length;

  const damagedItems = items.filter(
    (item) => item.condition !== "Baik"
  ).length;

  function conditionStyle(condition: string) {
    if (condition === "Baik") return "bg-green-100 text-green-700";
    if (condition === "Rusak Ringan") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  }

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
                Data Barang
              </h1>

              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-blue-100 md:text-xs">
                Kelola inventaris dan stok barang organisasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Jenis Barang
                </p>
                <p className="text-sm font-black">{items.length}</p>
              </div>

              <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                  Total Stok
                </p>
                <p className="text-sm font-black text-orange-300">
                  {totalStock}
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                + Tambah Barang
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
          <button onClick={() => setError("")} className="ml-3 font-bold">
            Tutup
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Jenis Barang</p>
          <p className="mt-2 text-3xl font-bold text-gray-800">{items.length}</p>
          <p className="mt-1 text-xs text-gray-400">Total jenis inventaris</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Stok</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{totalStock}</p>
          <p className="mt-1 text-xs text-gray-400">Jumlah seluruh barang</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Kondisi Baik</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{goodItems}</p>
          <p className="mt-1 text-xs text-gray-400">
            Jenis barang dalam kondisi baik
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Perlu Perhatian</p>
          <p className="mt-2 text-3xl font-bold text-red-500">{damagedItems}</p>
          <p className="mt-1 text-xs text-gray-400">Jenis barang rusak</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-bold text-gray-800">Daftar Inventaris</h2>
          <p className="mt-1 text-sm text-gray-500">
            Data barang yang tersimpan di database.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Cari kode atau nama barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={filterCondition}
              onChange={(e) => setFilterCondition(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
            >
              <option value="Semua">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">No.</th>
                <th className="px-5 py-4">Foto</th>
                <th className="px-5 py-4">Kode Barang</th>
                <th className="px-5 py-4">Nama Barang</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Stok</th>
                <th className="px-5 py-4">Kondisi</th>
                <th className="px-5 py-4">Lokasi</th>
                <th className="px-5 py-4">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-500">
                    Memuat data barang...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-500">
                    Belum ada data barang.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr key={item.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 text-gray-500">{index + 1}</td>

                    <td className="px-5 py-4">
                      {item.image_url ? (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedImage({
                              url: item.image_url!,
                              name: item.item_name,
                            })
                          }
                          className="group relative"
                          title="Klik untuk memperbesar foto"
                        >
                          <img
                            src={item.image_url}
                            alt={item.item_name}
                            className="h-14 w-14 cursor-zoom-in rounded-lg border border-gray-200 object-cover transition group-hover:scale-105 group-hover:shadow-md"
                          />
                        </button>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                          No Foto
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 font-medium text-orange-600">
                      {item.item_code}
                    </td>

                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {item.item_name}
                    </td>

                    <td className="px-5 py-4 text-gray-600">{item.category}</td>

                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {item.stock}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${conditionStyle(item.condition)}`}>
                        {item.condition}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {item.storage_location || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
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
          Menampilkan {filteredItems.length} dari {items.length} jenis barang
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {editId ? "Edit Data Barang" : "Tambah Barang"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Lengkapi informasi inventaris berikut.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {/* UPLOAD FOTO */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Foto Barang
                </label>

                {previewImage ? (
                  <div className="mb-3">
                    <img
                      src={previewImage}
                      alt="Preview foto barang"
                      className="h-48 w-full rounded-xl border border-gray-200 object-contain bg-gray-50"
                    />
                  </div>
                ) : (
                  <div className="mb-3 flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
                    Belum ada foto barang
                  </div>
                )}

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600 transition hover:bg-orange-100">
                  <span>📷</span>
                  {selectedFile ? "Ganti Foto" : "Pilih Foto"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                <p className="mt-2 text-xs text-gray-500">
                  Format JPG, PNG, atau WEBP. Maksimal 5 MB.
                </p>

                {selectedFile && (
                  <p className="mt-1 text-xs text-green-600">
                    Foto dipilih: {selectedFile.name}
                  </p>
                )}

                {editId && imageUrl && !selectedFile && (
                  <p className="mt-1 text-xs text-gray-500">
                    Foto lama akan tetap digunakan jika tidak memilih foto baru.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kode Barang *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.item_code}
                    onChange={(e) => setForm({ ...form, item_code: e.target.value })}
                    placeholder="Contoh: INV-001"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nama Barang *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.item_name}
                    onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                    placeholder="Nama barang"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kategori *
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Jumlah Stok *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Kondisi Barang *
                  </label>
                  <select
                    required
                    value={form.condition}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  >
                    <option value="Baik">Baik</option>
                    <option value="Rusak Ringan">Rusak Ringan</option>
                    <option value="Rusak Berat">Rusak Berat</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Lokasi Penyimpanan
                  </label>
                  <input
                    type="text"
                    value={form.storage_location}
                    onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
                    placeholder="Contoh: Gudang A"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Keterangan
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Keterangan tambahan barang..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
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
                    ? "Mengunggah Foto..."
                    : saving
                    ? "Menyimpan..."
                    : editId
                    ? "Simpan Perubahan"
                    : "Tambah Barang"}
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