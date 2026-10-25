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
  return (
    <svg
      className="couple-avatar"
      viewBox="0 0 160 180"
      role="img"
      aria-label={`${name}’s avatar`}
    >
      <circle cx="80" cy="79" r="68" fill="var(--avatar-backdrop, #f7efe7)" />
      {a.headwear !== "hijab" && a.hair === "long" && (
        <path d="M39 67Q38 22 80 22T121 67L127 145H33Z" fill={hair} />
      )}
      <path d="M28 178v-18q2-33 52-33t52 33v18" fill={color} />
      <path d="M68 115h24v20q-12 13-24 0" fill={skin} />
      <ellipse cx="40" cy="82" rx="8" ry="12" fill={skin} />
      <ellipse cx="120" cy="82" rx="8" ry="12" fill={skin} />
      <path d="M40 65q0-37 40-37t40 37v27q0 35-40 35T40 92Z" fill={skin} />
      {a.headwear !== "hijab" && a.hair === "short" && (
        <path
          d="M39 75V57q0-35 40-35t42 35v18l-11-24q-25 14-55 3Z"
          fill={hair}
        />
      )}
      {a.headwear !== "hijab" && a.hair === "bob" && (
        <path
          d="M34 103V60q0-39 46-39t46 39v43l-14-7V55q-35 13-54 0v41Z"
          fill={hair}
        />
      )}
      {a.headwear !== "hijab" && a.hair === "long" && (
        <path
          d="M39 70V57q0-35 41-35t41 35v13L99 47Q74 65 48 61Z"
          fill={hair}
        />
      )}
      {a.headwear !== "hijab" && a.hair === "curls" && (
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
      <g fill="#352c2e">
        <ellipse cx="63" cy="81" rx="3.5" ry="5" />
        <ellipse cx="97" cy="81" rx="3.5" ry="5" />
      </g>
      <g fill="#e89191" opacity=".45">
        <ellipse cx="54" cy="94" rx="9" ry="5" />
        <ellipse cx="106" cy="94" rx="9" ry="5" />
      </g>
      <path
        d="M71 102q9 9 18 0"
        fill="none"
        stroke="#714d43"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {a.glasses !== "none" && (
        <g fill="none" stroke="#493b43" strokeWidth="2.5">
          {a.glasses === "round" ? (
            <>
              <circle cx="62" cy="81" r="13" />
              <circle cx="98" cy="81" r="13" />
            </>
          ) : (
            <>
              <rect x="48" y="70" width="28" height="23" rx="5" />
              <rect x="84" y="70" width="28" height="23" rx="5" />
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
      {a.headwear === "hijab" && (
        <path
          fill={color}
          fillRule="evenodd"
          d="M80 15q-49 0-49 54l-9 85q58 31 116 0l-9-85q0-54-49-54Zm0 25q-35 0-35 33v19q0 33 35 33t35-33V73q0-33-35-33Z"
        />
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
