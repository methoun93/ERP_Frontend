import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../../core/page-engine/erp-page-engine.types';
import { CreateUserForm, CreateUserRow } from './create-user.models';

export const CREATE_USER_PAGE: ErpPageDefinition<CreateUserForm, CreateUserRow> & { idKey?: string } = {
  route: '/administration/user-setup/create-user',
  title: 'Create User',
  subtitle: 'Manage ERP user login, role and area access information.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'userId',
  permission: 'UserSetup.View',
  actions: [
    { key: 'add', label: 'Add User', icon: 'pi pi-plus', permission: 'UserSetup.Create' },
    { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
    { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'UserSetup.Export' }
  ],
  form: {
    key: 'userSetup',
    title: 'User Information',
    api: {
      list: '/adm-users',
      getById: '/adm-users',
      create: '/adm-users',
      update: '/adm-users',
      delete: '/adm-users'
    },
    initialValue: { isActive: true },
    sections: [
      {
        title: 'User Information',
        description: 'Create user account and assign role/location access.',
        icon: 'pi pi-user-plus',
        columns: 2,
        fields: [
          { key: 'username', label: 'Username', type: 'text', required: true, validators: [Validators.required] },
          { key: 'empId', label: 'Employee Id', type: 'text' },
          { key: 'email', label: 'Email', type: 'email', required: true, validators: [Validators.required, Validators.email] },
          { key: 'password', label: 'Password', type: 'text', required: true, validators: [Validators.required] },
          { key: 'roleId', label: 'Role', type: 'searchSelect', lookupApi: '/adm-user-roles', optionValueKey: 'roleId', optionLabelKey: 'roleName' },
          { key: 'areaId', label: 'Area', type: 'searchSelect', lookupApi: '/adm-area-infos', optionValueKey: 'areaId', optionLabelKey: 'areaName' },
          { key: 'isActive', label: 'Active', type: 'checkbox', hint: 'Allow this user to login and use ERP.' }
        ]
      }
    ]
  },
  tables: [
    {
      key: 'userList',
      title: 'User List',
      searchPlaceholder: 'Search by username, employee id, email, role...',
      pageSize: 10,
      api: { list: '/adm-users', export: '/adm-users/export', delete: '/adm-users' },
      columns: [
        { key: 'username', header: 'Username', sortable: true },
        { key: 'empId', header: 'Employee Id', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'role', header: 'Role', sortable: true, fallbackKeys: ['roleName', 'role.roleName', 'roleId'] },
        { key: 'isActive', header: 'Status', type: 'status', sortable: true }
      ],
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'UserSetup.Update' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'UserSetup.Delete' }
      ]
    }
  ]
};

export const ADM_USERS_PAGE: ErpPageDefinition<CreateUserForm, CreateUserRow> & { idKey?: string } = {
  ...CREATE_USER_PAGE,
  route: '/administration/user-setup/adm-users'
};
