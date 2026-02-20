# Geo Frontend

Frontend web da aplicação Geo, construído com React + TypeScript + Vite + shadcn/ui.

## Requisitos

- Node.js 20+ (recomendado)
- npm ou pnpm
- Backend da Geo API rodando (por padrão em `http://localhost:8000`)

## Configuração

1. Instale as dependências:

```bash
npm install
# ou
pnpm install
```

2. Crie seu arquivo de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

3. Configure as variáveis de ambiente no arquivo `.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Como rodar

Ambiente de desenvolvimento:

```bash
npm run dev
# ou
pnpm dev
```

Com Docker (desenvolvimento, com hot reload):

```bash
docker compose up --build
```

Build de produção com Docker:

```bash
docker build -t geo-frontend .
docker run --rm -p 8080:80 geo-frontend
```

Build de produção:

```bash
npm run build
# ou
pnpm build
```

Preview do build:

```bash
npm run preview
# ou
pnpm preview
```

Lint:

```bash
npm run lint
# ou
pnpm lint
```

## Rotas e páginas

- `/` - **Login**
  - Autentica usuário com username/senha.
  - Em sucesso, cria cookies de autenticação e libera rotas privadas.

- `/register` - **Cadastro**
  - Cria nova conta de usuário.
  - Valida confirmação de senha e exibe feedback de erro/sucesso.

- `/home` - **Home (protegida)**
  - Tela inicial após login.
  - Exibe menu superior e acesso rápido aos módulos.

- `/products` - **Produtos (protegida)**
  - CRUD completo de produtos:
    - listar produtos
    - criar produto
    - editar produto
    - excluir produto
    - ajustar estoque (adicionar/remover)
  - Atualiza a listagem em tempo real após operações.

- `/cash` - **Movimentações de Caixa (protegida)**
  - Lista entradas/saídas.
  - Mostra resumo de caixa (entradas, saídas e saldo).
  - Permite criar nova movimentação via modal.

- `/places` - **Locais e Uso do Solo (protegida)**
  - Lista os usos do solo disponíveis.
  - Consulta área total por uso do solo.
  - Salva pontos por latitude/longitude (com inferência de uso no backend).
  - Lista todos os pontos cadastrados.

## Autenticação e acesso

- Rotas públicas: `/` e `/register`
- Rotas privadas: `/home`, `/products`, `/cash`, `/places`
- Usuário não autenticado é redirecionado para `/`.

## Stack principal

- React 19
- TypeScript
- Vite
- TanStack Query
- react-hook-form
- shadcn/ui
- Sonner (toasts)
