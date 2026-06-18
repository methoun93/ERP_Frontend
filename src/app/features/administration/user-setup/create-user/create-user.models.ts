export interface CreateUserForm {
  id?: string;
  userId?: string;
  username?: string;
  empId?: string;
  email?: string;
  password?: string;

  // Backward-compatible default fields used by backend Adm_Users.
  roleId?: string | null;
  areaId?: string | null;
  compId?: string | null;
  companyId?: string | null;

  // Future-ready multi access fields.
  roleIds?: string[];
  areaIds?: string[];
  companyIds?: string[];
  primaryRoleId?: string | null;
  defaultAreaId?: string | null;
  defaultCompanyId?: string | null;

  isActive?: boolean;
}

export interface CreateUserRow {
  id: string;
  userId?: string;
  username?: string;
  empId?: string;
  email?: string;
  role?: string;
  roleId?: string;
  roleName?: string;
  areaName?: string;
  areaId?: string;
  companyNames?: string;
  isActive?: boolean;
}
