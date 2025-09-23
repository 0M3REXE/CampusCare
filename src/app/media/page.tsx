"use client";
import VideoGallery from '@/components/VideoGallery';

const videos = [
  { id: 'j4wKV5-1oTw', title: 'How to cope with anxiety', channel: 'TED-Ed', duration: '6:48' },
  { id: 'W6IN0wx8rWY', title: 'What is stress? (and how to manage it)', channel: 'SciShow Psych', duration: '9:12' },
  { id: 'ax0tXbY5r2k', title: 'Mindfulness for beginners', channel: 'Jon Kabat-Zinn', duration: '10:05' },
  { id: '5qPLtXf1rFQ', title: 'Understanding depression', channel: 'Kati Morton', duration: '7:31' },
  { id: 'sTJ7AzBIJoI', title: 'Motivation: How to get started', channel: 'Thomas Frank', duration: '8:43' },
  { id: 'ZToicYcHIOU', title: 'Guided meditation for relaxation', channel: 'The Honest Guys', duration: '15:00' },
  { id: '2FGR-OspxsU', title: 'How to build resilience', channel: 'TED', duration: '12:10' },
];

export default function MediaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Media</h1>
        <p className="mt-2 text-foreground/70">Curated wellbeing content for students.</p>
      </div>

      {/* Articles section (placeholder) */}
      <section>
        <h2 className="text-xl font-semibold">Articles</h2>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 p-4">
              <div className="aspect-video rounded-md bg-black/5 dark:bg-white/5 grid place-items-center text-foreground/50">Thumbnail</div>
              <div className="mt-3 font-medium">Article {i}</div>
              <div className="text-sm text-foreground/60">Practical guidance on stress management, balance, and campus life.</div>
              <div className="mt-2 text-xs text-foreground/50">3 min read • Wellbeing</div>
            </div>
          ))}
        </div>
      </section>

      {/* Helpful videos section */}
      <section>
        <h2 className="text-xl font-semibold">Helpful videos</h2>
        <p className="mt-1 text-sm text-foreground/70">Short, accessible content on mental health and wellbeing.</p>
        <div className="mt-4">
          <VideoGallery videos={videos} />
        </div>
      </section>
    </div>
  );
}
