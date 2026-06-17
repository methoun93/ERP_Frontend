export interface AreaInformationForm {
  areaId?: string;
  compId?: string;
  areaName?: string;
  areaNameBng?: string;
  shortName?: string;
  shortNameBng?: string;
  areaAddressEng?: string;
  areaAddressBng?: string;
  sortOrder?: number | null;
  isActive?: boolean;
}

export interface AreaInformationRow extends AreaInformationForm {
  areaId: string;
  companyName?: string;
  compName?: string;
  createdAt?: string;
  updatedAt?: string;
}
