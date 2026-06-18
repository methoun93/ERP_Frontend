export type ReportType = 'GRID' | 'LAYOUT' | 'PIVOT' | 'CHART' | 'DASHBOARD' | 'MASTER_DETAIL';

export interface RptReport {
  id?: string;
  reportNo?: string;
  reportKey: string;
  reportName: string;
  moduleId?: string;
  moduleName?: string;
  procedureName: string;
  reportType: ReportType | string;
  isActive?: boolean;
}

export interface RptReportVariant {
  id?: string;
  reportId?: string;
  variantCode: string;
  variantName: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface RptReportTemplate {
  id?: string;
  variantId?: string;
  templateName: string;
  companyId?: string | null;
  areaId?: string | null;
  layoutJson: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface RptReportParameter {
  id?: string;
  reportId?: string;
  parameterName: string;
  displayName: string;
  dataType: string;
  controlType: string;
  lookupApi?: string | null;
  isRequired?: boolean;
  defaultValue?: string | null;
  sortOrder?: number;
}

export interface ReportElement {
  id: string;
  type: 'text' | 'field' | 'image' | 'table' | 'line' | 'rectangle' | 'barcode' | 'qr' | 'pageBreak';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  field?: string;
  text?: string;
  imageUrl?: string;
  style?: Record<string, string | number | boolean>;
  columns?: ReportTableColumn[];
}

export interface ReportTableColumn {
  field: string;
  caption: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  aggregate?: 'sum' | 'count' | 'avg' | 'min' | 'max' | '';
}

export interface ReportLayout {
  pageSettings: {
    pageSize: 'A4' | 'A5' | 'Letter' | 'Legal';
    orientation: 'Portrait' | 'Landscape';
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    showPageNo: boolean;
    showPrintDate: boolean;
    repeatHeader: boolean;
  };
  theme: {
    primaryColor: string;
    headerBackground: string;
    headerTextColor: string;
    borderColor: string;
    textColor: string;
  };
  elements: ReportElement[];
}

export interface RenderReportRequest {
  reportId?: string;
  reportNo?: string;
  reportKey?: string;
  variantCode?: string;
  parameters: Record<string, unknown>;
}

export interface RenderReportResponse {
  report?: RptReport;
  variant?: RptReportVariant;
  template?: RptReportTemplate;
  layout?: ReportLayout;
  data?: Record<string, unknown>[];
}
