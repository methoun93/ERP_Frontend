import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ErpDataTableComponent } from '../erp-data-table/erp-data-table.component';
import { ErpDataTableColumn, ErpTableAction } from '../erp-data-table/erp-data-table.types';
import { ErpPageChange } from '../erp-data-table/erp-data-table.component';
import { ErpFormMasterComponent } from '../erp-form-master/erp-form-master.component';
import { ErpFormField, ErpFormSection } from '../erp-form-master/erp-form-master.types';
import { ApiClientService } from '../../core/services/api-client.service';
import { NotificationService } from '../../core/services/notification.service';
import { ERP_UI_CONFIG } from '../../core/config/erp-ui.config';

export type CrudPageMode = 'list' | 'create' | 'edit' | 'view';

export interface CrudPermissionConfig {
  view?: string;
  create?: string;
  update?: string;
  delete?: string;
  export?: string;
}

export interface CrudActionConfig {
  key: 'add' | 'edit' | 'delete' | 'export' | 'refresh' | string;
  label: string;
  icon?: string;
  danger?: boolean;
  permission?: string;
  visible?: boolean;
}

export interface CrudMasterConfig<TForm = any, TRow = any> {
  route: string;
  title: string;
  subtitle?: string;
  endpoint: string;
  idKey: keyof TRow & string;
  fields: ErpFormField<TForm>[];
  sections?: ErpFormSection<TForm>[];
  tableColumns: ErpDataTableColumn<TRow>[];
  gridCols?: 2 | 3 | 4;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  searchPlaceholder?: string;
  permissions?: CrudPermissionConfig;
  actions?: CrudActionConfig[];
  initialValue?: Partial<TForm>;
}

type ListResponse<T> = T[] | {
  items?: T[];
  Items?: T[];
  data?: T[];
  Data?: T[];
  result?: T[];
  Result?: T[];
  records?: T[];
  Records?: T[];
  totalCount?: number;
  TotalCount?: number;
  total?: number;
  Total?: number;
  count?: number;
  Count?: number;
};

