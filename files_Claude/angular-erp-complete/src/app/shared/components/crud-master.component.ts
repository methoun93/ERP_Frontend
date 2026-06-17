import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService, ListParams, normalizeList, getTotalCount } from '@/app/core/services/crud.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { BehaviorSubject, Subject, debounceTime, switchMap, catchError } from 'rxjs';
import { of } from 'rxjs';

export type SelectOption = { label: string; value: string | number };

export type MasterField = {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'searchSelect' | 'checkbox' | 'file';
  options?: SelectOption[];
  required?: boolean;
  colSpan?: 1 | 2 | 3;
  readOnly?: boolean;
  defaultValue?: unknown;
  maxLength?: number;
};

export type CrudMasterConfig = {
  title: string;
  subtitle?: string;
  endpoint: string;
  idKey: string;
  fields: MasterField[];
  tableColumns?: string[];
  gridCols?: 2 | 3 | 4;
  pageSize?: number;
};

@Component({
  selector: 'app-crud-master',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px;">
      <!-- Modal Overlay -->
      <div *ngIf="showForm" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #ECFDF5; padding-bottom: 12px;">
            <h2 style="margin: 0; font-size: 18px; font-weight: 700; color: #064E3B;">
              {{ editing ? 'Edit' : 'Create New' }} {{ config.title }}
            </h2>
            <button (click)="closeForm()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #9CA3AF;">×</button>
          </div>

          <div [style.display]="'grid'" [style.gridTemplateColumns]="'repeat(' + (config.gridCols || 2) + ', 1fr)'" [style.gap]="'16px'" style="margin-bottom: 20px;">
            <div *ngFor="let field of config.fields" [style.gridColumn]="field.colSpan ? field.colSpan : 'auto'">
              <label style="display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 6px;">
                {{ field.label }}
                <span *ngIf="field.required" style="color: #EF4444;">*</span>
              </label>
              
              <!-- Text Input -->
              <input *ngIf="!field.type || field.type === 'text' || field.type === 'email' || field.type === 'number'"
                [(ngModel)]="form[field.key]"
                [type]="field.type || 'text'"
                [placeholder]="'Enter ' + field.label"
                [maxlength]="field.maxLength"
                [readOnly]="field.readOnly"
                style="width: 100%; height: 40px; border: 1.5px solid #D1FAE5; border-radius: 9px; padding: 0 12px; font-size: 13px; outline: none; box-sizing: border-box;"
                (focus)="$event.target.style.borderColor = '#059669'; $event.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'"
                (blur)="$event.target.style.borderColor = '#D1FAE5'; $event.target.style.boxShadow = 'none'" />

              <!-- Date Input -->
              <input *ngIf="field.type === 'date'"
                [(ngModel)]="form[field.key]"
                type="date"
                style="width: 100%; height: 40px; border: 1.5px solid #D1FAE5; border-radius: 9px; padding: 0 12px; font-size: 13px; outline: none; box-sizing: border-box;"
                (focus)="$event.target.style.borderColor = '#059669'; $event.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'"
                (blur)="$event.target.style.borderColor = '#D1FAE5'; $event.target.style.boxShadow = 'none'" />

              <!-- Textarea -->
              <textarea *ngIf="field.type === 'textarea'"
                [(ngModel)]="form[field.key]"
                [placeholder]="'Enter ' + field.label"
                [maxlength]="field.maxLength"
                [readOnly]="field.readOnly"
                style="width: 100%; height: 80px; border: 1.5px solid #D1FAE5; border-radius: 9px; padding: 10px 12px; font-size: 13px; outline: none; resize: vertical; box-sizing: border-box; font-family: inherit;"
                (focus)="$event.target.style.borderColor = '#059669'; $event.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'"
                (blur)="$event.target.style.borderColor = '#D1FAE5'; $event.target.style.boxShadow = 'none'"></textarea>

              <!-- Select -->
              <select *ngIf="field.type === 'select' && field.options"
                [(ngModel)]="form[field.key]"
                style="width: 100%; height: 40px; border: 1.5px solid #D1FAE5; border-radius: 9px; padding: 0 12px; font-size: 13px; outline: none; box-sizing: border-box;"
                (focus)="$event.target.style.borderColor = '#059669'; $event.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'"
                (blur)="$event.target.style.borderColor = '#D1FAE5'; $event.target.style.boxShadow = 'none'">
                <option value="">-- Select {{field.label}} --</option>
                <option *ngFor="let opt of field.options" [value]="opt.value">{{ opt.label }}</option>
              </select>

              <!-- Search Select -->
              <div *ngIf="field.type === 'searchSelect' && field.options" style="position: relative;">
                <input
                  [(ngModel)]="searchQueries[field.key]"
                  (focus)="openSearchSelect(field.key)"
                  (blur)="closeSearchSelect(field.key, 200)"
                  [placeholder]="'Search ' + field.label"
                  [readOnly]="field.readOnly"
                  style="width: 100%; height: 40px; border: 1.5px solid #D1FAE5; border-radius: 9px; padding: 0 12px; font-size: 13px; outline: none; box-sizing: border-box;"
                  (focus)="$event.target.style.borderColor = '#059669'; $event.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.10)'"
                  (blur)="$event.target.style.borderColor = '#D1FAE5'; $event.target.style.boxShadow = 'none'" />
                <div *ngIf="openSearchSelects[field.key]" style="position: absolute; top: 44px; left: 0; right: 0; background: white; border: 1.5px solid #D1FAE5; border-radius: 9px; max-height: 220px; overflow-y: auto; z-index: 9999; box-shadow: 0 8px 24px rgba(5,150,105,0.15);">
                  <div *ngFor="let opt of getFilteredOptions(field)"
                    (mousedown)="selectOption(field.key, opt)"
                    style="padding: 9px 14px; cursor: pointer; font-size: 13px; border-bottom: 1px solid #ECFDF5; display: flex; justify-content: space-between; align-items: center;"
                    [style.background]="form[field.key] === opt.value ? '#ECFDF5' : 'white'"
                    [style.color]="form[field.key] === opt.value ? '#059669' : '#1F2937'"
                    [style.fontWeight]="form[field.key] === opt.value ? '600' : '400'"
                    (mouseenter)="$event.currentTarget.style.background = form[field.key] === opt.value ? '#ECFDF5' : '#F0FDF4'"
                    (mouseleave)="$event.currentTarget.style.background = form[field.key] === opt.value ? '#ECFDF5' : 'white'">
                    {{ opt.label }}
                    <i *ngIf="form[field.key] === opt.value" class="fas fa-check" style="font-size: 11px; color: #059669;"></i>
                  </div>
                </div>
              </div>

              <!-- Checkbox -->
              <div *ngIf="field.type === 'checkbox'" style="display: flex; align-items: center; height: 40px;">
                <input type="checkbox" [(ngModel)]="form[field.key]" [id]="field.key"
                  style="width: 18px; height: 18px; cursor: pointer; accent-color: #059669;" />
              </div>

              <!-- File Upload -->
              <input *ngIf="field.type === 'file'" type="file" multiple
                (change)="onFileSelect($event, field.key)"
                style="display: block; width: 100%; padding: 10px; border: 1.5px solid #D1FAE5; border-radius: 9px; font-size: 12px;" />
              <div *ngIf="uploadedFiles[field.key]?.length" style="margin-top: 8px;">
                <div *ngFor="let file of uploadedFiles[field.key]" style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #F0FDF4; border-radius: 6px; font-size: 12px; margin-bottom: 4px;">
                  <span><i class="fas fa-file"></i> {{ file.name || file }}</span>
                  <button type="button" (click)="removeFile(field.key, $event)" style="background: none; border: none; color: #E11D48; cursor: pointer;">✕</button>
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; border-top: 1px solid #ECFDF5; padding-top: 16px;">
            <button (click)="save()" [disabled]="isSaving"
              style="flex: 1; padding: 10px 16px; background: #059669; color: white; border: none; border-radius: 9px; font-weight: 600; cursor: pointer; opacity: {{ isSaving ? '0.7' : '1' }};">
              <i class="fas fa-{{editing ? 'floppy-disk' : 'check'}}" style="margin-right: 6px;"></i>
              {{ isSaving ? 'Saving...' : (editing ? 'Save Changes' : 'Create') }}
            </button>
            <button (click)="closeForm()"
              style="flex: 1; padding: 10px 16px; background: #F3F4F6; color: #6B7280; border: none; border-radius: 9px; font-weight: 600; cursor: pointer;">
              <i class="fas fa-times" style="margin-right: 6px;"></i> Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #ECFDF5; padding-bottom: 16px;">
          <div>
            <h1 style="margin: 0 0 4px; font-size: 20px; font-weight: 700; color: #064E3B;">{{ config.title }}</h1>
            <p *ngIf="config.subtitle" style="margin: 0; font-size: 13px; color: #9CA3AF;">{{ config.subtitle }}</p>
          </div>
          <button (click)="openNew()"
            style="padding: 10px 16px; background: #059669; color: white; border: none; border-radius: 9px; font-weight: 600; cursor: pointer;">
            <i class="fas fa-plus"></i> Create New
          </button>
        </div>

        <!-- Search Bar -->
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <div style="position: relative; flex: 1;">
            <i class="fas fa-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 11px; color: #9CA3AF;"></i>
            <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)"
              placeholder="Search..."
              style="width: 100%; height: 34px; border-radius: 9px; border: 1.5px solid #D1FAE5; background: #F0FDF4; padding-left: 30px; padding-right: 10px; font-size: 12px; outline: none; box-sizing: border-box;" />
          </div>
        </div>

        <!-- Table -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F0FDF4; border-bottom: 2px solid #D1FAE5;">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 700; color: #064E3B; width: 44px;">#</th>
                <th *ngFor="let col of getTableColumns()"
                  style="padding: 12px; text-align: left; font-size: 12px; font-weight: 700; color: #064E3B;">
                  {{ getFieldLabel(col) }}
                </th>
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 700; color: #064E3B; width: 140px;">Action</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loading -->
              <tr *ngIf="isLoading">
                <td [attr.colspan]="getTableColumns().length + 2" style="padding: 36px; text-align: center;">
                  <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #059669;">
                    <i class="fas fa-circle-notch spin" style="font-size: 18px;"></i>
                    <span style="font-size: 13px;">Loading data...</span>
                  </div>
                </td>
              </tr>

              <!-- Error -->
              <tr *ngIf="error && !isLoading">
                <td [attr.colspan]="getTableColumns().length + 2" style="padding: 28px; text-align: center;">
                  <div style="display: inline-flex; align-items: center; gap: 8px; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 10px; padding: 10px 18px; font-size: 13px; color: #B91C1C;">
                    <i class="fas fa-triangle-exclamation"></i> {{ error }}
                  </div>
                </td>
              </tr>

              <!-- Empty -->
              <tr *ngIf="!isLoading && !error && paginatedRows.length === 0">
                <td [attr.colspan]="getTableColumns().length + 2" style="padding: 48px; text-align: center;">
                  <i class="fas fa-inbox" style="font-size: 32px; color: #D1FAE5; display: block; margin-bottom: 10px;"></i>
                  <p style="font-size: 13px; color: #9CA3AF; margin: 0 0 12px;">No records found</p>
                  <button (click)="openNew()" style="padding: 8px 16px; background: #059669; color: white; border: none; border-radius: 9px; font-weight: 600; cursor: pointer; font-size: 12px;">
                    <i class="fas fa-plus"></i> Add First Record
                  </button>
                </td>
              </tr>

              <!-- Rows -->
              <tr *ngFor="let row of paginatedRows; let i = index"
                style="border-bottom: 1px solid #ECFDF5;"
                (mouseenter)="$event.currentTarget.style.background = '#F0FDF4'"
                (mouseleave)="$event.currentTarget.style.background = 'transparent'">
                <td style="padding: 12px; font-size: 12px; color: #9CA3AF; font-weight: 500;">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
                <td *ngFor="let col of getTableColumns()" style="padding: 12px; font-size: 13px; color: #374151; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {{ getRowValue(row, col) }}
                </td>
                <td style="padding: 12px;">
                  <div style="display: flex; gap: 6px;">
                    <button (click)="openEdit(row)"
                      style="padding: 5px 12px; border-radius: 7px; border: 1px solid #D1FAE5; background: white; color: #059669; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                      <i class="fas fa-pen" style="font-size: 10px;"></i> Edit
                    </button>
                    <button (click)="confirmDelete(row)" [disabled]="isDeleting"
                      style="padding: 5px 12px; border-radius: 7px; border: 1px solid #FECDD3; background: white; color: #E11D48; font-size: 12px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 5px; opacity: {{ isDeleting ? '0.7' : '1' }};">
                      <i class="fas fa-trash" style="font-size: 10px;"></i> Del
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div *ngIf="totalPages > 1" style="display: flex; align-items: center; justify-content: space-between; padding: 11px 16px; border-top: 1px solid #ECFDF5; margin-top: 16px;">
          <span style="font-size: 12px; color: #6B7280;">
            Showing {{ totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} records
          </span>
          <div style="display: flex; gap: 4px;">
            <button (click)="goToPage(currentPage - 1)" [disabled]="currentPage <= 1"
              style="width: 30px; height: 30px; border-radius: 7px; border: 1px solid #D1FAE5; background: white; cursor: {{ currentPage <= 1 ? 'not-allowed' : 'pointer' }}; opacity: {{ currentPage <= 1 ? '0.4' : '1' }}; display: flex; align-items: center; justify-content: center; color: #6B7280;">
              <i class="fas fa-chevron-left" style="font-size: 10px;"></i>
            </button>
            <button *ngFor="let p of getPageNumbers()" (click)="goToPage(p)"
              [style.background]="p === currentPage ? '#059669' : 'white'"
              [style.color]="p === currentPage ? 'white' : '#6B7280'"
              style="width: 30px; height: 30px; border-radius: 7px; border: 1px solid; border-color: {{ p === currentPage ? '#059669' : '#D1FAE5' }}; cursor: pointer; font-size: 12px; font-weight: {{ p === currentPage ? '700' : '400' }}; display: flex; align-items: center; justify-content: center;">
              {{ p }}
            </button>
            <button (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages"
              style="width: 30px; height: 30px; border-radius: 7px; border: 1px solid #D1FAE5; background: white; cursor: {{ currentPage >= totalPages ? 'not-allowed' : 'pointer' }}; opacity: {{ currentPage >= totalPages ? '0.4' : '1' }}; display: flex; align-items: center; justify-content: center; color: #6B7280;">
              <i class="fas fa-chevron-right" style="font-size: 10px;"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Dialog -->
      <div *ngIf="confirmDeleteId !== null" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: center; justify-content: center;">
        <div style="background: white; border-radius: 12px; padding: 24px; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <i class="fas fa-triangle-exclamation" style="font-size: 20px; color: #E11D48;"></i>
            <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #1F2937;">Delete Record</h3>
          </div>
          <p style="margin: 0 0 24px; font-size: 13px; color: #6B7280;">This record will be permanently deleted. Are you sure?</p>
          <div style="display: flex; gap: 10px;">
            <button (click)="deleteRecord()" [disabled]="isDeleting"
              style="flex: 1; padding: 10px 16px; background: #E11D48; color: white; border: none; border-radius: 9px; font-weight: 600; cursor: pointer; opacity: {{ isDeleting ? '0.7' : '1' }};">
              <i class="fas fa-trash" style="margin-right: 6px;"></i> {{ isDeleting ? 'Deleting...' : 'Yes, Delete' }}
            </button>
            <button (click)="confirmDeleteId = null" [disabled]="isDeleting"
              style="flex: 1; padding: 10px 16px; background: #F3F4F6; color: #6B7280; border: none; border-radius: 9px; font-weight: 600; cursor: pointer;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class CrudMasterComponent implements OnInit {
  @Input() config!: CrudMasterConfig;

  showForm = false;
  editing = false;
  form: Record<string, any> = {};
  isLoading = false;
  isSaving = false;
  isDeleting = false;
  error: string | null = null;

  allRows: any[] = [];
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  searchQuery = '';
  searchQueries: Record<string, string> = {};
  openSearchSelects: Record<string, boolean> = {};
  uploadedFiles: Record<string, string[]> = {};
  confirmDeleteId: string | null = null;

  private searchSubject = new Subject<string>();

  Math = Math;

  constructor(private crudService: CrudService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadData();
    this.searchSubject.pipe(debounceTime(300), switchMap(q => {
      this.currentPage = 1;
      return this.loadDataInternal(q);
    })).subscribe();
  }

  loadData() {
    this.loadDataInternal(this.searchQuery).subscribe();
  }

  private loadDataInternal(search: string) {
    this.isLoading = true;
    this.error = null;
    return this.crudService.list(this.config.endpoint, {
      page: this.currentPage,
      limit: this.pageSize,
      search: search
    }).pipe(
      catchError(err => {
        this.error = (err as Error).message || 'Failed to load data';
        this.isLoading = false;
        return of(null);
      })
    ).pipe(switchMap(result => {
      if (result) {
        this.allRows = normalizeList(result);
        this.totalCount = getTotalCount(result);
      }
      this.isLoading = false;
      return of(null);
    }));
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  openNew() {
    this.editing = false;
    this.form = {};
    this.uploadedFiles = {};
    this.config.fields.forEach(f => {
      if (f.defaultValue !== undefined) this.form[f.key] = f.defaultValue;
    });
    this.showForm = true;
  }

  openEdit(row: any) {
    this.editing = true;
    this.form = { ...row };
    this.uploadedFiles = {};
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.form = {};
    this.uploadedFiles = {};
  }

  save() {
    const requiredFields = this.config.fields.filter(f => f.required);
    const missing = requiredFields.filter(f => !this.form[f.key]);
    if (missing.length) {
      this.notificationService.error(`Please fill: ${missing.map(f => f.label).join(', ')}`);
      return;
    }

    this.isSaving = true;
    const request = this.editing
      ? this.crudService.update(this.config.endpoint, this.form[this.config.idKey], this.form)
      : this.crudService.create(this.config.endpoint, this.form);

    request.pipe(
      catchError(err => {
        this.notificationService.error((err as Error).message || 'Save failed');
        this.isSaving = false;
        return of(null);
      })
    ).subscribe(result => {
      if (result) {
        this.notificationService.success(`${this.config.title} ${this.editing ? 'updated' : 'created'} successfully`);
        this.closeForm();
        this.loadData();
      }
      this.isSaving = false;
    });
  }

  confirmDelete(row: any) {
    const id = row[this.config.idKey];
    if (!id) {
      this.notificationService.error(`Missing ${this.config.idKey}. Cannot delete.`);
      return;
    }
    this.confirmDeleteId = id;
  }

  deleteRecord() {
    if (!this.confirmDeleteId) return;
    this.isDeleting = true;
    this.crudService.delete(this.config.endpoint, String(this.confirmDeleteId)).pipe(
      catchError(err => {
        this.notificationService.error((err as Error).message || 'Delete failed');
        this.isDeleting = false;
        return of(null);
      })
    ).subscribe(result => {
      this.notificationService.success(`${this.config.title} deleted successfully`);
      this.confirmDeleteId = null;
      this.loadData();
      this.isDeleting = false;
    });
  }

  getTableColumns(): string[] {
    return this.config.tableColumns || this.config.fields.map(f => f.key);
  }

  getFieldLabel(key: string): string {
    return this.config.fields.find(f => f.key === key)?.label || key;
  }

  getRowValue(row: any, key: string): string {
    const field = this.config.fields.find(f => f.key === key);
    const value = row[key];
    if (field?.type === 'checkbox') return value ? 'Active' : 'Inactive';
    if (field?.type === 'searchSelect' && field.options) {
      return field.options.find(o => o.value === value)?.label || String(value || '');
    }
    return String(value || '');
  }

  getFilteredOptions(field: MasterField): SelectOption[] {
    if (!field.options) return [];
    const query = (this.searchQueries[field.key] || '').toLowerCase();
    if (!query) return field.options;
    return field.options.filter(o => o.label.toLowerCase().includes(query));
  }

  openSearchSelect(key: string) {
    this.openSearchSelects[key] = true;
  }

  closeSearchSelect(key: string, delay = 0) {
    setTimeout(() => {
      this.openSearchSelects[key] = false;
      this.searchQueries[key] = '';
    }, delay);
  }

  selectOption(key: string, option: SelectOption) {
    this.form[key] = option.value;
    this.closeSearchSelect(key);
  }

  onFileSelect(event: any, fieldKey: string) {
    const files = Array.from(event.target.files) as File[];
    this.uploadedFiles[fieldKey] = files.map(f => f.name);
    this.form[fieldKey] = files;
  }

  removeFile(fieldKey: string, event: any) {
    event.preventDefault();
    if (this.uploadedFiles[fieldKey]) {
      this.uploadedFiles[fieldKey].pop();
    }
  }

  get paginatedRows(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.allRows.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  getPageNumbers(): number[] {
    const pages = Math.min(this.totalPages, 7);
    return Array.from({ length: pages }, (_, i) => i + 1);
  }
}
