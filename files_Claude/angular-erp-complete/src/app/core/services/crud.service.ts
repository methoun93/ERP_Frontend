import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type PagedResult<T> = {
  items?: T[];
  Items?: T[];
  data?: T[];
  Data?: T[];
  result?: T[];
  Result?: T[];
  totalCount?: number;
  TotalCount?: number;
  total?: number;
  Total?: number;
  page?: number;
  Page?: number;
  limit?: number;
  Limit?: number;
} | T[];

export type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, string | number | boolean | null | undefined>;
};

@Injectable({ providedIn: 'root' })
export class CrudService {
  constructor(private http: HttpClient) {}

  list<T>(endpoint: string, params?: ListParams): Observable<PagedResult<T>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));
    if (params?.search?.trim()) httpParams = httpParams.set('search', params.search.trim());

    Object.entries(params?.filters ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        httpParams = httpParams.set(`filters[${key}]`, String(value));
      }
    });

    return this.http.get<PagedResult<T>>(endpoint, { params: httpParams });
  }

  get<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${endpoint}/${encodeURIComponent(id)}`);
  }

  create<T>(endpoint: string, payload: unknown): Observable<T> {
    return this.http.post<T>(endpoint, payload);
  }

  update<T>(endpoint: string, id: string, payload: unknown): Observable<T> {
    return this.http.put<T>(`${endpoint}/${encodeURIComponent(id)}`, payload);
  }

  delete(endpoint: string, id: string): Observable<void> {
    return this.http.delete<void>(`${endpoint}/${encodeURIComponent(id)}`);
  }
}

export function normalizeList<T>(result: PagedResult<T> | any): T[] {
  if (Array.isArray(result)) return result;
  if (!result) return [];
  return result.items || result.Items || result.data || result.Data || result.result || result.Result || [];
}

export function getTotalCount<T>(result: PagedResult<T> | any): number {
  if (Array.isArray(result)) return result.length;
  if (!result) return 0;
  const total = result.totalCount ?? result.TotalCount ?? result.total ?? result.Total;
  if (typeof total === 'number') return total;
  return normalizeList<T>(result).length;
}
