import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStoreService } from '../services/token-store.service';

type RefreshResponse = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresAtUtc?: string;
  data?: RefreshResponse;
  Data?: RefreshResponse;
  result?: RefreshResponse;
  Result?: RefreshResponse;
};

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStoreService);
  const http = inject(HttpClient);
  const router = inject(Router);

  const accessToken = tokenStore.getAccess();
  const authReq = addAuthHeader(req, accessToken);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!shouldRefresh(error, req)) {
        return throwError(() => error);
      }

      return handle401(authReq, next, http, tokenStore, router);
    })
  );
};

function addAuthHeader(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function shouldRefresh(error: HttpErrorResponse, req: HttpRequest<unknown>): boolean {
  if (error.status !== 401) return false;

  const url = req.url.toLowerCase();
  if (url.includes('/auth/login')) return false;
  if (url.includes('/auth/refresh')) return false;

  return true;
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  http: HttpClient,
  tokenStore: TokenStoreService,
  router: Router
) {
  const refreshToken = tokenStore.getRefresh();

  if (!refreshToken) {
    tokenStore.clear();
    router.navigate(['/login'], { queryParams: { returnUrl: router.url || '/erp/workspace' } });
    return throwError(() => new Error('Your session has expired. Please login again.'));
  }

  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token): token is string => !!token),
      take(1),
      switchMap((token) => next(addAuthHeader(req, token)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return http.post<RefreshResponse>(`${environment.apiBaseUrl}/auth/refresh`, { refreshToken }).pipe(
    switchMap((response) => {
      const data = unwrapRefreshResponse(response);
      const newAccessToken = data?.accessToken || data?.token;

      if (!newAccessToken) {
        throw new Error('Refresh token response did not contain an access token.');
      }

      tokenStore.setAccess(newAccessToken);
      if (data?.refreshToken) tokenStore.setRefresh(data.refreshToken);

      isRefreshing = false;
      refreshTokenSubject.next(newAccessToken);

      return next(addAuthHeader(req, newAccessToken));
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      tokenStore.clear();
      router.navigate(['/login'], { queryParams: { returnUrl: router.url || '/erp/workspace' } });
      return throwError(() => refreshError);
    })
  );
}

function unwrapRefreshResponse(response: RefreshResponse | null | undefined): RefreshResponse | null {
  if (!response) return null;
  return response.data || response.Data || response.result || response.Result || response;
}
