import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { TabBar } from './components/ui/TabBar';
import { MapScreen } from './screens/Map';
import { ReviewScreen } from './screens/Review';
import { KanaDojoScreen } from './screens/KanaDojo';
import { GrimoireScreen } from './screens/Grimoire';
import { ProfileScreen } from './screens/Profile';
import { SettingsScreen } from './screens/Settings';
import { OnboardingScreen } from './screens/Onboarding';
import { LessonScreen } from './screens/Lesson';
import { TravelModeScreen } from './screens/TravelMode';
import { useSettingsStore } from './store/settingsStore';

function TabLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 pb-24">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
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
          <Route path="/" element={<MapScreen />} />
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/kana" element={<KanaDojoScreen />} />
          <Route path="/grimoire" element={<GrimoireScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/lesson/:nodeId" element={<LessonScreen />} />
        <Route path="/travel" element={<TravelModeScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
