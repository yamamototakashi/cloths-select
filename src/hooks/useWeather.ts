import { useCallback, useEffect } from 'react';
import { OpenMeteoService } from '../services/weather/openMeteo';
import { useApp } from '../store/appStore';
import type { WeatherSnapshot } from '../types';

const weatherService = new OpenMeteoService();

async function fetchByGeolocation(): Promise<{ lat: number; lon: number } | undefined> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return undefined;
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), 8000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        clearTimeout(timer);
        resolve(undefined);
      },
      { maximumAge: 60 * 60 * 1000, timeout: 7000 },
    );
  });
}

export function useWeather() {
  const profile = useApp((s) => s.profile);
  const weather = useApp((s) => s.weather);
  const loading = useApp((s) => s.weatherLoading);
  const error = useApp((s) => s.weatherError);
  const setWeather = useApp((s) => s.setWeather);
  const setLoading = useApp((s) => s.setWeatherLoading);
  const setError = useApp((s) => s.setWeatherError);
  const loadCachedWeatherIfAny = useApp((s) => s.loadCachedWeatherIfAny);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(undefined);
    try {
      let lat = profile.location.latitude;
      let lon = profile.location.longitude;
      let name = profile.location.name;

      if (profile.location.mode === 'gps') {
        const geo = await fetchByGeolocation();
        if (geo) {
          lat = geo.lat;
          lon = geo.lon;
          name = name || '現在地';
        }
      }

      if (lat === undefined || lon === undefined) {
        setError('位置情報が未設定です。設定から地域を指定してください。');
        return;
      }

      const snap: WeatherSnapshot = await weatherService.getByCoordinates(lat, lon, name);
      await setWeather(snap);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '天気の取得に失敗しました';
      setError(msg);
      await loadCachedWeatherIfAny();
    } finally {
      setLoading(false);
    }
  }, [profile, setWeather, setLoading, setError, loadCachedWeatherIfAny]);

  useEffect(() => {
    if (profile && !weather && !loading) {
      void refresh();
    }
  }, [profile, weather, loading, refresh]);

  return { weather, loading, error, refresh };
}

export { weatherService };
