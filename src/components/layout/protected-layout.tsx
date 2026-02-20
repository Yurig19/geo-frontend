import type { ReactNode } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/authContexts';

type ProtectedLayoutProps = {
  children: ReactNode;
  currentPath: string;
  subtitle: string;
  title: string;
};

const navItems = [
  { label: 'Home', path: '/home' },
  { label: 'Produtos', path: '/products' },
  { label: 'Locais', path: '/places' },
  { label: 'Movimentações', path: '/cash' },
];

function getInitials(username?: string): string {
  if (!username) {
    return 'U';
  }
  return username.slice(0, 2).toUpperCase();
}

export function ProtectedLayout({
  children,
  currentPath,
  subtitle,
  title,
}: ProtectedLayoutProps) {
  const { logout, user } = useAuth();

  return (
    <main className='min-h-screen bg-muted/30 px-4 py-6 md:px-8'>
      <section className='mx-auto flex w-full max-w-5xl flex-col gap-6'>
        <Card>
          <CardContent className='flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6'>
            <div className='flex items-center gap-3'>
              <Avatar size='lg'>
                <AvatarFallback>{getInitials(user?.username)}</AvatarFallback>
              </Avatar>
              <div>
                <p className='text-sm text-muted-foreground'>Conectado como</p>
                <p className='text-sm font-semibold'>{user?.username}</p>
              </div>
            </div>

            <nav className='flex flex-wrap items-center gap-2'>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  asChild
                  variant={currentPath === item.path ? 'default' : 'outline'}
                >
                  <a href={item.path}>{item.label}</a>
                </Button>
              ))}
              <Button variant='destructive' onClick={logout}>
                Sair
              </Button>
            </nav>
          </CardContent>
        </Card>

        <header>
          <h1 className='text-2xl font-semibold'>{title}</h1>
          <p className='text-sm text-muted-foreground'>{subtitle}</p>
        </header>

        {children}
      </section>
    </main>
  );
}
