"use client";

import { useState } from "react";

export default function KelolaAdminPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat akun Admin.");
      }

      setSuccess(true);
      setMessage(data.message);
      setName("");
      setUsername("");
      setPassword("");
    } catch (error) {
      setSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="overflow-hidden rounded-[20px] bg-gradient-to-r from-[#071A3E] to-[#2368C5] p-7 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[2px] text-blue-200">
          BRAMASTRA ADMINISTRATION
        </p>

        <h1 className="mt-3 text-2xl font-black sm:text-3xl">
          Kelola Admin
        </h1>

        <p className="mt-2 text-sm text-blue-100">
          Tambahkan akun Admin dengan akses terbatas pada sistem BRAMASTRA.
        </p>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-extrabold text-[#071A3E]">
            Tambah Admin Terbatas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Akun ini hanya dapat mengakses Dashboard, Peminjaman,
            Persetujuan, dan Pengembalian.
          </p>
        </div>

        {message && (
          <div
            className={`mb-5 rounded-xl border p-4 text-sm font-medium ${
              success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Nama Admin
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Masukkan nama admin"
              maxLength={100}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Masukkan username"
              maxLength={50}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 8 karakter"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-bold text-orange-800">
              Hak akses Admin
            </p>

            <ul className="mt-2 space-y-1 text-sm text-orange-700">
              <li>✓ Dashboard</li>
              <li>✓ Peminjaman</li>
              <li>✓ Persetujuan</li>
              <li>✓ Pengembalian</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2368C5] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#123B78] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Menyimpan..." : "Buat Akun Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}