const PATHS = {
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  shield: <path d="M12 3l7 3v6c0 4.2-2.9 7.7-7 9-4.1-1.3-7-4.8-7-9V6l7-3z" />,
  star: <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8L12 4z" />,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  clipboard: <><rect x="8" y="3" width="8" height="4" rx="1" /><path d="M16 5h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13" /><path d="M9 7V4h6v3" /></>,
  pencil: <><path d="M4 20h4L20 8l-4-4L4 16v4z" /><path d="M14 6l4 4" /></>,
  image: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M21 16l-5-5-6 6" /></>,
  logout: <><path d="M15 12H4M9 8l-4 4 4 4" /><path d="M13 4h5a2 2 0 012 2v12a2 2 0 01-2 2h-5" /></>,
  refresh: <><path d="M20 12a8 8 0 10-2.5 5.8" /><path d="M20 5v6h-6" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 012-2h9" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  trophy: <><path d="M7 4h10v5a5 5 0 01-10 0V4z" /><path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3" /><path d="M12 14v4M9 20h6" /></>,
  gloves: <><path d="M8 21V11a2 2 0 014 0V6a1.5 1.5 0 013 0v5" /><path d="M15 11V7.5a1.5 1.5 0 013 0V15a6 6 0 01-6 6H8" /></>,
  run: <><circle cx="14" cy="5" r="2" /><path d="M11 21l2-5-3-3 1-5 3 3 3 1" /><path d="M8 12l2-3M13 16l3 5" /></>,
  users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0112 0" /><path d="M16 5.5a3.2 3.2 0 010 6M18 20a6 6 0 00-3-5.2" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /></>,
  flame: <path d="M12 21c3.3 0 6-2.5 6-5.7 0-3.9-3.4-5.6-4.4-9.3-1.9 1.4-2.6 3.3-2.2 5.3-1.1-.5-1.7-1.4-1.9-2.6C7.6 10.2 6 12.3 6 15.3 6 18.5 8.7 21 12 21z" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M4 4l16 16" /><path d="M9.9 5.9A9.8 9.8 0 0112 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 01-3.3 4.1M6.6 7.9A17 17 0 002.5 12S6 18.5 12 18.5c.9 0 1.7-.1 2.5-.4" /><path d="M9.9 9.9a3 3 0 004.2 4.2" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 018 0v3" /></>,
  calendar: <><rect x="3.5" y="5.5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3.5v4M16 3.5v4" /></>,
  ball: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5l3.4 2.5-1.3 4h-4.2l-1.3-4L12 7.5z" /><path d="M12 3.5v4M19.8 9.6l-3.7 2.9M17.2 19.2l-3.1-5M6.8 19.2l3.1-5M4.2 9.6l3.7 2.9" /></>,
  chevronDown: <path d="M6 9l6 6 6-6" />,
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 1.75 }) {
  const path = PATHS[name];
  if (!path) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
