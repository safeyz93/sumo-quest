export function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M3 2h5.2l4.5 6.2L17.9 2H21l-7.2 8.7L21.4 22h-5.2l-5-6.9L5.4 22H2.3l7.6-9.3L3 2Zm2.6 1.8 12.7 16.4h1.5L7.1 3.8H5.6Z" />
    </svg>
  );
}

export function SumoStamp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <circle
        cx="60"
        cy="60"
        r="54"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="6 5"
      />
      <circle cx="60" cy="60" r="44" stroke="currentColor" strokeWidth="2" />
      <path
        d="M60 30v60M30 60h60"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.35"
      />
    </svg>
  );
}
