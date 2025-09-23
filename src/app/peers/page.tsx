const majors = ["CS", "Psychology", "Biology", "Economics"] as const;
const baseTags = ["Listening", "Study Buddy", "Wellbeing"] as const;
type Peer = {
  id: number;
  name: string;
  major: (typeof majors)[number];
  tags: (typeof baseTags)[number][];
};

const peers: Peer[] = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: `Student ${i + 1}`,
  major: majors[i % majors.length],
  tags: baseTags.slice(0, (i % baseTags.length) + 1),
}));

export default function PeersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Peers</h1>
        <p className="mt-2 text-foreground/70">Find peer support and student communities.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {peers.map((p) => (
          <div key={p.id} className="rounded-2xl border border-black/10 dark:border-white/10 p-5 bg-background/60">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600" />
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-foreground/60">{p.major}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t: (typeof baseTags)[number]) => (
                <span key={t} className="text-xs rounded-full border border-black/10 dark:border-white/10 px-2 py-1 text-foreground/70">{t}</span>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className="text-sm rounded-full border px-3 py-1.5 border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]">Connect</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
