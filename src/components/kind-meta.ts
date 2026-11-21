import {
  BookHeart,
  Flag,
  Hourglass,
  ListChecks,
  MapPin,
  ShoppingBasket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Kind } from "../lib/types";

// One icon, one colour tone and one short name per feature, used everywhere.
export const kindMeta: Record<
  Kind,
  { label: string; hint: string; Icon: LucideIcon; tone: number }
> = {
  ShortNotes: {
    label: "Journal",
    hint: "The little things worth keeping.",
    Icon: BookHeart,
    tone: 1,
  },
  Goals: {
    label: "Goals",
    hint: "One small step, together.",
    Icon: Flag,
    tone: 4,
  },
  Ambitions: {
    label: "Goals",
    hint: "A little closer to the life we imagine.",
    Icon: Flag,
    tone: 4,
  },
  Todos: {
    label: "To-dos",
    hint: "Less remembering. More living.",
    Icon: ListChecks,
    tone: 3,
  },
  Groceries: {
    label: "Groceries",
    hint: "For our next grocery run.",
    Icon: ShoppingBasket,
    tone: 2,
  },
  Places: {
    label: "Places",
    hint: "Our next “let’s go there”.",
    Icon: MapPin,
    tone: 5,
  },
  FoodToTry: {
    label: "Food",
    hint: "New flavours, together.",
    Icon: UtensilsCrossed,
    tone: 6,
  },
  Countdowns: {
    label: "Countdowns",
    hint: "Good things are on their way.",
    Icon: Hourglass,
    tone: 3,
  },
};
// Order of the tabs in Lists, and of the Create sheet after Note.
export const listKinds: Kind[] = [
  "Groceries",
  "Todos",
  "Places",
  "FoodToTry",
  "Ambitions",
  "Countdowns",
];
export const createKinds: Kind[] = ["ShortNotes", ...listKinds];
