import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { TabBar } from './components/ui/TabBar';
import { TopBar } from './components/ui/TopBar';
import { MapScreen } from './screens/Map';
import { OnboardingScreen } from './screens/Onboarding';
import { MAP_FLAG } from './screens/travelFlag';
import { useSettingsStore } from './store/settingsStore';
import { isTravelPeriod } from './domain/calendar';
import { localDayKey } from './domain/dates';

// Heavy screens are code-split so the map opens fast (spec §15: initial load < 300 KB gzip).
const ReviewScreen = lazy(() => import('./screens/Review').then((m) => ({ default: m.ReviewScreen })));
const KanaDojoScreen = lazy(() => import('./screens/KanaDojo').then((m) => ({ default: m.KanaDojoScreen })));
const KanaQuickScreen = lazy(() => import('./screens/KanaQuick').then((m) => ({ default: m.KanaQuickScreen })));
const GrimoireScreen = lazy(() => import('./screens/Grimoire').then((m) => ({ default: m.GrimoireScreen })));
const ProfileScreen = lazy(() => import('./screens/Profile').then((m) => ({ default: m.ProfileScreen })));
const SettingsScreen = lazy(() => import('./screens/Settings').then((m) => ({ default: m.SettingsScreen })));
const LessonScreen = lazy(() => import('./screens/Lesson').then((m) => ({ default: m.LessonScreen })));
const TravelModeScreen = lazy(() => import('./screens/TravelMode').then((m) => ({ default: m.TravelModeScreen })));
const TalkHubScreen = lazy(() => import('./screens/TalkHub').then((m) => ({ default: m.TalkHubScreen })));
const PronounceScreen = lazy(() => import('./screens/Pronounce').then((m) => ({ default: m.PronounceScreen })));
const DictionaryScreen = lazy(() => import('./screens/Dictionary').then((m) => ({ default: m.DictionaryScreen })));
const ConversationScreen = lazy(() => import('./screens/Conversation').then((m) => ({ default: m.ConversationScreen })));

function Loading() {
  return (
    <main className="screen flex min-h-[60dvh] items-center justify-center">
      <p className="text-ink-2">Cargando…</p>
    </main>
  );
}

function S({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

function TabLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <div className="flex-1 pb-24">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}

/** From 2 to 16 November the app opens in Modo viaje (spec §11); «Mapa» in travel mode opts out for the session. */
function Home() {
  let optOut = false;
  try {
    optOut = sessionStorage.getItem(MAP_FLAG) === '1';
  } catch {
    /* ignore */
  }
  if (isTravelPeriod(localDayKey()) && !optOut) return <Navigate to="/travel" replace />;
  return <MapScreen />;
}

function RequireOnboarding() {
  const onboarded = useSettingsStore((s) => s.onboarded);
  if (!onboarded) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route element={<RequireOnboarding />}>
        <Route element={<TabLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/review" element={<S><ReviewScreen /></S>} />
          <Route path="/kana" element={<S><KanaDojoScreen /></S>} />
          <Route path="/talk" element={<S><TalkHubScreen /></S>} />
          <Route path="/grimoire" element={<S><GrimoireScreen /></S>} />
          <Route path="/profile" element={<S><ProfileScreen /></S>} />
        </Route>
        <Route path="/settings" element={<S><SettingsScreen /></S>} />
        <Route path="/dictionary" element={<S><DictionaryScreen /></S>} />
        <Route path="/lesson/:nodeId" element={<S><LessonScreen /></S>} />
        <Route path="/travel" element={<S><TravelModeScreen /></S>} />
        <Route path="/kana/quick" element={<S><KanaQuickScreen /></S>} />
        <Route path="/talk/pronounce/:topic" element={<S><PronounceScreen /></S>} />
        <Route path="/talk/conversation/:convId/:level" element={<S><ConversationScreen /></S>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
