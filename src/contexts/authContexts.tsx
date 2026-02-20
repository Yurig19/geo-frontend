import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { type ReactNode, createContext, useContext } from 'react';
import { authClient, publicClient } from '@/client/auth-client';
import { queryClient } from '@/lib/query-client';
import {
  useAuthCheckTokenRetrieve,
  useAuthLoginCreate,
  useAuthRegisterCreate,
  type AuthUserResponse,
  type LoginRequest,
  type RegisterRequest,
} from '@/gen';

interface AuthContextType {
  user: AuthUserResponse | undefined;
  loading: boolean;
  handleLogin: (authLoginDto: LoginRequest) => Promise<void>;
  handleRegister: (registerAuthDto: RegisterRequest) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

type LoginPayload = {
  access: string;
  refresh: string;
};

type AuthAction = 'login' | 'register';

function prettifyFieldName(field: string): string {
  const labels: Record<string, string> = {
    username: 'username',
    password: 'senha',
    email: 'e-mail',
    non_field_errors: 'dados',
  };

  return labels[field] ?? field;
}

function getValidationMessage(payload: Record<string, unknown>): string | null {
  const details =
    payload.details && typeof payload.details === 'object'
      ? (payload.details as Record<string, unknown>)
      : null;
  const source = details ?? payload;

  for (const [field, value] of Object.entries(source)) {
    if (typeof value === 'string' && value.trim()) {
      return `${prettifyFieldName(field)}: ${value}`;
    }

    if (Array.isArray(value) && typeof value[0] === 'string') {
      return `${prettifyFieldName(field)}: ${value[0]}`;
    }
  }

  return null;
}

function getFriendlyStatusMessage(
  status: number,
  action: AuthAction
): string | null {
  if (action === 'login') {
    if (status === 401) {
      return 'Usuário ou senha inválidos. Verifique e tente novamente.';
    }
    if (status === 429) {
      return 'Muitas tentativas de login. Aguarde um momento e tente novamente.';
    }
  }

  if (action === 'register') {
    if (status === 409) {
      return 'Já existe uma conta com esses dados.';
    }
    if (status === 429) {
      return 'Muitas tentativas de cadastro. Aguarde um momento e tente novamente.';
    }
  }

  if (status >= 500) {
    return 'Estamos com instabilidade no servidor. Tente novamente em instantes.';
  }

  return null;
}

function getApiErrorMessage(
  status: number,
  action: AuthAction,
  payload: unknown,
  fallbackMessage: string
): string {
  const statusMessage = getFriendlyStatusMessage(status, action);
  if (statusMessage) {
    return statusMessage;
  }

  if (!payload || typeof payload !== 'object') {
    return fallbackMessage;
  }

  const data = payload as Record<string, unknown>;
  const validationMessage = getValidationMessage(data);
  if (validationMessage) {
    return `Verifique os dados informados (${validationMessage}).`;
  }

  const nestedData =
    data.data && typeof data.data === 'object'
      ? (data.data as Record<string, unknown>)
      : null;

  if (nestedData) {
    const nestedValidationMessage = getValidationMessage(nestedData);
    if (nestedValidationMessage) {
      return `Verifique os dados informados (${nestedValidationMessage}).`;
    }
  }

  const directMessage =
    data.detail ??
    data.message ??
    data.error ??
    nestedData?.detail ??
    nestedData?.message ??
    nestedData?.error;

  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage;
  }

  const nonFieldErrors =
    data.non_field_errors ?? nestedData?.non_field_errors ?? data.errors;
  if (Array.isArray(nonFieldErrors) && typeof nonFieldErrors[0] === 'string') {
    return nonFieldErrors[0];
  }

  return fallbackMessage;
}

function extractLoginPayload(responseData: unknown): LoginPayload {
  if (!responseData || typeof responseData !== 'object') {
    throw new Error('Resposta de login inválida.');
  }

  const data = responseData as Record<string, unknown>;
  const nestedData =
    data.data && typeof data.data === 'object'
      ? (data.data as Record<string, unknown>)
      : null;

  const access =
    (data.access as string | undefined) ??
    (data.access_token as string | undefined) ??
    (nestedData?.access as string | undefined) ??
    (nestedData?.access_token as string | undefined);
  const refresh =
    (data.refresh as string | undefined) ??
    (data.refresh_token as string | undefined) ??
    (nestedData?.refresh as string | undefined) ??
    (nestedData?.refresh_token as string | undefined);

  if (!access || !refresh) {
    throw new Error('Resposta de login inválida: token não retornado.');
  }

  return { access, refresh };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token } = parseCookies();
  const hasToken = Boolean(token);

  const {
    data: user,
    isLoading: loading,
    queryKey: checkTokenQueryKey,
  } = useAuthCheckTokenRetrieve({
    query: {
      enabled: hasToken,
      retry: false,
    },
    client: {
      client: authClient,
    },
  });
  const { mutateAsync: handleLoginMutation } = useAuthLoginCreate({
    client: {
      client: publicClient,
    },
  });
  const { mutateAsync: handleRegisterMutation } = useAuthRegisterCreate({
    client: {
      client: publicClient,
    },
  });

  const logout = (): void => {
    queryClient.removeQueries({ queryKey: checkTokenQueryKey });
    destroyCookie(null, 'token', { path: '/' });
    destroyCookie(null, 'refreshToken', { path: '/' });
    window.location.href = '/';
  };

  const handleLogin = async (authLoginDto: LoginRequest): Promise<void> => {
    const response = await handleLoginMutation({ data: authLoginDto });
    if (response.status !== 200) {
      throw new Error(
        getApiErrorMessage(
          response.status,
          'login',
          response.data,
          'Não foi possível realizar o login.'
        )
      );
    }

    const { access, refresh } = extractLoginPayload(response.data);

    setCookie(null, 'token', access, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    setCookie(null, 'refreshToken', refresh, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    await queryClient.invalidateQueries({ queryKey: checkTokenQueryKey });
  };

  const handleRegister = async (
    registerAuthDto: RegisterRequest
  ): Promise<void> => {
    const response = await handleRegisterMutation({ data: registerAuthDto });
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        getApiErrorMessage(
          response.status,
          'register',
          response.data,
          'Não foi possível criar a conta.'
        )
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user?.data?.user,
        loading,
        handleLogin,
        handleRegister,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
