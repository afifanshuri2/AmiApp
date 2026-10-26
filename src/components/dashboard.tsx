"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  LayoutDashboard,
  NotebookPen,
  Flag,
  Sparkles,
  CheckSquare,
  ShoppingBasket,
  MapPin,
  Hourglass,
  ArrowUpRight,
  LogOut,
  Check,
  RefreshCw,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import {
  kinds,
  featureKinds,
  type Entry,
  type Kind,
  type Profile,
} from "../lib/types";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { EntryEditor, type EntryInput } from "./entry-editor";
import { Logo } from "./logo";
import { TogetherCard } from "./together-card";
import { RelationshipForm } from "./relationship-form";
import { NotificationSettings } from "./notification-settings";
import { useNoteBadge } from "../lib/use-note-badge";
import { signOut } from "../lib/notifications";
import { ShortNotesNotebook } from "./shortnotes-notebook";
import { EntryCollection } from "./entry-collection";
import { GoalsPanel, GoalDetail } from "./goals-panel";
import { ReminderStrip } from "./reminder-strip";
import { CouplePlayground } from "./couple-playground";
import { GestureToasts } from "./gesture-toasts";
const icons = [
  NotebookPen,
  Flag,
  Sparkles,
  CheckSquare,
  ShoppingBasket,
  MapPin,
  UtensilsCrossed,
  Hourglass,
];
const labels: Record<Kind, string> = {
  ShortNotes: "ShortNotes",
  Goals: "Goals & ambitions",
  Ambitions: "Goals & ambitions",
  Todos: "To-dos & reminders",
  Groceries: "Grocery list",
  Places: "Places to go",
  FoodToTry: "Food to try",
  Countdowns: "Counting down",
};
const hints: Record<Kind, string> = {
  ShortNotes: "The little things worth keeping.",
  Goals: "One small step, together.",
  Ambitions: "A little closer to the life we imagine.",
  Todos: "Less remembering. More living.",
  Groceries: "For our next little grocery run.",
  Places: "Our next “let’s go there”.",
  FoodToTry: "New flavors, little food adventures, together.",
  Countdowns: "Good things are on their way.",
};
export function Dashboard({
  profile,
  partner,
  togetherSince,
  onRelationshipSaved,
}: {
  profile: Profile;
  partner: Profile;
  togetherSince: string | null;
  onRelationshipSaved: (date: string | null) => Promise<void>;
}) {
  const [entries, setEntries] = useState<Entry[]>([]),
    [view, setView] = useState<Kind | "Dashboard" | "Settings">("Dashboard"),
    [theme, setTheme] = useState("rose"),
    [editor, setEditor] = useState<{ kind: Kind; entry?: Entry } | null>(null),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [foodCategory, setFoodCategory] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  useEffect(() => {
    setSelectedGoal(null);
  }, [view]);
  const reduced = useReducedMotion();
  const unread = useNoteBadge(
    profile.id,
    entries.filter((e) => e.kind === "ShortNotes").map((e) => e.id),
    view === "ShortNotes" && !loading,
  );
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("view") === "ShortNotes"
    )
      setView("ShortNotes");
  }, []);
  useEffect(() => {
    const saved = localStorage.getItem("ami-theme");
    if (saved && ["rose", "sage", "lavender"].includes(saved)) setTheme(saved);
  }, []);
  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else {
      setEntries(data || []);
      setError("");
    }
    setLoading(false);
  }
  useEffect(() => {
    let active = true;
    async function fetchEntries() {
      if (!supabase) return;
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) setError(error.message);
      else setEntries(data || []);
      setLoading(false);
    }
    void fetchEntries();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void fetchEntries();
    }, 20000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);
  async function mutate(
    action: () => PromiseLike<{ error: { message: string } | null }>,
  ) {
    setBusy(true);
    setError("");
    try {
      const { error } = await action();
      if (error) throw error;
      await load();
      return true;
    } catch (e) {
      setError(
        e && typeof e === "object" && "message" in e
          ? String(e.message)
          : "Could not save. Please try again.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function save(data: EntryInput) {
    if (!supabase || !editor) return;
    const client = supabase;
    const current = editor;
    const ok = await mutate(() =>
      current.entry
        ? client
            .from("entries")
            .update({
              ...data,
              ...(current.kind === "Ambitions"
                ? { done: data.progress === 100 }
                : {}),
            })
            .eq("id", current.entry.id)
        : client.from("entries").insert({
            ...data,
            kind: current.kind,
            couple_id: profile.couple_id,
            created_by: profile.id,
          }),
    );
    if (ok) setEditor(null);
  }
  const goals = entries.filter(
    (entry) => entry.kind === "Goals" || entry.kind === "Ambitions",
  );
  function deleteEntry(entry: Entry) {
    if (window.confirm(`Delete “${entry.title}” for both of you?`))
      void mutate(() => supabase!.from("entries").delete().eq("id", entry.id));
  }
  function toggleEntry(entry: Entry) {
    void mutate(() =>
      supabase!
        .from("entries")
        .update({ done: !entry.done })
        .eq("id", entry.id),
    );
  }
  function section(kind: Kind, compact = false) {
    if (kind === "Ambitions" || kind === "Goals") {
      const goal = goals.find((goal) => goal.id === selectedGoal);
      if (!compact && goal)
        return (
          <GoalDetail
            goal={goal}
            profile={profile}
            partner={partner}
            onBack={() => setSelectedGoal(null)}
            onSaved={load}
          />
        );
      return (
        <GoalsPanel
          key="Ambitions"
          goals={goals}
          compact={compact}
          busy={busy}
          loading={loading}
          onOpen={() => setView("Ambitions")}
          onSelect={(goal) => setSelectedGoal(goal.id)}
          onAdd={() => setEditor({ kind: "Ambitions" })}
          onEdit={(entry) => setEditor({ kind: "Ambitions", entry })}
          onDelete={deleteEntry}
        />
      );
    }
    const list = entries.filter(
      (e) =>
        e.kind === kind &&
        (kind !== "FoodToTry" ||
          compact ||
          !foodCategory ||
          e.category === foodCategory),
    );
    const Icon = icons[kinds.indexOf(kind)];
    if (kind === "ShortNotes")
      return (
        <ShortNotesNotebook
          key={kind}
          notes={list}
          profile={profile}
          partner={partner}
          compact={compact}
          loading={loading}
          busy={busy}
          onAdd={() => setEditor({ kind })}
          onEdit={(entry) => setEditor({ kind, entry })}
          onOpen={() => setView("ShortNotes")}
          onDelete={(entry) => {
            if (window.confirm(`Delete “${entry.title}” for both of you?`))
              void mutate(() =>
                supabase!.from("entries").delete().eq("id", entry.id),
              );
          }}
        />
      );
    return (
      <EntryCollection
        key={kind}
        kind={kind}
        entries={entries}
        label={labels[kind]}
        hint={hints[kind]}
        Icon={Icon}
        compact={compact}
        loading={loading}
        busy={busy}
        foodCategory={foodCategory}
        setFoodCategory={setFoodCategory}
        onOpen={() => setView(kind)}
        onAdd={() => setEditor({ kind })}
        onEdit={(entry) => setEditor({ kind, entry })}
        onDelete={(entry) => {
          if (window.confirm(`Delete “${entry.title}” for both of you?`))
            void mutate(() =>
              supabase!.from("entries").delete().eq("id", entry.id),
            );
        }}
        onToggle={(entry) => {
          void mutate(() =>
            supabase!
              .from("entries")
              .update({ done: !entry.done })
              .eq("id", entry.id),
          );
        }}
      />
    );
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <a className="wordmark" href="#" onClick={() => setView("Dashboard")}>
          <Logo />
        </a>
        <nav aria-label="Main navigation">
          <button
            className={view === "Dashboard" ? "active" : ""}
            onClick={() => setView("Dashboard")}
          >
            <LayoutDashboard size={18} />
            Our dashboard
          </button>
          <p className="nav-caption">OUR EVERYDAY</p>
          {featureKinds.map((kind) => {
            const Icon = icons[kinds.indexOf(kind)];
            return (
              <button
                key={kind}
                className={view === kind ? "active" : ""}
                onClick={() => setView(kind)}
              >
                <Icon size={18} />
                {labels[kind]}
                {kind === "ShortNotes" && unread > 0 && (
                  <span
                    className="unread-badge"
                    aria-label={`${unread} unread notes`}
                  >
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={view === "Settings" ? "active" : ""}
            onClick={() => setView("Settings")}
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            Our little corner{" "}
            <span className="muted">
              /{" "}
              {view === "Dashboard" || view === "Settings"
                ? view
                : labels[view]}
            </span>
          </span>
          <div className="theme-picker" aria-label="Color theme">
            {["rose", "sage", "lavender"].map((t) => (
              <button
                key={t}
                className={`theme-dot ${t}`}
                aria-label={`${t} theme`}
                aria-pressed={theme === t}
                onClick={() => {
                  setTheme(t);
                  localStorage.setItem("ami-theme", t);
                }}
              >
                {theme === t && <Check size={12} />}
              </button>
            ))}
          </div>
        </header>
        <main className="dashboard">
          <div className="page-heading">
            <div>
              <p className="eyebrow">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h1>
                {view === "Dashboard"
                  ? "Home is wherever we are."
                  : view === "Settings"
                    ? "Our settings"
                    : labels[view]}
              </h1>
              <p className="muted">
                {view === "Dashboard"
                  ? `Hey ${profile.username}, let’s make a little room for us today. ♡`
                  : view === "Settings"
                    ? "The little details that make this space ours."
                    : hints[view]}
              </p>
            </div>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? {} : { opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {view === "Settings" ? (
                <div className="single-collection">
                  <RelationshipForm
                    initialDate={togetherSince}
                    onSaved={onRelationshipSaved}
                  />
                  <NotificationSettings userId={profile.id} />
                  <div>
                    <Button variant="outline" onClick={signOut}>
                      <LogOut size={16} />
                      Log out
                    </Button>
                  </div>
                </div>
              ) : view === "Dashboard" ? (
                <>
                  <CouplePlayground
                    key={profile.id}
                    profile={profile}
                    partner={partner}
                    theme={theme}
                  />
                  {togetherSince && <TogetherCard since={togetherSince} />}
                  <ReminderStrip
                    todos={entries.filter((entry) => entry.kind === "Todos")}
                    busy={busy}
                    onAdd={() => setEditor({ kind: "Todos" })}
                    onEdit={(entry) => setEditor({ kind: "Todos", entry })}
                    onDelete={deleteEntry}
                    onToggle={toggleEntry}
                  />
                  <div className="grid-heading">
                    <h2>A little of our everyday</h2>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Refresh shared data"
                      disabled={loading}
                      onClick={load}
                    >
                      <RefreshCw size={16} />
                    </Button>
                  </div>
                  <div className="collections-grid">
                    {featureKinds.map((k) => section(k, true))}
                  </div>
                  <footer>
                    Built on little things. Held together with love. ♡
                  </footer>
                </>
              ) : (
                <div className="single-collection">{section(view)}</div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <GestureToasts
        key={profile.id}
        profile={profile}
        partner={partner}
        theme={theme}
      />
      {editor && (
        <EntryEditor
          theme={theme}
          kind={editor.kind}
          entry={editor.entry}
          busy={busy}
          save={save}
          close={() => setEditor(null)}
        />
      )}
    </div>
  );
}
