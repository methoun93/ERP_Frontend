import { CrudMasterConfig } from '@/app/shared/components/crud-master.component';
import { apiRoutes } from './api-routes';

export const BuyersPageConfig: CrudMasterConfig = {
  title: 'Buyer',
  subtitle: 'Base Setup / Merchandising Setup',
  endpoint: apiRoutes.baseBuyers,
  idKey: 'buyerId',
  gridCols: 3,
  tableColumns: ['buyerName', 'buyerCode', 'contactPerson', 'email', 'isActive'],
  fields: [
    { key: 'buyerName', label: 'Buyer Name', type: 'text', required: true, colSpan: 2 },
    { key: 'buyerCode', label: 'Buyer Code', type: 'text' },
    { key: 'contactPerson', label: 'Contact Person', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'address', label: 'Address', type: 'textarea', colSpan: 3 },
    { key: 'isActive', label: 'Active', type: 'checkbox' },
  ],
};
