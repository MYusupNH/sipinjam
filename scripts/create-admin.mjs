import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

try {
  const username = (await rl.question("Username Super Admin: ")).trim();
  const name = (await rl.question("Nama Super Admin: ")).trim();
  const password = await rl.question("Password Super Admin: ");

  if (!username || !name || !password) {
    throw new Error("Semua kolom wajib diisi.");
  }

  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO admin_users (username, password_hash, name)
    VALUES (${username}, ${passwordHash}, ${name})
  `;

  console.log("\nAkun Super Admin berhasil dibuat.");
} catch (error) {
  console.error("\nGagal membuat akun:", error.message);
  process.exitCode = 1;
} finally {
  rl.close();
}