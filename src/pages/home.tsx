import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/authContexts';

export function HomePage() {
  const { user } = useAuth();

  return (
    <ProtectedLayout
      currentPath='/home'
      title='Página inicial'
      subtitle='Acesse os módulos do sistema pelo menu superior.'
    >
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo, {user?.username}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <p className='text-sm text-muted-foreground'>
            Você está autenticado e já pode acompanhar as movimentações do
            caixa.
          </p>
          <Button asChild>
            <a href='/cash'>Ver movimentações</a>
          </Button>
        </CardContent>
      </Card>
    </ProtectedLayout>
  );
}
