export const avatarOptions = {
  skin: {
    porcelain: "Porcelain",
    peach: "Peach",
    golden: "Golden",
    tan: "Tan",
    brown: "Brown",
    deep: "Deep",
  },
  hair: {
    short: "Short",
    bob: "Bob",
    curls: "Curls",
    long: "Long",
    none: "No hair",
  },
  hair_color: {
    espresso: "Espresso",
    chestnut: "Chestnut",
    honey: "Honey",
    silver: "Silver",
  },
  headwear: { none: "None", cap: "Cap", beanie: "Beanie", hijab: "Hijab" },
  glasses: { none: "None", round: "Round", square: "Square" },
  outfit: { rose: "Rose", sage: "Sage", lavender: "Lavender", blue: "Blue" },
} as const;
export type AvatarConfig = {
  [K in keyof typeof avatarOptions]: keyof (typeof avatarOptions)[K];
};
export type AvatarRecord = AvatarConfig & { user_id: string };
export const defaultAvatar: AvatarConfig = {
  skin: "peach",
  hair: "short",
  hair_color: "espresso",
  headwear: "none",
  glasses: "none",
  outfit: "sage",
};
export function avatarConfig(record?: Partial<AvatarConfig>): AvatarConfig {
  return Object.fromEntries(
    Object.entries(defaultAvatar).map(([key, fallback]) => {
      const value = record?.[key as keyof AvatarConfig];
      return [
        key,
        value && Object.hasOwn(avatarOptions[key as keyof AvatarConfig], value)
          ? value
          : fallback,
      ];
    }),
  ) as AvatarConfig;
}
export const gestures = {
  poke: {
    label: "Poke",
    emoji: "👉",
    received: "You’ve been poked!",
    detail: "A tiny tap. A little ‘thinking of you’.",
  },
  nudge: {
    label: "Nudge",
    emoji: "🫶",
    received: "A little nudge for you!",
    detail: "Your person wants a little of your attention.",
  },
  kiss: {
    label: "Kiss",
    emoji: "💋",
    received: "You’ve been kissed!",
    detail: "One little kiss, sent straight to you.",
  },
} as const;
export type GestureKind = keyof typeof gestures;
export type PartnerGesture = {
  id: string;
  sender_id: string;
  recipient_id: string;
  kind: GestureKind;
  created_at: string;
};
