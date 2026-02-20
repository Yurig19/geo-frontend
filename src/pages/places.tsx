import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InputField } from '@/components/fields/input';
import { SelectField } from '@/components/fields/select';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { authClient } from '@/client/auth-client';
import {
  placesLandUsesAreaRetrieve,
  type LandUseAreaResponse,
  usePlacesLandUsesRetrieve,
  usePlacesPointsCreate,
  usePlacesPointsList,
} from '@/gen';
import { toast } from 'sonner';

type AreaSearchFormData = {
  land_use_description: string;
};

type PlacePointFormData = {
  latitude: string;
  longitude: string;
};

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const obj = error as {
      code?: string;
      data?: { code?: string; detail?: string; message?: string };
      detail?: string;
      message?: string;
    };

    const message = obj.data?.detail ?? obj.data?.message ?? obj.detail ?? obj.message;
    const code = obj.data?.code ?? obj.code;

    if (message && code) {
      return `${message} (${code})`;
    }

    return message ?? fallback;
  }

  return fallback;
}

function parseCoordinate(value: string): number {
  return Number(value.replace(',', '.').trim());
}

function validateLatitude(value: string): boolean {
  const latitude = parseCoordinate(value);
  return !Number.isNaN(latitude) && latitude >= -90 && latitude <= 90;
}

function validateLongitude(value: string): boolean {
  const longitude = parseCoordinate(value);
  return !Number.isNaN(longitude) && longitude >= -180 && longitude <= 180;
}

