export interface CreateModuleForm {
  moduleId?: string;
  moduleName?: string;
  moduleIcon?: string;
  moduleRoute?: string;
  sortOrder?: number | null;
  isActive?: boolean;
}

export interface CreateModuleRow {
  moduleId: string;
  moduleName?: string;
  moduleIcon?: string;
  moduleRoute?: string;
  sortOrder?: number | null;
  isActive?: boolean;
}
