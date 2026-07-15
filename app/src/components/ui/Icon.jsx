/**
 * Inline SVG icon component — the single icon source for the app.
 * Viewbox 0 0 16 16, currentColor stroke/fill, rounded caps/joins.
 *
 * Sizing rule: stroke-width scales with optical size so a 24px icon
 * doesn't look thin next to a 16px one — pass `size` (16 default,
 * 20/24 for larger touch targets like empty states / feature callouts).
 * Style rule: outline-first. The handful of icons that are filled
 * (play, star, xp, bolt) are intentionally solid glyphs where a filled
 * shape reads faster than an outline at small size — everything else
 * stays stroke-only so the set doesn't mix optical weight arbitrarily.
 *
 * Usage: <Icon name="missions" size={18} />
 */
export default function Icon({ name, size = 16, strokeWidth, className = "", style }) {
  // Base convention is 1.5 stroke @ 16px. Scale proportionally for larger
  // sizes so line weight stays optically consistent, unless caller overrides.
  const sw = strokeWidth ?? +(1.5 * (size / 16)).toFixed(2);

  const icons = {
    dashboard: (
      <>
        <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
      </>
    ),
    missions: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth={sw}/>
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth={sw}/>
        <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
      </>
    ),
    labs: (
      <>
        <rect x="2.5" y="5" width="11" height="8.5" rx="1.5" stroke="currentColor" strokeWidth={sw}/>
        <path d="M5.5 5V3.5C5.5 3.22 5.72 3 6 3H10C10.28 3 10.5 3.22 10.5 3.5V5" stroke="currentColor" strokeWidth={sw}/>
        <path d="M2.5 8.5H13.5" stroke="currentColor" strokeWidth={sw}/>
      </>
    ),
    paths: (
      <>
        <circle cx="3.5" cy="12.5" r="1.8" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.8" fill="currentColor"/>
        <circle cx="12.5" cy="3.5" r="1.8" fill="currentColor"/>
        <path d="M5 11L7 9" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M9 7L11 5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    courses: (
      <>
        <path d="M2 5L8 2L14 5L8 8L2 5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
        <path d="M2 9L8 12L14 9" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 5V9" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    leaderboard: (
      <>
        <rect x="2" y="8" width="3.5" height="7" rx="1" stroke="currentColor" strokeWidth={sw}/>
        <rect x="6.25" y="5" width="3.5" height="10" rx="1" stroke="currentColor" strokeWidth={sw}/>
        <rect x="10.5" y="2" width="3.5" height="13" rx="1" stroke="currentColor" strokeWidth={sw}/>
      </>
    ),
    profile: (
      <>
        <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth={sw}/>
        <path d="M2.5 14C2.5 11.5 5.01 9.5 8 9.5C10.99 9.5 13.5 11.5 13.5 14" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    chevronLeft: (
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    ),
    chevronRight: (
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    ),
    chevronDown: (
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    ),
    chevronUp: (
      <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    ),
    logout: (
      <>
        <path d="M10 11L13 8L10 5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 8H7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M7 2.5H3.5C3.22 2.5 3 2.72 3 3V13C3 13.28 3.22 13.5 3.5 13.5H7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    search: (
      <>
        <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth={sw}/>
        <path d="M10 10L13 13" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    play: (
      <path d="M5 3l9 5-9 5V3z" fill="currentColor"/>
    ),
    book: (
      <>
        <path d="M4 2.5H11.5C12.33 2.5 13 3.17 13 4V13C13 13.83 12.33 14.5 11.5 14.5H4C3.17 14.5 2.5 13.83 2.5 13V4C2.5 3.17 3.17 2.5 4 2.5Z" stroke="currentColor" strokeWidth={sw}/>
        <path d="M5.5 5.5H10.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M5.5 8H10.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M5.5 10.5H8.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    terminal: (
      <>
        <rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth={sw}/>
        <path d="M5 7L7.5 9L5 11" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11H11.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    check: (
      <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth={+(1.7 * (size / 16)).toFixed(2)} strokeLinecap="round" strokeLinejoin="round"/>
    ),
    lock: (
      <>
        <rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth={sw}/>
        <path d="M5.5 7V5.5C5.5 4.12 6.62 3 8 3C9.38 3 10.5 4.12 10.5 5.5V7" stroke="currentColor" strokeWidth={sw}/>
      </>
    ),
    star: (
      <path d="M8 2l1.8 3.6L14 6.4l-3 2.9.7 4.1L8 11.4 4.3 13.4l.7-4.1-3-2.9 4.2-.8L8 2z" fill="currentColor"/>
    ),
    xp: (
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="none" stroke="currentColor" strokeWidth={+(1.6 * (size / 16)).toFixed(2)} strokeLinecap="round"/>
    ),
    bolt: (
      <path d="M9 1.5L3 9.5h4l-.8 5L13 6h-4l.8-4.5z" fill="currentColor"/>
    ),
    flame: (
      <path
        d="M8 1.5c.6 2 2.6 3 2.6 5.4 0 .9-.4 1.6-.9 2.1.9-.2 1.8-1 1.8-2.4 1.4 1.3 2 2.9 2 4.3 0 2.8-2.4 4.6-5.3 4.6S2.9 13.7 2.9 10.9c0-1.9 1.1-3.6 2.6-4.6-.2.6-.2 1.2-.1 1.7.6-2.4 1.9-4.4 2.6-6.5z"
        fill="currentColor"
      />
    ),
    clock: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth={sw}/>
        <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    layers: (
      <>
        <path d="M2 6l6-3.5L14 6l-6 3.5L2 6z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
        <path d="M2 10l6 3.5L14 10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
    trophy: (
      <>
        <path d="M8 11v2" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M5 13h6" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M4 2.5H12V8C12 10.21 10.21 12 8 12C5.79 12 4 10.21 4 8V2.5Z" stroke="currentColor" strokeWidth={sw}/>
        <path d="M4 5H2V7C2 8.1 2.9 9 4 9" stroke="currentColor" strokeWidth={sw}/>
        <path d="M12 5H14V7C14 8.1 13.1 9 12 9" stroke="currentColor" strokeWidth={sw}/>
      </>
    ),
    arrowRight: (
      <path d="M3 8H13M9 4l4 4-4 4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    ),
    arrowLeft: (
      <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    ),
    map: (
      <>
        <path d="M2 4.5L6 2.5L10 4.5L14 2.5V11.5L10 13.5L6 11.5L2 13.5V4.5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
        <path d="M6 2.5V11.5M10 4.5V13.5" stroke="currentColor" strokeWidth={sw}/>
      </>
    ),
    beaker: (
      <>
        <path d="M5.5 2.5V7L2.5 12C2.5 13.1 3.4 14 4.5 14H11.5C12.6 14 13.5 13.1 13.5 12L10.5 7V2.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 2.5H12" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <circle cx="6.5" cy="11" r="1" fill="currentColor" opacity=".7"/>
        <circle cx="9.5" cy="9.5" r="0.8" fill="currentColor" opacity=".5"/>
      </>
    ),
    menu: (
      <path d="M2 4.5h12M2 8h12M2 11.5h12" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
    ),
    close: (
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
    ),
    plus: (
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
    ),
    filter: (
      <path d="M2.5 3.5h11L9 8.5v4l-2 1v-5L2.5 3.5z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
    ),
    sun: (
      <>
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth={sw}/>
        <path d="M8 1.5v1.5M8 13v1.5M2.5 8H1M15 8h-1.5M3.6 3.6l1 1M11.4 11.4l1 1M3.6 12.4l1-1M11.4 4.6l1-1"
          stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    moon: (
      <path d="M13.5 9.6A5.6 5.6 0 1 1 6.4 2.5a4.4 4.4 0 0 0 7.1 7.1z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
    ),
    users: (
      <>
        <circle cx="5.8" cy="5.8" r="2.3" stroke="currentColor" strokeWidth={sw}/>
        <path d="M1.5 14c0-2.2 1.9-4 4.3-4s4.3 1.8 4.3 4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M10.3 2.3c1.3.3 2.2 1.4 2.2 2.7 0 1.3-.9 2.4-2.2 2.7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M11 10.2c1.9.4 3.4 1.8 3.5 3.8" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    target: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth={sw}/>
        <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth={sw}/>
        <circle cx="8" cy="8" r="0.9" fill="currentColor"/>
      </>
    ),
    shield: (
      <path d="M8 1.5L13.5 3.5V7.5C13.5 11 11.2 13.4 8 14.5C4.8 13.4 2.5 11 2.5 7.5V3.5L8 1.5Z"
        stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
    ),
    alert: (
      <>
        <path d="M8 1.8L14.7 13.2C15 13.7 14.6 14.5 14 14.5H2C1.4 14.5 1 13.7 1.3 13.2L8 1.8Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
        <path d="M8 6.2V9.4" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <circle cx="8" cy="11.8" r="0.8" fill="currentColor"/>
      </>
    ),
    info: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth={sw}/>
        <path d="M8 7.2V11.2" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <circle cx="8" cy="4.8" r="0.9" fill="currentColor"/>
      </>
    ),
    calendar: (
      <>
        <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth={sw}/>
        <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth={sw}/>
        <path d="M5.5 2V5M10.5 2V5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
    edit: (
      <path d="M11 2.5l2.5 2.5L5 13.5H2.5V11L11 2.5z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
    ),
    trash: (
      <>
        <path d="M2.5 4.5H13.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M6 4.5V2.8C6 2.36 6.36 2 6.8 2H9.2C9.64 2 10 2.36 10 2.8V4.5" stroke="currentColor" strokeWidth={sw}/>
        <path d="M4 4.5L4.7 13C4.75 13.6 5.25 14 5.8 14H10.2C10.75 14 11.25 13.6 11.3 13L12 4.5" stroke="currentColor" strokeWidth={sw}/>
      </>
    ),
    sparkles: (
      <>
        <path d="M8 1.5L9.2 5.4 13 6.6 9.2 7.8 8 11.7 6.8 7.8 3 6.6 6.8 5.4 8 1.5Z" stroke="currentColor" strokeWidth={sw} strokeLinejoin="round"/>
        <path d="M12.8 9.8L13.4 11.7 15.2 12.3 13.4 12.9 12.8 14.8 12.2 12.9 10.4 12.3 12.2 11.7 12.8 9.8Z" fill="currentColor" opacity=".85"/>
      </>
    ),
    external: (
      <>
        <path d="M6.5 3H13V9.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 3L6.5 9.5" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M11 9V12.5C11 13 10.5 13.5 10 13.5H3.5C3 13.5 2.5 13 2.5 12.5V6C2.5 5.5 3 5 3.5 5H7" stroke="currentColor" strokeWidth={sw} strokeLinecap="round"/>
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {icons[name] || null}
    </svg>
  );
}
