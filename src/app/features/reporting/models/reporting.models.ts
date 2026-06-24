export type ReportType = 'GRID' | 'LAYOUT' | 'PIVOT' | 'CHART' | 'DASHBOARD' | 'MASTER_DETAIL';
export type ReportElementType =
  | 'text'
  | 'field'
  | 'image'
  | 'table'
  | 'line'
  | 'rectangle'
  | 'barcode'
  | 'qr'
  | 'pageBreak'
  | 'pageHeader'
  | 'pageFooter'
  | 'groupHeader'
  | 'groupFooter'
  | 'pageNumber'
  | 'printDate'
  | 'printedBy';

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

export interface ReportConditionalRule {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
  value: string | number | boolean;
  background?: string;
  color?: string;
  fontWeight?: number;
}

export interface ReportTableColumn {
  field: string;
  caption: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  aggregate?: 'sum' | 'count' | 'avg' | 'min' | 'max' | '';
  format?: string;
  visible?: boolean;
}

export interface ReportElement {
  id: string;
  type: ReportElementType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  field?: string;
  text?: string;
  imageUrl?: string;
  groupBy?: string;
  section?: 'reportHeader' | 'pageHeader' | 'details' | 'body' | 'groupHeader' | 'groupFooter' | 'reportFooter' | 'pageFooter';
  style?: Record<string, string | number | boolean>;
  columns?: ReportTableColumn[];
  conditions?: ReportConditionalRule[];
}

export interface ReportLayout {
  version: number;
  pageSettings: {
    pageSize: 'A4' | 'A5' | 'Letter' | 'Legal';
    orientation: 'Portrait' | 'Landscape';
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    showPageNo: boolean;
    showPrintDate: boolean;
    showPrintedBy: boolean;
    repeatHeader: boolean;
    pageBreakAfterGroup: boolean;
    keepRowTogether: boolean;
  };
  theme: {
    primaryColor: string;
    headerBackground: string;
    headerTextColor: string;
    borderColor: string;
    textColor: string;
    tableAltRowBackground: string;
    groupHeaderBackground: string;
    totalBackground: string;
  };
  dataSource: {
    procedureName: string;
    fields: string[];
    groupBy?: string;
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

export interface ReportLookupOption {
  id: string;
  name: string;
}

export interface ProcedureParameterMeta {
  parameterName: string;
  displayName: string;
  dataType: string;
  controlType: string;
  isRequired: boolean;
  defaultValue?: string | null;
  sortOrder: number;
}

export interface SaveReportDesignerRequest {
  reportId?: string | null;
  reportNo?: string | null;
  reportKey: string;
  reportName: string;
  moduleId?: string | null;
  procedureName: string;
  reportType: string;
  selectedVariantCode?: string | null;
  layoutJson: string;
  variants: RptReportVariant[];
  parameters: RptReportParameter[];
  templates: (RptReportTemplate & { variantCode?: string | null })[];
}

export interface SaveReportDesignerResponse {
  reportId: string;
  variantId: string;
  templateId: string;
  reportNo?: string | null;
  reportKey: string;
  variantCode: string;
  templateName: string;
}
