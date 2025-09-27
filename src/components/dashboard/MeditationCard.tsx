import Image from 'next/image';
import { Play, MoreHorizontal, Headphones } from 'lucide-react';

export default function MeditationCard() {
  return (
    <section className="rounded-2xl border border-black/10 bg-background/70 p-5 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
          <Headphones className="size-4" aria-hidden />
          Guided session
        </div>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg border border-black/10 text-foreground/60 transition hover:border-purple-500/30 hover:text-foreground dark:border-white/10"
          aria-label="Session options"
        >
          <MoreHorizontal className="size-5" aria-hidden />
        </button>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-xl">
        <Image
          src="https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=1200&q=80"
          alt="Guided meditation"
          width={640}
          height={360}
          className="h-56 w-full object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/70 via-transparent to-transparent" />
        <button
          type="button"
          className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-indigo-600 shadow-lg backdrop-blur"
        >
          <Play className="size-4" aria-hidden />
          Start 10 min session
        </button>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-lg font-semibold">Reset after classes</h3>
        <p className="text-sm text-foreground/60">Mindful breathing • 10 minutes • Moderate guidance</p>
      </div>
    </section>
  );
}
