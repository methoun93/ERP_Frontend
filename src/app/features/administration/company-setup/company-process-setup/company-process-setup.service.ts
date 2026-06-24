import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiClientService } from '../../../../core/services/api-client.service';
import { TokenStoreService } from '../../../../core/services/token-store.service';

export interface CompanyModuleSetupItem { moduleId: string; moduleName: string; moduleKey?: string | null; moduleIcon?: string | null; sortOrder: number; isConfigured: boolean; isEnabled: boolean; totalProcesses: number; enabledProcesses: number; }
export interface CompanyProcessSetupDto { companyId: string; moduleId: string; moduleName?: string | null; moduleKey?: string | null; isModuleConfigured: boolean; isModuleEnabled: boolean; processes: CompanyProcessSetupItem[]; flows: CompanyProcessFlowItem[]; autoRules: CompanyProcessAutoRuleItem[]; }
export interface CompanyProcessSetupItem { processId: string; processName?: string | null; processKey?: string | null; icon?: string | null; isEnabled: boolean; isRequired: boolean; autoCreateType: number; sortOrder: number; }
export interface CompanyProcessFlowItem { flowId?: string | null; fromProcessId: string; toProcessId: string; isRequired: boolean; sortOrder: number; }
export interface CompanyProcessAutoRuleItem { ruleId?: string | null; skipProcessId: string; autoCreateProcessId: string; createAs: number; copyDataFrom: number; isActive: boolean; }
export interface SaveCompanyProcessSetupRequest { companyId: string; moduleId: string; isModuleEnabled: boolean; processes: CompanyProcessSetupItem[]; flows: Omit<CompanyProcessFlowItem, 'flowId'>[]; autoRules: Omit<CompanyProcessAutoRuleItem, 'ruleId'>[]; }
export interface ModuleProcessMasterItem { processId?: string | null; moduleId: string; processName: string; processKey: string; icon?: string | null; sortOrder: number; isActive: boolean; }
export interface ProcessTrackingItem { trackingId: string; companyId: string; companyName?: string | null; moduleId: string; moduleName?: string | null; processId: string; processName?: string | null; processKey?: string | null; referenceId: string; sourceReferenceId?: string | null; status?: string | null; createdAt: string; }

@Injectable({ providedIn: 'root' })
export class CompanyProcessSetupService {
  private readonly endpoint = '/adm-company-process-setups';
  constructor(private readonly api: ApiClientService, private readonly tokenStore: TokenStoreService) {}
  getCurrentCompanyId(): string | null { return this.tokenStore.getContext()?.companyId || this.tokenStore.getUser()?.companyId || null; }
  getCurrentCompanyName(): string { return this.tokenStore.getContext()?.companyName || this.tokenStore.getUser()?.companyName || 'Selected Company'; }
  getModules(companyId: string): Observable<CompanyModuleSetupItem[]> { return this.api.get<CompanyModuleSetupItem[]>(`${this.endpoint}/companies/${companyId}/modules`).pipe(map(x => x || [])); }
  getSetup(companyId: string, moduleId: string): Observable<CompanyProcessSetupDto> { return this.api.get<CompanyProcessSetupDto>(`${this.endpoint}/companies/${companyId}/modules/${moduleId}`).pipe(map(x => ({ ...x, processes: x?.processes || [], flows: x?.flows || [], autoRules: x?.autoRules || [] }))); }
  saveSetup(payload: SaveCompanyProcessSetupRequest): Observable<unknown> { return this.api.post<unknown>(this.endpoint, payload); }
  getModuleProcesses(moduleId: string): Observable<ModuleProcessMasterItem[]> { return this.api.get<ModuleProcessMasterItem[]>(`${this.endpoint}/modules/${moduleId}/processes`).pipe(map(x => x || [])); }
  saveModuleProcess(payload: ModuleProcessMasterItem): Observable<unknown> { return this.api.post<unknown>(`${this.endpoint}/module-processes`, payload); }
  deleteModuleProcess(processId: string): Observable<unknown> { return this.api.delete<unknown>(`${this.endpoint}/module-processes/${processId}`); }
  getTracking(companyId: string, moduleId?: string | null): Observable<ProcessTrackingItem[]> { const q = moduleId ? `?moduleId=${moduleId}` : ''; return this.api.get<ProcessTrackingItem[]>(`${this.endpoint}/companies/${companyId}/tracking${q}`).pipe(map(x => x || [])); }
}
