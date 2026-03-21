import { useEffect, useState } from 'react';
import { parseRoute, type RouteState } from './utils/router';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Portfolio from './pages/Portfolio';
import Settings from './pages/Settings';
import Level from './pages/Level';

export default function App() {
  const [route, setRoute] = useState<RouteState>(parseRoute);

  useEffect(() => {
    function onNav() {
      setRoute(parseRoute());
    }
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, []);

  const { page, level } = route;

  if (page === 'level' && level) return <Level levelId={level} />;
  if (page === 'explore') return <Explore selectedLevelId={level} />;
  if (page === 'portfolio') return <Portfolio />;
  if (page === 'settings') return <Settings />;
  return <Home />;
}
