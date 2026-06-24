import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../core/services/api-client.service';
import { ProcedureParameterMeta, RenderReportRequest, RenderReportResponse, ReportLookupOption, RptReport, RptReportParameter, RptReportTemplate, RptReportVariant, SaveReportDesignerRequest, SaveReportDesignerResponse } from '../models/reporting.models';

@Injectable({ providedIn: 'root' })
export class ReportingApiService {
  private readonly base = '/reporting';

  constructor(private readonly api: ApiClientService) {}


  getModules(): Observable<ReportLookupOption[]> {
    return this.api.get<ReportLookupOption[]>(`${this.base}/reports/modules`);
  }

  getCompanies(): Observable<ReportLookupOption[]> {
    return this.api.get<ReportLookupOption[]>(`${this.base}/reports/companies`);
  }

  getAreas(companyId?: string | null): Observable<ReportLookupOption[]> {
    const qs = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return this.api.get<ReportLookupOption[]>(`${this.base}/reports/areas${qs}`);
  }

  discoverParameters(procedureName: string): Observable<ProcedureParameterMeta[]> {
    return this.api.get<ProcedureParameterMeta[]>(`${this.base}/reports/procedure-parameters?procedureName=${encodeURIComponent(procedureName)}`);
  }

  saveDesigner(payload: SaveReportDesignerRequest): Observable<SaveReportDesignerResponse> {
    return this.api.post<SaveReportDesignerResponse>(`${this.base}/reports/designer-save`, payload);
  }

  getDesigner(reportId: string): Observable<any> {
    return this.api.get<any>(`${this.base}/reports/${encodeURIComponent(reportId)}/designer`);
  }

  cloneReport(reportId: string): Observable<SaveReportDesignerResponse> {
    return this.api.post<SaveReportDesignerResponse>(`${this.base}/reports/${encodeURIComponent(reportId)}/clone`, {});
  }

  getReports(): Observable<RptReport[]> {
    return this.api.get<any>(`${this.base}/reports`).pipe(
      map(result => Array.isArray(result) ? result : (result?.items ?? result?.Items ?? []))
    );
  }

  getReport(idOrKey: string): Observable<RptReport> {
    return this.api.get<RptReport>(`${this.base}/reports/${encodeURIComponent(idOrKey)}`);
  }

  createReport(payload: Partial<RptReport>): Observable<RptReport> {
    return this.api.post<RptReport>(`${this.base}/reports`, payload);
  }

  updateReport(id: string, payload: Partial<RptReport>): Observable<RptReport> {
    return this.api.put<RptReport>(`${this.base}/reports/${id}`, payload);
  }

  getVariants(reportIdOrKey: string): Observable<RptReportVariant[]> {
    return this.api.get<RptReportVariant[]>(`${this.base}/reports/${encodeURIComponent(reportIdOrKey)}/variants`);
  }

  saveVariant(reportIdOrKey: string, payload: Partial<RptReportVariant>): Observable<RptReportVariant> {
    return this.api.post<RptReportVariant>(`${this.base}/reports/${encodeURIComponent(reportIdOrKey)}/variants`, payload);
  }

  getTemplates(variantId: string): Observable<RptReportTemplate[]> {
    return this.api.get<RptReportTemplate[]>(`${this.base}/variants/${encodeURIComponent(variantId)}/templates`);
  }

  saveTemplate(variantIdOrCode: string, payload: Partial<RptReportTemplate>): Observable<RptReportTemplate> {
    return this.api.post<RptReportTemplate>(`${this.base}/variants/${encodeURIComponent(variantIdOrCode)}/templates`, payload);
  }

  getParameters(reportIdOrKey: string): Observable<RptReportParameter[]> {
    return this.api.get<RptReportParameter[]>(`${this.base}/reports/${encodeURIComponent(reportIdOrKey)}/parameters`);
  }

  saveParameter(reportIdOrKey: string, payload: Partial<RptReportParameter>): Observable<RptReportParameter> {
    return this.api.post<RptReportParameter>(`${this.base}/reports/${encodeURIComponent(reportIdOrKey)}/parameters`, payload);
  }

  discoverFields(procedureName: string): Observable<string[]> {
    return this.api
      .get<unknown[]>(`${this.base}/reports/fields?procedureName=${encodeURIComponent(procedureName)}`)
      .pipe(map((fields) => this.normalizeFieldNames(fields)));
  }

  private normalizeFieldNames(fields: unknown): string[] {
    if (!Array.isArray(fields)) return [];

    return fields
      .map((item) => {
        if (typeof item === 'string') return item;
        if (!item || typeof item !== 'object') return '';

        const field = item as Record<string, unknown>;
        const name =
          field['fieldName'] ??
          field['FieldName'] ??
          field['name'] ??
          field['Name'] ??
          field['columnName'] ??
          field['ColumnName'];

        return typeof name === 'string' ? name : '';
      })
      .filter((name): name is string => !!name.trim());
  }

  render(payload: RenderReportRequest): Observable<RenderReportResponse> {
    return this.api.post<RenderReportResponse>(`${this.base}/reports/render`, payload);
  }
}
