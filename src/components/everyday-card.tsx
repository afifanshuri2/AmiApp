import type { ComponentProps } from "react";
import { FeatureCard } from "./feature-card";
import type { Kind } from "../lib/types";

const materials: Partial<Record<Kind, string>> = {
  Goals: "clipboard",
  Ambitions: "vision-board",
  Todos: "daily-planner",
  Places: "postcards",
  FoodToTry: "recipe-box",
  Countdowns: "desk-calendar",
};

export function EverydayCard({
  kind,
  className = "",
  children,
  ...props
}: ComponentProps<typeof FeatureCard> & { kind: Kind }) {
  const material = materials[kind];
  return (
    <FeatureCard
      {...props}
      className={`card collection ${kind === "Groceries" ? "sticky-note" : `everyday-object ${material}`} ${className}`}
    >
      {material && <span className="object-decoration" aria-hidden="true" />}
      {material ? <div className="object-surface">{children}</div> : children}
    </FeatureCard>
  );
}
