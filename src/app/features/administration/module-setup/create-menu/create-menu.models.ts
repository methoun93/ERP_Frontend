export interface CreateMenuForm {
  menuId?: string;
  moduleId?: string;
  menuName?: string;
  menuIcon?: string;
  menuRoute?: string;
  mainMenuIcon?: string;
  sortOrder?: number | null;
  isActive?: boolean;
}

export interface CreateMenuRow {
  menuId: string;
  moduleId?: string;
  moduleName?: string;
  menuName?: string;
  menuIcon?: string;
  menuRoute?: string;
  mainMenuIcon?: string;
  sortOrder?: number | null;
  isActive?: boolean;
}
