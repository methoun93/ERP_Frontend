import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';
import { ErpNavigationService } from '../navigation/erp-navigation.service';

export const erpRouteGuard: CanActivateFn = (route, state) => {
  const navigation = inject(ErpNavigationService);
  const router = inject(Router);
  const cleanUrl = (state.url || '').split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  const routeUrl = cleanUrl
    .replace(/\/create$/i, '')
    .replace(/\/edit\/[^/]+$/i, '')
    .replace(/\/view\/[^/]+$/i, '');

  if (routeUrl === '/erp' || routeUrl === '/erp/workspace' || routeUrl === '/erp/dashboard') {
    return true;
  }

  const redirectNotFound = (): UrlTree => router.parseUrl('/erp/not-found');

  return navigation.loadFromApi().pipe(
    switchMap(() => navigation.resolveUrlAfterTree(routeUrl)),
    map((found) => {
      if (found.subMenu || found.menu || found.module) return true;
      return redirectNotFound();
    }),
    catchError(() => of(redirectNotFound()))
  );
};
