import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ReportListItem,
  ReportParameter,
  ReportRenderRequest,
  ReportRenderResponse,
  ReportTemplate,
  ReportVariant,
} from './reporting.models';

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  result?: T;
  Data?: T;
  Result?: T;
};

@Injectable({ providedIn: 'root' })
export class ReportingApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/reporting`;

  constructor(private readonly http: HttpClient) {}

  getReports(): Observable<ReportListItem[]> {
    return this.http.get<unknown>(`${this.baseUrl}/reports`).pipe(map((res) => this.unwrap<ReportListItem[]>(res, [])));
  }

  getReport(reportKey: string): Observable<ReportListItem> {
    return this.http.get<unknown>(`${this.baseUrl}/reports/${encodeURIComponent(reportKey)}`).pipe(map((res) => this.unwrap<ReportListItem>(res)));
  }

  getVariants(reportKey: string): Observable<ReportVariant[]> {
    return this.http.get<unknown>(`${this.baseUrl}/reports/${encodeURIComponent(reportKey)}/variants`).pipe(map((res) => this.unwrap<ReportVariant[]>(res, [])));
  }

  getParameters(reportKey: string): Observable<ReportParameter[]> {
    return this.http.get<unknown>(`${this.baseUrl}/reports/${encodeURIComponent(reportKey)}/parameters`).pipe(map((res) => this.unwrap<ReportParameter[]>(res, [])));
  }

  getTemplate(reportKey: string, variantCode: string): Observable<ReportTemplate> {
    return this.http
      .get<unknown>(`${this.baseUrl}/reports/${encodeURIComponent(reportKey)}/templates/${encodeURIComponent(variantCode)}`)
      .pipe(map((res) => this.unwrap<ReportTemplate>(res)));
  }

  render(request: ReportRenderRequest): Observable<ReportRenderResponse> {
    return this.http.post<unknown>(`${this.baseUrl}/reports/render`, request).pipe(map((res) => this.unwrap<ReportRenderResponse>(res)));
  }

  saveTemplate(reportKey: string, variantCode: string, body: Partial<ReportTemplate>): Observable<ReportTemplate> {
    return this.http
      .post<unknown>(`${this.baseUrl}/reports/${encodeURIComponent(reportKey)}/templates/${encodeURIComponent(variantCode)}`, body)
      .pipe(map((res) => this.unwrap<ReportTemplate>(res)));
  }

  private unwrap<T>(response: unknown, fallback?: T): T {
    if (response && typeof response === 'object') {
      const envelope = response as ApiEnvelope<T>;
      return (envelope.data ?? envelope.Data ?? envelope.result ?? envelope.Result ?? response ?? fallback) as T;
    }
    return (response ?? fallback) as T;
  }
}
