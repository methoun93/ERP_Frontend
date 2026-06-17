import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../../core/page-engine/erp-page-engine.types';
import { CreateMenuForm, CreateMenuRow } from './create-menu.models';

export const CREATE_MENU_PAGE: ErpPageDefinition<CreateMenuForm, CreateMenuRow> & { idKey?: string } = {
  route: '/administration/module-setup/create-menu',
  title: 'Create Menu',
  subtitle: 'Manage module-wise ERP menus. Menus expand/collapse only; submenus open actual pages.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'menuId',
  permission: 'MenuSetup.View',
  actions: [
    { key: 'add', label: 'Add Menu', icon: 'pi pi-plus', permission: 'MenuSetup.Create' },
    { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
    { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'MenuSetup.Export' }
  ],
  form: {
    key: 'menuSetup',
    title: 'Menu Information',
    api: {
      list: '/adm-menus',
      getById: '/adm-menus',
      create: '/adm-menus',
      update: '/adm-menus',
      delete: '/adm-menus'
    },
    initialValue: { isActive: true },
    sections: [
      {
        title: 'Menu Information',
        description: 'Attach menu to a module and define menu display information.',
        icon: 'pi pi-bars',
        columns: 2,
        fields: [
          { key: 'moduleId', label: 'Module', type: 'searchSelect', required: true, validators: [Validators.required], lookupApi: '/adm-modules', optionValueKey: 'moduleId', optionLabelKey: 'moduleName' },
          { key: 'menuName', label: 'Menu Name', type: 'text', required: true, validators: [Validators.required], placeholder: 'Module Setup' },
          { key: 'menuIcon', label: 'Menu Icon', type: 'text', placeholder: 'pi pi-sitemap' },
          { key: 'menuRoute', label: 'Menu Route', type: 'text', placeholder: '/erp/administration/module-setup' },
          { key: 'mainMenuIcon', label: 'Main Menu Icon', type: 'text', placeholder: 'pi pi-bars' },
          { key: 'sortOrder', label: 'Sort Order', type: 'number' },
          { key: 'isActive', label: 'Active', type: 'checkbox', hint: 'Show this menu under selected module.' }
        ]
      }
    ]
  },
  tables: [
    {
      key: 'menuList',
      title: 'Menu List',
      searchPlaceholder: 'Search by menu name, module, route...',
      pageSize: 10,
      api: { list: '/adm-menus', export: '/adm-menus/export', delete: '/adm-menus' },
      columns: [
        { key: 'moduleName', header: 'Module', sortable: true, fallbackKeys: ['module.moduleName', 'moduleName', 'moduleId'] },
        { key: 'menuName', header: 'Menu Name', sortable: true },
        { key: 'menuIcon', header: 'Icon', sortable: true },
        { key: 'menuRoute', header: 'Route', sortable: true },
        { key: 'sortOrder', header: 'Sort Order', type: 'number', sortable: true },
        { key: 'isActive', header: 'Status', type: 'status', sortable: true }
      ],
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'MenuSetup.Update' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'MenuSetup.Delete' }
      ]
    }
  ]
};
