import { useEffect, useState } from 'react';
import './index.css';
import { UIConfigProvider } from './context/UIConfigContext';
import { AdaptiveNav } from './components/AdaptiveNav';
import { PersonaBadge } from './components/PersonaBadge';
import { useUIConfig } from './context/useUIConfig';
import { useBehaviorSignals } from './hooks/useBehaviorSignals';
import { Home } from './pages/Home';
import { Technology } from './pages/Technology';
import { UseCases } from './pages/UseCases';
import { DataScienceApi } from './pages/DataScienceApi';

function AppShell() {
  const { persona, isLoading } = useUIConfig();
  const { behaviorMode, markHighIntent } = useBehaviorSignals(persona);
  const [path, setPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function navigate(next: string) {
    if (next === path) return;
    window.history.pushState({}, '', next);
    setPath(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const engagementScore =
    behaviorMode === 'high_intent' ? 96 : behaviorMode === 'low_engagement' ? 58 : 84;

  return (
    <>
      <AdaptiveNav currentPath={path} onNavigate={navigate} />
      {path === '/technology' ? (
        <Technology behaviorMode={behaviorMode} />
      ) : path === '/use-cases' ? (
        <UseCases behaviorMode={behaviorMode} />
      ) : path === '/api' ? (
        <DataScienceApi behaviorMode={behaviorMode} />
      ) : (
        <Home
          persona={persona}
          behaviorMode={behaviorMode}
          isLoading={isLoading}
          engagementScore={engagementScore}
          onPrimaryIntent={markHighIntent}
          onSecondaryIntent={markHighIntent}
        />
      )}
      <PersonaBadge />
    </>
  );
}

function App() {
  return (
    <UIConfigProvider>
      <AppShell />
    </UIConfigProvider>
  );

}

export default App;
