/**
 * SUMO-01, the gatekeeper. Hand-drawn SVG so the brand stays ours and the
 * illustration ships with zero network cost.
 */
export function SumoMascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      role="img"
      aria-label="SUMO-01, a sumo wrestler gatekeeper with a topknot, a purple belt and a mint knot"
    >
      {/* Back ring */}
      <circle
        cx="160"
        cy="160"
        r="136"
        fill="none"
        stroke="#836FFF"
        strokeWidth="18"
        strokeDasharray="2 14"
        opacity="0.5"
      />

      {/* Feet */}
      <rect
        x="90"
        y="286"
        width="60"
        height="28"
        rx="10"
        fill="#F0F3FF"
        stroke="#211951"
        strokeWidth="8"
      />
      <rect
        x="170"
        y="286"
        width="60"
        height="28"
        rx="10"
        fill="#F0F3FF"
        stroke="#211951"
        strokeWidth="8"
      />

      {/* Body */}
      <path
        d="M160 146c-44 0-66 30-70 66-3 32 8 62 22 80h96c14-18 25-48 22-80-4-36-26-66-70-66Z"
        fill="#F0F3FF"
        stroke="#211951"
        strokeWidth="8"
      />

      {/* Arms, drawn over the body so they read as ready-stance arms */}
      <path
        d="M112 200c-32 6-48 18-56 32"
        fill="none"
        stroke="#211951"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M112 200c-32 6-48 18-56 32"
        fill="none"
        stroke="#F0F3FF"
        strokeWidth="18"
        strokeLinecap="round"
      />
      <path
        d="M208 200c32 6 48 18 56 32"
        fill="none"
        stroke="#211951"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M208 200c32 6 48 18 56 32"
        fill="none"
        stroke="#F0F3FF"
        strokeWidth="18"
        strokeLinecap="round"
      />

      {/* Fists */}
      <circle
        cx="54"
        cy="234"
        r="17"
        fill="#F0F3FF"
        stroke="#211951"
        strokeWidth="7"
      />
      <circle
        cx="266"
        cy="234"
        r="17"
        fill="#F0F3FF"
        stroke="#211951"
        strokeWidth="7"
      />

      {/* Mawashi belt */}
      <path
        d="M94 238c42 20 90 20 132 0l4 30c-44 24-96 24-140 0l4-30Z"
        fill="#836FFF"
        stroke="#211951"
        strokeWidth="8"
      />

      {/* Belt knot */}
      <rect
        x="146"
        y="262"
        width="28"
        height="34"
        rx="4"
        fill="#15F5BA"
        stroke="#211951"
        strokeWidth="7"
      />

      {/* Head */}
      <ellipse
        cx="160"
        cy="112"
        rx="62"
        ry="56"
        fill="#F0F3FF"
        stroke="#211951"
        strokeWidth="8"
      />

      {/* Topknot */}
      <path
        d="M140 62c0-20 40-20 40 0"
        fill="none"
        stroke="#211951"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <rect
        x="134"
        y="50"
        width="52"
        height="16"
        rx="6"
        fill="#15F5BA"
        stroke="#211951"
        strokeWidth="7"
      />

      {/* Brows */}
      <path
        d="M118 102l24 9"
        stroke="#211951"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M202 102l-24 9"
        stroke="#211951"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Eyes */}
      <circle cx="132" cy="120" r="6" fill="#211951" />
      <circle cx="188" cy="120" r="6" fill="#211951" />

      {/* Nose */}
      <path
        d="M160 126v12"
        stroke="#211951"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Mouth */}
      <path
        d="M140 148c12 10 28 10 40 0"
        fill="none"
        stroke="#211951"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Cheeks */}
      <circle cx="110" cy="136" r="10" fill="#FF5C7A" opacity="0.7" />
      <circle cx="210" cy="136" r="10" fill="#FF5C7A" opacity="0.7" />

      {/* Chest label */}
      <text
        x="160"
        y="222"
        textAnchor="middle"
        fontFamily="var(--font-jetbrains), monospace"
        fontSize="20"
        fontWeight="700"
        letterSpacing="3"
        fill="#211951"
      >
        SUMO
      </text>
    </svg>
  );
}
