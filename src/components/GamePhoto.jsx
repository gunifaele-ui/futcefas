function Silhouette({ className = '' }) {
  return (
    <svg viewBox="0 0 100 130" className={className} preserveAspectRatio="xMidYMax slice" fill="currentColor">
      <circle cx="50" cy="34" r="20" />
      <path d="M50 58c-24 0-40 15-40 38v34h80V96c0-23-16-38-40-38z" />
    </svg>
  );
}

export default function GamePhoto({ nome, fotoJogo, className = '' }) {
  if (fotoJogo) {
    return <img src={fotoJogo} alt={nome} className={`w-full h-full object-cover bg-fc-cream ${className}`} />;
  }

  return (
    <div className={`w-full h-full bg-gradient-to-b from-fc-line to-fc-cream flex items-end justify-center overflow-hidden ${className}`}>
      <Silhouette className="w-[65%] text-fc-dark/15" />
    </div>
  );
}
