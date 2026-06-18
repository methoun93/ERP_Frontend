import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { RenderReportRequest, RenderReportResponse, RptReport, RptReportParameter, RptReportTemplate, RptReportVariant } from '../models/reporting.models';

@Injectable({ providedIn: 'root' })
export class ReportingApiService {
  private readonly base = '/reporting';

  constructor(private readonly api: ApiClientService) {}

  getReports(): Observable<RptReport[]> {
    return this.api.get<RptReport[]>(`${this.base}/reports`);
  }

  getReport(id: string): Observable<RptReport> {
    return this.api.get<RptReport>(`${this.base}/reports/${id}`);
  }

  createReport(payload: Partial<RptReport>): Observable<RptReport> {
    return this.api.post<RptReport>(`${this.base}/reports`, payload);
  }

  updateReport(id: string, payload: Partial<RptReport>): Observable<RptReport> {
    return this.api.put<RptReport>(`${this.base}/reports/${id}`, payload);
  }

  getVariants(reportId: string): Observable<RptReportVariant[]> {
    return this.api.get<RptReportVariant[]>(`${this.base}/reports/${reportId}/variants`);
  }

  saveVariant(reportId: string, payload: Partial<RptReportVariant>): Observable<RptReportVariant> {
    return this.api.post<RptReportVariant>(`${this.base}/reports/${reportId}/variants`, payload);
  }

  getTemplates(variantId: string): Observable<RptReportTemplate[]> {
    return this.api.get<RptReportTemplate[]>(`${this.base}/variants/${variantId}/templates`);
  }

  saveTemplate(variantId: string, payload: Partial<RptReportTemplate>): Observable<RptReportTemplate> {
    return this.api.post<RptReportTemplate>(`${this.base}/variants/${variantId}/templates`, payload);
  }

  getParameters(reportId: string): Observable<RptReportParameter[]> {
    return this.api.get<RptReportParameter[]>(`${this.base}/reports/${reportId}/parameters`);
  }

  saveParameter(reportId: string, payload: Partial<RptReportParameter>): Observable<RptReportParameter> {
    return this.api.post<RptReportParameter>(`${this.base}/reports/${reportId}/parameters`, payload);
  }

  render(payload: RenderReportRequest): Observable<RenderReportResponse> {
    return this.api.post<RenderReportResponse>(`${this.base}/render`, payload);
  }
}
