export type ErpColumnType = 'text' | 'number' | 'date' | 'status' | 'action';

export interface ErpDataTableColumn<T = any> {
  key: keyof T & string;
  header: string;
  fallbackKeys?: string[];
  type?: ErpColumnType;
  sortable?: boolean;
  width?: string;
}

export interface ErpTableAction<T = any> {
  key: string;
  label: string;
  icon?: string;
  danger?: boolean;
  handler?: (row: T) => void;
}

export interface ErpSortChange {
  key: string;
  direction: 'asc' | 'desc' | '';
}
