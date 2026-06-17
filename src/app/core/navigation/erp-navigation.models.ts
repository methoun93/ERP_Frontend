export interface SubMenuDto {
  id: string;
  title: string;
  route: string;
  icon?: string;
  badge?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface MenuDto {
  id: string;
  title: string;
  icon?: string;
  route?: string;
  subMenus: SubMenuDto[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface ModuleDto {
  id: string;
  key: string;
  title: string;
  subtitle?: string;
  icon?: string;
  route: string;
  menus: MenuDto[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface BreadcrumbItem {
  label: string;
  url?: string | null;
}
