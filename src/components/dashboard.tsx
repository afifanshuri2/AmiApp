"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  LayoutGrid,
  ListChecks,
  MessageCircle,
  Plus,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import type { Entry, Kind, Profile } from "../lib/types";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { EntryEditor, type EntryInput } from "./entry-editor";
import { useNoteBadge } from "../lib/use-note-badge";
import { useEntries } from "../lib/use-entries";
import {
  groceryLines,
  latestGroceryList,
  serializeGrocery,
} from "../lib/groceries";
import { useTheme } from "../lib/use-theme";
import { Home } from "./home";
import { NotesChat } from "./notes-chat";
import { GroceryBook } from "./grocery-book";
import { EntryCollection } from "./entry-collection";
import { GoalsPanel, GoalDetail } from "./goals-panel";
import { ReminderStrip } from "./reminder-strip";
import { GestureToasts } from "./gesture-toasts";
import { SettingsView } from "./settings-view";
import { Logo } from "./logo";
import { createKinds, kindMeta, listKinds } from "./kind-meta";

type View = "Home" | "Notes" | "Lists" | "Settings";
const tabs: { view: View; label: string; Icon: typeof LayoutGrid }[] = [
  { view: "Home", label: "Home", Icon: LayoutGrid },
  { view: "Notes", label: "Notes", Icon: MessageCircle },
  { view: "Lists", label: "Lists", Icon: ListChecks },
  { view: "Settings", label: "Us", Icon: UserRound },
];
const createLabel: Record<Kind, string> = {
  ShortNotes: "Note",
  Goals: "Goal",
  Ambitions: "Goal",
  Todos: "To-do",
  Groceries: "Grocery item",
  Places: "Place",
  FoodToTry: "Food to try",
  Countdowns: "Countdown",
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
  const { entries, loading, error: loadError, reload } = useEntries();
  const { accent, setAccent, mode, setMode } = useTheme();
  const [view, setView] = useState<View>("Home"),
    [listKind, setListKind] = useState<Kind>("Groceries"),
    [editor, setEditor] = useState<{ kind: Kind; entry?: Entry } | null>(null),
    [creating, setCreating] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [foodCategory, setFoodCategory] = useState(""),
    [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const notes = entries.filter((e) => e.kind === "ShortNotes");
  const unread = useNoteBadge(
    profile.id,
    notes.map((e) => e.id),
    view === "Notes" && !loading,
  );
  // A notification tap opens ?view=ShortNotes.
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("view") === "ShortNotes"
    )
      setView("Notes");
  }, []);
  useEffect(() => {
    setSelectedGoal(null);
  }, [view, listKind]);
  const go = useCallback((next: View) => {
    setView(next);
    setError("");
    window.scrollTo({ top: 0 });
  }, []);
  const openKind = useCallback(
    (kind: Kind) => {
      setListKind(kind === "Goals" ? "Ambitions" : kind);
      go("Lists");
    },
    [go],
  );
  async function mutate(
    action: () => PromiseLike<{ error: { message: string } | null }>,
  ) {
    setBusy(true);
    setError("");
    try {
      const { error } = await action();
      if (error) throw error;
      await reload();
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
    const client = supabase,
      current = editor;
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
  async function sendNote(text: string) {
    if (!supabase) return false;
    // A note is a title; a long one keeps its full text in the detail.
    const letters = Array.from(text),
      title =
        letters.length <= 160 ? text : letters.slice(0, 157).join("") + "…";
    return mutate(() =>
      supabase!.from("entries").insert({
        kind: "ShortNotes",
        title,
        detail: title === text ? "" : text,
        couple_id: profile.couple_id,
        created_by: profile.id,
      }),
    );
  }
  // The fridge note edits the newest grocery list: items are lines of its text,
  // and a ticked item is stored as "[x] item".
  async function addGroceryLine(text: string, target?: Entry) {
    if (!supabase) return false;
    const list = target ?? latestGroceryList(entries);
    if (!list)
      return mutate(() =>
        supabase!.from("entries").insert({
          kind: "Groceries",
          title: "Groceries",
          detail: text,
          couple_id: profile.couple_id,
          created_by: profile.id,
        }),
      );
    const lines = groceryLines(list);
    if (!lines.length) lines.push({ text: list.title, done: list.done });
    lines.push({ text, done: false });
    return mutate(() =>
      supabase!
        .from("entries")
        .update({
          detail: serializeGrocery(lines),
          done: lines.every((l) => l.done),
        })
        .eq("id", list.id),
    );
  }
  function toggleGroceryLine(list: Entry, index: number) {
    const lines = groceryLines(list);
    if (!lines.length) return toggleEntry(list);
    lines[index] = { ...lines[index], done: !lines[index].done };
    void mutate(() =>
      supabase!
        .from("entries")
        .update({
          detail: serializeGrocery(lines),
          done: lines.every((l) => l.done),
        })
        .eq("id", list.id),
    );
  }
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
  const goals = entries.filter(
    (e) => e.kind === "Goals" || e.kind === "Ambitions",
  );
  const heading =
    view === "Home"
      ? `Hi ${profile.username}`
      : view === "Notes"
        ? partner.username
        : view === "Lists"
          ? "Our lists"
          : "Us";
  function list() {
    if (listKind === "Ambitions" || listKind === "Goals") {
      const goal = goals.find((g) => g.id === selectedGoal);
      return goal ? (
        <GoalDetail
          goal={goal}
          profile={profile}
          partner={partner}
          onBack={() => setSelectedGoal(null)}
          onSaved={reload}
        />
      ) : (
        <GoalsPanel
          goals={goals}
          loading={loading}
          busy={busy}
          onSelect={(g) => setSelectedGoal(g.id)}
          onAdd={() => setEditor({ kind: "Ambitions" })}
          onEdit={(entry) => setEditor({ kind: "Ambitions", entry })}
          onDelete={deleteEntry}
        />
      );
    }
    if (listKind === "Todos")
      return (
        <ReminderStrip
          todos={entries.filter((e) => e.kind === "Todos")}
          busy={busy}
          onAdd={() => setEditor({ kind: "Todos" })}
          onEdit={(entry) => setEditor({ kind: "Todos", entry })}
          onDelete={deleteEntry}
          onToggle={toggleEntry}
        />
      );
    if (listKind === "Groceries")
      return (
        <GroceryBook
          lists={entries.filter((e) => e.kind === "Groceries")}
          busy={busy}
          onToggleLine={toggleGroceryLine}
          onAddLine={addGroceryLine}
          onNewList={() => setEditor({ kind: "Groceries" })}
          onEdit={(entry) => setEditor({ kind: "Groceries", entry })}
          onDelete={deleteEntry}
        />
      );
    return (
      <EntryCollection
        kind={listKind as Exclude<Kind, "ShortNotes">}
        entries={entries}
        loading={loading}
        busy={busy}
        foodCategory={foodCategory}
        setFoodCategory={setFoodCategory}
        onAdd={() => setEditor({ kind: listKind })}
        onEdit={(entry) => setEditor({ kind: listKind, entry })}
        onDelete={deleteEntry}
        onToggle={toggleEntry}
      />
    );
  }
  const navButtons = (items: typeof tabs, scope: string) =>
    items.map(({ view: v, label, Icon }) => (
      <motion.button
        key={v}
        type="button"
        className={`nav-btn ${view === v ? "on" : ""}`}
        aria-current={view === v ? "page" : undefined}
        whileTap={{ scale: 0.9 }}
        onClick={() => go(v)}
      >
        <span className="nav-icon">
          {view === v && (
            <motion.span
              layoutId={`nav-pill-${scope}`}
              className="nav-pill"
              transition={{ type: "spring", stiffness: 500, damping: 36 }}
            />
          )}
          <Icon size={24} aria-hidden="true" />
          {v === "Notes" && unread > 0 && (
            <span className="badge" aria-label={`${unread} unread notes`}>
              {unread}
            </span>
          )}
        </span>
        {label}
      </motion.button>
    ));
  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <nav className="rail" aria-label="Main navigation">
          <div className="rail-logo" aria-hidden="true">
            <Logo />
          </div>
          <motion.button
            type="button"
            className="create-btn"
            aria-label="Create"
            whileHover={{ rotate: 90, scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => setCreating(true)}
          >
            <Plus size={24} aria-hidden="true" />
          </motion.button>
          {navButtons(tabs, "rail")}
        </nav>
        <main className={`page view-${view}`}>
          <header className="page-head">
            <h1>{heading}</h1>
            {view === "Home" && (
              <p className="muted">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </header>
          {(error || loadError) && (
            <p className="error" role="alert">
              {error || loadError}
            </p>
          )}
          {view === "Lists" && (
            <div className="seg-tabs" role="tablist" aria-label="Lists">
              {listKinds.map((kind) => {
                const { label, Icon } = kindMeta[kind];
                const on =
                  listKind === kind ||
                  (kind === "Ambitions" && listKind === "Goals");
                return (
                  <motion.button
                    key={kind}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setListKind(kind)}
                  >
                    {on && (
                      <motion.span
                        layoutId="seg-pill"
                        className="seg-pill"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 38,
                        }}
                      />
                    )}
                    <Icon size={18} aria-hidden="true" />
                    <span>{label}</span>
                  </motion.button>
                );
              })}
            </div>
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view === "Lists" ? `Lists-${listKind}` : view}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? {} : { opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {view === "Home" ? (
                <Home
                  profile={profile}
                  partner={partner}
                  togetherSince={togetherSince}
                  entries={entries}
                  unread={unread}
                  busy={busy}
                  onOpenKind={openKind}
                  onOpenNotes={() => go("Notes")}
                  onToggle={toggleEntry}
                  onAdd={(kind) => setEditor({ kind })}
                  onToggleGroceryLine={toggleGroceryLine}
                  onAddGroceryLine={addGroceryLine}
                />
              ) : view === "Notes" ? (
                <NotesChat
                  notes={notes}
                  profile={profile}
                  partner={partner}
                  loading={loading}
                  busy={busy}
                  onSend={sendNote}
                  onEdit={(entry) => setEditor({ kind: "ShortNotes", entry })}
                  onDelete={deleteEntry}
                />
              ) : view === "Lists" ? (
                list()
              ) : (
                <SettingsView
                  userId={profile.id}
                  togetherSince={togetherSince}
                  onRelationshipSaved={onRelationshipSaved}
                  accent={accent}
                  setAccent={setAccent}
                  mode={mode}
                  setMode={setMode}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <nav className="tabbar" aria-label="Tabs">
          {navButtons(tabs.slice(0, 2), "bar-a")}
          <motion.button
            type="button"
            className="create-btn"
            aria-label="Create"
            whileTap={{ scale: 0.88, rotate: 90 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={() => setCreating(true)}
          >
            <Plus size={26} aria-hidden="true" />
          </motion.button>
          {navButtons(tabs.slice(2), "bar-b")}
        </nav>
        <GestureToasts key={profile.id} profile={profile} partner={partner} />
        {creating && (
          <Dialog open onOpenChange={(open) => !open && setCreating(false)}>
            <DialogContent
              className="sheet"
              showCloseButton={false}
              aria-describedby={undefined}
            >
              <div className="section-heading">
                <DialogTitle asChild>
                  <h2>Create</h2>
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={() => setCreating(false)}
                >
                  <X size={18} />
                </Button>
              </div>
              <div className="sheet-list">
                {createKinds.map((kind, index) => {
                  const { Icon, tone } = kindMeta[kind];
                  return (
                    <motion.button
                      key={kind}
                      type="button"
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.04 + index * 0.035,
                        duration: 0.2,
                      }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setCreating(false);
                        setEditor({ kind });
                      }}
                    >
                      <span className={`chip k${tone}`}>
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      {createLabel[kind]}
                    </motion.button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        )}
        {editor && (
          <EntryEditor
            kind={editor.kind}
            entry={editor.entry}
            busy={busy}
            save={save}
            close={() => setEditor(null)}
          />
        )}
      </div>
    </MotionConfig>
  );
}
