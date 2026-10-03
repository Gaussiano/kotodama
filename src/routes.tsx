import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { TabBar } from './components/ui/TabBar';
import { TopBar } from './components/ui/TopBar';
import { MapScreen } from './screens/Map';
import { ReviewScreen } from './screens/Review';
import { KanaDojoScreen } from './screens/KanaDojo';
import { GrimoireScreen } from './screens/Grimoire';
import { ProfileScreen } from './screens/Profile';
import { SettingsScreen } from './screens/Settings';
import { OnboardingScreen } from './screens/Onboarding';
import { LessonScreen } from './screens/Lesson';
import { TravelModeScreen } from './screens/TravelMode';
import { TalkHubScreen } from './screens/TalkHub';
import { PronounceScreen } from './screens/Pronounce';
import { ConversationScreen } from './screens/Conversation';
import { KanaQuickScreen } from './screens/KanaQuick';
import { MAP_FLAG } from './screens/TravelMode';
import { isTravelPeriod } from './domain/calendar';
import { localDayKey } from './domain/dates';
import { useSettingsStore } from './store/settingsStore';

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
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/kana" element={<KanaDojoScreen />} />
          <Route path="/talk" element={<TalkHubScreen />} />
          <Route path="/grimoire" element={<GrimoireScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/lesson/:nodeId" element={<LessonScreen />} />
        <Route path="/travel" element={<TravelModeScreen />} />
        <Route path="/kana/quick" element={<KanaQuickScreen />} />
        <Route path="/talk/pronounce/:topic" element={<PronounceScreen />} />
        <Route path="/talk/conversation/:convId/:level" element={<ConversationScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
