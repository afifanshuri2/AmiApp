export const kinds = [
  "ShortNotes",
  "Goals",
  "Ambitions",
  "Todos",
  "Groceries",
  "Places",
  "FoodToTry",
  "Countdowns",
] as const;
export type Kind = (typeof kinds)[number];
export type Entry = {
  id: string;
  couple_id: string;
  kind: Kind;
  title: string;
  detail: string;
  category: string;
  place_name: string;
  location: string;
  done: boolean;
  progress: number;
  due_date: string | null;
  due_at?: string | null;
  emoji?: string;
  created_by: string;
  created_at: string;
};
export type GoalUpdate = {
  id: string;
  entry_id: string;
  description: string;
  progress: number;
  created_by: string;
  created_at: string;
};
export const featureKinds = kinds.filter(
  (kind) => kind !== "Goals" && kind !== "Todos",
);
export type Profile = {
  id: string;
  username: string;
  role: "husband" | "wife";
  couple_id: string | null;
};
export const foodCategories = [
  "Western",
  "Malay",
  "Kampung",
  "Chinese",
  "Indian",
  "Japanese",
  "Korean",
  "Thai",
  "Indonesian",
  "Middle Eastern",
  "Seafood",
  "Desserts",
  "Other",
];
