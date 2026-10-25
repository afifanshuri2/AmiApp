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
  Plus,
  ArrowUpRight,
  LogOut,
  Check,
  RefreshCw,
  Settings,
  UtensilsCrossed,
} from "lucide-react";
import { kinds, type Entry, type Kind, type Profile } from "../lib/types";
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
  Goals: "Our goals",
  Ambitions: "Big little dreams",
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
        ? client.from("entries").update(data).eq("id", current.entry.id)
        : client.from("entries").insert({
            ...data,
            kind: current.kind,
            couple_id: profile.couple_id,
            created_by: profile.id,
          }),
    );
    if (ok) setEditor(null);
  }
  const completed = entries.filter((e) => e.done).length;
  function section(kind: Kind, compact = false) {
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
        <div className="couple-badge">
          <span aria-hidden="true">♡</span>
          <div>
            <strong>
              {profile.username} & {partner.username}
            </strong>
            <small>Better, together.</small>
          </div>
        </div>
        <nav aria-label="Main navigation">
          <button
            className={view === "Dashboard" ? "active" : ""}
            onClick={() => setView("Dashboard")}
          >
            <LayoutDashboard size={18} />
            Our dashboard
          </button>
          <p className="nav-caption">OUR EVERYDAY</p>
          {kinds.map((kind, index) => {
            const Icon = icons[index];
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
            {view !== "Settings" && (
              <Button
                onClick={() =>
                  setEditor({
                    kind: view === "Dashboard" ? "ShortNotes" : view,
                  })
                }
              >
                <Plus size={17} />
                Add a little thing
              </Button>
            )}
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
                  <section className="hero-card">
                    <div>
                      <span className="pill">♡ JUST THE TWO OF US</span>
                      <h2>
                        Small moments.
                        <br />
                        <em>Our favorite kind.</em>
                      </h2>
                      <p>
                        A note to say “thinking of you”. A plan for someday.
                        <br />
                        The beautiful ordinary, all in one place.
                      </p>
                      <button
                        className="text-link"
                        onClick={() => setView("ShortNotes")}
                      >
                        Leave a little love note <ArrowUpRight size={16} />
                      </button>
                    </div>
                    <div className="hero-art" aria-hidden="true">
                      <div className="orbit" />
                      <div className="heart heart-one">♥</div>
                      <div className="heart heart-two">♥</div>
                      <span className="star star-one">✧</span>
                      <span className="star star-two">✦</span>
                      <span className="art-caption">you + me, always.</span>
                    </div>
                  </section>
                  {togetherSince && <TogetherCard since={togetherSince} />}
                  <div className="stats">
                    <div>
                      <span>♡</span>
                      <strong>
                        {entries.filter((e) => e.kind === "ShortNotes").length}
                      </strong>
                      <small>little love notes</small>
                    </div>
                    <div>
                      <Flag size={20} />
                      <strong>
                        {
                          entries.filter((e) => e.kind === "Goals" && !e.done)
                            .length
                        }
                      </strong>
                      <small>dreams in the making</small>
                    </div>
                    <div>
                      <CheckSquare size={20} />
                      <strong>{completed}</strong>
                      <small>little wins together</small>
                    </div>
                  </div>
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
                    {kinds
                      .filter(
                        (k) =>
                          k !== "Countdowns" ||
                          entries.some((e) => e.kind === k),
                      )
                      .map((k) => section(k, true))}
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
