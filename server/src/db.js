import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSeed } from "./seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const DB_FILE = join(DATA_DIR, "db.json");

const EMPTY = {
  users: [],
  properties: [],
  contacts: [],
  vacancies: [],
  deals: [],
  team: [],
  activity: [],
  settings: {}, // misc persisted config (e.g. auto-created Razorpay plan id)
};

let cache = null;

function persist() {
  writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
}

// Load from disk, seeding a fresh workspace on first run.
export async function initDb() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

  if (existsSync(DB_FILE)) {
    cache = { ...EMPTY, ...JSON.parse(readFileSync(DB_FILE, "utf8")) };
    return;
  }

  cache = { ...EMPTY, ...(await buildSeed()) };
  persist();
}

// Direct access to the in-memory store. Mutate via the collection helpers below,
// then call save() to flush to disk.
export function getDb() {
  if (!cache) throw new Error("DB not initialized — call initDb() first");
  return cache;
}

export function save() {
  persist();
}

// ── Generic collection helpers ───────────────────────────
export const all = (name) => getDb()[name];

export const find = (name, id) => getDb()[name].find((x) => x.id === id);

export function insert(name, record, { prepend = false } = {}) {
  const list = getDb()[name];
  if (prepend) list.unshift(record);
  else list.push(record);
  save();
  return record;
}

export function update(name, id, patch) {
  const list = getDb()[name];
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch };
  save();
  return list[idx];
}

export function remove(name, id) {
  const list = getDb()[name];
  const idx = list.findIndex((x) => x.id === id);
  if (idx < 0) return false;
  list.splice(idx, 1);
  save();
  return true;
}
