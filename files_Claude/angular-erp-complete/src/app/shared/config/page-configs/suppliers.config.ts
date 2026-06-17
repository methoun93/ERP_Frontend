import { CrudMasterConfig } from '@/app/shared/components/crud-master.component';
import { apiRoutes } from './api-routes';

export const SuppliersPageConfig: CrudMasterConfig = {
  title: 'Supplier',
  subtitle: 'Base Setup / Merchandising Setup',
  endpoint: apiRoutes.baseSuppliers,
  idKey: 'supplierId',
  gridCols: 3,
  tableColumns: ['supplierName', 'supplierCode', 'contactPerson', 'email', 'isActive'],
  fields: [
    { key: 'supplierName', label: 'Supplier Name', type: 'text', required: true, colSpan: 2 },
    { key: 'supplierCode', label: 'Supplier Code', type: 'text' },
    { key: 'contactPerson', label: 'Contact Person', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'address', label: 'Address', type: 'textarea', colSpan: 3 },
    { key: 'isActive', label: 'Active', type: 'checkbox' },
  ],
};
