export type ReportType = 'Grid' | 'Layout' | 'Pivot' | 'Dashboard';
export type ReportOrientation = 'Portrait' | 'Landscape';
export type ReportControlType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox';

export interface ReportListItem {
  id: string;
  reportKey: string;
  reportName: string;
  moduleId?: string;
  procedureName?: string;
  reportType: ReportType | string;
  isActive: boolean;
}

export interface ReportVariant {
  id: string;
  reportId: string;
  variantCode: string;
  variantName: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface ReportTemplate {
  id: string;
  variantId: string;
  companyId?: string | null;
  areaId?: string | null;
  templateName: string;
  layoutJson: string | ReportLayout;
  isDefault: boolean;
  isActive: boolean;
}

export interface ReportParameter {
  id?: string;
  reportId?: string;
  parameterName: string;
  displayName: string;
  dataType: string;
  controlType: ReportControlType | string;
  lookupApi?: string | null;
  isRequired: boolean;
  defaultValue?: string | null;
  sortOrder: number;
  options?: { id: string | number; name: string }[];
}

export interface ReportColumnLayout {
  field: string;
  caption: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  aggregate?: 'sum' | 'count' | 'avg' | 'min' | 'max' | null;
  visible?: boolean;
}

export interface ReportLayout {
  pageSettings: {
    pageSize: string;
    orientation: ReportOrientation;
    showPageNo: boolean;
    showPrintDate: boolean;
  };
  header: {
    showLogo: boolean;
    showCompanyInfo: boolean;
    title?: string;
    subtitle?: string;
  };
  columns: ReportColumnLayout[];
  groupBy: string[];
  footer?: {
    showSignature: boolean;
    showPreparedBy: boolean;
  };
}

export interface ReportRenderRequest {
  reportKey: string;
  variantCode?: string | null;
  parameters: Record<string, unknown>;
}

export interface ReportRenderResponse {
  reportName: string;
  reportKey: string;
  variantCode?: string;
  layout: ReportLayout;
  parameters?: ReportParameter[];
  data: Record<string, unknown>[];
  generatedAt?: string;
}

export const emptyLayout: ReportLayout = {
  pageSettings: {
    pageSize: 'A4',
    orientation: 'Landscape',
    showPageNo: true,
    showPrintDate: true,
  },
  header: {
    showLogo: true,
    showCompanyInfo: true,
    title: 'Report Title',
    subtitle: '',
  },
  columns: [],
  groupBy: [],
  footer: {
    showSignature: true,
    showPreparedBy: true,
  },
};
