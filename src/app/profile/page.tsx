"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabaseBrowser';

// Options should mirror onboarding
const strengthOptions = ['Listening', 'Empathy', 'Problem Solving', 'Motivation'] as const;
const weaknessOptions = ['Time Management', 'Anxiety', 'Public Speaking', 'Procrastination'] as const;
const interestOptions = ['Mindfulness', 'Yoga', 'Peer Support', 'Journaling', 'Meditation'] as const;
const compatibilityOptions = ['Calm', 'Direct', 'Encouraging', 'Reflective'] as const;
const visibilityOptions = ['friends', 'public'] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [compatibility, setCompatibility] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('friends');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }

      type Preferences = { strengths?: string[]; weaknesses?: string[]; compatibility?: string };
      type ProfileRow = {
        display_name: string | null;
        interests: string[] | null;
        preferences: Preferences | null;
        visibility: string | null;
      };

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, interests, preferences, visibility')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) {
        setError(error.message);
      } else if (data) {
        const row = data as ProfileRow;
        setDisplayName(row.display_name ?? '');
        setInterests(Array.isArray(row.interests) ? row.interests : []);
        const prefs: Preferences = row.preferences ?? {};
        setStrengths(Array.isArray(prefs.strengths) ? prefs.strengths : []);
        setWeaknesses(Array.isArray(prefs.weaknesses) ? prefs.weaknesses : []);
        setCompatibility(typeof prefs.compatibility === 'string' ? prefs.compatibility : '');
        setVisibility(typeof row.visibility === 'string' ? row.visibility : 'friends');
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
    setSaved(false);
    setSaving(true);
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }
    const { error } = await supabase.from('profiles').upsert({
      user_id: user.id,
      display_name: displayName,
      interests,
      preferences: { strengths, weaknesses, compatibility },
      visibility,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setError(error.message);
    } else {
      setSaved(true);
    }
    setSaving(false);
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <p className="mt-1 text-foreground/70">Update your details and preferences anytime.</p>

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
          <label className="text-sm font-medium">Strengths</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {strengthOptions.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => toggle(strengths, setStrengths, opt)}
                className={`text-sm rounded-full border px-3 py-1.5 ${strengths.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Weaknesses</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {weaknessOptions.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => toggle(weaknesses, setWeaknesses, opt)}
                className={`text-sm rounded-full border px-3 py-1.5 ${weaknesses.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Interests</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {interestOptions.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => toggle(interests, setInterests, opt)}
                className={`text-sm rounded-full border px-3 py-1.5 ${interests.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Emotional compatibility</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {compatibilityOptions.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setCompatibility(compatibility === opt ? '' : opt)}
                className={`text-sm rounded-full border px-3 py-1.5 ${compatibility === opt ? 'bg-blue-600 text-white border-blue-600' : 'border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/10 dark:border-white/10 bg-background px-3 py-2 outline-none"
          >
            {visibilityOptions.map(v => (
              <option key={v} value={v}>{v === 'public' ? 'Public (visible to peers)' : 'Friends (hidden from directory)'}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-foreground/60">Public shows your card in Peers. Friends hides you from the directory.</p>
        </div>

        {error && <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>}
        {saved && <div className="text-sm text-emerald-600 dark:text-emerald-400">Saved.</div>}

        <div className="flex justify-between">
          <button type="button" onClick={() => router.back()} className="rounded-full border px-5 py-2 text-sm border-black/10 dark:border-white/10 hover:bg-black/[.04] dark:hover:bg-white/[.06]">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full bg-blue-600 text-white px-5 py-2 font-medium hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
