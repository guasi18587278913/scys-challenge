export const METRIC_KEYS = [
  "weight",
  "exerciseMinutes",
] as const;

export const METRIC_OPTIONS = [
  { key: "weight", label: "体重 (kg)", required: true },
  { key: "exerciseMinutes", label: "运动时长 (min)", required: false },
] as const;

export const MEMBER_COLORS: Record<string, string> = {
  sang: "#FF8A5C",
  gua: "#46A0FF",
  bi: "#5BC49F",
};
