export interface RolePermissionForm {
  id?: string;
  roleId?: string | null;
  moduleId?: string | null;
  menuId?: string | null;
  subMenuId?: string | null;
  isPermitted?: boolean;
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canPrint?: boolean;
  canExport?: boolean;
  canApprove?: boolean;
}

export interface RolePermissionRow extends RolePermissionForm {
  roleName?: string;
  moduleName?: string;
  menuName?: string;
  subMenuName?: string;
}
