export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#f5f7fa] dark:bg-[#071224] transition-colors">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-navy-900/15 border-t-gold-400 dark:border-white/15 dark:border-t-gold-400" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy-800/50 dark:text-slate-400">
          Loading…
        </p>
      </div>
    </div>
  );
}
