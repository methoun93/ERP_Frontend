import { Routes } from '@angular/router';
import { ErpShell } from './layouts/erp-shell/erp-shell';
import { Login } from './features/auth/login/login';
import { CompanyGateway } from './features/auth/company-gateway/company-gateway';
import { Dashboard } from './features/dashboard/dashboard';
import { NotFound } from './features/not-found/not-found';
import { DynamicErpPage } from './features/dynamic-erp-page/dynamic-erp-page';
import { authGuard, companyContextGuard } from './core/guards/auth.guard';
import { erpRouteGuard } from './core/guards/erp-route.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    data: { breadcrumb: 'Login' }
  },

  {
    path: 'company-gateway',
    component: CompanyGateway,
    canActivate: [authGuard],
    data: { breadcrumb: 'Company Gateway' }
  },

  {
    path: '',
    redirectTo: 'erp/workspace',
    pathMatch: 'full'
  },

  {
    path: 'modules',
    redirectTo: 'erp/workspace',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    redirectTo: 'erp/workspace',
    pathMatch: 'full'
  },

  {
    path: 'erp',
    component: ErpShell,
    canActivate: [companyContextGuard],
    children: [
      {
        path: '',
        redirectTo: 'workspace',
        pathMatch: 'full'
      },

      {
        path: 'workspace',
        component: Dashboard,
        data: { breadcrumb: 'Home' }
      },

      {
        path: 'dashboard',
        redirectTo: 'workspace',
        pathMatch: 'full'
      },

      {
        path: 'not-found',
        component: NotFound,
        data: { breadcrumb: 'Page Not Found' }
      },

      {
        path: ':moduleKey',
        component: Dashboard,
        canActivate: [erpRouteGuard]
      },

      {
        path: ':moduleKey/:menuKey',
        component: Dashboard,
        canActivate: [erpRouteGuard]
      },

      {
        path: ':moduleKey/:menuKey/:subMenuKey/create',
        component: DynamicErpPage,
        canActivate: [erpRouteGuard]
      },

      {
        path: ':moduleKey/:menuKey/:subMenuKey/edit/:id',
        component: DynamicErpPage,
        canActivate: [erpRouteGuard]
      },

      {
        path: ':moduleKey/:menuKey/:subMenuKey/view/:id',
        component: DynamicErpPage,
        canActivate: [erpRouteGuard]
      },

      {
        path: ':moduleKey/:menuKey/:subMenuKey',
        component: DynamicErpPage,
        canActivate: [erpRouteGuard]
      },

      // ERP wildcard
      {
        path: '**',
        redirectTo: 'not-found'
      }
    ]
  },

  // Global wildcard
  {
    path: '**',
    redirectTo: 'erp/not-found'
  }
];