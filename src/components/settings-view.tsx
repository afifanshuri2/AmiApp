"use client";
import { motion } from "motion/react";
import {
  LogOut,
  Moon,
  Palette,
  Sun,
  SunMoon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { RelationshipForm } from "./relationship-form";
import { NotificationSettings } from "./notification-settings";
import { signOut } from "../lib/notifications";
import { accents, modes, type Accent, type Mode } from "../lib/use-theme";

const modeIcons: Record<Mode, LucideIcon> = {
  auto: SunMoon,
  light: Sun,
  dark: Moon,
};
const modeLabels: Record<Mode, string> = {
  auto: "Auto",
  light: "Light",
  dark: "Dark",
};

export function SettingsView({
  userId,
  togetherSince,
  onRelationshipSaved,
  accent,
  setAccent,
  mode,
  setMode,
}: {
  userId: string;
  togetherSince: string | null;
  onRelationshipSaved: (date: string | null) => Promise<void>;
  accent: Accent;
  setAccent: (value: Accent) => void;
  mode: Mode;
  setMode: (value: Mode) => void;
}) {
  return (
    <div className="settings">
      <section className="panel appearance" aria-label="Appearance">
        <h2>
          <Palette size={20} aria-hidden="true" />
          Appearance
        </h2>
        <div className="segmented" role="group" aria-label="Colour mode">
          {modes.map((value) => {
            const Icon = modeIcons[value];
            return (
              <motion.button
                key={value}
                type="button"
                aria-pressed={mode === value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode(value)}
              >
                {mode === value && (
                  <motion.span
                    layoutId="mode-pill"
                    className="mode-pill"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon size={18} aria-hidden="true" />
                <span>{modeLabels[value]}</span>
              </motion.button>
            );
          })}
        </div>
        <div className="swatches" role="group" aria-label="Accent colour">
          {accents.map((value) => (
            <motion.button
              key={value}
              type="button"
              className={`swatch ${value}`}
              aria-label={`${value} accent`}
              aria-pressed={accent === value}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              animate={{ scale: accent === value ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              onClick={() => setAccent(value)}
            />
          ))}
        </div>
      </section>
      <RelationshipForm
        initialDate={togetherSince}
        onSaved={onRelationshipSaved}
      />
      <NotificationSettings userId={userId} />
      <Button variant="outline" onClick={signOut}>
        <LogOut size={16} />
        Log out
      </Button>
    </div>
  );
}
