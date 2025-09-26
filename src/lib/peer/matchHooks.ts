"use client";
import { useCallback, useState } from 'react';

export interface PeerMatchResult {
  user_id: string;
  display_name: string;
  institution?: string;
  sharedInterests: string[];
  complements: string[];
  interestOverlap: number;
  complementStrength: number;
  sameInstitution: number;
  score: number;
}

interface MatchesResponse { matches: PeerMatchResult[] }

export function usePeerMatches(accessToken: string | null) {
  const [matches, setMatches] = useState<PeerMatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/v1/peer/match', { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) throw new Error(await res.text());
      const data: MatchesResponse = await res.json();
      setMatches(data.matches);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load matches');
    } finally { setLoading(false); }
  }, [accessToken]);

  return { matches, loading, error, fetchMatches };
}
