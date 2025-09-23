export default function MediaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Media</h1>
      <p className="mt-2 text-foreground/70">Curated wellbeing content for students.</p>
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
            <div className="aspect-video rounded-md bg-black/5 dark:bg-white/5 grid place-items-center text-foreground/50">Thumbnail</div>
            <div className="mt-3 font-medium">Article {i}</div>
            <div className="text-sm text-foreground/60">Short description for media item {i}.</div>
          </div>
        ))}
      </div>
    </div>
  );
}
