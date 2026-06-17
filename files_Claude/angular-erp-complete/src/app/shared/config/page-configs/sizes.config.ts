import { CrudMasterConfig } from '@/app/shared/components/crud-master.component';
import { apiRoutes } from './api-routes';

export const SizesPageConfig: CrudMasterConfig = {
  title: 'Size',
  subtitle: 'Base Setup / Merchandising Setup',
  endpoint: apiRoutes.baseSizes,
  idKey: 'sizeId',
  gridCols: 2,
  tableColumns: ['sizeCode', 'sizeName', 'isActive'],
  fields: [
    { key: 'sizeCode', label: 'Size Code', type: 'text', required: true },
    { key: 'sizeName', label: 'Size Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { key: 'isActive', label: 'Active', type: 'checkbox' },
  ],
};
