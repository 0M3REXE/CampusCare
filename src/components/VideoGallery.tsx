'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/Skeleton';

export type Video = {
  id: string; // YouTube video ID
  title: string;
  channel?: string;
  duration?: string;
  categories?: string[]; // wellness categories (anxiety, sleep, etc.)
};

type VideoGalleryProps = {
  videos: Video[];
  loading?: boolean;
};

export default function VideoGallery({ videos, loading = false }: VideoGalleryProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-background/60">
            <div className="aspect-video">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="p-4 space-y-2">
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="60%" />
              <div className="flex gap-1 mt-2">
                <Skeleton variant="button" width="60px" className="h-5 rounded-full" />
                <Skeleton variant="button" width="80px" className="h-5 rounded-full" />
                <Skeleton variant="button" width="70px" className="h-5 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setOpenId(v.id)}
            className="text-left rounded-xl border border-black/10 dark:border-white/10 overflow-hidden bg-background/60 hover:bg-black/[.03] dark:hover:bg-white/[.04] transition"
          >
            <div className="relative aspect-video bg-black/5 dark:bg-white/5">
              <Image
                src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                alt={v.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                unoptimized
              />
            </div>
            <div className="p-4">
              <div className="font-medium line-clamp-2">{v.title}</div>
              {(v.channel || v.duration) && (
                <div className="mt-1 text-xs text-foreground/60 flex items-center gap-2">
                  {v.channel && <span>{v.channel}</span>}
                  {v.channel && v.duration && <span>•</span>}
                  {v.duration && <span>{v.duration}</span>}
                </div>
              )}
              {v.categories && v.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {v.categories.slice(0,4).map(cat => (
                    <span key={cat} className="px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/60 text-[10px] tracking-wide uppercase">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Floating modal */}
      {openId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenId(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${openId}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <button
              onClick={() => setOpenId(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 text-white px-3 py-1 text-xs hover:bg-black/80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
