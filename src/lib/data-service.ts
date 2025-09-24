import { differenceInCalendarDays, isWithinInterval, parseISO } from "date-fns";
import { readDb, updateDb } from "@/lib/db";
import type {
  DailyEntryRecord,
  WeeklyChallengeRecord,
  WeeklyTargetRecord,
  UserRecord,
} from "@/lib/types";
import { findUserById } from "@/lib/auth";

export type ChallengeWithContext = {
  challenge: WeeklyChallengeRecord;
  targets: Array<
    WeeklyTargetRecord & {
      user: UserRecord | null;
      userDisplayName: string;
      colorHex: string;
    }
  >;
  entriesByUser: Record<string, DailyEntryRecord[]>;
  progressByUser: Record<
    string,
    {
      baselineWeight?: number;
      currentWeight?: number;
      delta?: number;
      remaining?: number;
      achieved: boolean;
      latestEntryDate?: string;
      entries: DailyEntryRecord[];
    }
  >;
};

export async function getActiveChallenge(date = new Date()): Promise<WeeklyChallengeRecord | null> {
  const db = await readDb();
  const active = db.challenges.find((challenge) => {
    const start = new Date(challenge.startOn);
    const end = new Date(challenge.endOn);
    return isWithinInterval(date, { start, end });
  });

  if (active) {
    return active;
  }

  const sorted = [...db.challenges].sort((a, b) => new Date(b.startOn).getTime() - new Date(a.startOn).getTime());
  return sorted[0] ?? null;
}

export async function getChallengeContext(challengeId?: string): Promise<ChallengeWithContext | null> {
  const db = await readDb();
  const challenge = challengeId
    ? db.challenges.find((c) => c.id === challengeId)
    : await getActiveChallenge();

  if (!challenge) {
    return null;
  }

  const start = new Date(challenge.startOn);
  const end = new Date(challenge.endOn);

  const targets = db.targets
    .filter((target) => target.challengeId === challenge.id)
    .map((target) => {
      const user = db.users.find((u) => u.id === target.userId);
      return {
        ...target,
        user: user ?? null,
        userDisplayName: user?.displayName ?? target.userId,
        colorHex: user?.colorHex ?? "#888888",
      };
    });

  const entriesByUser = db.entries.reduce<Record<string, DailyEntryRecord[]>>((acc, entry) => {
    if (!isWithinInterval(new Date(entry.date), { start, end })) {
      return acc;
    }
    if (!acc[entry.userId]) {
      acc[entry.userId] = [];
    }
    acc[entry.userId].push(entry);
    return acc;
  }, {});

  for (const key of Object.keys(entriesByUser)) {
    entriesByUser[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const progressByUser: ChallengeWithContext["progressByUser"] = {};

  for (const target of targets) {
    const userEntries = entriesByUser[target.userId] ?? [];
    const baseline = userEntries[0];
    const latest = userEntries[userEntries.length - 1];
    const delta = baseline && latest ? baseline.weightKg - latest.weightKg : undefined;
    const remaining = typeof delta === "number" ? target.targetDeltaKg - delta : target.targetDeltaKg;
    progressByUser[target.userId] = {
      baselineWeight: baseline?.weightKg,
      currentWeight: latest?.weightKg,
      delta,
      remaining,
      achieved: typeof delta === "number" ? delta >= target.targetDeltaKg : false,
      latestEntryDate: latest?.date,
      entries: userEntries,
    };
  }

  return {
    challenge,
    targets,
    entriesByUser,
    progressByUser,
  };
}

export async function listChallenges() {
  const db = await readDb();
  return [...db.challenges].sort((a, b) => new Date(b.startOn).getTime() - new Date(a.startOn).getTime());
}

export async function listEntriesForUser(userId: string) {
  const db = await readDb();
  return db.entries
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function upsertEntry(entry: DailyEntryRecord) {
  return updateDb(async (draft) => {
    const index = draft.entries.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      draft.entries[index] = entry;
    } else {
      draft.entries.push(entry);
    }
  });
}

export async function deleteEntry(entryId: string) {
  return updateDb((draft) => {
    draft.entries = draft.entries.filter((entry) => entry.id !== entryId);
  });
}

export async function getLatestEntryDate(userId: string, date = new Date()) {
  const db = await readDb();
  const entries = db.entries
    .filter((entry) => entry.userId === userId && new Date(entry.date) <= date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return entries[0]?.date ?? null;
}

export async function getStreakLength(userId: string, withinDays = 14) {
  const db = await readDb();
  const today = new Date();
  const userEntries = db.entries
    .filter((entry) => entry.userId === userId && differenceInCalendarDays(today, new Date(entry.date)) < withinDays)
    .map((entry) => parseISO(entry.date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const currentDate = new Date(today.toDateString());

  for (const entryDate of userEntries) {
    if (differenceInCalendarDays(currentDate, entryDate) === 0) {
      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (differenceInCalendarDays(currentDate, entryDate) === 1) {
      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (differenceInCalendarDays(currentDate, entryDate) > 1) {
      break;
    }
  }

  return streak;
}

export async function findEntryByUserAndDate(userId: string, date: string) {
  const db = await readDb();
  return db.entries.find((entry) => entry.userId === userId && entry.date === date) ?? null;
}

export async function resolveUserColor(userId: string) {
  const user = await findUserById(userId);
  return user?.colorHex ?? "#CCCCCC";
}

export function buildChallengeSummary(context: ChallengeWithContext) {
  return context.targets.map((target) => {
    const progress = context.progressByUser[target.userId];
    return {
      target,
      progress,
      actualDeltaKg: progress?.delta ?? 0,
      achieved: progress?.achieved ?? false,
      remaining: progress?.remaining ?? target.targetDeltaKg,
    };
  });
}
