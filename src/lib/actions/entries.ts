"use server";

import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { entrySchema } from "@/lib/validators";
import { getSession } from "@/lib/session";
import { getActiveChallenge, findEntryByUserAndDate } from "@/lib/data-service";
import { updateDb } from "@/lib/db";
import type { DailyEntryRecord } from "@/lib/types";

export type EntryActionState = {
  error?: string;
  success?: boolean;
};

const DEFAULT_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");
const DATA_ROOT = process.env.DATA_ROOT;
const UPLOAD_DIR = DATA_ROOT ? path.join(DATA_ROOT, "uploads") : DEFAULT_UPLOAD_DIR;

async function persistPhoto(file: File, existingPath?: string) {
  if (!file || file.size === 0) {
    return existingPath;
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const extension = file.name.split(".").pop() ?? "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const fullPath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, buffer);

  if (existingPath && existingPath !== `/uploads/${filename}`) {
    const previous = path.join(process.cwd(), "public", existingPath.replace(/^\/+/, ""));
    fs.rm(previous, { force: true }).catch(() => undefined);
  }

  return `/uploads/${filename}`;
}

export async function saveEntryAction(_: EntryActionState, formData: FormData): Promise<EntryActionState> {
  const session = await getSession();
  if (!session.userId) {
    return { error: "登录已过期，请重新登录" };
  }

  const rawDate = formData.get("date");
  const rawWeight = formData.get("weightKg");
  const payload = {
    id: formData.get("id")?.toString() ?? undefined,
    userId: session.userId,
    date: rawDate?.toString() ?? "",
    weightKg: rawWeight?.toString() ?? "",
    exerciseMinutes: formData.get("exerciseMinutes")?.toString() ?? undefined,
    activityType: formData.get("activityType")?.toString() ?? undefined,
    breakfast: formData.get("breakfast")?.toString() ?? undefined,
    lunch: formData.get("lunch")?.toString() ?? undefined,
    dinner: formData.get("dinner")?.toString() ?? undefined,
    note: formData.get("note")?.toString() ?? undefined,
    photoShared: formData.get("photoShared") === "on",
  };

  const parsed = entrySchema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "请检查输入数据" };
  }

  const challenge = await getActiveChallenge(new Date(parsed.data.date));
  if (!challenge) {
    return { error: "当前没有挑战周期，无法记录" };
  }

  const dateObj = new Date(parsed.data.date);
  if (dateObj < new Date(challenge.startOn) || dateObj > new Date(challenge.endOn)) {
    return { error: "仅可记录当前挑战周期内的日期" };
  }

  const previous = await findEntryByUserAndDate(session.userId, parsed.data.date);
  const photoFile = formData.get("photo");
  const mealPhotoFile = formData.get("mealPhoto");
  let photoPath = previous?.photoPath;
  let mealPhotoPath = previous?.mealPhotoPath;

  if (photoFile instanceof File && photoFile.size > 0) {
    if (photoFile.size > 5 * 1024 * 1024) {
      return { error: "照片请控制在 5MB 以下" };
    }
    photoPath = await persistPhoto(photoFile, previous?.photoPath);
  }

  if (mealPhotoFile instanceof File && mealPhotoFile.size > 0) {
    if (mealPhotoFile.size > 5 * 1024 * 1024) {
      return { error: "三餐照片请控制在 5MB 以下" };
    }
    mealPhotoPath = await persistPhoto(mealPhotoFile, previous?.mealPhotoPath);
  }

  const now = new Date().toISOString();
  const meals =
    parsed.data.breakfast || parsed.data.lunch || parsed.data.dinner
      ? {
          breakfast: parsed.data.breakfast,
          lunch: parsed.data.lunch,
          dinner: parsed.data.dinner,
        }
      : undefined;
  const entry: DailyEntryRecord = {
    id: previous?.id ?? parsed.data.id ?? randomUUID(),
    userId: session.userId,
    date: parsed.data.date,
    weightKg: Number(parsed.data.weightKg),
    exerciseMinutes: parsed.data.exerciseMinutes ? Number(parsed.data.exerciseMinutes) : undefined,
    activityType: parsed.data.activityType,
    meals: meals ?? previous?.meals,
    mealPhotoPath,
    note: parsed.data.note?.trim() ? parsed.data.note.trim() : undefined,
    photoPath,
    photoShared: parsed.data.photoShared ?? false,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  };

  await updateDb((draft) => {
    const index = draft.entries.findIndex((item) => item.id === entry.id);
    if (index >= 0) {
      draft.entries[index] = entry;
    } else if (previous) {
      const prevIndex = draft.entries.findIndex(
        (item) => item.userId === previous.userId && item.date === previous.date
      );
      if (prevIndex >= 0) {
        draft.entries[prevIndex] = entry;
      } else {
        draft.entries.push(entry);
      }
    } else {
      draft.entries.push(entry);
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/record");
  revalidatePath("/challenges");

  return { success: true };
}

export async function deleteEntryAction(entryId: string) {
  const session = await getSession();
  if (!session.userId) {
    return { error: "未登录" };
  }

  let removedPhoto: string | undefined;
  let removedMealPhoto: string | undefined;

  await updateDb((draft) => {
    const entry = draft.entries.find((item) => item.id === entryId);
    if (!entry || entry.userId !== session.userId) {
      return;
    }
    removedPhoto = entry.photoPath;
    removedMealPhoto = entry.mealPhotoPath;
    draft.entries = draft.entries.filter((item) => item.id !== entryId);
  });

  if (removedPhoto) {
    const filePath = path.join(process.cwd(), "public", removedPhoto.replace(/^\/+/, ""));
    fs.rm(filePath, { force: true }).catch(() => undefined);
  }

  if (removedMealPhoto) {
    const filePath = path.join(process.cwd(), "public", removedMealPhoto.replace(/^\/+/, ""));
    fs.rm(filePath, { force: true }).catch(() => undefined);
  }

  revalidatePath("/dashboard");
  revalidatePath("/record");
  revalidatePath("/challenges");

  return { success: true };
}
