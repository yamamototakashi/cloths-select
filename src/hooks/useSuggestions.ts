import { useMemo } from 'react';
import { buildSuggestions } from '../engine/engine';
import { useApp } from '../store/appStore';
import type { OutfitSuggestion } from '../types';

export function useSuggestions(): OutfitSuggestion[] {
  const profile = useApp((s) => s.profile);
  const items = useApp((s) => s.items);
  const wearLogs = useApp((s) => s.wearLogs);
  const weather = useApp((s) => s.weather);

  return useMemo(() => {
    if (!profile || !weather) return [];
    return buildSuggestions({ weather, profile, items, wearLogs });
  }, [profile, items, wearLogs, weather]);
}
