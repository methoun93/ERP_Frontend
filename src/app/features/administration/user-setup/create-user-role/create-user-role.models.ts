export interface CreateUserRoleForm {
  roleId?: string;
  roleName?: string;
  isActive?: boolean;
  sortOrder?: number;
  remarks?: string;
}

export interface CreateUserRoleRow {
  roleId: string;
  roleName?: string;
  isActive?: boolean;
  sortOrder?: number;
  remarks?: string;
}
