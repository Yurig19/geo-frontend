import { useForm } from 'react-hook-form';
import { InputField } from '@/components/fields/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/authContexts';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';

type LoginFormData = {
  password: string;
  username: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const errorObject = error as {
      data?: { detail?: string; message?: string };
      message?: string;
    };

    return (
      errorObject.data?.detail ??
      errorObject.data?.message ??
      errorObject.message ??
      'Não foi possível realizar o login.'
    );
  }

  return 'Não foi possível realizar o login.';
}

export function LoginPage() {
  const { handleLogin } = useAuth();

  const form = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await handleLogin(data);
      toast.success('Login realizado', {
        description: 'Bem-vindo de volta.',
      });
      window.setTimeout(() => {
        window.location.href = '/home';
      }, 700);
    } catch (err) {
      toast.error('Erro ao entrar', {
        description: getErrorMessage(err),
      });
    }
  };

  return (
    <main className='relative min-h-screen overflow-hidden bg-muted/30 px-4 py-10'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--color-primary)/20,_transparent_55%),radial-gradient(circle_at_bottom_right,_var(--color-chart-2)/20,_transparent_50%)]' />

      <section className='mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center'>
        <Card className='w-full backdrop-blur-xs'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl'>Entrar na sua conta</CardTitle>
            <CardDescription>
              Use seu username e senha para acessar o sistema.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                className='space-y-4'
                onSubmit={form.handleSubmit(onSubmit)}
                noValidate
              >
                <InputField
                  control={form.control}
                  name='username'
                  label='Username'
                  placeholder='Digite seu username'
                  type='text'
                  rules={{ required: 'Username é obrigatório' }}
                />

                <InputField
                  control={form.control}
                  name='password'
                  label='Senha'
                  placeholder='Digite sua senha'
                  type='password'
                  rules={{ required: 'Senha é obrigatória' }}
                />

                <Button
                  className='w-full'
                  type='submit'
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className='flex flex-col items-start gap-2'>
            <p className='text-muted-foreground text-sm'>
              Ainda não tem conta?
            </p>
            <a className='text-sm underline' href='/register'>
              Criar conta
            </a>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
