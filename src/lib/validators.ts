import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "请选择账号"),
  password: z.string().min(1, "请输入密码"),
  remember: z.boolean().optional(),
});

export const entrySchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  date: z.string(),
  weightKg: z.coerce.number().min(20).max(200),
  photoShared: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EntryInput = z.infer<typeof entrySchema>;
