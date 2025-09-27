"use client";
import VideoGallery, { Video } from '@/components/VideoGallery';
import BreathingExercise from '@/components/wellness/BreathingExercise';
import GroundingHelper from '@/components/wellness/GroundingHelper';
import { useState, useMemo, useEffect } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

const CATEGORY_OPTIONS = [
  'All',
  'anxiety',
  'balance',
  'breathing',
  'burnout',
  'calm',
  'exam',
  'meditation',
  'mindfulness',
  'panic',
  'relaxation',
  'sleep',
  'stress',
  'study',
  'wellbeing',
] as const;

const videos: Video[] = [
  { id: 'inpok4MKVLM', title: '5-Minute Guided Meditation for Stress', categories: ['stress','meditation','calm'] },
  { id: 'LiUnFJ8P4gM', title: 'Breathing Exercise for Anxiety Relief', categories: ['anxiety','breathing','calm'] },
  { id: 'SNqYG95j_UQ', title: 'Progressive Muscle Relaxation', categories: ['relaxation','stress','calm'] },
  { id: '6p_yaNFSYao', title: 'Mindfulness for Beginners', categories: ['mindfulness','balance','wellbeing'] },
  { id: '5mGifCwig8I', title: 'Sleep Stories for Insomnia', categories: ['sleep','calm','relaxation'] },
  { id: 'hJbRpHZr_d0', title: 'Yoga for Stress Relief', categories: ['stress','balance','wellbeing'] },
  { id: 'WPPPFqsECz0', title: 'Gratitude Journaling Guide', categories: ['wellbeing','mindfulness','balance'] },
  { id: '1vx8iUvfyCY', title: 'Study Break Meditation', categories: ['study','meditation','stress'] },
];

export default function WellnessMediaHubPage() {
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>('All');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading state for demonstration
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const filteredVideos = useMemo(() => {
    if (category === 'All') return videos;
    return videos.filter(v => v.categories?.includes(category));
  }, [category]);

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

      {/* Helpful videos section */}
      <section>
        <h2 className="text-xl font-semibold">Videos</h2>
        <p className="mt-1 text-sm text-foreground/70">Short, accessible content on mental health and wellbeing. Filter by what you need right now.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} variant="button" className="rounded-full" width={`${60 + Math.random() * 40}px`} />
            ))
          ) : (
            CATEGORY_OPTIONS.map(opt => {
              const active = category === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setCategory(opt)}
                  className={`px-3 py-1 rounded-full text-sm border transition font-medium tracking-wide ${active ? 'bg-foreground text-background border-foreground' : 'border-foreground/20 hover:border-foreground/40 text-foreground/70 hover:text-foreground'}`}
                  aria-pressed={active}
                >
                  {opt}
                </button>
              );
            })
          )}
        </div>
        <div className="mt-6">
          <VideoGallery videos={filteredVideos} loading={loading} />
        </div>
      </section>
    </div>
  );
}
