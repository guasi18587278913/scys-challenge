import bcrypt from "bcryptjs";
import { readDb } from "@/lib/db";
import type { UserRecord } from "@/lib/types";

export async function getAllUsers(): Promise<UserRecord[]> {
  const db = await readDb();
  return db.users;
}

export async function findUserById(userId: string) {
  const db = await readDb();
  return db.users.find((user) => user.id === userId) ?? null;
}

export async function findUserByUsername(username: string) {
  const db = await readDb();
  return db.users.find((user) => user.username === username) ?? null;
}

export async function verifyUserPassword(user: UserRecord, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

export async function authenticate(username: string, password: string) {
  const user = await findUserByUsername(username);
  if (!user) {
    return null;
  }
  const valid = await verifyUserPassword(user, password);
  if (!valid) {
    return null;
  }
  return user;
}
