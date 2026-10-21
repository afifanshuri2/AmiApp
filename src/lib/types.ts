export const kinds = [
  "ShortNotes",
  "Goals",
  "Ambitions",
  "Todos",
  "Groceries",
  "Places",
  "Countdowns",
] as const;
export type Kind = (typeof kinds)[number];
export type Entry = {
  id: string;
  couple_id: string;
  kind: Kind;
  title: string;
  detail: string;
  done: boolean;
  progress: number;
  due_date: string | null;
  created_by: string;
  created_at: string;
};
export type Profile = {
  id: string;
  username: string;
  role: "husband" | "wife";
  couple_id: string | null;
};