@Component({
  selector: 'app-crud-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErpDataTableComponent, ErpFormMasterComponent],
  template: `
    <section class="crud-master" [class.form-mode]="mode !== 'list'">
      <ng-container *ngIf="mode === 'list'; else formPage">
        <div class="crud-hero list-hero">
          <div class="hero-copy">
            <span class="eyebrow">ERP Master Setup</span>
            <h1>{{ config?.title || 'ERP List' }}</h1>
            <p *ngIf="config?.subtitle">{{ config?.subtitle }}</p>
          </div>

          <div class="crud-header-actions">
            <button type="button" class="btn secondary" *ngIf="canRefresh" (click)="loadRows()">
              <i class="pi pi-refresh"></i>
              Refresh
            </button>
            <div class="export-wrap" *ngIf="canExport">
              <button type="button" class="btn success" (click)="exportOpen = !exportOpen">
                <i class="pi pi-download"></i>
                Export
                <i class="pi pi-chevron-down"></i>
              </button>
              <div class="export-menu" *ngIf="exportOpen">
                <button type="button" (click)="exportCsv('excel')"><i class="pi pi-file-excel"></i> Excel</button>
                <button type="button" (click)="exportCsv('csv')"><i class="pi pi-file"></i> CSV</button>
                <button type="button" (click)="exportCsv('pdf')"><i class="pi pi-file-pdf"></i> PDF</button>
              </div>
            </div>
            <button type="button" class="btn primary" *ngIf="canCreate" (click)="goCreate()">
              <i class="pi pi-plus"></i>
              Add {{ entityLabel }}
            </button>
          </div>
        </div>

        <app-erp-data-table
          [title]="listTitle"
          [searchPlaceholder]="config?.searchPlaceholder || ('Search by ' + entityLabel.toLowerCase() + '...')"
          [columns]="config?.tableColumns || []"
          [data]="rows"
          [actions]="tableActions"
          [loading]="loading"
          [showRefresh]="false"
          [showExport]="false"
          [pageSize]="pageSize"
          [pageSizeOptions]="pageSizeOptions"
          [totalRecords]="totalRows"
          [serverSide]="true"
          (searchChange)="onSearch($event)"
          (pageChange)="onPageChange($event)"
          (sortChange)="onSort($event)">
        </app-erp-data-table>

        <div class="erp-confirm-backdrop" *ngIf="deleteCandidate">
          <div class="erp-confirm-dialog" role="dialog" aria-modal="true">
            <div class="confirm-icon danger"><i class="pi pi-exclamation-triangle"></i></div>
            <div class="confirm-content">
              <h3>Delete {{ entityLabel }}?</h3>
              <p>This action cannot be undone. Please confirm before deleting this record.</p>
            </div>
            <div class="confirm-actions">
              <button type="button" class="btn secondary" (click)="cancelDelete()">Cancel</button>
              <button type="button" class="btn danger" (click)="confirmDelete()">
                <i class="pi pi-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #formPage>
        <app-erp-form-master
          [title]="pageTitle"
          [subtitle]="mode === 'view' ? 'Read-only record details.' : 'Complete the required information and save.'"
          [formGroup]="formGroup"
          [sections]="formSections"
          [saving]="saving"
          [showActions]="mode !== 'view'"
          [backLabel]="'Back to ' + entityLabel + ' List'"
          (back)="goList()"
          (save)="save()"
          (resetForm)="resetForm()"
          (fileSelected)="onFileSelected($event)">
        </app-erp-form-master>
      </ng-template>
    </section>
  `,
  styles: [`
    .crud-master { display: grid; gap: 10px; width: 100%; max-width: none; margin: 0; color: #17211b; }
    .crud-master.form-mode { width: 100%; max-width: none; }
    .crud-hero { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 13px; background: #fff; border: 1px solid #e2eee8; border-radius: 10px; box-shadow: 0 1px 2px rgba(15,23,42,.04); }
    .hero-copy { min-width: 0; }
    .eyebrow { display: inline-flex; align-items: center; height: 18px; padding: 0 7px; border-radius: 5px; background: #eef8f3; color: #047857; font-size: 9px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 5px; }
    .crud-hero h1 { margin: 0; color: #0f2f26; font-size: 18px; font-weight: 700; letter-spacing: -.015em; }
    .crud-hero p { margin: 2px 0 0; color: #667085; font-size: 12px; }
    .crud-header-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
    .btn { min-height: 32px; border: 1px solid #d7e1dc; background: #fff; border-radius: 7px; padding: 0 10px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; color: #1f2937; box-shadow: none; transition: background .14s ease, border-color .14s ease, color .14s ease; }
    .btn:hover { background: #f7faf9; border-color: #bfd2c9; }
    .btn.primary { background: #047857; border-color: #047857; color: white; }
    .btn.primary:hover { background: #066b50; border-color: #066b50; }
    .btn.success { background: #0f766e; border-color: #0f766e; color: white; }
    .btn.success:hover { background: #0b625c; border-color: #0b625c; }
    .btn.secondary { background: #ffffff; color: #1f2937; }
    .btn i { font-size: 12px; }
    .export-wrap { position: relative; }
    .erp-confirm-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: start center; padding-top: 90px; background: rgba(15, 23, 42, .36); backdrop-filter: blur(2px); }
    .erp-confirm-dialog { width: min(420px, calc(100vw - 32px)); background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 24px 60px rgba(15,23,42,.22); padding: 18px; display: grid; grid-template-columns: 42px 1fr; gap: 12px; }
    .confirm-icon { width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: #fef2f2; color: #dc2626; }
    .confirm-content h3 { margin: 0 0 4px; font-size: 16px; color: #111827; }
    .confirm-content p { margin: 0; color: #667085; font-size: 12px; line-height: 1.45; }
    .confirm-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }
    .export-menu { position: absolute; top: calc(100% + 5px); right: 0; min-width: 145px; padding: 5px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 24px rgba(15,23,42,.12); z-index: 20; }
    .export-menu button { width: 100%; border: 0; background: white; padding: 8px 9px; text-align: left; border-radius: 6px; cursor: pointer; display: flex; gap: 8px; align-items: center; font-size: 12px; font-weight: 600; color: #334155; }
    .export-menu button:hover { background: #f1f5f9; }
    @media (max-width: 768px) { .crud-hero { flex-direction: column; align-items: stretch; } .crud-header-actions { justify-content: stretch; } .btn { flex: 1; } }
  `]
})
export class CrudMasterComponent<TForm = any, TRow extends Record<string, any> = Record<string, any>> implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) config!: CrudMasterConfig<TForm, TRow>;
  @Input() hasPermission: (permission?: string) => boolean = () => true;

  mode: CrudPageMode = 'list';
  id: string | null = null;
  rows: TRow[] = [];
  totalRows = 0;
  currentPage = 1;
  pageSize: number = ERP_UI_CONFIG.defaultPageSize;
  readonly pageSizeOptions = ERP_UI_CONFIG.pageSizeOptions;
  sortKey = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  deleteCandidate: TRow | null = null;
  formGroup = new FormGroup({});
  formSections: ErpFormSection<TForm>[] = [];
  selectedFiles: Record<string, File> = {};
  loading = false;
  saving = false;
  searchText = '';
  exportOpen = false;

  private sub?: Subscription;
  private searchTimer?: ReturnType<typeof setTimeout>;
  private lastAppliedUrl = '';

  constructor(
    private readonly api: ApiClientService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.preparePaging();
    this.prepareFormMetadata();
    this.buildForm();
    this.loadLookupOptions();
    this.applyUrl(this.router.url);
    this.sub = this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(event => {
      this.applyUrl(event.urlAfterRedirects);
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && this.config) {
      this.resetListState();
      this.preparePaging();
      this.prepareFormMetadata();
      this.buildForm();
      this.loadLookupOptions();
      this.applyUrl(this.router.url, true);
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  get pageTitle(): string {
    if (this.mode === 'create') return `Add ${this.entityLabel}`;
    if (this.mode === 'edit') return `Edit ${this.entityLabel}`;
    if (this.mode === 'view') return `View ${this.entityLabel}`;
    return this.config?.title || 'ERP List';
  }

  get formTitle(): string {
    if (this.mode === 'create') return `${this.entityLabel} Information`;
    if (this.mode === 'edit') return `${this.entityLabel} Information`;
    return `${this.entityLabel} Details`;
  }

  get listTitle(): string {
    return `${this.entityLabel} List`;
  }

  get entityLabel(): string {
    const title = this.config?.title || 'Record';
    return title.replace(/ Information$/i, '').replace(/ List$/i, '').trim() || 'Record';
  }

  get canCreate(): boolean { return this.isActionVisible('add', this.config?.permissions?.create); }
  get canExport(): boolean { return this.isActionVisible('export', this.config?.permissions?.export); }
  get canRefresh(): boolean { return this.isActionVisible('refresh'); }
  get canUpdate(): boolean { return this.isActionVisible('edit', this.config?.permissions?.update); }
  get canDelete(): boolean { return this.isActionVisible('delete', this.config?.permissions?.delete); }

  get tableActions(): ErpTableAction<TRow>[] {
    const actions: ErpTableAction<TRow>[] = [];
    if (this.hasPermission(this.config?.permissions?.view)) {
      actions.push({ key: 'view', label: 'View', icon: 'pi pi-eye', handler: (row) => this.goView(row) });
    }
    if (this.canUpdate) {
      actions.push({ key: 'edit', label: 'Edit', icon: 'pi pi-pencil', handler: (row) => this.goEdit(row) });
    }
    if (this.canDelete) {
      actions.push({ key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, handler: (row) => this.delete(row) });
    }
    return actions;
  }

  onSearch(value: string): void {
    this.searchText = value;
    this.currentPage = 1;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadRows(), 350);
  }

  onPageChange(event: ErpPageChange): void {
    this.currentPage = event.page;
    this.pageSize = Number(event.pageSize);
    this.loadRows();
  }

  onSort(event: { key: string; direction: 'asc' | 'desc' | '' }): void {
    this.sortKey = event.key;
    this.sortDirection = event.direction;
    this.currentPage = 1;
    this.loadRows();
  }

  onFileSelected(event: { key: string; file: File | null }): void {
    if (event.file) this.selectedFiles[event.key] = event.file;
    else delete this.selectedFiles[event.key];
  }

  goList(): void { this.router.navigateByUrl(this.erpRoute()); }
  goCreate(): void { this.router.navigateByUrl(`${this.erpRoute()}/create`); }
  goEdit(row: TRow): void {
    const id = this.getRowId(row);
    if (id === undefined || id === null || id === '') return;
    this.router.navigateByUrl(`${this.erpRoute()}/edit/${encodeURIComponent(String(id))}`);
  }

  goView(row: TRow): void {
    const id = this.getRowId(row);
    if (id === undefined || id === null || id === '') return;
    this.router.navigateByUrl(`${this.erpRoute()}/view/${encodeURIComponent(String(id))}`);
  }

  save(): void {
    if (this.formGroup.invalid || this.mode === 'view') {
      this.formGroup.markAllAsTouched();
      return;
    }
    const payload = this.buildPayload();
    this.saving = true;
    const request = this.mode === 'edit' && this.id
      ? this.api.put(this.withId(this.config.endpoint, this.id), payload)
      : this.api.post(this.config.endpoint, payload);

    request.subscribe({
      next: (res) => {
        this.saving = false;
        this.notification.success(this.extractSuccessMessage(res, `${this.entityLabel} saved successfully.`));
        this.goList();
        this.loadRows();
      },
      error: (err) => {
        this.saving = false;
        this.notification.error(err, 'Save Failed');
      }
    });
  }

  resetForm(): void {
    if (this.mode === 'edit' && this.id) {
      this.loadById(this.id);
      return;
    }
    this.selectedFiles = {};
    this.formGroup.reset(this.config?.initialValue || {});
  }

  delete(row: TRow): void {
    this.deleteCandidate = row;
  }

  cancelDelete(): void {
    this.deleteCandidate = null;
  }

  confirmDelete(): void {
    const row = this.deleteCandidate;
    const id = row ? this.getRowId(row) : null;
    if (!row || !id) {
      this.deleteCandidate = null;
      return;
    }
    this.api.delete(this.withId(this.config.endpoint, String(id))).subscribe({
      next: (res) => {
        this.deleteCandidate = null;
        this.notification.success(this.extractSuccessMessage(res, `${this.entityLabel} deleted successfully.`));
        this.loadRows();
      },
      error: (err) => {
        this.deleteCandidate = null;
        this.notification.error(err, 'Delete Failed');
      }
    });
  }

  exportCsv(type: 'csv' | 'excel' | 'pdf'): void {
    this.exportOpen = false;
    if (type === 'pdf') {
      window.print();
      return;
    }
    const headers = this.config.tableColumns.map(c => c.header).join(',');
    const body = this.rows.map(row => this.config.tableColumns.map(col => `"${String(row[col.key] ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[headers, ...body].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.entityLabel.toLowerCase().replace(/\s+/g, '-')}.${type === 'excel' ? 'csv' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private applyUrl(url: string, forceReload = false): void {
    const cleanUrl = this.cleanUrl(url);
    if (!forceReload && cleanUrl === this.lastAppliedUrl && this.mode === 'list') return;
    this.lastAppliedUrl = cleanUrl;

    const parts = cleanUrl.split('/').filter(Boolean);
    const createIndex = parts.indexOf('create');
    const editIndex = parts.indexOf('edit');
    const viewIndex = parts.indexOf('view');

    if (createIndex >= 0) {
      this.resetListState(false);
      this.mode = 'create';
      this.id = null;
      this.enableForm(true);
      this.selectedFiles = {};
      this.formGroup.reset(this.config?.initialValue || {});
      return;
    }

    if (editIndex >= 0) {
      this.resetListState(false);
      this.mode = 'edit';
      this.id = parts[editIndex + 1] ? decodeURIComponent(parts[editIndex + 1]) : null;
      this.enableForm(true);
      if (this.id) this.loadById(this.id);
      return;
    }

    if (viewIndex >= 0) {
      this.resetListState(false);
      this.mode = 'view';
      this.id = parts[viewIndex + 1] ? decodeURIComponent(parts[viewIndex + 1]) : null;
      this.enableForm(false);
      if (this.id) this.loadById(this.id);
      return;
    }

    this.resetListState();
    this.mode = 'list';
    this.id = null;
    this.loadRows();
  }


  private resetListState(resetPaging = true): void {
    this.rows = [];
    this.totalRows = 0;
    this.loading = false;
    this.saving = false;
    this.deleteCandidate = null;
    this.exportOpen = false;
    this.selectedFiles = {};
    if (resetPaging) {
      this.currentPage = 1;
      this.searchText = '';
      this.sortKey = '';
      this.sortDirection = '';
    }
  }

  private preparePaging(): void {
    this.pageSize = Number(this.config?.pageSize) || ERP_UI_CONFIG.defaultPageSize;
    this.currentPage = 1;
  }

  private prepareFormMetadata(): void {
    const sections = this.config?.sections?.length
      ? this.config.sections
      : [{ title: this.config?.title || 'Information', columns: this.config?.gridCols || 2, fields: this.config?.fields || [] }];
    this.formSections = sections.map(section => ({ ...section, fields: [...(section.fields || [])] }));
  }

  private allFields(): ErpFormField<TForm>[] {
    return this.formSections.flatMap(section => section.fields || []);
  }

  private buildPayload(): unknown {
    const raw = this.formGroup.getRawValue() as Record<string, any>;

    // User access screens use future-ready multi access fields while keeping
    // backward-compatible default columns in Adm_Users.
    if (raw['primaryRoleId'] && !raw['roleId']) raw['roleId'] = raw['primaryRoleId'];
    if (raw['defaultAreaId'] && !raw['areaId']) raw['areaId'] = raw['defaultAreaId'];
    if (raw['defaultCompanyId']) {
      if (!raw['compId']) raw['compId'] = raw['defaultCompanyId'];
      if (!raw['companyId']) raw['companyId'] = raw['defaultCompanyId'];
    }

    const files = Object.entries(this.selectedFiles);
    if (!files.length) return raw;

    const formData = new FormData();
    for (const [key, value] of Object.entries(raw)) {
      if (value === undefined || value === null) continue;
      formData.append(key, value instanceof Date ? value.toISOString() : String(value));
    }
    for (const [key, file] of files) {
      formData.append(key, file, file.name);
    }
    return formData;
  }



 private loadLookupOptions(): void {
  for (const field of this.allFields()) {
    if (!field.lookupApi) continue;

    this.api.get<ListResponse<Record<string, any>>>(field.lookupApi).subscribe({
      next: (res) => {
        const rows = this.normalizeList<Record<string, any>>(res);
        const valueKey = field.optionValueKey || 'id';
        const labelKey = field.optionLabelKey || 'name';

        field.options = rows
          .map((row: Record<string, any>) => ({
            value: row[valueKey] ?? row['value'] ?? row['id'] ?? row['compId'],
            label: String(
              row[labelKey] ??
              row['label'] ??
              row['name'] ??
              row['compName'] ??
              row['companyName'] ??
              ''
            )
          }))
          .filter(option =>
            option.value !== undefined &&
            option.value !== null &&
            option.label
          );
      },
      error: () => {
        field.options = [];
      }
    });
  }
}

  private buildForm(): void {
    const group: Record<string, FormControl> = {};
    for (const field of this.allFields()) {
      const validators: ValidatorFn[] = [...(field.validators || [])];
      if (field.required && !validators.includes(Validators.required)) validators.push(Validators.required);
      if (field.type === 'email') validators.push(Validators.email);
      const defaultValue = (this.config.initialValue as Record<string, any> | undefined)?.[field.key] ?? (field.type === 'checkbox' ? false : null);
      group[field.key] = new FormControl(defaultValue, validators);
    }
    this.formGroup = new FormGroup(group);
  }

  private enableForm(enabled: boolean): void {
    if (enabled) this.formGroup.enable({ emitEvent: false });
    else this.formGroup.disable({ emitEvent: false });
  }

  public loadRows(): void {
    if (!this.config?.endpoint || this.mode !== 'list') return;
    this.loading = true;
    this.api.get<ListResponse<TRow>>(this.buildListUrl()).subscribe({
      next: (res) => {
        this.rows = this.normalizeList(res);
        this.totalRows = this.getTotalCount(res, this.rows.length);
        this.loading = false;
      },
      error: (err) => {
        this.rows = [];
        this.totalRows = 0;
        this.loading = false;
        this.notification.error(err, 'Load Failed');
      }
    });
  }

  private loadById(id: string): void {
    this.loading = true;
    this.api.get<TForm>(this.withId(this.config.endpoint, id)).subscribe({
      next: (row) => {
        this.formGroup.patchValue(this.normalizeFormValue(row as any) as any);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notification.error(err, 'Load Failed');
      }
    });
  }


  private getRowId(row: Record<string, any>): any {
    if (!row || !this.config?.idKey) return undefined;
    const configuredKey = String(this.config.idKey);
    const keys = [
      configuredKey,
      configuredKey.charAt(0).toUpperCase() + configuredKey.slice(1),
      configuredKey.charAt(0).toLowerCase() + configuredKey.slice(1),
    ];
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') return row[key];
    }
    const lower = configuredKey.toLowerCase();
    const actualKey = Object.keys(row).find(key => key.toLowerCase() === lower);
    return actualKey ? row[actualKey] : undefined;
  }

  private normalizeFormValue(row: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
    const keys = Object.keys(row || {});
    for (const field of this.allFields()) {
      const key = String(field.key);
      const exact = row[key];
      if (exact !== undefined) {
        normalized[key] = exact;
        continue;
      }
      const pascal = key.charAt(0).toUpperCase() + key.slice(1);
      if (row[pascal] !== undefined) {
        normalized[key] = row[pascal];
        continue;
      }
      const actualKey = keys.find(item => item.toLowerCase() === key.toLowerCase());
      if (actualKey) normalized[key] = row[actualKey];
    }
    return normalized;
  }

  private extractSuccessMessage(response: unknown, fallback: string): string {
    if (!response) return fallback;
    if (typeof response === 'string') return response;
    const obj = response as Record<string, any>;
    return String(
      obj['__apiMessage'] ||
      obj['message'] || obj['Message'] ||
      obj['title'] || obj['Title'] ||
      obj['detail'] || obj['Detail'] ||
      fallback
    );
  }

  private normalizeList<T>(response: any): T[] {
    if (Array.isArray(response)) return response.map(item => this.normalizeRowKeys(item)) as T[];

    const source = response?.data ?? response?.Data ?? response;
    const rows = source?.items || source?.Items || source?.data || source?.Data || source?.result || source?.Result || source?.records || source?.Records || [];

    return Array.isArray(rows) ? rows.map(item => this.normalizeRowKeys(item)) as T[] : [];
  }

  private getTotalCount<T>(response: any, fallback: number): number {
    if (Array.isArray(response)) return response.length;

    const source = response?.data ?? response?.Data ?? response;
    return Number(source?.totalCount ?? source?.TotalCount ?? source?.total ?? source?.Total ?? source?.count ?? source?.Count ?? fallback);
  }

  private normalizeRowKeys<T>(row: T): T {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return row;

    const source = row as Record<string, any>;
    const normalized: Record<string, any> = { ...source };
    for (const key of Object.keys(source)) {
      if (!key) continue;
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      if (normalized[camelKey] === undefined) normalized[camelKey] = source[key];
      if (normalized[pascalKey] === undefined) normalized[pascalKey] = source[key];
    }

    return normalized as T;
  }

  private buildListUrl(): string {
    const params = new URLSearchParams();
    params.set('page', String(this.currentPage));
    params.set('pageNumber', String(this.currentPage));
    params.set('pageSize', String(this.pageSize));
    params.set('limit', String(this.pageSize));
    if (this.searchText.trim()) params.set('search', this.searchText.trim());
    if (this.sortKey && this.sortDirection) {
      params.set('sortBy', this.sortKey);
      params.set('sortDirection', this.sortDirection);
    }
    const separator = this.config.endpoint.includes('?') ? '&' : '?';
    return `${this.config.endpoint}${separator}${params.toString()}`;
  }

  private withId(endpoint: string, id: string): string {
    return `${endpoint.replace(/\/$/, '')}/${encodeURIComponent(id)}`;
  }

  private erpRoute(): string {
    const route = this.config.route.startsWith('/erp/') ? this.config.route : `/erp${this.config.route.startsWith('/') ? '' : '/'}${this.config.route}`;
    return route.replace(/\/create$|\/edit\/[^/]+$|\/view\/[^/]+$/g, '');
  }

  private cleanUrl(url: string): string {
    return (url || '').split('?')[0].split('#')[0].replace(/\/$/, '');
  }

  private isActionVisible(key: string, permission?: string): boolean {
    const action = this.config?.actions?.find(x => x.key === key);
    if (action?.visible === false) return false;
    return this.hasPermission(action?.permission || permission);
  }
}
