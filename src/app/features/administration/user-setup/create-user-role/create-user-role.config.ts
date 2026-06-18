import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../../core/page-engine/erp-page-engine.types';
import { CreateUserRoleForm, CreateUserRoleRow } from './create-user-role.models';

export const CREATE_USER_ROLE_PAGE: ErpPageDefinition<CreateUserRoleForm, CreateUserRoleRow> & { idKey?: string } = {
  route: '/administration/user-setup/create-user-role',
  title: 'Create User Role',
  subtitle: 'Create and maintain ERP user roles for permission assignment.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'roleId',
  permission: 'UserRole.View',
  actions: [
    { key: 'add', label: 'Add Role', icon: 'pi pi-plus', permission: 'UserRole.Create' },
    { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
    { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'UserRole.Export' }
  ],
  form: {
    key: 'userRoleSetup',
    title: 'Role Information',
    api: {
      list: '/adm-user-roles',
      getById: '/adm-user-roles',
      create: '/adm-user-roles',
      update: '/adm-user-roles',
      delete: '/adm-user-roles'
    },
    initialValue: { isActive: true, sortOrder: 0 },
    sections: [
      {
        title: 'Role Information',
        description: 'Define a role that can be assigned to one or more users.',
        icon: 'pi pi-users',
        columns: 2,
        fields: [
          { key: 'roleName', label: 'Role Name', type: 'text', required: true, validators: [Validators.required], placeholder: 'Merchandiser' },
          { key: 'sortOrder', label: 'Sort Order', type: 'number' },
          { key: 'remarks', label: 'Remarks', type: 'textarea', colSpan: 2 },
          { key: 'isActive', label: 'Active', type: 'checkbox', hint: 'Show this role for user assignment.' }
        ]
      }
    ]
  },
  tables: [
    {
      key: 'roleList',
      title: 'User Role List',
      searchPlaceholder: 'Search by role name...',
      pageSize: 10,
      api: { list: '/adm-user-roles', export: '/adm-user-roles/export', delete: '/adm-user-roles' },
      columns: [
        { key: 'roleName', header: 'Role Name', sortable: true, fallbackKeys: ['RoleName'] },
        { key: 'sortOrder', header: 'Sort Order', type: 'number', sortable: true, fallbackKeys: ['SortOrder'] },
        { key: 'isActive', header: 'Status', type: 'status', sortable: true, fallbackKeys: ['IsActive'] }
      ],
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'UserRole.Update' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'UserRole.Delete' }
      ]
    }
  ]
};
