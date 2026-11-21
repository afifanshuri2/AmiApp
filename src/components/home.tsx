"use client";
import { motion, type Variants } from "motion/react";
import {
  MessageCircle,
  ChevronRight,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";
import { CouplePlayground } from "./couple-playground";
import { CountUp } from "./motion-bits";
import { TodoFocus } from "./todo-focus";
import { GroceryNote } from "./grocery-note";
import { GoalsCard } from "./goals-card";
import { latestGroceryList } from "../lib/groceries";
import type { Entry, Kind, Profile } from "../lib/types";

// One short staggered entrance when Home opens.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 26 },
  },
};
const daysUntil = (date: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (new Date(date + "T00:00:00").getTime() - today.getTime()) / 86400000,
  );
};

export function Home({
  profile,
  partner,
  togetherSince,
  entries,
  unread,
  busy,
  onOpenKind,
  onOpenNotes,
  onToggle,
  onAdd,
  onToggleGroceryLine,
  onAddGroceryLine,
}: {
  profile: Profile;
  partner: Profile;
  togetherSince: string | null;
  entries: Entry[];
  unread: number;
  busy: boolean;
  onOpenKind: (kind: Kind) => void;
  onOpenNotes: () => void;
  onToggle: (entry: Entry) => void;
  onAdd: (kind: Kind) => void;
  onToggleGroceryLine: (list: Entry, index: number) => void;
  onAddGroceryLine: (text: string) => Promise<boolean>;
}) {
  const of = (...kinds: Kind[]) =>
    entries.filter((e) => kinds.includes(e.kind));
  const latest = of("ShortNotes")[0];
  const dates = of("Countdowns")
    .filter((e) => e.due_date && daysUntil(e.due_date) >= 0)
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));
  const places = of("Places").length,
    food = of("FoodToTry").filter((e) => !e.done).length;
  return (
    <motion.div
      className="home"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="home-hero" variants={rise}>
        <CouplePlayground
          key={profile.id}
          profile={profile}
          partner={partner}
          togetherSince={togetherSince}
          dates={dates}
          onAddDate={() => onAdd("Countdowns")}
          onSeeDates={() => onOpenKind("Countdowns")}
        />
      </motion.div>
      <motion.div className="home-todo" variants={rise}>
        <TodoFocus
          todos={of("Todos")}
          busy={busy}
          onToggle={onToggle}
          onAdd={() => onAdd("Todos")}
          onOpenAll={() => onOpenKind("Todos")}
        />
      </motion.div>
      <motion.div className="home-goals" variants={rise}>
        <GoalsCard
          goals={of("Goals", "Ambitions")}
          onAdd={() => onAdd("Ambitions")}
          onOpenAll={() => onOpenKind("Ambitions")}
        />
      </motion.div>
      <motion.div className="home-fridge" variants={rise}>
        <GroceryNote
          list={latestGroceryList(entries)}
          totalLists={of("Groceries").length}
          busy={busy}
          onToggleLine={onToggleGroceryLine}
          onAddLine={onAddGroceryLine}
          onNewList={() => onAdd("Groceries")}
          onOpenAll={() => onOpenKind("Groceries")}
        />
      </motion.div>
      <div className="home-more">
        <div className="tiles">
          <motion.button
            type="button"
            className="tile"
            variants={rise}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onOpenKind("Places")}
          >
            <span className="chip k5">
              <MapPin size={22} aria-hidden="true" />
            </span>
            <span className="tile-value">
              <CountUp value={places} />
            </span>
            <span className="tile-label">Places to go</span>
          </motion.button>
          <motion.button
            type="button"
            className="tile"
            variants={rise}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onOpenKind("FoodToTry")}
          >
            <span className="chip k6">
              <UtensilsCrossed size={22} aria-hidden="true" />
            </span>
            <span className="tile-value">
              <CountUp value={food} />
            </span>
            <span className="tile-label">Food to try</span>
          </motion.button>
        </div>
        <motion.button
          type="button"
          className="latest"
          variants={rise}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenNotes}
        >
          <span className="chip k1">
            <MessageCircle size={22} aria-hidden="true" />
          </span>
          <span className="latest-copy">
            <strong>
              {latest
                ? `${latest.created_by === profile.id ? "You" : partner.username} wrote`
                : "Notes"}
            </strong>
            <span>{latest ? latest.title : "Say something small"}</span>
          </span>
          {unread > 0 && (
            <span className="badge" aria-label={`${unread} unread notes`}>
              {unread}
            </span>
          )}
          <ChevronRight size={18} aria-hidden="true" />
        </motion.button>
      </div>
    </motion.div>
  );
}
