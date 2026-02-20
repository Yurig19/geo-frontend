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
import { Form } from '@/components/ui/form';
import { useAuth } from '@/contexts/authContexts';
import { toast } from 'sonner';

type RegisterFormData = {
  confirmPassword: string;
  email: string;
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
      'Não foi possível criar a conta.'
    );
  }

  return 'Não foi possível criar a conta.';
}

export function RegisterPage() {
  const { handleRegister } = useAuth();

  const form = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        message: 'As senhas precisam ser iguais',
      });
      toast.error('Erro no cadastro', {
        description: 'As senhas precisam ser iguais.',
      });
      return;
    }

    try {
      await handleRegister({
        username: data.username,
        email: data.email || undefined,
        password: data.password,
      });
      toast.success('Conta criada', {
        description: 'Seu cadastro foi realizado com sucesso.',
      });
      window.setTimeout(() => {
        window.location.href = '/login';
      }, 700);
    } catch (err) {
      toast.error('Erro no cadastro', {
        description: getErrorMessage(err),
      });
    }
  };

  return (
    <main className='relative min-h-screen overflow-hidden bg-muted/30 px-4 py-10'>
      <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_var(--color-chart-2)/20,_transparent_55%),radial-gradient(circle_at_bottom,_var(--color-primary)/20,_transparent_50%)]' />

      <section className='mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center'>
        <Card className='w-full backdrop-blur-xs'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl'>Criar conta</CardTitle>
            <CardDescription>
              Preencha os dados para se registrar.
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
                  name='email'
                  label='E-mail (opcional)'
                  placeholder='voce@dominio.com'
                  type='email'
                  rules={{
                    validate: (value) => {
                      if (!value) {
                        return true;
                      }
                      return /\S+@\S+\.\S+/.test(value) || 'E-mail inválido';
                    },
                  }}
                />

                <InputField
                  control={form.control}
                  name='password'
                  label='Senha'
                  placeholder='Crie uma senha'
                  type='password'
                  rules={{
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter no mínimo 6 caracteres',
                    },
                    required: 'Senha é obrigatória',
                  }}
                />

                <InputField
                  control={form.control}
                  name='confirmPassword'
                  label='Confirmar senha'
                  placeholder='Repita a senha'
                  type='password'
                  rules={{ required: 'Confirmação de senha é obrigatória' }}
                />

                <Button
                  className='w-full'
                  type='submit'
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? 'Criando conta...'
                    : 'Criar conta'}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className='flex flex-col items-start gap-2'>
            <p className='text-muted-foreground text-sm'>
              Já possui uma conta?
            </p>
            <a className='text-sm underline' href='/login'>
              Fazer login
            </a>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
