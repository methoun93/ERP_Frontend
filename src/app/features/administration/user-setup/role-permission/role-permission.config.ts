import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../../core/page-engine/erp-page-engine.types';
import { RolePermissionForm, RolePermissionRow } from './role-permission.models';

export const ROLE_PERMISSION_PAGE: ErpPageDefinition<RolePermissionForm, RolePermissionRow> & { idKey?: string } = {
  route: '/administration/user-setup/role-permission',
  title: 'Role Permission',
  subtitle: 'Assign module, menu and submenu permissions to user roles.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'id',
  permission: 'RolePermission.View',
  actions: [
    { key: 'add', label: 'Add Permission', icon: 'pi pi-plus', permission: 'RolePermission.Create' },
    { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
    { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'RolePermission.Export' }
  ],
  form: {
    key: 'rolePermissionSetup',
    title: 'Permission Information',
    api: {
      list: '/adm-role-permissions',
      getById: '/adm-role-permissions',
      create: '/adm-role-permissions',
      update: '/adm-role-permissions',
      delete: '/adm-role-permissions'
    },
    initialValue: {
      isPermitted: true,
      canView: true,
      canCreate: false,
      canEdit: false,
      canUpdate: false,
      canDelete: false,
      canPrint: false,
      canExport: false,
      canApprove: false
    },
    sections: [
      {
        title: 'Menu Access',
        description: 'Select role, module, menu and submenu for permission assignment.',
        icon: 'pi pi-lock',
        columns: 2,
        fields: [
          { key: 'roleId', label: 'Role', type: 'searchSelect', required: true, validators: [Validators.required], lookupApi: '/administration/lookups/adm-user-roles', optionValueKey: 'id', optionLabelKey: 'name' },
          { key: 'moduleId', label: 'Module', type: 'searchSelect', required: true, validators: [Validators.required], lookupApi: '/adm-modules', optionValueKey: 'moduleId', optionLabelKey: 'moduleName' },
          { key: 'menuId', label: 'Menu', type: 'searchSelect', required: true, validators: [Validators.required], lookupApi: '/adm-menus', optionValueKey: 'menuId', optionLabelKey: 'menuName' },
          { key: 'subMenuId', label: 'Submenu', type: 'searchSelect', lookupApi: '/adm-sub-menus', optionValueKey: 'subMenuId', optionLabelKey: 'subMenuName' },
          { key: 'isPermitted', label: 'Permitted', type: 'checkbox', hint: 'Main access flag for backward compatibility.' }
        ]
      },
      {
        title: 'Action Permissions',
        description: 'Control button/action permission for this role.',
        icon: 'pi pi-check-square',
        columns: 4,
        fields: [
          { key: 'canView', label: 'View', type: 'checkbox' },
          { key: 'canCreate', label: 'Create', type: 'checkbox' },
          { key: 'canEdit', label: 'Edit', type: 'checkbox' },
          { key: 'canUpdate', label: 'Update', type: 'checkbox' },
          { key: 'canDelete', label: 'Delete', type: 'checkbox' },
          { key: 'canPrint', label: 'Print', type: 'checkbox' },
          { key: 'canExport', label: 'Export', type: 'checkbox' },
          { key: 'canApprove', label: 'Approve', type: 'checkbox' }
        ]
      }
    ]
  },
  tables: [
    {
      key: 'rolePermissionList',
      title: 'Role Permission List',
      searchPlaceholder: 'Search by role, module, menu or submenu...',
      pageSize: 10,
      api: { list: '/adm-role-permissions', export: '/adm-role-permissions/export', delete: '/adm-role-permissions' },
      columns: [
        { key: 'roleName', header: 'Role', sortable: true, fallbackKeys: ['RoleName', 'roleId'] },
        { key: 'moduleName', header: 'Module', sortable: true, fallbackKeys: ['ModuleName', 'moduleId'] },
        { key: 'menuName', header: 'Menu', sortable: true, fallbackKeys: ['MenuName', 'menuId'] },
        { key: 'subMenuName', header: 'Submenu', sortable: true, fallbackKeys: ['SubMenuName', 'subMenuId'] },
        { key: 'canView', header: 'View', type: 'status', sortable: true },
        { key: 'canCreate', header: 'Create', type: 'status', sortable: true },
        { key: 'canUpdate', header: 'Update', type: 'status', sortable: true },
        { key: 'canDelete', header: 'Delete', type: 'status', sortable: true },
        { key: 'canPrint', header: 'Print', type: 'status', sortable: true },
        { key: 'canExport', header: 'Export', type: 'status', sortable: true },
        { key: 'canApprove', header: 'Approve', type: 'status', sortable: true }
      ],
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'RolePermission.Update' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'RolePermission.Delete' }
      ]
    }
  ]
};

export const ROLE_PERMISSIONS_LEGACY_PAGE: ErpPageDefinition<RolePermissionForm, RolePermissionRow> & { idKey?: string } = {
  ...ROLE_PERMISSION_PAGE,
  route: '/administration/role-management/adm-role-permissions'
};
