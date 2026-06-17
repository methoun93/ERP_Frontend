export interface ErpUiConfig {
  defaultPageSize: number;
  pageSizeOptions: number[];
}

export const ERP_UI_CONFIG: ErpUiConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
};
