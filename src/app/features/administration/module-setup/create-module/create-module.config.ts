import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../../core/page-engine/erp-page-engine.types';
import { CreateModuleForm, CreateModuleRow } from './create-module.models';

export const CREATE_MODULE_PAGE: ErpPageDefinition<CreateModuleForm, CreateModuleRow> & { idKey?: string } = {
  route: '/administration/module-setup/create-module',
  title: 'Create Module',
  subtitle: 'Manage ERP modules used by the dynamic navigation system.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'moduleId',
  permission: 'ModuleSetup.View',
  actions: [
    { key: 'add', label: 'Add Module', icon: 'pi pi-plus', permission: 'ModuleSetup.Create' },
    { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
    { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'ModuleSetup.Export' }
  ],
  form: {
    key: 'moduleSetup',
    title: 'Module Information',
    api: {
      list: '/adm-modules',
      getById: '/adm-modules',
      create: '/adm-modules',
      update: '/adm-modules',
      delete: '/adm-modules'
    },
    initialValue: { isActive: true },
    sections: [
      {
        title: 'Module Information',
        description: 'Define module name, route and PrimeIcon class for sidebar/header navigation.',
        icon: 'pi pi-box',
        columns: 2,
        fields: [
          { key: 'moduleName', label: 'Module Name', type: 'text', required: true, validators: [Validators.required], placeholder: 'Administration' },
          { key: 'moduleIcon', label: 'Module Icon', type: 'text', placeholder: 'pi pi-users' },
          { key: 'moduleRoute', label: 'Module Route', type: 'text', required: true, validators: [Validators.required], placeholder: '/erp/administration' },
          { key: 'sortOrder', label: 'Sort Order', type: 'number' },
          { key: 'isActive', label: 'Active', type: 'checkbox', hint: 'Show this module in ERP navigation.' }
        ]
      }
    ]
  },
  tables: [
    {
      key: 'moduleList',
      title: 'Module List',
      searchPlaceholder: 'Search by module name, route, icon...',
      pageSize: 10,
      api: { list: '/adm-modules', export: '/adm-modules/export', delete: '/adm-modules' },
      columns: [
        { key: 'moduleName', header: 'Module Name', sortable: true },
        { key: 'moduleIcon', header: 'Icon', sortable: true },
        { key: 'moduleRoute', header: 'Route', sortable: true },
        { key: 'sortOrder', header: 'Sort Order', type: 'number', sortable: true },
        { key: 'isActive', header: 'Status', type: 'status', sortable: true }
      ],
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'ModuleSetup.Update' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'ModuleSetup.Delete' }
      ]
    }
  ]
};
