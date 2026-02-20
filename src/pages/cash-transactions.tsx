import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '@/components/fields/input';
import { SelectField } from '@/components/fields/select';
import { TextareaField } from '@/components/fields/textArea';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { authClient } from '@/client/auth-client';
import {
  movementTypeEnumEnum,
  type MovementTypeEnum,
  useCashRetrieve,
  useCashTransactionsCreate,
  useCashTransactionsList,
} from '@/gen';
import { toast } from 'sonner';

type CashMovementFormData = {
  amount: string;
  description: string;
  movement_type: MovementTypeEnum;
};

function formatCurrency(value: string): string {
  const amount = Number(value);
  return Number.isNaN(amount)
    ? value
    : amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

function movementLabel(value: string): string {
  if (value === 'INCOME') {
    return 'Entrada';
  }
  if (value === 'EXPENSE') {
    return 'Saída';
  }
  return value;
}

function normalizeAmount(value: string): string {
  return value.replace(',', '.').trim();
}

function isValidAmount(value: string): boolean {
  const normalized = normalizeAmount(value);
  if (!/^\d{1,10}([.]\d{1,2})?$/.test(normalized)) {
    return false;
  }

  return Number(normalized) > 0;
}

function getMutationErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível registrar a movimentação.';
}

export function CashTransactionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useCashRetrieve({
    client: {
      client: authClient,
    },
  });
  const {
    data: transactions,
    isLoading: transactionsLoading,
    isError: transactionsError,
    refetch: refetchTransactions,
  } = useCashTransactionsList({
    client: {
      client: authClient,
    },
  });
  const { mutateAsync: createTransaction, isPending: isCreatingTransaction } =
    useCashTransactionsCreate({
      client: {
        client: authClient,
      },
    });

  const movementForm = useForm<CashMovementFormData>({
    defaultValues: {
      movement_type: movementTypeEnumEnum.INCOME,
      amount: '',
      description: '',
    },
  });

  const reloadData = async () => {
    await Promise.all([refetchSummary(), refetchTransactions()]);
  };

  const handleCreateMovement = async (data: CashMovementFormData) => {
    const payload = {
      movement_type: data.movement_type,
      amount: normalizeAmount(data.amount),
      description: data.description?.trim() || undefined,
    };

    const response = await createTransaction({ data: payload });
    if (response.status !== 200 && response.status !== 201) {
      toast('Não foi possível registrar a movimentação.');
      return;
    }

    await reloadData();
    movementForm.reset({
      movement_type: movementTypeEnumEnum.INCOME,
      amount: '',
      description: '',
    });
    setIsDialogOpen(false);
    toast.success('Movimentação registrada com sucesso.');
  };

  return (
    <ProtectedLayout
      currentPath='/cash'
      title='Movimentações do caixa'
      subtitle='Lista completa das entradas e saídas registradas.'
    >
      <section className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Total de entradas</CardDescription>
            <CardTitle className='text-xl'>
              {summaryLoading
                ? 'Carregando...'
                : summaryError
                  ? 'Erro ao carregar'
                  : formatCurrency(summary?.data.total_income ?? '0')}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Total de saídas</CardDescription>
            <CardTitle className='text-xl'>
              {summaryLoading
                ? 'Carregando...'
                : summaryError
                  ? 'Erro ao carregar'
                  : formatCurrency(summary?.data.total_expense ?? '0')}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Saldo atual</CardDescription>
            <CardTitle className='text-xl'>
              {summaryLoading
                ? 'Carregando...'
                : summaryError
                  ? 'Erro ao carregar'
                  : formatCurrency(summary?.data.balance ?? '0')}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-4'>
          <div>
            <CardTitle>Histórico de movimentações</CardTitle>
            <CardDescription>
              Entradas e saídas ordenadas conforme retorno da API.
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Nova movimentação</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar movimentação</DialogTitle>
                  <DialogDescription>
                    Registre uma nova entrada ou saída de caixa.
                  </DialogDescription>
                </DialogHeader>

                <Form {...movementForm}>
                  <form
                    className='space-y-4'
                    onSubmit={movementForm.handleSubmit(async (data) => {
                      try {
                        await handleCreateMovement(data);
                      } catch (error) {
                        toast.error('Erro ao salvar movimentação', {
                          description: getMutationErrorMessage(error),
                        });
                      }
                    })}
                  >
                    <SelectField
                      control={movementForm.control}
                      name='movement_type'
                      label='Tipo de movimentação'
                      disabled={isCreatingTransaction}
                      options={[
                        {
                          value: movementTypeEnumEnum.INCOME,
                          label: 'Entrada',
                        },
                        {
                          value: movementTypeEnumEnum.EXPENSE,
                          label: 'Saída',
                        },
                      ]}
                      rules={{ required: 'Selecione o tipo da movimentação.' }}
                    />

                    <InputField
                      control={movementForm.control}
                      name='amount'
                      label='Valor'
                      placeholder='Ex.: 120,50'
                      disabled={isCreatingTransaction}
                      rules={{
                        required: 'Informe o valor da movimentação.',
                        validate: (value) =>
                          isValidAmount(value) ||
                          'Informe um valor válido maior que zero.',
                      }}
                      type='text'
                    />

                    <TextareaField
                      control={movementForm.control}
                      name='description'
                      label='Descrição (opcional)'
                      placeholder='Ex.: recebimento de cliente / pagamento de fornecedor'
                      disabled={isCreatingTransaction}
                    />

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          variant='outline'
                          disabled={isCreatingTransaction}
                        >
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button type='submit' disabled={isCreatingTransaction}>
                        {isCreatingTransaction ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Button variant='outline' onClick={reloadData}>
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {transactionsLoading ? (
            <p className='text-sm text-muted-foreground'>
              Carregando movimentações...
            </p>
          ) : null}

          {transactionsError ? (
            <p className='text-sm text-destructive'>
              Não foi possível carregar as movimentações.
            </p>
          ) : null}

          {!transactionsLoading &&
          !transactionsError &&
          (transactions?.data.length ?? 0) === 0 ? (
            <p className='text-sm text-muted-foreground'>
              Nenhuma movimentação encontrada.
            </p>
          ) : null}

          {(transactions?.data ?? []).map((movement) => (
            <Card key={movement.id}>
              <CardContent className='flex flex-col gap-2 px-4 py-4 md:flex-row md:items-center md:justify-between'>
                <div>
                  <p className='text-sm font-semibold'>
                    {movementLabel(movement.movement_type)}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {movement.description}
                  </p>
                </div>
                <div className='text-left md:text-right'>
                  <p className='text-sm font-semibold'>
                    {formatCurrency(movement.amount)}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {formatDateTime(movement.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </ProtectedLayout>
  );
}
