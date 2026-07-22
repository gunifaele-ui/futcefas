export default function Header({ isAdmin, onLogoClick, onLeaveAdmin }) {
  return (
    <header className="sticky top-0 bg-fc-dark text-white pt-3.5 pb-7 px-3.5 flex flex-col items-center justify-between z-40 shadow-lg overflow-hidden rounded-b-[32px]">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-fc-lime/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center justify-between w-full max-w-md relative">
        <div
          onClick={onLogoClick}
          className="flex items-center gap-2.5 cursor-pointer py-1 px-2 rounded-xl active:scale-95 transition"
        >
          <div className="w-10 h-12 shrink-0 drop-shadow-md">
            <svg viewBox="0 0 200 240" className="w-full h-full">
              <defs>
                <linearGradient id="fcShieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#1c3a6b" />
                  <stop offset="1" stopColor="#122647" />
                </linearGradient>
              </defs>
              <path
                d="M100,10 L180,38 L180,118 Q180,192 100,230 Q20,192 20,118 L20,38 Z"
                fill="url(#fcShieldGrad)"
                stroke="#c9a23f"
                strokeWidth="4"
              />
              <path
                d="M100,22 L168,46 L168,116 Q168,180 100,214 Q32,180 32,116 L32,46 Z"
                fill="none"
                stroke="#c9a23f"
                strokeOpacity="0.5"
                strokeWidth="1.5"
              />
              <g transform="translate(100,100)">
                <circle r="34" fill="#f7f6f4" stroke="#152a4d" strokeWidth="2.5" />
                <polygon points="0,-15 14,-5 9,12 -9,12 -14,-5" fill="#152a4d" />
                <line x1="0" y1="-15" x2="0" y2="-34" stroke="#152a4d" strokeWidth="2" />
                <line x1="14" y1="-5" x2="30" y2="-15" stroke="#152a4d" strokeWidth="2" />
                <line x1="9" y1="12" x2="20" y2="28" stroke="#152a4d" strokeWidth="2" />
                <line x1="-9" y1="12" x2="-20" y2="28" stroke="#152a4d" strokeWidth="2" />
                <line x1="-14" y1="-5" x2="-30" y2="-15" stroke="#152a4d" strokeWidth="2" />
              </g>
              <rect x="35" y="182" width="130" height="30" rx="3" fill="#c9a23f" />
              <text
                x="100"
                y="203"
                textAnchor="middle"
                fontFamily="'Barlow Condensed', sans-serif"
                fontWeight="800"
                fontSize="19"
                letterSpacing="1.5"
                fill="#152a4d"
              >
                FUTCEFAS
              </text>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider text-white leading-none">FUT CEFAS</h1>
            <span className="text-[9px] font-bold text-fc-limesoft/80 uppercase tracking-[0.15em]">Escalação da pelada</span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-fc-limesoft text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-fc-lime animate-pulse" /> MODO ADM
            </span>
            <button
              onClick={onLeaveAdmin}
              className="bg-fc-coral/20 hover:bg-fc-coral/30 text-fc-coral text-[10px] font-black px-2 py-1 rounded-full border border-fc-coral/30 active:scale-95 transition"
            >
              🚪 Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
