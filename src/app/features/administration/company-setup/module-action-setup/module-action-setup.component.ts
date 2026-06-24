import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TokenStoreService } from '../../../../core/services/token-store.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModuleActionItem, ModuleActionModuleItem, ModuleActionSetupService } from './module-action-setup.service';

type RuleType = 'Boolean' | 'Dropdown' | 'Formula' | 'Number' | 'Text' | 'Date';

@Component({
  selector: 'app-module-action-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './module-action-setup.component.html',
  styleUrls: ['./module-action-setup.component.scss']
})
export class ModuleActionSetupComponent implements OnInit {
  companyId = '';
  companyName = '';
  moduleSearch = '';
  actionSearch = '';
  loadingModules = false;
  loadingActions = false;
  saving = false;
  error = '';
  success = '';

  modules: ModuleActionModuleItem[] = [];
  selectedModule: ModuleActionModuleItem | null = null;
  actions: ModuleActionItem[] = [];
  ruleTypes: RuleType[] = ['Boolean', 'Dropdown', 'Formula', 'Number', 'Text', 'Date'];

  constructor(
    private readonly service: ModuleActionSetupService,
    private readonly tokenStore: TokenStoreService,
    private readonly notification: NotificationService
  ) {}

  ngOnInit(): void {
    const context = this.tokenStore.getContext();
    const user = this.tokenStore.getUser();
    this.companyId = context?.companyId || user?.companyId || '';
    this.companyName = context?.companyName || user?.companyName || '';

    if (!this.companyId) {
      this.error = 'Company context was not found. Please select a company again.';
      this.notification.error(this.error);
      return;
    }

    this.loadModules();
  }

  get filteredModules(): ModuleActionModuleItem[] {
    const term = this.moduleSearch.trim().toLowerCase();
    if (!term) return this.modules;
    return this.modules.filter(x => x.moduleName.toLowerCase().includes(term));
  }

  get filteredActions(): ModuleActionItem[] {
    const term = this.actionSearch.trim().toLowerCase();
    const rows = !term ? this.actions : this.actions.filter(x =>
      x.actionName.toLowerCase().includes(term) || x.actionKey.toLowerCase().includes(term) || (x.ruleValue || '').toLowerCase().includes(term)
    );
    return rows.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  loadModules(): void {
    this.loadingModules = true;
    this.error = '';
    this.service.getModules(this.companyId).subscribe({
      next: modules => {
        this.modules = modules || [];
        this.loadingModules = false;
        if (!this.selectedModule && this.modules.length) this.selectModule(this.modules[0]);
      },
      error: err => {
        this.error = this.notification.extractErrorMessage(err) || 'Module list could not be loaded.';
        this.notification.error(err, 'Load Failed');
        this.loadingModules = false;
      }
    });
  }

  selectModule(module: ModuleActionModuleItem): void {
    this.selectedModule = module;
    this.loadActions(module.moduleId);
  }

  loadActions(moduleId: string): void {
    this.loadingActions = true;
    this.error = '';
    this.success = '';
    this.service.getSetup(this.companyId, moduleId).subscribe({
      next: setup => {
        this.actions = (setup.actions || []).map((x, index) => ({
          ...x,
          sortOrder: x.sortOrder || index + 1,
          isEnabled: !!x.isEnabled,
          ruleType: x.ruleType || 'Boolean'
        }));
        this.loadingActions = false;
      },
      error: err => {
        this.error = this.notification.extractErrorMessage(err) || 'Action setup could not be loaded.';
        this.notification.error(err, 'Load Failed');
        this.actions = [];
        this.loadingActions = false;
      }
    });
  }

  addAction(): void {
    if (!this.selectedModule) return;
    const next = this.actions.length + 1;
    this.actions = [
      ...this.actions,
      {
        companyId: this.companyId,
        moduleId: this.selectedModule.moduleId,
        actionName: '',
        actionKey: '',
        ruleType: 'Boolean',
        ruleValue: 'Yes',
        description: '',
        isEnabled: true,
        sortOrder: next,
        isCompanySpecific: true
      }
    ];
  }

  removeAction(row: ModuleActionItem): void {
    this.actions = this.actions.filter(x => x !== row).map((x, i) => ({ ...x, sortOrder: i + 1 }));
  }

  updateKey(row: ModuleActionItem): void {
    if (row.actionKey?.trim()) return;
    row.actionKey = this.toKey(row.actionName);
  }

  save(): void {
    if (!this.selectedModule) return;
    const invalid = this.actions.find(x => !x.actionName?.trim() || !x.actionKey?.trim());
    if (invalid) {
      this.error = 'Action name and action key are required.';
      this.notification.warning(this.error, 'Validation');
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    const payload = {
      companyId: this.companyId,
      moduleId: this.selectedModule.moduleId,
      actions: this.actions.map((x, i) => ({ ...x, sortOrder: x.sortOrder || i + 1 }))
    };

    this.service.save(payload).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Module action setup saved successfully.';
        this.notification.success(this.success);
        this.loadModules();
        if (this.selectedModule) this.loadActions(this.selectedModule.moduleId);
      },
      error: err => {
        this.saving = false;
        this.error = this.notification.extractErrorMessage(err) || 'Save failed.';
        this.notification.error(err, 'Save Failed');
      }
    });
  }

  trackByModule(_: number, item: ModuleActionModuleItem): string { return item.moduleId; }
  trackByAction(index: number, item: ModuleActionItem): string { return item.companyActionId || item.definitionId || `${item.actionKey}-${index}`; }

  private toKey(value: string): string {
    return (value || '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }
}
