"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';

const strengthOptions = ['Listening', 'Empathy', 'Problem Solving', 'Motivation'] as const;
const weaknessOptions = ['Time Management', 'Anxiety', 'Public Speaking', 'Procrastination'] as const;
const interestOptions = ['Mindfulness', 'Yoga', 'Peer Support', 'Journaling', 'Meditation'] as const;
const compatibilityOptions = ['Calm', 'Direct', 'Encouraging', 'Reflective'] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [institution, setInstitution] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [compatibility, setCompatibility] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      // Optionally fetch existing profile to prefill
      const { data } = await supabase
        .from('profiles')
        .select('display_name, interests, preferences')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name ?? '');
        setInterests(Array.isArray(data.interests) ? data.interests : []);
        if (data.preferences && typeof data.preferences === 'object') {
          const prefsObj = data.preferences as Record<string, unknown>;
          const inst = prefsObj['institution'];
          if (typeof inst === 'string') setInstitution(inst);
        }
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      display_name: displayName,
      interests,
      preferences: {
        strengths,
        weaknesses,
        compatibility,
        institution: institution.trim() || null,
      },
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setError(error.message);
      return;
    }
    router.replace('/peers');
  };

  if (loading) return <div className="mx-auto max-w-md px-4 sm:px-6 py-16">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Tell us about you</h1>
      <p className="mt-1 text-foreground/70">We use this to match you with peers.</p>
      <form onSubmit={onSave} className="mt-6 space-y-6">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/10 bg-background px-3 py-2 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Institution</label>
          <input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. University of Example"
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/10 bg-background px-3 py-2 outline-none"
          />
          <p className="mt-1 text-xs text-foreground/60">Used to refine peer matching. Optional.</p>
        </div>

        <div>
          <label className="text-sm font-medium">Strengths</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {strengthOptions.map((opt) => (
              <button type="button" key={opt} onClick={() => toggle(strengths, setStrengths, opt)} className={`text-sm rounded-full border px-3 py-1.5 ${strengths.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'}`}>{opt}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Weaknesses</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {weaknessOptions.map((opt) => (
              <button type="button" key={opt} onClick={() => toggle(weaknesses, setWeaknesses, opt)} className={`text-sm rounded-full border px-3 py-1.5 ${weaknesses.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'}`}>{opt}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Interests</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {interestOptions.map((opt) => (
              <button type="button" key={opt} onClick={() => toggle(interests, setInterests, opt)} className={`text-sm rounded-full border px-3 py-1.5 ${interests.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'}`}>{opt}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Emotional compatibility</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {compatibilityOptions.map((opt) => (
              <button type="button" key={opt} onClick={() => setCompatibility(compatibility === opt ? '' : opt)} className={`text-sm rounded-full border px-3 py-1.5 ${compatibility === opt ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'}`}>{opt}</button>
            ))}
          </div>
        </div>

        {error && <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>}

        <div className="flex justify-end">
          <button type="submit" className="rounded-full bg-blue-600 text-white px-5 py-2 font-medium hover:bg-blue-700">Save and continue</button>
        </div>
      </form>
    </div>
  );
}
