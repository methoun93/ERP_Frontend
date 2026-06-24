import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../../core/services/api-client.service';

export interface ModuleActionModuleItem {
  moduleId: string;
  moduleName: string;
  moduleIcon?: string | null;
  totalActions: number;
  enabledActions: number;
}

export interface ModuleActionItem {
  definitionId?: string | null;
  companyActionId?: string | null;
  moduleId: string;
  companyId: string;
  actionName: string;
  actionKey: string;
  ruleType: 'Boolean' | 'Dropdown' | 'Formula' | 'Number' | 'Text' | 'Date' | string;
  ruleValue?: string | null;
  defaultRuleValue?: string | null;
  description?: string | null;
  isEnabled: boolean;
  sortOrder: number;
  isCompanySpecific?: boolean;
}

export interface ModuleActionSetupDto {
  companyId: string;
  moduleId: string;
  moduleName: string;
  actions: ModuleActionItem[];
}

@Injectable({ providedIn: 'root' })
export class ModuleActionSetupService {
  private readonly base = '/administration/company-setup/module-actions';

  constructor(private readonly api: ApiClientService) {}

  getModules(companyId: string): Observable<ModuleActionModuleItem[]> {
    return this.api.get<ModuleActionModuleItem[]>(`${this.base}/companies/${companyId}/modules`);
  }

  getSetup(companyId: string, moduleId: string): Observable<ModuleActionSetupDto> {
    return this.api.get<ModuleActionSetupDto>(`${this.base}/companies/${companyId}/modules/${moduleId}`);
  }

  save(payload: { companyId: string; moduleId: string; actions: ModuleActionItem[] }): Observable<{ saved: boolean }> {
    return this.api.post<{ saved: boolean }>(this.base, payload);
  }
}
