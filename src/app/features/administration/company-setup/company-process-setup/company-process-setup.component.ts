import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  CompanyModuleSetupItem,
  CompanyProcessAutoRuleItem,
  CompanyProcessSetupDto,
  CompanyProcessSetupItem,
  CompanyProcessSetupService,
  SaveCompanyProcessSetupRequest
} from './company-process-setup.service';

@Component({
  selector: 'app-company-process-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-process-setup.component.html',
  styleUrl: './company-process-setup.component.scss'
})
export class CompanyProcessSetupComponent implements OnInit {
  companyId = '';
  companyName = '';
  modules: CompanyModuleSetupItem[] = [];
  selectedModule?: CompanyModuleSetupItem;
  setup?: CompanyProcessSetupDto;
  searchTerm = '';

  loadingModules = false;
  loadingSetup = false;
  saving = false;
  error = '';
  success = '';

  readonly autoCreateOptions = [
    { value: 0, label: 'No' },
    { value: 1, label: 'If skipped' },
    { value: 2, label: 'Always' }
  ];

  readonly createAsOptions = [
    { value: 0, label: 'Draft' },
    { value: 1, label: 'Pending' },
    { value: 2, label: 'Approved' }
  ];

  readonly copyFromOptions = [
    { value: 0, label: 'None' },
    { value: 1, label: 'Previous step' },
    { value: 2, label: 'Custom' }
  ];

  constructor(private readonly setupService: CompanyProcessSetupService) {}

  ngOnInit(): void {
    this.companyId = this.setupService.getCurrentCompanyId() || '';
    this.companyName = this.setupService.getCurrentCompanyName();

    if (!this.companyId) {
      this.error = 'Company context not found. Please select a company first.';
      return;
    }

    this.loadModules();
  }

  get filteredModules(): CompanyModuleSetupItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    const sorted = [...this.modules].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (!term) return sorted;
    return sorted.filter(x =>
      (x.moduleName || '').toLowerCase().includes(term) ||
      (x.moduleKey || '').toLowerCase().includes(term)
    );
  }

  get orderedProcesses(): CompanyProcessSetupItem[] {
    return [...(this.setup?.processes || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  get enabledProcesses(): CompanyProcessSetupItem[] {
    return this.orderedProcesses.filter(x => x.isEnabled);
  }

  get canSave(): boolean {
    return !!this.setup && !!this.selectedModule && !this.saving && !this.loadingSetup;
  }

  loadModules(): void {
    this.loadingModules = true;
    this.error = '';
    this.setupService.getModules(this.companyId)
      .pipe(finalize(() => this.loadingModules = false))
      .subscribe({
        next: modules => {
          this.modules = modules || [];
          const current = this.selectedModule ? this.modules.find(x => x.moduleId === this.selectedModule?.moduleId) : undefined;
          const first = current || this.modules.find(x => x.isConfigured) || this.modules[0];
          if (first) this.selectModule(first);
        },
        error: err => this.error = err?.message || 'Failed to load modules.'
      });
  }

  selectModule(module: CompanyModuleSetupItem): void {
    this.selectedModule = module;
    this.success = '';
    this.error = '';
    this.loadSetup(module.moduleId);
  }

  loadSetup(moduleId: string): void {
    this.loadingSetup = true;
    this.setup = undefined;
    this.setupService.getSetup(this.companyId, moduleId)
      .pipe(finalize(() => this.loadingSetup = false))
      .subscribe({
        next: setup => {
          this.setup = this.normalizeSetup(setup);
          this.selectedModule = this.modules.find(x => x.moduleId === moduleId) || this.selectedModule;
        },
        error: err => this.error = err?.message || 'Failed to load process setup.'
      });
  }

  toggleProcess(process: CompanyProcessSetupItem): void {
    process.isEnabled = !process.isEnabled;
    if (!process.isEnabled) {
      process.isRequired = false;
      process.autoCreateType = 0;
    }
  }

  toggleRequired(process: CompanyProcessSetupItem): void {
    if (!process.isEnabled) return;
    process.isRequired = !process.isRequired;
  }

  moveProcess(process: CompanyProcessSetupItem, direction: -1 | 1): void {
    if (!this.setup) return;
    const list = this.orderedProcesses;
    const index = list.findIndex(x => x.processId === process.processId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    list.forEach((item, i) => item.sortOrder = i + 1);
    this.setup.processes = list;
  }

  addAutoRule(): void {
    if (!this.setup || this.enabledProcesses.length < 2) return;
    this.setup.autoRules.push({
      skipProcessId: this.enabledProcesses[0].processId,
      autoCreateProcessId: this.enabledProcesses[1].processId,
      createAs: 1,
      copyDataFrom: 1,
      isActive: true
    });
  }

  removeAutoRule(index: number): void {
    this.setup?.autoRules.splice(index, 1);
  }

  getProcessName(processId: string): string {
    return this.setup?.processes.find(x => x.processId === processId)?.processName || 'Process';
  }

  save(): void {
    if (!this.setup || !this.selectedModule) return;
    this.saving = true;
    this.error = '';
    this.success = '';

    const enabled = this.enabledProcesses;
    const flows = [];
    for (let i = 0; i < enabled.length - 1; i++) {
      flows.push({
        fromProcessId: enabled[i].processId,
        toProcessId: enabled[i + 1].processId,
        isRequired: enabled[i + 1].isRequired,
        sortOrder: i + 1
      });
    }

    const payload: SaveCompanyProcessSetupRequest = {
      companyId: this.companyId,
      moduleId: this.selectedModule.moduleId,
      isModuleEnabled: true,
      processes: this.orderedProcesses.map((item, index) => ({
        processId: item.processId,
        isEnabled: !!item.isEnabled,
        isRequired: !!item.isEnabled && !!item.isRequired,
        autoCreateType: Number(item.autoCreateType || 0),
        sortOrder: item.sortOrder || index + 1
      })),
      flows,
      autoRules: (this.setup.autoRules || []).map(item => ({
        skipProcessId: item.skipProcessId,
        autoCreateProcessId: item.autoCreateProcessId,
        createAs: Number(item.createAs || 0),
        copyDataFrom: Number(item.copyDataFrom || 0),
        isActive: !!item.isActive
      }))
    };

    this.setupService.saveSetup(payload)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: () => {
          this.success = 'Process setup saved successfully.';
          this.loadModules();
        },
        error: err => this.error = err?.message || 'Failed to save process setup.'
      });
  }

  trackByModule(_: number, item: CompanyModuleSetupItem): string { return item.moduleId; }
  trackByProcess(_: number, item: CompanyProcessSetupItem): string { return item.processId; }
  trackByRule(index: number, item: CompanyProcessAutoRuleItem): string { return item.ruleId || `${item.skipProcessId}-${item.autoCreateProcessId}-${index}`; }

  private normalizeSetup(setup: CompanyProcessSetupDto): CompanyProcessSetupDto {
    const processes = [...(setup?.processes || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    processes.forEach((item, index) => item.sortOrder = item.sortOrder || index + 1);
    return {
      ...setup,
      processes,
      flows: [],
      autoRules: setup?.autoRules || []
    };
  }
}
