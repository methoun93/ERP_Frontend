import { Injectable } from '@angular/core';
import { ErpCompanyContext, ErpUserInfo } from '../auth/auth.models';

const ACCESS = 'erp_access_token';
const REFRESH = 'erp_refresh_token';
const COMPANY = 'erp_selected_company';
const AREA = 'erp_selected_area';
const MODULE = 'erp_selected_module';
const USER = 'erp_user_info';

@Injectable({ providedIn: 'root' })
export class TokenStoreService {
  getAccess(): string | null { return localStorage.getItem(ACCESS); }
  setAccess(value: string): void { localStorage.setItem(ACCESS, value); }
  getRefresh(): string | null { return localStorage.getItem(REFRESH); }
  setRefresh(value: string): void { localStorage.setItem(REFRESH, value); }
  setModule(value: string): void { localStorage.setItem(MODULE, value); }
  getModule(): string | null { return localStorage.getItem(MODULE); }

  setContext(context: ErpCompanyContext): void {
    localStorage.setItem(COMPANY, JSON.stringify({ companyId: context.companyId, companyName: context.companyName }));
    localStorage.setItem(AREA, JSON.stringify({ areaId: context.areaId, areaName: context.areaName }));
    const user = this.getUser() ?? {};
    this.setUser({ ...user, companyId: context.companyId, companyName: context.companyName, areaId: context.areaId, areaName: context.areaName });
  }

  getContext(): ErpCompanyContext | null {
    const company = this.readJson<{ companyId?: string | number; companyName?: string }>(COMPANY);
    const area = this.readJson<{ areaId?: string | number; areaName?: string }>(AREA);
    if (!company?.companyId || !area?.areaId) return null;
    return {
      companyId: String(company.companyId),
      companyName: company.companyName ?? '',
      areaId: String(area.areaId),
      areaName: area.areaName ?? '',
    };
  }

  setUser(info: ErpUserInfo): void { localStorage.setItem(USER, JSON.stringify(info)); }
  getUser(): ErpUserInfo | null { return this.readJson<ErpUserInfo>(USER); }

  clearContext(): void { [COMPANY, AREA, MODULE].forEach((key) => localStorage.removeItem(key)); }
  clear(): void { [ACCESS, REFRESH, COMPANY, AREA, MODULE, USER].forEach((key) => localStorage.removeItem(key)); }

  private readJson<T>(key: string): T | null {
    try { return JSON.parse(localStorage.getItem(key) || 'null') as T | null; } catch { return null; }
  }
}
