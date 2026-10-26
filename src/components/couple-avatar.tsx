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
};
const outfits = {
  rose: "#bc788a",
  sage: "#7c9b88",
  lavender: "#a192be",
  blue: "#789caf",
};
export function CoupleAvatar({
  config,
  name,
}: {
  config?: Partial<AvatarConfig>;
  name: string;
}) {
  const a = avatarConfig(config),
    skin = skins[a.skin],
    hair = hairColors[a.hair_color],
    color = outfits[a.outfit];
  const covered = a.headwear.startsWith("hijab");
  return (
    <svg
      className="couple-avatar"
      viewBox="0 0 160 180"
      role="img"
      aria-label={`${name}’s avatar`}
    >
      <circle cx="80" cy="79" r="68" fill="var(--avatar-backdrop, #f7efe7)" />
      {!covered && a.hair === "long" && (
        <path d="M39 67Q38 22 80 22T121 67L127 145H33Z" fill={hair} />
      )}
      <path d="M28 178v-18q2-33 52-33t52 33v18" fill={color} />
      <path d="M68 115h24v20q-12 13-24 0" fill={skin} />
      <ellipse cx="40" cy="82" rx="8" ry="12" fill={skin} />
      <ellipse cx="120" cy="82" rx="8" ry="12" fill={skin} />
      <path d="M40 65q0-37 40-37t40 37v27q0 35-40 35T40 92Z" fill={skin} />
      {!covered && a.hair === "short" && (
        <path
          d="M39 75V57q0-35 40-35t42 35v18l-11-24q-25 14-55 3Z"
          fill={hair}
        />
      )}
      {!covered && a.hair === "bob" && (
        <path
          d="M34 103V60q0-39 46-39t46 39v43l-14-7V55q-35 13-54 0v41Z"
          fill={hair}
        />
      )}
      {!covered && a.hair === "long" && (
        <path
          d="M39 70V57q0-35 41-35t41 35v13L99 47Q74 65 48 61Z"
          fill={hair}
        />
      )}
      {!covered && a.hair === "curls" && (
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
      )}
      <g stroke="#352c2e" strokeWidth="2.5" strokeLinecap="round" fill="none">
        {a.mood === "love" ? (
          <g fill="#bd536f" stroke="none">
            {[63, 97].map((x) => (
              <path
                key={x}
                transform={`translate(${x - 7} 73)`}
                d="M7 3C-2-5-5 7 7 15C19 7 16-5 7 3Z"
              />
            ))}
          </g>
        ) : a.mood === "sleepy" ? (
          <path d="M57 82q6 5 12 0m22 0q6 5 12 0" />
        ) : a.eyes === "almond" ? (
          <>
            <path d="M55 81q8-10 16 0q-8 8-16 0m34 0q8-10 16 0q-8 8-16 0" />
            <circle cx="63" cy="81" r="2" fill="#352c2e" />
            <circle cx="97" cy="81" r="2" fill="#352c2e" />
          </>
        ) : (
          <>
            <g fill="#352c2e" stroke="none">
              <ellipse cx="63" cy="81" rx="3.5" ry="5" />
              <ellipse cx="97" cy="81" rx="3.5" ry="5" />
            </g>
            {a.eyes === "lashes" && (
              <path d="M57 77l-3-4m8 3-1-5m30 6-3-4m8 3 1-5" />
            )}
          </>
        )}
        {a.mood === "angry" && <path d="M55 69l15 6m20 0 15-6" />}
        {a.mood === "sad" && <path d="M55 73l14-5m22 0 14 5" />}
        {a.nose === "button" && <path d="M77 93q3 4 6 0" stroke="#8e624e" />}
        {a.nose === "pointed" && <path d="m81 85-4 9h6" stroke="#8e624e" />}
      </g>
      {a.mood === "sad" && <path d="M106 88q-8 12 0 12t0-12" fill="#7caec3" />}
      <g fill="#e89191" opacity=".45">
        <ellipse cx="54" cy="94" rx="9" ry="5" />
        <ellipse cx="106" cy="94" rx="9" ry="5" />
      </g>
      {a.facial_hair === "beard" && (
        <path d="M44 96q6 34 36 34t36-34l-12 13q-24 15-48 0Z" fill={hair} />
      )}
      {a.mood === "surprised" ? (
        <ellipse cx="80" cy="105" rx="5" ry="7" fill="#714d43" />
      ) : (
        <path
          d={
            a.mood === "sad" || a.mood === "angry"
              ? "M71 108q9-9 18 0"
              : a.mood === "neutral" || a.mood === "sleepy"
                ? "M73 105h14"
                : "M70 102q10 13 20 0"
          }
          fill="none"
          stroke="#714d43"
          strokeWidth="3"
          strokeLinecap="round"
        />
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
      <path
        d="M69 153l11 9 11-9"
        fill="none"
        stroke="#ffffff88"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
