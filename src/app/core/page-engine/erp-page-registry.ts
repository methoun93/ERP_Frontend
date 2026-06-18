import { ErpPageDefinition } from './erp-page-engine.types';
import { COMPANY_INFORMATION_PAGE } from '../../features/administration/company-setup/company-information/company-information.config';
import { AREA_INFORMATION_PAGE } from '../../features/administration/company-setup/area-information/area-information.config';
import { CREATE_MODULE_PAGE } from '../../features/administration/module-setup/create-module/create-module.config';
import { CREATE_MENU_PAGE } from '../../features/administration/module-setup/create-menu/create-menu.config';
import { CREATE_SUBMENU_PAGE, CREATE_SUBMENUS_PAGE, ADM_SUBMENUS_PAGE } from '../../features/administration/module-setup/create-submenu/create-submenu.config';
import { CREATE_USER_PAGE, ADM_USERS_PAGE } from '../../features/administration/user-setup/create-user/create-user.config';
import { CREATE_USER_ROLE_PAGE } from '../../features/administration/user-setup/create-user-role/create-user-role.config';
import { ROLE_PERMISSION_PAGE, ROLE_PERMISSIONS_LEGACY_PAGE } from '../../features/administration/user-setup/role-permission/role-permission.config';
import { MERCHENDISING_SETUP_PAGES } from '../../features/administration/merchendising-setup/merchendising-setup.config';
import { TEXTILE_SETUP_PAGES } from '../../features/administration/textile-setup/textile-setup.config';

export const ERP_PAGE_REGISTRY: (ErpPageDefinition & { idKey?: string })[] = [
  COMPANY_INFORMATION_PAGE,
  AREA_INFORMATION_PAGE,
  CREATE_MODULE_PAGE,
  CREATE_MENU_PAGE,
  CREATE_SUBMENU_PAGE,
  CREATE_SUBMENUS_PAGE,
  ADM_SUBMENUS_PAGE,
  CREATE_USER_ROLE_PAGE,
  CREATE_USER_PAGE,
  ADM_USERS_PAGE,
  ROLE_PERMISSION_PAGE,
  ROLE_PERMISSIONS_LEGACY_PAGE,
  ...MERCHENDISING_SETUP_PAGES,
  ...TEXTILE_SETUP_PAGES
];
