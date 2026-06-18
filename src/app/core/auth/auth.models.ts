export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  expiresAtUtc?: string;

  userId?: string;
  id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  empId?: string | null;
  role?: string | null;
  roleName?: string | null;
  primaryRoleName?: string | null;
  profileImageUrl?: string | null;
  signatureImageUrl?: string | null;
  areaId?: string | null;
  isActive?: boolean;

  user?: {
    id?: string;
    userId?: string;
    username?: string;
    fullName?: string;
    email?: string;
    role?: string | null;
    roleName?: string | null;
    primaryRoleName?: string | null;
    profileImageUrl?: string | null;
    signatureImageUrl?: string | null;
    areaId?: string | null;
  };
}

export interface CompanyContextCompany {
  companyId: string;
  companyName: string;
  shortName?: string | null;
}

export interface CompanyContextArea {
  areaId: string;
  companyId: string;
  areaName: string;
  shortName?: string | null;
}

export interface SelectCompanyContextRequest {
  companyId: string;
  areaId: string;
}

export interface CompanyContextResponse {
  companyId: string;
  companyName: string;
  areaId: string;
  areaName: string;
  accessToken?: string;
  token?: string;
  expiresAtUtc?: string;
}

export interface ErpCompanyContext {
  companyId: string;
  companyName: string;
  areaId: string;
  areaName: string;
}

export interface ErpUserInfo {
  id?: string;
  userId?: string;
  username?: string;
  fullName?: string;
  email?: string;
  role?: string | null;
  roleName?: string | null;
  primaryRoleName?: string | null;
  profileImageUrl?: string | null;
  signatureImageUrl?: string | null;
  avatarUrl?: string;
  companyName?: string;
  companyId?: string;
  areaName?: string;
  areaId?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
