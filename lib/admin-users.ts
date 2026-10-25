import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";
import { supabaseAdmin, usingSupabase } from "@/lib/store";

/**
 * Extra admin logins added by the owner in Settings. Passwords are stored as scrypt hashes,
 * in Supabase (admin_users, locked to the server) or a local JSON file when Supabase is off.
 * Kept out of the main database object so hashes never reach a page.
 */
export type AdminUser = { id: string; email: string; name: string; createdAt: string };
type StoredAdmin = AdminUser & { passwordHash: string };

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const filePath = process.env.VERCEL ? path.join("/tmp", "spotless-nt-admins.json") : path.join(process.cwd(), "data", "admins.json");

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

async function checkPassword(password: string, stored: string) {
  const [kind, saltHex, hashHex] = stored.split("$");
  if (kind !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

async function readAll(): Promise<StoredAdmin[]> {
  const sb = usingSupabase() ? supabaseAdmin() : null;
  if (sb) {
    const { data, error } = await sb.from("admin_users").select("*").order("created_at");
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({ id: row.id, email: row.email, name: row.name, passwordHash: row.password_hash, createdAt: row.created_at }));
  }
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as StoredAdmin[];
  } catch {
    return [];
  }
}

async function writeLocal(admins: StoredAdmin[]) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(admins, null, 2));
}

export async function listAdmins(): Promise<AdminUser[]> {
  return (await readAll()).map(({ id, email, name, createdAt }) => ({ id, email, name, createdAt }));
}

export async function isAdminEmail(email: string) {
  return (await readAll()).some((admin) => admin.email === email.toLowerCase());
}

export async function verifyAdmin(email: string, password: string) {
  const admin = (await readAll()).find((item) => item.email === email.toLowerCase());
  return admin ? checkPassword(password, admin.passwordHash) : false;
}

export async function addAdmin(input: { id: string; email: string; name: string; password: string }) {
  const record: StoredAdmin = { id: input.id, email: input.email.toLowerCase(), name: input.name, passwordHash: await hashPassword(input.password), createdAt: new Date().toISOString() };
  const sb = usingSupabase() ? supabaseAdmin() : null;
  if (sb) {
    const { error } = await sb.from("admin_users").insert({ id: record.id, email: record.email, name: record.name, password_hash: record.passwordHash });
    if (error) throw new Error(error.message);
    return;
  }
  await writeLocal([...(await readAll()), record]);
}

export async function setAdminPassword(id: string, password: string) {
  const passwordHash = await hashPassword(password);
  const sb = usingSupabase() ? supabaseAdmin() : null;
  if (sb) {
    const { error } = await sb.from("admin_users").update({ password_hash: passwordHash }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await writeLocal((await readAll()).map((admin) => (admin.id === id ? { ...admin, passwordHash } : admin)));
}

export async function removeAdmin(id: string) {
  const sb = usingSupabase() ? supabaseAdmin() : null;
  if (sb) {
    const { error } = await sb.from("admin_users").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  await writeLocal((await readAll()).filter((admin) => admin.id !== id));
}
