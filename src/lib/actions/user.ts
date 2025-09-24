"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { METRIC_KEYS } from "@/lib/constants";

const metricEnum = z.enum(METRIC_KEYS);

const preferencesSchema = z.object({
  metrics: z.array(metricEnum).refine((values) => values.includes("weight"), {
    message: "体重为必填指标",
  }),
  sharePhotosByDefault: z.boolean(),
});

export type PreferencesActionState = {
  error?: string;
  success?: boolean;
};

export async function updatePreferencesAction(
  _: PreferencesActionState,
  formData: FormData
): Promise<PreferencesActionState> {
  const session = await getSession();
  if (!session.userId) {
    return { error: "未登录" };
  }

  const metrics = formData.getAll("metrics").map((value) => value.toString());
  const sharePhotos = formData.get("sharePhotosByDefault") === "on";

  const parsed = preferencesSchema.safeParse({ metrics, sharePhotosByDefault: sharePhotos });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "参数有误" };
  }

  await updateDb((draft) => {
    const user = draft.users.find((item) => item.id === session.userId);
    if (!user) {
      return;
    }
    user.preferences.metrics = parsed.data.metrics;
    user.preferences.sharePhotosByDefault = parsed.data.sharePhotosByDefault;
    user.updatedAt = new Date().toISOString();
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true };
}
