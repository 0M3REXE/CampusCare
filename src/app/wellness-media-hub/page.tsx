"use client";
import VideoGallery from '@/components/VideoGallery';
import BreathingExercise from '@/components/wellness/BreathingExercise';
import GroundingHelper from '@/components/wellness/GroundingHelper';

const videos = [
  { id: 'inpok4MKVLM', title: '5-Minute Guided Meditation for Stress' },
  { id: 'LiUnFJ8P4gM', title: 'Breathing Exercise for Anxiety Relief' },
  { id: 'SNqYG95j_UQ', title: 'Progressive Muscle Relaxation' },
  { id: '6p_yaNFSYao', title: 'Mindfulness for Beginners' },
  { id: '5mGifCwig8I', title: 'Sleep Stories for Insomnia' },
  { id: 'hJbRpHZr_d0', title: 'Yoga for Stress Relief' },
  { id: 'WPPPFqsECz0', title: 'Gratitude Journaling Guide' },
  { id: '1vx8iUvfyCY', title: 'Study Break Meditation' },
];

export default function WellnessMediaHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Wellness Media Hub</h1>
        <p className="mt-2 text-foreground/70">Curated wellbeing content for students.</p>
      </div>

      {/* Guided Breathing / Panic Relief */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">Calm & Breathing Support</h2>
          <p className="mt-1 text-sm text-foreground/70 max-w-3xl">If you feel anxious or notice early signs of a panic surge, use the guided patterns below to slow your breathing and settle your nervous system.</p>
          <div className="mt-4">
            <BreathingExercise />
          </div>
        </div>
        <GroundingHelper />
      </section>

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
