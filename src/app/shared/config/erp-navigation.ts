export interface ErpNavChild { label: string; route: string; }
export interface ErpNavGroup { label: string; icon: string; route?: string; children?: ErpNavChild[]; }
export interface ErpNavModule { label: string; key: string; route: string; groups: ErpNavGroup[]; }
export const ERP_NAVIGATION: ErpNavModule[] = [];
