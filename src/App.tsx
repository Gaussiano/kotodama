import { HashRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { ThemeEffect } from './theme/ThemeEffect';
import { UpdatePrompt } from './components/ui/UpdatePrompt';

export function App() {
  return (
    <HashRouter>
      <ThemeEffect />
      <AppRoutes />
      <UpdatePrompt />
    </HashRouter>
  );
}
