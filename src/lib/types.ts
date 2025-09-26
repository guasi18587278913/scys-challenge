export type PenaltyStatus = "PENDING" | "COMPLETED" | "WAIVED";

export type UserRecord = {
  id: string;
  username: string;
  displayName: string;
  passwordHash: string;
  colorHex: string;
  preferences: {
    sharePhotosByDefault: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type WeeklyChallengeRecord = {
  id: string;
  label: string;
  startOn: string;
  endOn: string;
  rules: string;
  penalty: string;
  poolAmount?: number;
  penaltyAmount?: number;
};

export type WeeklyTargetRecord = {
  id: string;
  challengeId: string;
  userId: string;
  targetDeltaKg: number;
  penaltyStatus: PenaltyStatus;
  penaltyNote?: string;
  penaltyRecordedAt?: string;
};

export type DailyEntryRecord = {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  photoPath?: string;
  photoShared?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DatabaseShape = {
  users: UserRecord[];
  challenges: WeeklyChallengeRecord[];
  targets: WeeklyTargetRecord[];
  entries: DailyEntryRecord[];
};
