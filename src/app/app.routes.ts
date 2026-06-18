import { Routes } from '@angular/router';
import { ErpShell } from './layouts/erp-shell/erp-shell';
import { Login } from './features/auth/login/login';
import { CompanyGateway } from './features/auth/company-gateway/company-gateway';
import { Dashboard } from './features/dashboard/dashboard';
import { NotFound } from './features/not-found/not-found';
import { DynamicErpPage } from './features/dynamic-erp-page/dynamic-erp-page';
import { RolePermissionPage } from './features/administration/user-setup/role-permission-page/role-permission-page';
import { CreateUserPage } from './features/administration/user-setup/create-user-page/create-user-page';
import { authGuard, companyContextGuard } from './core/guards/auth.guard';
import { erpRouteGuard } from './core/guards/erp-route.guard';
import { ReportingDashboard } from './features/reporting/reporting-dashboard/reporting-dashboard';
import { ReportLibrary } from './features/reporting/report-library/report-library';
import { ReportBuilder } from './features/reporting/report-builder/report-builder';
import { ReportPreview } from './features/reporting/report-preview/report-preview';

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
        path: 'administration/user-setup/create-user',
        component: CreateUserPage,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Create User' }
      },

      {
        path: 'administration/user-setup/create-user/edit/:id',
        component: CreateUserPage,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Edit User' }
      },

      {
        path: 'administration/user-setup/create-user/create',
        component: CreateUserPage,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Create User' }
      },

      {
        path: 'administration/user-setup/role-permission',
        component: RolePermissionPage,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Role Permission' }
      },

      {
        path: 'administration/role-management/role-permissions',
        component: RolePermissionPage,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Role Permission' }
      },

      {
        path: 'administration/role-management/adm-role-permissions',
        component: RolePermissionPage,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Role Permission' }
      },


      {
        path: 'reporting',
        component: ReportingDashboard,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Reporting Dashboard' }
      },

      {
        path: 'reporting/library',
        component: ReportLibrary,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Report Library' }
      },

      {
        path: 'reporting/reports',
        redirectTo: 'reporting/library',
        pathMatch: 'full'
      },

      {
        path: 'reporting/builder',
        component: ReportBuilder,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Report Builder' }
      },

      {
        path: 'reporting/builder/:id',
        component: ReportBuilder,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Report Builder' }
      },

      {
        path: 'reporting/preview',
        component: ReportPreview,
        canActivate: [erpRouteGuard],
        data: { breadcrumb: 'Report Preview' }
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