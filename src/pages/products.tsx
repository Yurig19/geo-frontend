import { useMemo, useState } from 'react';
import {
  type ProductFormData,
  CreateProductDialog,
  DeleteProductDialog,
  EditProductDialog,
  type StockFormData,
  StockProductDialog,
} from '@/components/products/product-dialogs';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/client/auth-client';
import {
  type ProductResponse,
  useProductsCreate,
  useProductsDestroy,
  useProductsList,
  useProductsStockAddPartialUpdate,
  useProductsStockRemovePartialUpdate,
  useProductsUpdate,
} from '@/gen';
import { toast } from 'sonner';

function toCurrency(value: string): string {
  const amount = Number(value);
  return Number.isNaN(amount)
    ? value
    : amount.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
}

function toDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
}

function normalizeDecimal(value: string): number {
  return Number(value.replace(',', '.'));
}

export function ProductsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(
    null
  );
  const [deletingProduct, setDeletingProduct] =
    useState<ProductResponse | null>(null);
  const [stockProduct, setStockProduct] = useState<ProductResponse | null>(
    null
  );

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useProductsList({
    client: {
      client: authClient,
    },
  });
  const { mutateAsync: createProduct, isPending: isCreating } =
    useProductsCreate({
      client: {
        client: authClient,
      },
    });
  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useProductsUpdate({
      client: {
        client: authClient,
      },
    });
  const { mutateAsync: deleteProduct, isPending: isDeleting } =
    useProductsDestroy({
      client: {
        client: authClient,
      },
    });
  const { mutateAsync: addStock, isPending: isAddingStock } =
    useProductsStockAddPartialUpdate({
      client: {
        client: authClient,
      },
    });
  const { mutateAsync: removeStock, isPending: isRemovingStock } =
    useProductsStockRemovePartialUpdate({
      client: {
        client: authClient,
      },
    });

  const totalProducts = products?.data.length ?? 0;
  const totalInventoryValue = useMemo(() => {
    return (products?.data ?? []).reduce(
      (acc, item) => acc + Number(item.total_value || 0),
      0
    );
  }, [products?.data]);

  const refreshProducts = async () => {
    await refetch();
  };

  const onCreate = async (data: ProductFormData) => {
    const response = await createProduct({
      data: {
        name: data.name.trim(),
        quantity: Number(data.quantity),
        unit_price: normalizeDecimal(data.unit_price),
      },
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('Não foi possível criar o produto.');
    }

    await refreshProducts();
    setIsCreateOpen(false);
    toast.success('Produto criado com sucesso.');
  };

  const onUpdate = async (data: ProductFormData) => {
    if (!editingProduct) {
      return;
    }

    const response = await updateProduct({
      product_id: editingProduct.id,
      data: {
        name: data.name.trim(),
        unit_price: normalizeDecimal(data.unit_price),
      },
    });

    if (response.status !== 200) {
      throw new Error('Não foi possível atualizar o produto.');
    }

    await refreshProducts();
    setEditingProduct(null);
    toast.success('Produto atualizado com sucesso.');
  };

  const onDelete = async () => {
    if (!deletingProduct) {
      return;
    }

    const response = await deleteProduct({ product_id: deletingProduct.id });
    if (response.status !== 200 && response.status !== 204) {
      throw new Error('Não foi possível excluir o produto.');
    }

    await refreshProducts();
    setDeletingProduct(null);
    toast.success('Produto excluído com sucesso.');
  };

  const onUpdateStock = async (data: StockFormData) => {
    if (!stockProduct) {
      return;
    }

    const payload = { amount: Number(data.amount) };
    const response =
      data.operation === 'add'
        ? await addStock({ product_id: stockProduct.id, data: payload })
        : await removeStock({ product_id: stockProduct.id, data: payload });

    if (response.status !== 200) {
      throw new Error('Não foi possível atualizar o estoque.');
    }

    await refreshProducts();
    setStockProduct(null);
    toast.success('Estoque atualizado com sucesso.');
  };

  return (
    <ProtectedLayout
      currentPath='/products'
      title='Produtos'
      subtitle='Gerencie o catálogo com criação, edição, estoque e exclusão.'
    >
      <section className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Total de produtos</CardDescription>
            <CardTitle className='text-xl'>{totalProducts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Valor total em estoque</CardDescription>
            <CardTitle className='text-xl'>
              {totalInventoryValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-4'>
          <div>
            <CardTitle>Listagem de produtos</CardTitle>
            <CardDescription>
              Cadastre e mantenha seus produtos em tempo real.
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <CreateProductDialog
              open={isCreateOpen}
              onOpenChange={setIsCreateOpen}
              isLoading={isCreating}
              onCreate={onCreate}
            />
            <Button variant='outline' onClick={refreshProducts}>
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? (
            <p className='text-sm text-muted-foreground'>
              Carregando produtos...
            </p>
          ) : null}
          {isError ? (
            <p className='text-sm text-destructive'>
              Não foi possível carregar a lista de produtos.
            </p>
          ) : null}
          {!isLoading && !isError && (products?.data.length ?? 0) === 0 ? (
            <p className='text-sm text-muted-foreground'>
              Nenhum produto cadastrado.
            </p>
          ) : null}

          {(products?.data ?? []).map((product) => (
            <Card key={product.id}>
              <CardContent className='flex flex-col gap-4 px-4 py-4'>
                <div className='flex flex-col justify-between gap-2 md:flex-row md:items-center'>
                  <div>
                    <p className='text-base font-semibold'>{product.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Criado em {toDateTime(product.created_at)}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Atualizado em {toDateTime(product.updated_at)}
                    </p>
                  </div>
                  <div className='text-left md:text-right'>
                    <p className='text-sm'>
                      Preço: {toCurrency(product.unit_price)}
                    </p>
                    <p className='text-sm'>Qtd.: {product.quantity}</p>
                    <p className='text-sm font-semibold'>
                      Total: {toCurrency(product.total_value)}
                    </p>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => setEditingProduct(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => setStockProduct(product)}
                  >
                    Ajustar estoque
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={() => setDeletingProduct(product)}
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <EditProductDialog
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingProduct(null);
          }
        }}
        isLoading={isUpdating}
        onUpdate={onUpdate}
        product={editingProduct}
      />

      <StockProductDialog
        open={Boolean(stockProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setStockProduct(null);
          }
        }}
        isLoading={isAddingStock || isRemovingStock}
        onUpdateStock={onUpdateStock}
        product={stockProduct}
      />

      <DeleteProductDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingProduct(null);
          }
        }}
        isLoading={isDeleting}
        onDelete={onDelete}
        product={deletingProduct}
      />
    </ProtectedLayout>
  );
}
