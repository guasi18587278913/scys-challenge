"use server";

import { revalidatePath } from "next/cache";
import { updateDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import type { PenaltyStatus } from "@/lib/types";

export type PenaltyActionState = {
  error?: string;
  success?: boolean;
};

const allowedStatuses: PenaltyStatus[] = ["PENDING", "COMPLETED", "WAIVED"];

export async function updatePenaltyStatusAction(_: PenaltyActionState, formData: FormData): Promise<PenaltyActionState> {
  const session = await getSession();
  if (!session.userId) {
    return { error: "未登录" };
  }

  const challengeId = formData.get("challengeId")?.toString();
  const userId = formData.get("userId")?.toString();
  const status = formData.get("status")?.toString() as PenaltyStatus | undefined;
  const note = formData.get("note")?.toString() ?? undefined;

  if (!challengeId || !userId || !status || !allowedStatuses.includes(status)) {
    return { error: "参数有误" };
  }

  const timestamp = new Date().toISOString();

  await updateDb((draft) => {
    const target = draft.targets.find((t) => t.challengeId === challengeId && t.userId === userId);
    if (!target) {
      return;
    }
    target.penaltyStatus = status;
    target.penaltyNote = note;
    target.penaltyRecordedAt = timestamp;
  });

  revalidatePath("/dashboard");
  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath("/challenges");

  return { success: true };
}
