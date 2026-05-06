interface HotelMarkProps {
  className?: string;
}

export function HotelMark({ className }: HotelMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="64" height="64" rx="12" fill="url(#hotel-mark-bg)" />
      <path
        d="M20 18V46M44 18V46M20 32H44"
        stroke="url(#hotel-mark-accent)"
        strokeWidth="4.5"
        strokeLinecap="square"
      />
      <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      <defs>
        <linearGradient id="hotel-mark-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#15191D" />
          <stop offset="1" stopColor="#090B0E" />
        </linearGradient>
        <linearGradient id="hotel-mark-accent" x1="20" y1="18" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F4DEB4" />
          <stop offset="1" stopColor="#C19E58" />
        </linearGradient>
      </defs>
    </svg>
  );
}
