export interface CreateUserForm {
  userId?: string;
  username?: string;
  empId?: string;
  email?: string;
  password?: string;
  roleId?: string;
  areaId?: string;
  isActive?: boolean;
}

export interface CreateUserRow {
  userId: string;
  username?: string;
  empId?: string;
  email?: string;
  role?: string;
  roleId?: string;
  areaName?: string;
  areaId?: string;
  isActive?: boolean;
}
