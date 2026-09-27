export function AnnouncementBar() {
  return (
    <div className="bg-ink-dark text-cream h-9 flex items-center justify-center px-5">
      <p className="text-[0.68rem] font-sans-wide uppercase tracking-[0.15em] text-center truncate">
        Livraison offerte dès 100 000 F CFA
        <span className="hidden sm:inline"> · Retours gratuits sous 30 jours</span>
      </p>
    </div>
  );
}
