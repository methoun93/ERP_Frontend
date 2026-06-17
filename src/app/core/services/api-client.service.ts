import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { TokenStoreService } from './token-store.service';
import { environment } from '../../../environments/environment';

type ApiResponseShape<T> = {
  success?: boolean;
  Success?: boolean;
  message?: string;
  Message?: string;
  title?: string;
  Title?: string;
  error?: string;
  Error?: string;
  detail?: string;
  Detail?: string;
  errors?: string[] | Record<string, string[] | string>;
  Errors?: string[] | Record<string, string[] | string>;
  data?: T;
  Data?: T;
  result?: T;
  Result?: T;
  statusCode?: number;
  StatusCode?: number;
  correlationId?: string;
  CorrelationId?: string;
  traceId?: string;
  TraceId?: string;
};

type RefreshResponse = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresAtUtc?: string;
};

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  // Change API base URL from src/environments/environment.ts only.
  // Example: apiBaseUrl: 'https://localhost:5001/api'
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient, private readonly tokenStore: TokenStoreService) {}

  get<T>(url: string, skipAuth = false): Observable<T> {
    return this.request<T>('GET', url, undefined, skipAuth);
  }

  post<T>(url: string, body: unknown, skipAuth = false): Observable<T> {
    return this.request<T>('POST', url, body, skipAuth);
  }

  put<T>(url: string, body: unknown, skipAuth = false): Observable<T> {
    return this.request<T>('PUT', url, body, skipAuth);
  }

  delete<T>(url: string, skipAuth = false): Observable<T> {
    return this.request<T>('DELETE', url, undefined, skipAuth);
  }

  private request<T>(method: string, url: string, body?: unknown, skipAuth = false, retried = false): Observable<T> {
    const fullUrl = this.toUrl(url);
    const headers = this.buildHeaders(skipAuth, body instanceof FormData);

    return this.http.request<unknown>(method, fullUrl, { body, headers }).pipe(
      map((res) => this.unwrap<T>(res)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !skipAuth && !retried && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
          return this.refreshAccessToken().pipe(
            switchMap((token) => {
              if (!token) return throwError(() => new Error('Your session has expired. Please login again.'));
              return this.request<T>(method, url, body, skipAuth, true);
            })
          );
        }

        return this.handleError(err);
      })
    );
  }

  private refreshAccessToken(): Observable<string | null> {
    const refreshToken = this.tokenStore.getRefresh();
    if (!refreshToken) return throwError(() => new Error('Your session has expired. Please login again.'));

    return this.http.post<unknown>(this.toUrl('/auth/refresh'), { refreshToken }).pipe(
      map((json) => {
        const data = this.unwrap<RefreshResponse>(json);
        const access = data.accessToken || data.token;
        if (!access) {
          this.tokenStore.clear();
          return null;
        }
        this.tokenStore.setAccess(access);
        if (data.refreshToken) this.tokenStore.setRefresh(data.refreshToken);
        return access;
      }),
      catchError(() => {
        this.tokenStore.clear();
        return throwError(() => new Error('Your session has expired. Please login again.'));
      })
    );
  }

  private buildHeaders(skipAuth: boolean, isFormData = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!isFormData) headers = headers.set('Content-Type', 'application/json');
    const token = this.tokenStore.getAccess();
    if (token && !skipAuth) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  private toUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    return `${this.baseUrl}${url.startsWith('/') ? url : '/' + url}`;
  }

  private unwrap<T>(payload: unknown): T {
    if (payload && typeof payload === 'object') {
      const obj = payload as ApiResponseShape<T>;
      const success = obj.success ?? obj.Success;
      const message = obj.message || obj.Message || obj.title || obj.Title || obj.detail || obj.Detail;
      const validationMessage = this.firstError(obj.errors || obj.Errors);

      if (success === false) {
        throw new Error(String(message || validationMessage || 'Request failed.'));
      }

      if (('data' in obj || 'Data' in obj) && ('success' in obj || 'Success' in obj || 'message' in obj || 'Message' in obj)) {
        return this.attachApiMessage((obj.data ?? obj.Data) as T, message);
      }
      if ('result' in obj) return this.attachApiMessage(obj.result as T, message);
      if ('Result' in obj) return this.attachApiMessage(obj.Result as T, message);
    }
    return payload as T;
  }

  private attachApiMessage<T>(data: T, message?: string): T {
    if (!message || data === null || data === undefined) return data;
    if (typeof data === 'object' && !Array.isArray(data)) {
      return { ...(data as Record<string, unknown>), __apiMessage: message } as T;
    }
    return data;
  }

  private handleError(error: HttpErrorResponse) {
    const payload = error.error;
    const fallback = this.fallbackMessage(error.status);
    let message = fallback;

    if (typeof payload === 'string' && payload.trim()) message = payload;
    if (payload && typeof payload === 'object') {
      const obj = payload as ApiResponseShape<unknown>;
      message = String(obj.message || obj.Message || obj.title || obj.Title || obj.detail || obj.Detail || obj.error || obj.Error || this.firstError(obj.errors || obj.Errors) || fallback);
    }

    return throwError(() => new Error(message));
  }

  private firstError(errors: ApiResponseShape<unknown>['errors']): string | undefined {
    if (!errors) return undefined;
    if (Array.isArray(errors)) return errors.find(Boolean);
    for (const [key, value] of Object.entries(errors)) {
      if (Array.isArray(value)) {
        const item = value.find(Boolean);
        if (item) return key ? `${key}: ${item}` : item;
      }
      if (typeof value === 'string' && value) return key ? `${key}: ${value}` : value;
    }
    return undefined;
  }

  private fallbackMessage(status: number): string {
    switch (status) {
      case 0: return 'Could not connect to API. Check backend is running, API base URL, HTTPS certificate, and CORS.';
      case 400: return 'Bad request (400). Please check the submitted data.';
      case 401: return 'Unauthorized (401). Login token expired, invalid, or company/area context is missing.';
      case 403: return 'Forbidden (403). You do not have permission for this action.';
      case 404: return 'Not found (404). API route or record was not found.';
      case 409: return 'Conflict (409). Duplicate or conflicting data found.';
      case 422: return 'Validation failed (422). Please check required fields.';
      case 500: return 'Server error (500). Check backend logs or database query/table/column names.';
      default: return `Request failed (${status || 'network'}).`;
    }
  }
}
