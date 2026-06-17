export interface CompanyInformationForm {
  compId?: string;
  compName?: string;
  compNameBng?: string;
  addressEng?: string;
  addressBng?: string;
  phoneNo?: string;
  shortNameEng?: string;
  shortNameBng?: string;
  email?: string;
  mailPort?: number | null;
  mailPass?: string;
  mailFrom?: string;
  setupCompWise?: boolean;
  logoFileName?: string;
  logoFileLocation?: string;
  comHeaderFileName?: string;
  comHeaderFileLocation?: string;
  signatoryFileName?: string;
  signatoryFileLoc?: string;
  sortOrder?: number | null;
  isActive?: boolean;
}

export interface CompanyInformationRow extends CompanyInformationForm {
  compId: string;
  createdAt?: string;
  updatedAt?: string;
}
