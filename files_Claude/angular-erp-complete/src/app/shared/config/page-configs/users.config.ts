import { CrudMasterConfig } from '@/app/shared/components/crud-master.component';
import { apiRoutes } from './api-routes';

export const UsersPageConfig: CrudMasterConfig = {
  title: 'User',
  subtitle: 'Administration / User Setup',
  endpoint: apiRoutes.admUsers,
  idKey: 'userId',
  gridCols: 3,
  tableColumns: ['username', 'email', 'role', 'isActive'],
  fields: [
    { key: 'username', label: 'Username', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'fullName', label: 'Full Name', type: 'text', colSpan: 2 },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'password', label: 'Password', type: 'text' },
    { key: 'isActive', label: 'Active', type: 'checkbox' },
  ],
};
