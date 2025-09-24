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
  exerciseMinutes: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? undefined : Number(val)))
    .optional(),
  activityType: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val.trim()))
    .optional(),
  breakfast: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val.trim()))
    .optional(),
  lunch: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val.trim()))
    .optional(),
  dinner: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val.trim()))
    .optional(),
  note: z.string().optional(),
  photoShared: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EntryInput = z.infer<typeof entrySchema>;
