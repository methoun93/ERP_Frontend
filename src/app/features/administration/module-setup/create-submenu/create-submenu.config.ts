import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../../core/page-engine/erp-page-engine.types';
import { CreateSubmenuForm, CreateSubmenuRow } from './create-submenu.models';

export const CREATE_SUBMENU_PAGE: ErpPageDefinition<CreateSubmenuForm, CreateSubmenuRow> & { idKey?: string } = {
  route: '/administration/module-setup/create-submenu',
  title: 'Create Submenu',
  subtitle: 'Manage actual functional page routes under ERP menus.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'subMenuId',
  permission: 'SubMenuSetup.View',
  actions: [
    { key: 'add', label: 'Add Submenu', icon: 'pi pi-plus', permission: 'SubMenuSetup.Create' },
    { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
    { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'SubMenuSetup.Export' }
  ],
  form: {
    key: 'subMenuSetup',
    title: 'Submenu Information',
    api: {
      list: '/adm-sub-menus',
      getById: '/adm-sub-menus',
      create: '/adm-sub-menus',
      update: '/adm-sub-menus',
      delete: '/adm-sub-menus'
    },
    initialValue: { isActive: true },
    sections: [
      {
        title: 'Submenu Information',
        description: 'Attach submenu to a menu. Submenu route opens the actual ERP page.',
        icon: 'pi pi-list',
        columns: 2,
        fields: [
          { key: 'menuId', label: 'Menu', type: 'searchSelect', required: true, validators: [Validators.required], lookupApi: '/adm-menus', optionValueKey: 'menuId', optionLabelKey: 'menuName' },
          { key: 'subMenuName', label: 'Submenu Name', type: 'text', required: true, validators: [Validators.required], placeholder: 'Create Module' },
          { key: 'subMenuIcon', label: 'Submenu Icon', type: 'text', placeholder: 'pi pi-box' },
          { key: 'subMenuRoute', label: 'Submenu Route', type: 'text', required: true, validators: [Validators.required], placeholder: '/administration/module-setup/create-module' },
          { key: 'controller', label: 'Controller', type: 'text', placeholder: 'ModuleSetup' },
          { key: 'action', label: 'Action', type: 'text', placeholder: 'CreateModule' },
          { key: 'sortOrder', label: 'Sort Order', type: 'number' },
          { key: 'isActive', label: 'Active', type: 'checkbox', hint: 'Show this submenu under selected menu.' }
        ]
      }
    ]
  },
  tables: [
    {
      key: 'subMenuList',
      title: 'Submenu List',
      searchPlaceholder: 'Search by submenu name, menu, route, controller...',
      pageSize: 10,
      api: { list: '/adm-sub-menus', export: '/adm-sub-menus/export', delete: '/adm-sub-menus' },
      columns: [
        { key: 'moduleName', header: 'Module', sortable: true, fallbackKeys: ['moduleName', 'module.moduleName', 'menu.moduleName', 'menu.module.moduleName', 'moduleId'] },
        { key: 'menuName', header: 'Menu', sortable: true, fallbackKeys: ['menu.menuName', 'menuName', 'menuId'] },
        { key: 'subMenuName', header: 'Submenu Name', sortable: true },
        { key: 'subMenuIcon', header: 'Icon', sortable: true },
        { key: 'subMenuRoute', header: 'Route', sortable: true },
        { key: 'controller', header: 'Controller', sortable: true },
        { key: 'action', header: 'Action', sortable: true },
        { key: 'sortOrder', header: 'Sort Order', type: 'number', sortable: true },
        { key: 'isActive', header: 'Status', type: 'status', sortable: true }
      ],
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'SubMenuSetup.Update' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'SubMenuSetup.Delete' }
      ]
    }
  ]
};

export const CREATE_SUBMENUS_PAGE: ErpPageDefinition<CreateSubmenuForm, CreateSubmenuRow> & { idKey?: string } = {
  ...CREATE_SUBMENU_PAGE,
  route: '/administration/module-setup/create-submenus'
};

export const ADM_SUBMENUS_PAGE: ErpPageDefinition<CreateSubmenuForm, CreateSubmenuRow> & { idKey?: string } = {
  ...CREATE_SUBMENU_PAGE,
  route: '/administration/module-setup/adm-submenus'
};
