import { promises as fs } from "fs";
import path from "path";
import type { DatabaseShape } from "@/lib/types";

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");
const DEFAULT_DB_PATH = path.join(DEFAULT_DATA_DIR, "db.json");
const DATA_ROOT = process.env.DATA_ROOT ?? DEFAULT_DATA_DIR;
const DB_PATH = path.join(DATA_ROOT, "db.json");

let cache: DatabaseShape | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function ensureDbExists() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    const seedPath = DB_PATH === DEFAULT_DB_PATH ? DB_PATH : DEFAULT_DB_PATH;
    const seed = await fs.readFile(seedPath, "utf-8");
    await fs.writeFile(DB_PATH, seed, "utf-8");
  }
}

async function readFromDisk(): Promise<DatabaseShape> {
  await ensureDbExists();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as DatabaseShape;
}

async function writeToDisk(data: DatabaseShape) {
  await ensureDbExists();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function readDb(): Promise<DatabaseShape> {
  if (!cache) {
    cache = await readFromDisk();
  }
  return structuredClone(cache);
}

async function readFresh(): Promise<DatabaseShape> {
  const data = await readFromDisk();
  cache = data;
  return structuredClone(data);
}

export function updateDb<T>(mutator: (draft: DatabaseShape) => T | Promise<T>): Promise<T> {
  const run = writeChain.then(async () => {
    const current = await readFresh();
    const draft = structuredClone(current);
    const result = await mutator(draft);
    await writeToDisk(draft);
    cache = draft;
    return result;
  });

  writeChain = run.then(
    () => undefined,
    () => undefined
  );

  return run;
}

export { DB_PATH };
