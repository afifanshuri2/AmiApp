"use client";

import type { ComponentProps } from "react";

const controls =
  "button, a, input, textarea, select, label, [role='button'], [role='checkbox'], [role='switch'], [contenteditable='true']";

export function FeatureCard({
  onOpen,
  ...props
}: ComponentProps<"section"> & { onOpen?: () => void }) {
  return (
    <section
      {...props}
      data-clickable={onOpen ? "true" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={
        onOpen
          ? (event) => {
              if (!(event.target as Element).closest(controls)) onOpen();
            }
          : undefined
      }
      onKeyDown={
        onOpen
          ? (event) => {
              if (
                event.target === event.currentTarget &&
                (event.key === "Enter" || event.key === " ")
              ) {
                event.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
    />
  );
}
