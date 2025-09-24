import { promises as fs } from "fs";
import path from "path";
import type { DatabaseShape } from "@/lib/types";

const DB_PATH = path.join(process.cwd(), "data/db.json");

let cache: DatabaseShape | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function readFromDisk(): Promise<DatabaseShape> {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as DatabaseShape;
}

async function writeToDisk(data: DatabaseShape) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
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
