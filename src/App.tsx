import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { ClosetScreen } from './screens/ClosetScreen';
import { ItemEditScreen } from './screens/ItemEditScreen';
import { ItemAddScreen } from './screens/ItemAddScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { SetupScreen } from './screens/SetupScreen';
import { SuggestionDetailScreen } from './screens/SuggestionDetailScreen';
import { WardrobeSummaryScreen } from './screens/WardrobeSummaryScreen';
import { useApp } from './store/appStore';

export function App() {
  const hydrate = useApp((s) => s.hydrate);
  const hydrated = useApp((s) => s.hydrated);
  const profile = useApp((s) => s.profile);
  const loadCached = useApp((s) => s.loadCachedWeatherIfAny);
  const location = useLocation();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated) void loadCached();
  }, [hydrated, loadCached]);

  if (!hydrated) {
    return (
      <div className="boot-screen">
        <div className="boot-screen__logo">Closet Weather</div>
        <div className="boot-screen__hint">読み込み中…</div>
      </div>
    );
  }

  const needsSetup = !profile?.setupCompleted;
  if (needsSetup && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/setup" element={<SetupScreen />} />
          <Route path="/" element={<HomeScreen />} />
          <Route path="/closet" element={<ClosetScreen />} />
          <Route path="/closet/summary" element={<WardrobeSummaryScreen />} />
          <Route path="/closet/add" element={<ItemAddScreen />} />
          <Route path="/closet/:id" element={<ItemEditScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/suggestion/:id" element={<SuggestionDetailScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!needsSetup && <BottomNav />}
    </div>
  );
}
