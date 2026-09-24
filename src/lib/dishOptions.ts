import { Category, DietaryTag } from "@/generated/prisma/enums";

// Record<Enum, string> rather than Record<string, string> — the compiler
// refuses to build if a new enum member is ever added without a label
// here, which is what actually keeps these display maps from drifting out
// of sync with the schema (the bug this file exists to prevent).
export const CATEGORY_LABELS: Record<Category, string> = {
  classics: "Classics",
  italian: "Italian & Mediterranean",
  bowls: "Bowls",
  mexican: "Mexican",
};

export const DIETARY_TAG_LABELS: Record<DietaryTag, string> = {
  vegetarian: "Vegetarian",
  gluten_free: "Gluten-free",
  high_protein: "High-protein",
};

export const CATEGORY_VALUES = Object.values(Category);
export const DIETARY_TAG_VALUES = Object.values(DietaryTag);
