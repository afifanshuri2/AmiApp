import { avatarConfig, type AvatarConfig } from "../lib/avatars";

const skins = {
  porcelain: "#f6d6bf",
  peach: "#edb895",
  golden: "#dca474",
  tan: "#bb8059",
  brown: "#905e41",
  deep: "#603f31",
};
const hairColors = {
  espresso: "#392c2b",
  chestnut: "#79523e",
  honey: "#c49a57",
  silver: "#bbc0c2",
  black: "#1f1a1c",
  auburn: "#8a3f2a",
  blonde: "#e0b96a",
  pink: "#e58aa7",
};
const outfits = {
  rose: "#bc788a",
  sage: "#7c9b88",
  lavender: "#a192be",
  blue: "#789caf",
  coral: "#e0775f",
  mustard: "#d9a935",
  navy: "#3d5a86",
  teal: "#3f9a93",
  charcoal: "#4b4a52",
  cream: "#efe4d2",
};
const INK = "#352c2e",
  MOUTH = "#714d43",
  GOLD = "#e2b857",
  SHADE = "#00000022";

type Look = AvatarConfig & { skinHex: string; hairHex: string; color: string };

/** Hair that sits behind the head and shoulders. */
function HairBack({ a, hair }: { a: Look; hair: string }) {
  switch (a.hair) {
    case "long":
      return <path d="M39 67Q38 22 80 22T121 67L127 145H33Z" fill={hair} />;
    case "wavy":
      return (
        <path
          d="M37 66Q36 22 80 22T123 66V120a8.6 8.6 0 0 1-17.2 0a8.6 8.6 0 0 1-17.2 0a8.6 8.6 0 0 1-17.2 0a8.6 8.6 0 0 1-17.2 0a8.6 8.6 0 0 1-17.2 0Z"
          fill={hair}
        />
      );
    case "ponytail":
      return (
        <path
          d="M108 38q36 4 28 50-4 22-18 30 8-26-2-42-4-12-16-16Z"
          fill={hair}
        />
      );
    default:
      return null;
  }
}

/** Hair that frames the face. */
function HairFront({ a, hair }: { a: Look; hair: string }) {
  switch (a.hair) {
    case "short":
      return (
        <path
          d="M39 75V57q0-35 40-35t42 35v18l-11-24q-25 14-55 3Z"
          fill={hair}
        />
      );
    case "bob":
      return (
        <path
          d="M34 103V60q0-39 46-39t46 39v43l-14-7V55q-35 13-54 0v41Z"
          fill={hair}
        />
      );
    case "long":
      return (
        <path
          d="M39 70V57q0-35 41-35t41 35v13L99 47Q74 65 48 61Z"
          fill={hair}
        />
      );
    case "wavy":
      return (
        <path
          d="M38 78V57q0-35 42-35t42 35v21q-6-24-22-30-20 14-40 4-14 6-22 26Z"
          fill={hair}
        />
      );
    case "ponytail":
      return (
        <g fill={hair}>
          <path d="M39 75V57q0-35 40-35t42 35v18l-11-24q-25 14-55 3Z" />
          <circle cx="114" cy="42" r="5" fill="#ffffff55" />
        </g>
      );
    case "bun":
      return (
        <g fill={hair}>
          <circle cx="80" cy="14" r="14" />
          <path d="M39 74V57q0-33 41-33t41 33v17q-14-22-41-22T39 74Z" />
          <path d="M66 22q14-6 28 0" stroke="#ffffff44" strokeWidth="3" />
        </g>
      );
    case "buzz":
      return (
        <path
          d="M41 66q0-33 39-33t39 33q-10-14-39-14T41 66Z"
          fill={hair}
          opacity=".85"
        />
      );
    case "side_part":
      return (
        <path
          d="M39 80V57q0-35 41-35t41 35v23q-6-26-24-34-32 18-58 34Z"
          fill={hair}
        />
      );
    case "curls":
      return (
        <g fill={hair}>
          {[40, 55, 72, 90, 107, 120].map((x, i) => (
            <circle
              key={x}
              cx={x}
              cy={i === 0 || i === 5 ? 54 : i === 1 || i === 4 ? 35 : 29}
              r="16"
            />
          ))}
        </g>
      );
    default:
      return null;
  }
}

