import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../../core/page-engine/erp-page-engine.types';
import { CreateUserForm, CreateUserRow } from './create-user.models';

const userAccessInitialValue: Partial<CreateUserForm> = {
  isActive: true,
  roleIds: [],
  areaIds: [],
  companyIds: []
};

export const CREATE_USER_PAGE: ErpPageDefinition<CreateUserForm, CreateUserRow> & { idKey?: string } = {
  route: '/administration/user-setup/create-user',
  title: 'Create User',
  subtitle: 'Manage ERP user login, multi-role, company and area access information.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'id',
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
    initialValue: userAccessInitialValue,
    sections: [
      {
        title: 'Login Information',
        description: 'Core login account information. Password is required only for new users.',
        icon: 'pi pi-user-plus',
        columns: 4,
        colSpan: 2,
        layoutClass: 'section-full section-hero section-compact',
        fields: [
          { key: 'username', label: 'Username', type: 'text', required: true, validators: [Validators.required], placeholder: 'Enter username' },
          { key: 'email', label: 'Email', type: 'email', required: true, validators: [Validators.required, Validators.email], placeholder: 'Enter email address' },
          { key: 'empId', label: 'Employee Id', type: 'text', placeholder: 'Employee code / ID' },
          { key: 'password', label: 'Password', type: 'text', placeholder: 'Set password', hint: 'Leave blank while editing to keep existing password.' },
          { key: 'isActive', label: 'Active User', type: 'checkbox', colSpan: 4, hint: 'Allow this user to login and use ERP.' }
        ]
      },
      {
        title: 'Role Access',
        description: 'Assign user roles and choose a primary role.',
        icon: 'pi pi-shield',
        columns: 1,
        colSpan: 1,
        layoutClass: 'section-half section-soft section-access section-compact',
        fields: [
          {
            key: 'roleIds',
            label: 'Assigned Roles',
            type: 'multiSelect',
            lookupApi: '/administration/lookups/user-roles',
            optionValueKey: 'id',
            optionLabelKey: 'name',
            hint: 'User can have multiple roles.'
          },
          {
            key: 'primaryRoleId',
            label: 'Primary Role',
            type: 'searchSelect',
            lookupApi: '/administration/lookups/user-roles',
            optionValueKey: 'id',
            optionLabelKey: 'name',
            hint: 'Default role stored in Adm_Users.RoleId.'
          }
        ]
      },
      {
        title: 'Company Access',
        description: 'Select companies this user can access.',
        icon: 'pi pi-building',
        columns: 1,
        colSpan: 1,
        layoutClass: 'section-half section-soft section-access section-compact',
        fields: [
          {
            key: 'companyIds',
            label: 'Assigned Companies',
            type: 'multiSelect',
            lookupApi: '/administration/lookups/companies',
            optionValueKey: 'id',
            optionLabelKey: 'name',
            hint: 'User can login only to assigned companies.'
          },
          {
            key: 'defaultCompanyId',
            label: 'Default Company',
            type: 'searchSelect',
            lookupApi: '/administration/lookups/companies',
            optionValueKey: 'id',
            optionLabelKey: 'name',
            hint: 'Default company for login context.'
          }
        ]
      },
      {
        title: 'Area Access',
        description: 'Select accessible areas and choose the default area.',
        icon: 'pi pi-map-marker',
        columns: 2,
        colSpan: 2,
        layoutClass: 'section-full section-soft section-access section-compact',
        fields: [
          {
            key: 'areaIds',
            label: 'Assigned Areas',
            type: 'multiSelect',
            lookupApi: '/administration/lookups/areas',
            optionValueKey: 'id',
            optionLabelKey: 'name',
            hint: 'User can access multiple areas.'
          },
          {
            key: 'defaultAreaId',
            label: 'Default Area',
            type: 'searchSelect',
            lookupApi: '/administration/lookups/areas',
            optionValueKey: 'id',
            optionLabelKey: 'name',
            hint: 'Default CurrentUser.AreaId after login context selection.'
          }
        ]
      }
    ]  },
  tables: [
    {
      key: 'userList',
      title: 'User List',
      searchPlaceholder: 'Search by username, employee id, email, role, area or company...',
      pageSize: 10,
      api: { list: '/adm-users', export: '/adm-users/export', delete: '/adm-users' },
      columns: [
        { key: 'username', header: 'Username', sortable: true },
        { key: 'empId', header: 'Employee Id', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'roleName', header: 'Primary Role', sortable: true, fallbackKeys: ['role', 'roleName', 'RoleName', 'roleId'] },
        { key: 'areaName', header: 'Default Area', sortable: true, fallbackKeys: ['AreaName', 'areaId'] },
        { key: 'companyNames', header: 'Companies', sortable: true, fallbackKeys: ['CompanyNames'] },
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
