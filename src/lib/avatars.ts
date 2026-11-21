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
    wavy: "Wavy",
    ponytail: "Ponytail",
    bun: "Bun",
    buzz: "Buzz cut",
    side_part: "Side part",
  },
  hair_color: {
    espresso: "Espresso",
    chestnut: "Chestnut",
    honey: "Honey",
    silver: "Silver",
    black: "Black",
    auburn: "Auburn",
    blonde: "Blonde",
    pink: "Pink",
  },
  headwear: {
    none: "None",
    cap: "Cap",
    beanie: "Beanie",
    bucket: "Bucket hat",
    beret: "Beret",
    songkok: "Songkok",
    hijab: "Classic hijab",
    hijab_wrap: "Wrapped shawl",
    hijab_instant: "Instant hijab",
    hijab_sport: "Sport hijab",
    headband: "Headband",
    bow: "Hair bow",
    flower_crown: "Flower crown",
  },
  glasses: {
    none: "None",
    round: "Round",
    square: "Square",
    oval: "Oval",
    cat_eye: "Cat-eye",
    sunglasses: "Sunglasses",
  },
  eyes: { dot: "Dot eyes", almond: "Almond eyes", lashes: "Lashes" },
  nose: { none: "None", button: "Button", pointed: "Pointed" },
  facial_hair: {
    none: "None",
    moustache: "Moustache",
    beard: "Beard",
    goatee: "Goatee",
  },
  mood: {
    happy: "Happy",
    neutral: "Calm",
    angry: "Angry",
    sad: "Sad",
    sleepy: "Sleepy",
    love: "In love",
    surprised: "Surprised",
    excited: "Excited",
    wink: "Winking",
    cool: "Cool",
    shy: "Shy",
    proud: "Proud",
    silly: "Silly",
  },
  clothing: {
    tee: "T-shirt",
    hoodie: "Hoodie",
    shirt: "Collared shirt",
    sweater: "Sweater",
    dress: "Dress",
    jacket: "Jacket",
    kurung: "Baju kurung",
    baju_melayu: "Baju Melayu",
  },
  outfit: {
    rose: "Rose",
    sage: "Sage",
    lavender: "Lavender",
    blue: "Blue",
    coral: "Coral",
    mustard: "Mustard",
    navy: "Navy",
    teal: "Teal",
    charcoal: "Charcoal",
    cream: "Cream",
  },
  accessory: {
    none: "None",
    earrings: "Earrings",
    necklace: "Necklace",
    scarf: "Scarf",
    headphones: "Headphones",
    bowtie: "Bow tie",
  },
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
  eyes: "dot",
  nose: "none",
  facial_hair: "none",
  mood: "happy",
  clothing: "tee",
  accessory: "none",
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
// Used by the mood picker in the avatar editor.
export const moodEmoji: Record<AvatarConfig["mood"], string> = {
  happy: "😊",
  neutral: "😐",
  angry: "😠",
  sad: "😢",
  sleepy: "😴",
  love: "😍",
  surprised: "😮",
  excited: "🤩",
  wink: "😉",
  cool: "😎",
  shy: "😳",
  proud: "😌",
  silly: "😜",
};