/** Eyes, brows, mouth and little extras for each mood. */
function Face({ a, hair }: { a: Look; hair: string }) {
  const brow = (d: string) => (
    <path
      d={d}
      stroke={hair}
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
      opacity=".85"
    />
  );
  const openEyes = (dy = 0) =>
    a.eyes === "almond" ? (
      <g stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M55 81q8-10 16 0q-8 8-16 0m34 0q8-10 16 0q-8 8-16 0" />
        <circle cx="63" cy={81 + dy} r="2" fill={INK} />
        <circle cx="97" cy={81 + dy} r="2" fill={INK} />
      </g>
    ) : (
      <g>
        <ellipse cx="63" cy={81 + dy} rx="3.6" ry="5" fill={INK} />
        <ellipse cx="97" cy={81 + dy} rx="3.6" ry="5" fill={INK} />
        <circle cx="64.4" cy={79 + dy} r="1.3" fill="#fff" />
        <circle cx="98.4" cy={79 + dy} r="1.3" fill="#fff" />
        {a.eyes === "lashes" && (
          <path
            d="M57 77l-3-4m8 3-1-5m30 6-3-4m8 3 1-5"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}
      </g>
    );
  const closed = (d = "M57 82q6 5 12 0m22 0q6 5 12 0") => (
    <path
      d={d}
      stroke={INK}
      strokeWidth="2.6"
      strokeLinecap="round"
      fill="none"
    />
  );
  const mouth = (d: string, fill = "none") => (
    <path
      d={d}
      fill={fill}
      stroke={MOUTH}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  switch (a.mood) {
    case "neutral":
      return (
        <>
          {brow("M55 70q8-3 16 0m18 0q8-3 16 0")}
          {openEyes()}
          {mouth("M73 105h14")}
        </>
      );
    case "angry":
      return (
        <>
          {brow("M54 66l17 8m18 0 17-8")}
          {openEyes(1)}
          {mouth("M71 108q9-9 18 0")}
          <path
            d="M104 62l5 4m0-4-5 4"
            stroke="#d9504b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      );
    case "sad":
      return (
        <>
          {brow("M55 74l15-6m20 0 15 6")}
          {openEyes(1)}
          {mouth("M71 108q9-9 18 0")}
          <path d="M106 88q-8 12 0 12t0-12" fill="#7caec3" />
        </>
      );
    case "sleepy":
      return (
        <>
          {brow("M55 72q8-2 16 0m18 0q8-2 16 0")}
          {closed()}
          {mouth("M74 105q6 4 12 0")}
          <text x="116" y="62" fontSize="13" fontWeight="700" fill="#8a7a8d">
            z
          </text>
          <text x="124" y="50" fontSize="10" fontWeight="700" fill="#a898a5">
            z
          </text>
        </>
      );
    case "love":
      return (
        <>
          <g fill="#bd536f">
            {[63, 97].map((x) => (
              <path
                key={x}
                transform={`translate(${x - 7} 73)`}
                d="M7 3C-2-5-5 7 7 15C19 7 16-5 7 3Z"
              />
            ))}
          </g>
          {mouth("M70 102q10 13 20 0")}
        </>
      );
    case "surprised":
      return (
        <>
          {brow("M55 64q8-6 16 0m18 0q8-6 16 0")}
          <g fill="#fff" stroke={INK} strokeWidth="2">
            <circle cx="63" cy="81" r="7" />
            <circle cx="97" cy="81" r="7" />
          </g>
          <circle cx="63" cy="81" r="3" fill={INK} />
          <circle cx="97" cy="81" r="3" fill={INK} />
          <ellipse cx="80" cy="107" rx="5" ry="7" fill={MOUTH} />
        </>
      );
    case "excited":
      return (
        <>
          {brow("M55 66q8-5 16 0m18 0q8-5 16 0")}
          <g
            fill="#f4b73f"
            stroke={INK}
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            {[63, 97].map((x) => (
              <path
                key={x}
                transform={`translate(${x} 81)`}
                d="M0-9 2.6-2.6 9 0 2.6 2.6 0 9-2.6 2.6-9 0-2.6-2.6Z"
              />
            ))}
          </g>
          <path d="M66 100q14 26 28 0Z" fill={MOUTH} />
          <path d="M72 111q8 6 16 0q-8-5-16 0Z" fill="#e8808c" />
        </>
      );
    case "wink":
      return (
        <>
          {brow("M55 69q8-4 16 0m18 -3q8-5 16 -1")}
          <ellipse cx="63" cy="81" rx="3.6" ry="5" fill={INK} />
          <circle cx="64.4" cy="79" r="1.3" fill="#fff" />
          {closed("M91 82q6-7 12 0")}
          {mouth("M70 101q12 14 22-4")}
        </>
      );
    case "cool":
      return (
        <>
          {brow("M55 68q8-2 16 0m18 -4q8-4 16 -1")}
          <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
            <path d="M56 80h14m20 0h14" />
          </g>
          <g fill={INK}>
            <ellipse cx="63" cy="84" rx="3.4" ry="3" />
            <ellipse cx="97" cy="84" rx="3.4" ry="3" />
          </g>
          {mouth("M71 103q8 4 14 1q4-1 6-5")}
        </>
      );
    case "shy":
      return (
        <>
          {brow("M55 69q8-4 16 0m18 0q8-4 16 0")}
          {openEyes(2)}
          {mouth("M74 105q6 4 12-1")}
          <path d="M116 58q-6 9 0 12t0-12" fill="#8ec9e6" />
        </>
      );
    case "proud":
      return (
        <>
          {brow("M55 66q8-5 16 0m18 0q8-5 16 0")}
          {closed("M56 84q7-9 14 0m20 0q7-9 14 0")}
          {mouth("M68 101q12 17 24 0")}
        </>
      );
    case "silly":
      return (
        <>
          {brow("M55 70q8-3 16 0m18 -5q8-5 16 -1")}
          <ellipse cx="63" cy="81" rx="3.6" ry="5" fill={INK} />
          <circle cx="64.4" cy="79" r="1.3" fill="#fff" />
          {closed("M89 78l12 5-12 5")}
          {mouth("M68 101q12 12 24 0")}
          <path
            d="M77 108q2 11 9 2V105Z"
            fill="#e8808c"
            stroke={MOUTH}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </>
      );
    default:
      return (
        <>
          {brow("M55 69q8-4 16 0m18 0q8-4 16 0")}
          {openEyes()}
          {mouth("M70 102q10 13 20 0")}
        </>
      );
  }
}

/** Torso, neckline and details for each clothing style. */
function Clothing({ a }: { a: Look }) {
  const { color: c, skinHex: skin } = a;
  const body = "M24 180v-18q2-34 56-36t56 36v18Z";
  switch (a.clothing) {
    case "hoodie":
      return (
        <g>
          <path d="M42 130q-4-32 38-32t38 32l6 30H36Z" fill={c} />
          <path
            d="M42 130q-4-32 38-32t38 32"
            fill="none"
            stroke={SHADE}
            strokeWidth="4"
          />
          <path d={body} fill={c} />
          <path d="M66 124q14 16 28 0l6 8q-20 20-40 0Z" fill={SHADE} />
          <path d="M68 115h24v18q-12 14-24 0" fill={skin} />
          <path
            d="M72 138v18m16-18v18"
            stroke="#ffffffaa"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="72" cy="158" r="2.5" fill="#ffffffaa" />
          <circle cx="88" cy="158" r="2.5" fill="#ffffffaa" />
          <path
            d="M52 176q28 8 56 0"
            fill="none"
            stroke={SHADE}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      );
    case "shirt":
      return (
        <g>
          <path d={body} fill={c} />
          <path d="M68 115h24v16l-12 14-12-14Z" fill={skin} />
          <path
            d="M68 126l-11 14 15 8 8-18Zm24 0 11 14-15 8-8-18Z"
            fill="#fbfbfb"
            stroke={SHADE}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M80 148v32" stroke={SHADE} strokeWidth="2" />
          <circle cx="80" cy="158" r="2" fill="#fbfbfb" />
          <circle cx="80" cy="170" r="2" fill="#fbfbfb" />
        </g>
      );
    case "sweater":
      return (
        <g>
          <path d={body} fill={c} />
          <path
            d="M30 152h100M27 164h106M25 176h110"
            stroke="#ffffff33"
            strokeWidth="3"
          />
          <path d="M68 115h24v20q-12 12-24 0" fill={skin} />
          <path
            d="M62 125q18 16 36 0v10q-18 18-36 0Z"
            fill={c}
            stroke={SHADE}
            strokeWidth="2"
          />
          <path
            d="M68 129v8m6-6v9m6-8v10m6-9v9m6-10v8"
            stroke={SHADE}
            strokeWidth="1.6"
          />
        </g>
      );
    case "dress":
      return (
        <g>
          <path d={body} fill={c} />
          <path d="M60 128q20 30 40 0l-8-7H68Z" fill={skin} />
          <path d="M68 115h24v8H68Z" fill={skin} />
          <path d="M26 162h108v8H26Z" fill={SHADE} />
          <g fill="#ffffff55">
            {[
              [44, 174],
              [62, 172],
              [98, 172],
              [116, 174],
              [80, 176],
            ].map(([x, y]) => (
              <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" />
            ))}
          </g>
        </g>
      );
    case "jacket":
      return (
        <g>
          <path d={body} fill={c} />
          <path d="M62 126h36l4 54H58Z" fill="#fbfbfb" />
          <path d="M68 115h24v13l-12 12-12-12Z" fill={skin} />
          <path
            d="M62 124l-14 42 20 14 8-40Zm36 0 14 42-20 14-8-40Z"
            fill={c}
            stroke={SHADE}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M80 142v38" stroke={SHADE} strokeWidth="2" />
        </g>
      );
    case "kurung":
      return (
        <g>
          <path d="M22 180v-18q2-34 58-36t58 36v18Z" fill={c} />
          <path d="M68 115h24v14q-12 10-24 0" fill={skin} />
          <path
            d="M60 128q20 14 40 0"
            fill="none"
            stroke={GOLD}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M80 138v42" stroke={GOLD} strokeWidth="3" />
          <g fill={GOLD}>
            {[148, 162, 174].map((y) => (
              <path
                key={y}
                transform={`translate(80 ${y})`}
                d="M0-4 3 0 0 4-3 0Z"
              />
            ))}
          </g>
          <path
            d="M34 166q46 10 92 0"
            fill="none"
            stroke={GOLD}
            strokeWidth="2"
            strokeDasharray="1 5"
            strokeLinecap="round"
          />
        </g>
      );
    case "baju_melayu":
      return (
        <g>
          <path d={body} fill={c} />
          <path d="M68 115h24v10H68Z" fill={skin} />
          <rect
            x="65"
            y="117"
            width="30"
            height="12"
            rx="5"
            fill={c}
            stroke={SHADE}
            strokeWidth="2"
          />
          <path d="M80 129v48" stroke={SHADE} strokeWidth="2" />
          <circle cx="80" cy="129" r="2.8" fill={GOLD} />
          <circle cx="80" cy="150" r="2.4" fill={GOLD} />
          <path d="M30 170h100" stroke={SHADE} strokeWidth="2" />
        </g>
      );
    default:
      return (
        <g>
          <path d={body} fill={c} />
          <path d="M68 115h24v20q-12 13-24 0" fill={skin} />
          <path
            d="M64 129q16 14 32 0"
            fill="none"
            stroke={SHADE}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      );
  }
}

export function CoupleAvatar({
  config,
  name,
}: {
  config?: Partial<AvatarConfig>;
  name: string;
}) {
  const base = avatarConfig(config);
  const a: Look = {
    ...base,
    skinHex: skins[base.skin],
    hairHex: hairColors[base.hair_color],
    color: outfits[base.outfit],
  };
  const { skinHex: skin, hairHex: hair, color } = a;
  const covered = a.headwear.startsWith("hijab");
  return (
    <svg
      className="couple-avatar"
      viewBox="0 0 160 180"
      role="img"
      aria-label={`${name}’s avatar`}
    >
      <circle cx="80" cy="79" r="68" fill="var(--avatar-backdrop, #f7efe7)" />
      {!covered && <HairBack a={a} hair={hair} />}
      <Clothing a={a} />
      {a.accessory === "scarf" && (
        <g>
          <path d="M60 120q20 22 40 0l5 13q-25 20-50 0Z" fill="#e9b949" />
          <path d="M91 130l9 32-13 4-5-30Z" fill="#e9b949" />
          <path
            d="M66 126l-4 6m14 2-4 6m16-1-4 6m-26-4 22 14"
            stroke="#ffffff66"
            strokeWidth="2"
          />
        </g>
      )}
      {a.accessory === "necklace" && (
        <g>
          <path
            d="M63 127q17 22 34 0"
            fill="none"
            stroke={GOLD}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="80" cy="145" r="4" fill={GOLD} />
          <circle cx="80" cy="145" r="1.6" fill="#fff8" />
        </g>
      )}
      {a.accessory === "bowtie" && (
        <g fill="#3b2f4a">
          <path d="M80 136l-14-8v16Zm0 0 14-8v16Z" />
          <circle cx="80" cy="136" r="3.8" />
        </g>
      )}
      <ellipse cx="40" cy="82" rx="8" ry="12" fill={skin} />
      <ellipse cx="120" cy="82" rx="8" ry="12" fill={skin} />
      <ellipse cx="40" cy="84" rx="3.5" ry="6" fill={SHADE} opacity=".5" />
      <ellipse cx="120" cy="84" rx="3.5" ry="6" fill={SHADE} opacity=".5" />
      {a.accessory === "earrings" && !covered && (
        <g fill={GOLD}>
          <circle cx="39" cy="97" r="3.4" />
          <circle cx="121" cy="97" r="3.4" />
          <path d="M39 99l-2.4 7h4.8ZM121 99l-2.4 7h4.8Z" />
        </g>
      )}
      <path d="M40 65q0-37 40-37t40 37v27q0 35-40 35T40 92Z" fill={skin} />
      <path
        d="M44 100q8 26 36 26t36-26q-4 36-36 36T44 100Z"
        fill={SHADE}
        opacity=".45"
      />
      <ellipse cx="66" cy="64" rx="14" ry="6" fill="#ffffff" opacity=".12" />
      <g
        fill="#e87f8c"
        opacity={a.mood === "shy" ? 0.75 : a.mood === "love" ? 0.6 : 0.4}
      >
        <ellipse cx="54" cy="95" rx="9" ry="5" />
        <ellipse cx="106" cy="95" rx="9" ry="5" />
      </g>
      {!covered && <HairFront a={a} hair={hair} />}
      <Face a={a} hair={hair} />
      {a.nose === "button" && (
        <path
          d="M77 93q3 4 6 0"
          stroke="#8e624e"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {a.nose === "pointed" && (
        <path
          d="m81 85-4 9h6"
          stroke="#8e624e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      )}
      {a.facial_hair === "beard" && (
        <path d="M44 96q6 34 36 34t36-34l-12 13q-24 15-48 0Z" fill={hair} />
      )}
      {a.facial_hair === "moustache" && (
        <path d="M80 97q-8-6-16 4 10 6 16 0 6 6 16 0-8-10-16-4" fill={hair} />
      )}
      {a.facial_hair === "goatee" && (
        <path d="M72 113h16l-3 12H75Z" fill={hair} />
      )}
      {a.glasses !== "none" && (
        <g fill="none" stroke="#493b43" strokeWidth="2.5">
          {a.glasses === "round" ? (
            <>
              <circle cx="62" cy="81" r="13" />
              <circle cx="98" cy="81" r="13" />
            </>
          ) : a.glasses === "oval" ? (
            <>
              <ellipse cx="62" cy="81" rx="15" ry="10" />
              <ellipse cx="98" cy="81" rx="15" ry="10" />
            </>
          ) : a.glasses === "cat_eye" ? (
            <>
              <path d="m45 69 30 5q3 23-21 16Z" />
              <path d="m115 69-30 5q-3 23 21 16Z" />
            </>
          ) : (
            <>
              <rect
                fill={a.glasses === "sunglasses" ? "#493b43" : "none"}
                x="48"
                y="70"
                width="28"
                height="23"
                rx="5"
              />
              <rect
                fill={a.glasses === "sunglasses" ? "#493b43" : "none"}
                x="84"
                y="70"
                width="28"
                height="23"
                rx="5"
              />
            </>
          )}
          <path d="M76 79h8M42 77l6 2m64 0 6-2" />
        </g>
      )}
      {a.headwear === "cap" && (
        <g fill={color}>
          <path d="M35 55q0-42 45-42t45 42Z" />
          <path d="M74 52h54q17 0 17 8H74Z" />
          <path d="M80 19v30" stroke="#ffffff66" strokeWidth="2" />
        </g>
      )}
      {a.headwear === "beanie" && (
        <g fill={color}>
          <path d="M38 52q0-39 42-39t42 39Z" />
          <rect x="34" y="45" width="92" height="17" rx="7" />
          <circle cx="80" cy="13" r="10" />
          <path
            d="M48 48v12m12-12v12m12-12v12m16-12v12m12-12v12m12-12v12"
            stroke="#ffffff55"
            strokeWidth="2"
          />
        </g>
      )}
      {covered && (
        <path
          fill={color}
          fillRule="evenodd"
          d={
            (a.headwear === "hijab_sport"
              ? "M80 17q-46 0-46 54v65q46 20 92 0V71q0-54-46-54Z"
              : a.headwear === "hijab_instant"
                ? "M80 12q-50 0-50 57L15 161q65 17 130 0L130 69q0-57-50-57Z"
                : "M80 15q-49 0-49 54l-9 85q58 31 116 0l-9-85q0-54-49-54Z") +
            "M80 40q-35 0-35 33v19q0 33 35 33t35-33V73q0-33-35-33Z"
          }
        />
      )}
      {a.headwear === "hijab_wrap" && (
        <path
          d="M34 119q42 28 90-4l-4 19q-23 18-41 18l-18 22-10-31"
          fill={color}
          stroke="#ffffff66"
          strokeWidth="3"
        />
      )}
      {a.headwear === "hijab_instant" && (
        <path d="M105 121l7 21" stroke="#ffffff88" strokeWidth="3" />
      )}
      {a.headwear === "bucket" && (
        <g fill={color}>
          <path d="M48 19h64l10 42H38Z" />
          <path d="M38 53h84l17 17H21Z" />
          <path d="M43 50h74" stroke="#ffffff77" strokeWidth="3" />
        </g>
      )}
      {a.headwear === "beret" && (
        <g fill={color}>
          <ellipse
            cx="76"
            cy="34"
            rx="51"
            ry="24"
            transform="rotate(-12 76 34)"
          />
          <path d="M39 51h80v8H39Z" />
          <path d="m79 11 4-7" stroke={color} strokeWidth="5" />
        </g>
      )}
      {a.headwear === "songkok" && (
        <g fill="#302d32">
          <path d="M39 53V23q41-14 82 0v30Z" />
          <path d="M44 43h72" stroke="#ffffff33" strokeWidth="2" />
        </g>
      )}
      {a.headwear === "headband" && (
        <path
          d="M39 63q41-30 82 0"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
        />
      )}
      {a.headwear === "bow" && (
        <g fill={color}>
          <path d="M110 38 92 27v22Zm0 0 18-11v22Z" />
          <circle cx="110" cy="38" r="5.5" />
          <path d="M110 38 92 27v22Z" opacity=".25" fill="#000" />
        </g>
      )}
      {a.headwear === "flower_crown" && (
        <g>
          <path
            d="M42 62q38-34 76 0"
            fill="none"
            stroke="#6f9b62"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {[
            [46, 58],
            [58, 44],
            [72, 37],
            [88, 37],
            [102, 44],
            [114, 58],
          ].map(([x, y], i) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              <g fill={["#f08ba7", "#fff", "#f6c35a"][i % 3]}>
                {[0, 72, 144, 216, 288].map((r) => (
                  <circle
                    key={r}
                    cx="0"
                    cy="-5"
                    r="3.8"
                    transform={`rotate(${r})`}
                  />
                ))}
              </g>
              <circle r="2.6" fill={i % 3 === 2 ? "#e0883a" : "#f6c35a"} />
            </g>
          ))}
        </g>
      )}
      {a.accessory === "headphones" && (
        <g>
          <path
            d="M34 82q0-58 46-58t46 58"
            fill="none"
            stroke="#3b2f4a"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <rect
            x="26"
            y="70"
            width="14"
            height="30"
            rx="7"
            fill={color}
            stroke="#3b2f4a"
            strokeWidth="3"
          />
          <rect
            x="120"
            y="70"
            width="14"
            height="30"
            rx="7"
            fill={color}
            stroke="#3b2f4a"
            strokeWidth="3"
          />
        </g>
      )}
    </svg>
  );
}