function formatArea(value: number): string {
  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

export function PlacesPage() {
  const [areaResult, setAreaResult] = useState<LandUseAreaResponse | null>(
    null
  );
  const [isSearchingArea, setIsSearchingArea] = useState(false);

  const {
    data: landUsesResponse,
    isLoading: landUsesLoading,
    isError: landUsesError,
    refetch: refetchLandUses,
  } = usePlacesLandUsesRetrieve({
    client: {
      client: authClient,
    },
  });
  const {
    data: pointsResponse,
    isLoading: pointsLoading,
    isError: pointsError,
    refetch: refetchPoints,
  } = usePlacesPointsList({
    client: {
      client: authClient,
    },
  });
  const { mutateAsync: createPoint, isPending: creatingPoint } =
    usePlacesPointsCreate({
      client: {
        client: authClient,
      },
    });

  const areaForm = useForm<AreaSearchFormData>({
    defaultValues: {
      land_use_description: '',
    },
  });

  const pointForm = useForm<PlacePointFormData>({
    defaultValues: {
      latitude: '',
      longitude: '',
    },
  });

  const landUses = landUsesResponse?.data.land_uses ?? [];
  const points = pointsResponse?.data ?? [];

  const searchArea = async (data: AreaSearchFormData) => {
    setIsSearchingArea(true);

    try {
      const response = await placesLandUsesAreaRetrieve(
        {
          land_use_description: data.land_use_description,
        },
        {
          client: authClient,
        }
      );

      if (response.status !== 200) {
        throw new Error(
          getApiErrorMessage(
            response.data,
            'Não foi possível consultar a área para esse uso.'
          )
        );
      }

      setAreaResult(response.data);
    } catch (error) {
      setAreaResult(null);
      toast.error('Erro ao consultar área', {
        description: getApiErrorMessage(
          error,
          'Não foi possível consultar a área para esse uso.'
        ),
      });
    } finally {
      setIsSearchingArea(false);
    }
  };

  const savePoint = async (data: PlacePointFormData) => {
    try {
      const response = await createPoint({
        data: {
          latitude: parseCoordinate(data.latitude),
          longitude: parseCoordinate(data.longitude),
        },
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          getApiErrorMessage(response.data, 'Não foi possível salvar o ponto.')
        );
      }

      await refetchPoints();
      pointForm.reset();
      toast.success('Ponto salvo com sucesso.');
    } catch (error) {
      toast.error('Erro ao salvar ponto', {
        description: getApiErrorMessage(
          error,
          'Não foi possível salvar o ponto informado.'
        ),
      });
    }
  };

  return (
    <ProtectedLayout
      currentPath='/places'
      title='Locais e Uso do Solo'
      subtitle='Visualize usos do solo, consulte áreas e registre pontos por latitude/longitude.'
    >
      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-4'>
          <div>
            <CardTitle>Usos do solo disponíveis</CardTitle>
            <CardDescription>
              Lista retornada pela propriedade `desc_uso_solo`.
            </CardDescription>
          </div>
          <Button variant='outline' onClick={() => refetchLandUses()}>
            Atualizar usos
          </Button>
        </CardHeader>
        <CardContent className='space-y-3'>
          {landUsesLoading ? (
            <p className='text-sm text-muted-foreground'>Carregando usos...</p>
          ) : null}
          {landUsesError ? (
            <p className='text-sm text-destructive'>
              Não foi possível carregar os usos do solo.
            </p>
          ) : null}
          {!landUsesLoading && !landUsesError && landUses.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              Nenhum uso do solo encontrado.
            </p>
          ) : null}
          {landUses.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {landUses.map((use) => (
                <span
                  key={use}
                  className='rounded-md border bg-background px-2.5 py-1 text-xs'
                >
                  {use}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consultar área por uso do solo</CardTitle>
          <CardDescription>
            Selecione um uso para calcular a área total correspondente.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Form {...areaForm}>
            <form
              className='grid gap-4 md:grid-cols-[1fr_auto]'
              onSubmit={areaForm.handleSubmit(searchArea)}
            >
              <SelectField
                control={areaForm.control}
                name='land_use_description'
                label='Uso do solo'
                disabled={isSearchingArea || landUsesLoading}
                options={landUses.map((use) => ({
                  value: use,
                  label: use,
                }))}
                rules={{ required: 'Selecione um uso do solo.' }}
              />
              <Button
                type='submit'
                className='self-end'
                disabled={isSearchingArea || landUses.length === 0}
              >
                {isSearchingArea ? 'Consultando...' : 'Consultar área'}
              </Button>
            </form>
          </Form>

          {areaResult ? (
            <Card>
              <CardContent className='space-y-1 px-4 py-4'>
                <p className='text-sm font-semibold'>
                  {areaResult.land_use_description}
                </p>
                <p className='text-sm text-muted-foreground'>
                  Área total: {formatArea(areaResult.total_area_m2)} m²
                </p>
              </CardContent>
            </Card>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Salvar novo ponto</CardTitle>
          <CardDescription>
            O backend infere automaticamente o uso do solo com base na
            geometria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...pointForm}>
            <form
              className='grid gap-4 md:grid-cols-3'
              onSubmit={pointForm.handleSubmit(savePoint)}
            >
              <InputField
                control={pointForm.control}
                name='latitude'
                label='Latitude'
                placeholder='Ex.: -23.5505'
                disabled={creatingPoint}
                rules={{
                  required: 'Informe a latitude.',
                  validate: (value) =>
                    validateLatitude(value) ||
                    'Latitude inválida (intervalo: -90 a 90).',
                }}
              />
              <InputField
                control={pointForm.control}
                name='longitude'
                label='Longitude'
                placeholder='Ex.: -46.6333'
                disabled={creatingPoint}
                rules={{
                  required: 'Informe a longitude.',
                  validate: (value) =>
                    validateLongitude(value) ||
                    'Longitude inválida (intervalo: -180 a 180).',
                }}
              />
              <Button
                type='submit'
                className='self-end'
                disabled={creatingPoint}
              >
                {creatingPoint ? 'Salvando...' : 'Salvar ponto'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-4'>
          <div>
            <CardTitle>Pontos salvos</CardTitle>
            <CardDescription>
              Lista com id, latitude, longitude e descrição do uso do solo.
            </CardDescription>
          </div>
          <Button variant='outline' onClick={() => refetchPoints()}>
            Atualizar pontos
          </Button>
        </CardHeader>
        <CardContent className='space-y-3'>
          {pointsLoading ? (
            <p className='text-sm text-muted-foreground'>
              Carregando pontos...
            </p>
          ) : null}
          {pointsError ? (
            <p className='text-sm text-destructive'>
              Não foi possível carregar os pontos.
            </p>
          ) : null}
          {!pointsLoading && !pointsError && points.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              Nenhum ponto cadastrado.
            </p>
          ) : null}

          {points.map((point) => (
            <Card key={point.id}>
              <CardContent className='grid gap-2 px-4 py-4 text-sm md:grid-cols-4'>
                <p>
                  <span className='text-muted-foreground'>ID:</span> {point.id}
                </p>
                <p>
                  <span className='text-muted-foreground'>Latitude:</span>{' '}
                  {point.latitude}
                </p>
                <p>
                  <span className='text-muted-foreground'>Longitude:</span>{' '}
                  {point.longitude}
                </p>
                <p>
                  <span className='text-muted-foreground'>Uso do solo:</span>{' '}
                  {point.land_use_description}
                </p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </ProtectedLayout>
  );
}
