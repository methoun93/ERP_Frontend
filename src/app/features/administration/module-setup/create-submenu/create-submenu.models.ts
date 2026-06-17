export interface CreateSubmenuForm {
  subMenuId?: string;
  menuId?: string;
  subMenuName?: string;
  subMenuIcon?: string;
  subMenuRoute?: string;
  controller?: string;
  action?: string;
  sortOrder?: number | null;
  isActive?: boolean;
}

export interface CreateSubmenuRow {
  subMenuId: string;
  menuId?: string;
  menuName?: string;
  moduleName?: string;
  subMenuName?: string;
  subMenuIcon?: string;
  subMenuRoute?: string;
  controller?: string;
  action?: string;
  sortOrder?: number | null;
  isActive?: boolean;
}
