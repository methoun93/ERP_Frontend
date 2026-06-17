import { ErpFormSection } from '../../shared/erp-form-master/erp-form-master.types';
import { ErpDataTableColumn } from '../../shared/erp-data-table/erp-data-table.types';

export type ErpPageType = 'master' | 'transaction' | 'document' | 'approval' | 'report';
export type ErpPageLayout = 'form-table' | 'form-tables' | 'table-only' | 'form-only';
export type ErpHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ErpPageApiConfig {
  list?: string;
  getById?: string;
  create?: string;
  update?: string;
  delete?: string;
  export?: string;
}

export interface ErpPageTableConfig<T = any> {
  key: string;
  title: string;
  api?: ErpPageApiConfig;
  columns: ErpDataTableColumn<T>[];
  actions?: ErpPageActionConfig[];
  pageSize?: number;
  searchPlaceholder?: string;
  showRefresh?: boolean;
  showExport?: boolean;
}

export interface ErpPageFormConfig<TForm = any> {
  key: string;
  title: string;
  subtitle?: string;
  api?: ErpPageApiConfig;
  sections: ErpFormSection<TForm>[];
  initialValue?: Partial<TForm>;
}

export interface ErpPageActionConfig {
  key: string;
  label: string;
  icon?: string;
  danger?: boolean;
  permission?: string;
}

export interface ErpPageDefinition<TForm = any, TRow = any> {
  route: string;
  title: string;
  subtitle?: string;
  pageType: ErpPageType;
  layout: ErpPageLayout;
  permission?: string;
  form?: ErpPageFormConfig<TForm>;
  tables?: ErpPageTableConfig<TRow>[];
  actions?: ErpPageActionConfig[];
}
