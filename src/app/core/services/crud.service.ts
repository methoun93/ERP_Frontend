import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export function normalizeList<T = any>(response: any): T[] {
  if (Array.isArray(response)) return response as T[];
  if (Array.isArray(response?.items)) return response.items as T[];
  if (Array.isArray(response?.data)) return response.data as T[];
  if (Array.isArray(response?.result)) return response.result as T[];
  if (Array.isArray(response?.records)) return response.records as T[];
  return [];
}

export function getTotalCount(response: any): number {
  if (Array.isArray(response)) return response.length;
  return Number(
    response?.totalCount ??
    response?.total ??
    response?.count ??
    response?.items?.length ??
    response?.data?.length ??
    response?.result?.length ??
    response?.records?.length ??
    0
  );
}

@Injectable({ providedIn: 'root' })
export class CrudService {
  constructor(private readonly http: HttpClient) {}

  list<T = any>(endpoint: string, params?: ListParams): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<T>(endpoint, { params: httpParams });
  }

  get<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${endpoint}/${id}`);
  }

  create<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(endpoint, data);
  }

  update<T>(endpoint: string, id: string | number, data: any): Observable<T> {
    return this.http.put<T>(`${endpoint}/${id}`, data);
  }

  delete(endpoint: string, id: string | number): Observable<void> {
    return this.http.delete<void>(`${endpoint}/${id}`);
  }
}
