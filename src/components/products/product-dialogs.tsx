import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '@/components/fields/input';
import { SelectField } from '@/components/fields/select';
import { Button } from '@/components/ui/button';
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
import type { ProductResponse } from '@/gen';
import { toast } from 'sonner';

export type ProductFormData = {
  name: string;
  quantity: string;
  unit_price: string;
};

export type StockFormData = {
  amount: string;
  operation: 'add' | 'remove';
};

type CreateProductDialogProps = {
  isLoading: boolean;
  onCreate: (data: ProductFormData) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

type EditProductDialogProps = {
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: ProductFormData) => Promise<void>;
  open: boolean;
  product: ProductResponse | null;
};

type StockProductDialogProps = {
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStock: (data: StockFormData) => Promise<void>;
  open: boolean;
  product: ProductResponse | null;
};

type DeleteProductDialogProps = {
  isLoading: boolean;
  onDelete: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductResponse | null;
};

function normalizeDecimal(value: string): number {
  return Number(value.replace(',', '.'));
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

function validatePositiveInteger(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) >= 0;
}

function validatePositiveDecimal(value: string): boolean {
  return /^\d{1,8}([.,]\d{1,2})?$/.test(value) && normalizeDecimal(value) >= 0;
}

export function CreateProductDialog({
  isLoading,
  onCreate,
  onOpenChange,
  open,
}: CreateProductDialogProps) {
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      quantity: '0',
      unit_price: '',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        quantity: '0',
        unit_price: '',
      });
    }
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Novo produto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar produto</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo item.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit(async (data) => {
              try {
                await onCreate(data);
              } catch (error) {
                toast.error('Erro ao criar produto', {
                  description: toErrorMessage(
                    error,
                    'Não foi possível criar o produto.'
                  ),
                });
              }
            })}
          >
            <InputField
              control={form.control}
              name='name'
              label='Nome'
              placeholder='Ex.: Água Mineral 500ml'
              disabled={isLoading}
              rules={{ required: 'Informe o nome do produto.' }}
            />
            <InputField
              control={form.control}
              name='unit_price'
              label='Preço unitário'
              placeholder='Ex.: 4,50'
              disabled={isLoading}
              rules={{
                required: 'Informe o preço unitário.',
                validate: (value) =>
                  validatePositiveDecimal(value) || 'Informe um preço válido.',
              }}
            />
            <InputField
              control={form.control}
              name='quantity'
              label='Quantidade inicial'
              placeholder='Ex.: 10'
              disabled={isLoading}
              rules={{
                required: 'Informe a quantidade.',
                validate: (value) =>
                  validatePositiveInteger(value) ||
                  'Informe uma quantidade válida.',
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline' disabled={isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditProductDialog({
  isLoading,
  onOpenChange,
  onUpdate,
  open,
  product,
}: EditProductDialogProps) {
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      quantity: '0',
      unit_price: '',
    },
  });

  useEffect(() => {
    if (!product) {
      return;
    }

    form.reset({
      name: product.name,
      quantity: String(product.quantity),
      unit_price: product.unit_price,
    });
  }, [form, product]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar produto</DialogTitle>
          <DialogDescription>
            Atualize nome e preço do produto selecionado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit(async (data) => {
              try {
                await onUpdate(data);
              } catch (error) {
                toast.error('Erro ao atualizar produto', {
                  description: toErrorMessage(
                    error,
                    'Não foi possível atualizar o produto.'
                  ),
                });
              }
            })}
          >
            <InputField
              control={form.control}
              name='name'
              label='Nome'
              disabled={isLoading}
              rules={{ required: 'Informe o nome do produto.' }}
            />
            <InputField
              control={form.control}
              name='unit_price'
              label='Preço unitário'
              disabled={isLoading}
              rules={{
                required: 'Informe o preço unitário.',
                validate: (value) =>
                  validatePositiveDecimal(value) || 'Informe um preço válido.',
              }}
            />
            <InputField
              control={form.control}
              name='quantity'
              label='Quantidade atual'
              disabled
              rules={{}}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline' disabled={isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function StockProductDialog({
  isLoading,
  onOpenChange,
  onUpdateStock,
  open,
  product,
}: StockProductDialogProps) {
  const form = useForm<StockFormData>({
    defaultValues: {
      operation: 'add',
      amount: '1',
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        operation: 'add',
        amount: '1',
      });
    }
  }, [form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar estoque</DialogTitle>
          <DialogDescription>
            {product ? `Produto: ${product.name}` : 'Selecione um produto'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={form.handleSubmit(async (data) => {
              try {
                await onUpdateStock(data);
              } catch (error) {
                toast.error('Erro ao ajustar estoque', {
                  description: toErrorMessage(
                    error,
                    'Não foi possível ajustar o estoque.'
                  ),
                });
              }
            })}
          >
            <SelectField
              control={form.control}
              name='operation'
              label='Operação'
              disabled={isLoading}
              options={[
                { value: 'add', label: 'Adicionar unidades' },
                { value: 'remove', label: 'Remover unidades' },
              ]}
              rules={{ required: 'Selecione a operação.' }}
            />
            <InputField
              control={form.control}
              name='amount'
              label='Quantidade'
              disabled={isLoading}
              rules={{
                required: 'Informe a quantidade.',
                validate: (value) =>
                  /^\d+$/.test(value) && Number(value) > 0
                    ? true
                    : 'Informe uma quantidade inteira maior que zero.',
              }}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline' disabled={isLoading}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Confirmar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteProductDialog({
  isLoading,
  onDelete,
  onOpenChange,
  open,
  product,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir produto</DialogTitle>
          <DialogDescription>
            {product
              ? `Tem certeza que deseja excluir "${product.name}"?`
              : 'Confirme a exclusão do produto.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' disabled={isLoading}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant='destructive'
            disabled={isLoading}
            onClick={async () => {
              try {
                await onDelete();
              } catch (error) {
                toast.error('Erro ao excluir produto', {
                  description: toErrorMessage(
                    error,
                    'Não foi possível excluir o produto.'
                  ),
                });
              }
            }}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
