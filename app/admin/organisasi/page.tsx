"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Organization = {
  id: number;
  organization_name: string;
  organization_type: "ORMAWA" | "UKM";
  username: string;
  is_active: boolean;
  created_at: string;
};

type SuperAdmin = {
  id: number;
  username: string;
  name: string;
  role: string;
  is_active: boolean;
};

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("SEMUA");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const [form, setForm] = useState({
    organization_name: "",
    organization_type: "ORMAWA",
    username: "",
    password: "",
  });

  const [newPassword, setNewPassword] = useState("");

  const [adminForm, setAdminForm] = useState({
    username: "",
    password: "",
  });

  async function loadOrganizations() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/organizations", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data akun.");
      }

      setOrganizations(data.organizations || []);
      setSuperAdmins(data.superAdmins || []);
      setCurrentAdminId(data.currentAdminId ?? null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrganizations();
  }, []);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.organization_name.toLowerCase().includes(keyword) ||
        item.username.toLowerCase().includes(keyword);

      const matchesFilter =
        filter === "SEMUA" || item.organization_type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [organizations, search, filter]);

  async function handleAddOrganization(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menambahkan akun.");
      }

      setShowAddModal(false);
      setForm({
        organization_name: "",
        organization_type: "ORMAWA",
        username: "",
        password: "",
      });

      setMessage("Akun ORMAWA/UKM berhasil ditambahkan.");
      await loadOrganizations();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedOrganization) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedOrganization.id,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengganti password.");
      }

      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedOrganization(null);

      setMessage("Password akun berhasil diperbarui.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOrganization(item: Organization) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus akun ${item.organization_name}?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: item.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus akun.");
      }

      setMessage("Akun berhasil dihapus.");
      await loadOrganizations();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    }
  }

  function openAdminModal() {
    const currentAdmin = superAdmins.find(
      (admin) => admin.id === currentAdminId
    );

    setAdminForm({
      username: currentAdmin?.username || "",
      password: "",
    });

    setShowAdminModal(true);
  }

  async function handleUpdateAdmin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountType: "super_admin",
          id: currentAdminId,
          username: adminForm.username,
          password: adminForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal memperbarui akun.");
      }

      setShowAdminModal(false);
      setMessage("Username dan password Super Admin berhasil diperbarui.");

      await loadOrganizations();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-800">
      <main className="min-w-0 p-5 md:p-9">
        {/* HEADER */}
        <section className="relative isolate mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-[#071A3E] via-[#123B78] to-[#2368C5] px-4 py-3 text-white shadow-md shadow-blue-950/10 md:px-5 md:py-4">

          <div className="absolute -right-8 -top-12 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />
          <div className="absolute -bottom-16 right-28 h-32 w-32 rounded-full border-[14px] border-white/[0.06]" />

          <div className="relative z-10">

            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-blue-100">
                Dashboard / ORMAWA & UKM
              </span>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[8px] font-bold tracking-[0.15em] text-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FB923C]" />
                BRAMASTRA ADMINISTRATOR
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-lg font-black tracking-tight md:text-xl">
                  Manajemen ORMAWA & UKM
                </h1>

                <p className="mt-1 max-w-2xl text-[11px] leading-5 text-blue-100 md:text-xs">
                  Kelola akun organisasi dan unit kegiatan mahasiswa.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                    Total Akun
                  </p>
                  <p className="text-sm font-black">{organizations.length}</p>
                </div>

                <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                    ORMAWA
                  </p>
                  <p className="text-sm font-black">
                    {
                      organizations.filter(
                        (item) => item.organization_type === "ORMAWA"
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-wider text-blue-200">
                    UKM
                  </p>
                  <p className="text-sm font-black text-orange-300">
                    {
                      organizations.filter(
                        (item) => item.organization_type === "UKM"
                      ).length
                    }
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  + Tambah Akun
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* NOTIFICATION */}
        {message && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="ml-3 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* STATISTICS */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Akun</p>
            <h2 className="mt-2 text-3xl font-bold">
              {organizations.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">ORMAWA</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {
                organizations.filter(
                  (item) => item.organization_type === "ORMAWA"
                ).length
              }
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">UKM</p>
            <h2 className="mt-2 text-3xl font-bold text-purple-600">
              {
                organizations.filter(
                  (item) => item.organization_type === "UKM"
                ).length
              }
            </h2>
          </div>
        </div>

        {/* ORGANIZATION TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center">
            <div>
              <h2 className="font-bold text-slate-800">
                Daftar Akun Organisasi
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Daftar akun ORMAWA dan UKM yang terdaftar.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari organisasi..."
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="SEMUA">Semua Jenis</option>
                <option value="ORMAWA">ORMAWA</option>
                <option value="UKM">UKM</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">No.</th>
                  <th className="px-5 py-4">Nama Organisasi</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Username</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredOrganizations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      Belum ada data organisasi.
                    </td>
                  </tr>
                ) : (
                  filteredOrganizations.map((item, index) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">{index + 1}</td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {item.organization_name}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.organization_type === "ORMAWA"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {item.organization_type}
                        </span>
                      </td>

                      <td className="px-5 py-4">{item.username}</td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrganization(item);
                              setNewPassword("");
                              setShowPasswordModal(true);
                            }}
                            className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                          >
                            Password
                          </button>

                          <button
                            onClick={() => handleDeleteOrganization(item)}
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
        </div>

        {/* SUPER ADMIN */}
        <div className="mt-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-800">
                Pengaturan Super Admin
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Kelola username dan password akun Super Admin yang sedang
                digunakan.
              </p>
            </div>

            <button
              onClick={openAdminModal}
              className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Ubah Username / Password
            </button>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase text-slate-400">
              Daftar Super Admin
            </p>

            {superAdmins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {admin.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    @{admin.username}
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {admin.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ADD ORGANIZATION MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  Tambah Akun Organisasi
                </h2>

                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-2xl text-slate-400"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddOrganization} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Nama Organisasi
                  </label>

                  <input
                    required
                    value={form.organization_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        organization_name: e.target.value,
                      })
                    }
                    placeholder="Masukkan nama organisasi"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Jenis Organisasi
                  </label>

                  <select
                    value={form.organization_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        organization_type: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="ORMAWA">ORMAWA</option>
                    <option value="UKM">UKM</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Username
                  </label>

                  <input
                    required
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    placeholder="Buat username"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Password
                  </label>

                  <input
                    required
                    minLength={8}
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Simpan Akun"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CHANGE ORGANIZATION PASSWORD MODAL */}
        {showPasswordModal && selectedOrganization && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">Ganti Password</h2>

                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-2xl text-slate-400"
                >
                  ×
                </button>
              </div>

              <p className="mb-4 text-sm text-slate-500">
                Akun:{" "}
                <strong className="text-slate-800">
                  {selectedOrganization.organization_name}
                </strong>
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Password Baru
                  </label>

                  <input
                    required
                    minLength={8}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Simpan Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUPER ADMIN MODAL */}
        {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  Ubah Akun Super Admin
                </h2>

                <button
                  onClick={() => setShowAdminModal(false)}
                  className="text-2xl text-slate-400"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Username Baru
                  </label>

                  <input
                    required
                    value={adminForm.username}
                    onChange={(e) =>
                      setAdminForm({
                        ...adminForm,
                        username: e.target.value,
                      })
                    }
                    placeholder="Masukkan username baru"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Password Baru
                  </label>

                  <input
                    type="password"
                    minLength={8}
                    value={adminForm.password}
                    onChange={(e) =>
                      setAdminForm({
                        ...adminForm,
                        password: e.target.value,
                      })
                    }
                    placeholder="Kosongkan jika tidak ingin mengganti password"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Password baru minimal 8 karakter. Jika tidak ingin
                  menggantinya, biarkan kosong.
                </p>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}