function Block({ className }) {
  return <div className={`animate-pulse rounded-xl bg-fc-line ${className}`} />;
}

export default function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="bg-fc-surface rounded-2xl p-4 border border-fc-line shadow-card space-y-2">
        <Block className="h-3.5 w-32" />
        <Block className="h-2.5 w-44" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Block className="h-24" />
        <Block className="h-24" />
      </div>

      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-fc-surface rounded-2xl p-4 border border-fc-line shadow-card space-y-2.5">
          <Block className="h-3 w-24" />
          <Block className="h-9 w-full" />
          <Block className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}
