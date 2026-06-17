import { CrudMasterConfig } from '@/app/shared/components/crud-master.component';
import { apiRoutes } from './api-routes';

export const ColorsPageConfig: CrudMasterConfig = {
  title: 'Color',
  subtitle: 'Base Setup / Merchandising Setup',
  endpoint: apiRoutes.baseColors,
  idKey: 'colorId',
  gridCols: 2,
  tableColumns: ['colorCode', 'colorName', 'colorHex', 'isActive'],
  fields: [
    { key: 'colorCode', label: 'Color Code', type: 'text', required: true },
    { key: 'colorName', label: 'Color Name', type: 'text', required: true },
    { key: 'colorHex', label: 'Color Hex', type: 'text', placeholder: '#000000' },
    { key: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { key: 'isActive', label: 'Active', type: 'checkbox' },
  ],
};
