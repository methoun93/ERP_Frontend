import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CompanyModuleSetupItem, CompanyProcessSetupService, ModuleProcessMasterItem } from '../company-process-setup/company-process-setup.service';

@Component({ selector: 'app-module-processes', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './module-processes.component.html', styleUrl: '../process-pages.scss' })
export class ModuleProcessesComponent implements OnInit {
  companyId = ''; modules: CompanyModuleSetupItem[] = []; selected?: CompanyModuleSetupItem; rows: ModuleProcessMasterItem[] = [];
  editing: ModuleProcessMasterItem | null = null; loading = false; saving = false; error = ''; success = '';
  constructor(private readonly service: CompanyProcessSetupService) {}
  ngOnInit(): void { this.companyId = this.service.getCurrentCompanyId() || ''; this.loadModules(); }
  loadModules(): void { if (!this.companyId) return; this.loading = true; this.service.getModules(this.companyId).pipe(finalize(()=>this.loading=false)).subscribe({next:x=>{this.modules=x; if(x[0]) this.selectModule(x[0]);}, error:e=>this.error=e.message}); }
  selectModule(m: CompanyModuleSetupItem): void { this.selected=m; this.editing=null; this.loadRows(); }
  loadRows(): void { if(!this.selected) return; this.loading=true; this.service.getModuleProcesses(this.selected.moduleId).pipe(finalize(()=>this.loading=false)).subscribe({next:x=>this.rows=x, error:e=>this.error=e.message}); }
  add(): void { if(!this.selected) return; this.editing={moduleId:this.selected.moduleId, processName:'', processKey:'', icon:'pi pi-circle', sortOrder:(this.rows.length+1), isActive:true}; }
  edit(r: ModuleProcessMasterItem): void { this.editing={...r}; }
  save(): void { if(!this.editing) return; this.saving=true; this.error=''; this.success=''; this.service.saveModuleProcess(this.editing).pipe(finalize(()=>this.saving=false)).subscribe({next:()=>{this.success='Module process saved successfully.'; this.editing=null; this.loadRows(); this.loadModules();}, error:e=>this.error=e.message}); }
  remove(r: ModuleProcessMasterItem): void { if(!r.processId) return; this.service.deleteModuleProcess(r.processId).subscribe({next:()=>this.loadRows(), error:e=>this.error=e.message}); }
}
