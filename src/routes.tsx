import type { ComponentType } from 'react';

import { CashTransactionsPage } from '@/pages/cash-transactions';
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { PlacesPage } from '@/pages/places';
import { ProductsPage } from '@/pages/products';
import { RegisterPage } from '@/pages/register';

export type AppRoute = {
  component: ComponentType;
  path: string;
  public: boolean;
};

export const appRoutes: AppRoute[] = [
  {
    path: '/',
    component: LoginPage,
    public: true,
  },
  {
    path: '/home',
    component: HomePage,
    public: false,
  },
  {
    path: '/cash',
    component: CashTransactionsPage,
    public: false,
  },
  {
    path: '/products',
    component: ProductsPage,
    public: false,
  },
  {
    path: '/places',
    component: PlacesPage,
    public: false,
  },
  {
    path: '/register',
    component: RegisterPage,
    public: true,
  },
];

export function resolveRoute(pathname: string): AppRoute {
  const route = appRoutes.find((item) => item.path === pathname);

  return (
    route ?? {
      path: '/',
      component: LoginPage,
      public: true,
    }
  );
}
