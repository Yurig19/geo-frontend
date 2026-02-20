import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/authContexts';
import { resolveRoute } from '@/routes';

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const { loading, user } = useAuth();

  const route = resolveRoute(pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);

    window.addEventListener('popstate', onPopState);

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!route.public && !user && pathname !== '/') {
      window.history.replaceState({}, '', '/');
      setPathname('/');
      return;
    }

    if (route.public && user && (pathname === '/' || pathname === '/register')) {
      window.history.replaceState({}, '', '/home');
      setPathname('/home');
    }
  }, [loading, pathname, route.public, user]);

  if (loading && !route.public) {
    return (
      <main className='flex min-h-screen items-center justify-center p-6'>
        <p className='text-muted-foreground text-sm'>Carregando...</p>
      </main>
    );
  }

  const Page = route.component;

  return <Page />;
}

export default App;
