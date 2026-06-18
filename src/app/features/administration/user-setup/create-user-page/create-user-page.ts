import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, firstValueFrom, Observable } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiClientService } from '../../../../core/services/api-client.service';
import { environment } from '../../../../../environments/environment';

interface LookupItem { id: string; name: string; }
interface UserRow {
  id?: string;
  userId?: string;
  username?: string;
  empId?: string;
  email?: string;
  roleName?: string;
  areaName?: string;
  companyNames?: string;
  isActive?: boolean;
}
interface UserFormModel {
  id?: string;
  userId?: string;
  username: string;
  empId: string;
  email: string;
  password: string;
  isActive: boolean;
  roleIds: string[];
  primaryRoleId: string;
  roleId?: string;
  companyIds: string[];
  defaultCompanyId: string;
  companyId?: string;
  compId?: string;
  areaIds: string[];
  defaultAreaId: string;
  areaId?: string;
  profileImageUrl?: string;
  signatureImageUrl?: string;
}

type MultiKey = 'roleIds' | 'companyIds' | 'areaIds';
type PageMode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-create-user-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogModule],
  templateUrl: './create-user-page.html',
  styleUrl: './create-user-page.scss',
  providers: [ConfirmationService]
})
export class CreateUserPage implements OnInit {
  mode: PageMode = 'list';
  model: UserFormModel = this.emptyModel();
  rows: UserRow[] = [];
  filteredRows: UserRow[] = [];
  listSearch = '';

  roles: LookupItem[] = [];
  companies: LookupItem[] = [];
  areas: LookupItem[] = [];

  roleSearch = '';
  companySearch = '';
  areaSearch = '';

  userId = '';
  loading = false;
  listLoading = false;
  saving = false;
  deletingId = '';
  error = '';
  profileImageFile: File | null = null;
  signatureImageFile: File | null = null;
  profilePreviewUrl = '';
  signaturePreviewUrl = '';

  constructor(
    private readonly api: ApiClientService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.resolveMode();
    this.loadLookups().then(() => {
      if (this.mode === 'list') this.loadUsers();
      if (this.mode === 'edit' && this.userId) this.loadUserForEdit(this.userId);
    });
  }

  get isEdit(): boolean { return this.mode === 'edit'; }
  get isFormMode(): boolean { return this.mode === 'create' || this.mode === 'edit'; }
  get pageTitle(): string {
    if (this.mode === 'list') return 'Create User List';
    return this.isEdit ? 'Edit User' : 'Add Create User';
  }
  get pageSubtitle(): string {
    if (this.mode === 'list') return 'Manage ERP users, roles, company and area access.';
    return 'Manage login, role, company and area access from one friendly screen.';
  }

  get selectedRoleNames(): string[] { return this.namesFor(this.roles, this.model.roleIds); }
  get selectedCompanyNames(): string[] { return this.namesFor(this.companies, this.model.companyIds); }
  get selectedAreaNames(): string[] { return this.namesFor(this.areas, this.model.areaIds); }
  get primaryRoleName(): string { return this.nameFor(this.roles, this.model.primaryRoleId); }
  get defaultCompanyName(): string { return this.nameFor(this.companies, this.model.defaultCompanyId); }
  get defaultAreaName(): string { return this.nameFor(this.areas, this.model.defaultAreaId); }
  mediaUrl(url?: string): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
    const apiRoot = environment.apiBaseUrl.replace(/\/api\/?$/i, '');
    return `${apiRoot}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  filteredRoles(): LookupItem[] { return this.filterItems(this.roles, this.roleSearch); }
  filteredCompanies(): LookupItem[] { return this.filterItems(this.companies, this.companySearch); }
  filteredAreas(): LookupItem[] { return this.filterItems(this.areas, this.areaSearch); }

  addNew(): void { this.router.navigateByUrl('/erp/administration/user-setup/create-user/create'); }
  edit(row: UserRow): void {
    const id = this.rowId(row);
    if (!id) return;
    this.router.navigateByUrl(`/erp/administration/user-setup/create-user/edit/${encodeURIComponent(id)}`);
  }
  goBack(): void { this.router.navigateByUrl('/erp/administration/user-setup/create-user'); }

  refresh(): void {
    if (this.mode === 'list') this.loadUsers();
    else this.loadLookups().then(() => this.isEdit && this.userId ? this.loadUserForEdit(this.userId) : undefined);
  }

  loadLookups(): Promise<void> {
    this.loading = true;
    this.error = '';
    return Promise.all([
      this.toPromise(this.api.get<LookupItem[]>('/administration/lookups/user-roles')),
      this.toPromise(this.api.get<LookupItem[]>('/administration/lookups/companies')),
      this.toPromise(this.api.get<LookupItem[]>('/administration/lookups/areas'))
    ])
      .then(([roles, companies, areas]) => {
        this.roles = this.normalizeArray<LookupItem>(roles);
        this.companies = this.normalizeArray<LookupItem>(companies);
        this.areas = this.normalizeArray<LookupItem>(areas);
      })
      .catch((err) => {
        this.error = err?.message || 'Failed to load user setup data.';
      })
      .finally(() => this.loading = false);
  }

  loadUsers(): void {
    this.listLoading = true;
    this.error = '';
    this.api.get<any>('/adm-users')
      .pipe(finalize(() => this.listLoading = false))
      .subscribe({
        next: (res) => {
          this.rows = this.normalizeArray<UserRow>(res).map(x => this.normalizeUserRow(x));
          this.applyListFilter();
        },
        error: (err) => {
          this.error = err?.message || 'Failed to load users.';
          this.rows = [];
          this.filteredRows = [];
        }
      });
  }

  applyListFilter(): void {
    const q = (this.listSearch || '').trim().toLowerCase();
    if (!q) {
      this.filteredRows = [...this.rows];
      return;
    }
    this.filteredRows = this.rows.filter(row => [
      row.username, row.empId, row.email, row.roleName, row.areaName, row.companyNames,
      row.isActive ? 'active' : 'inactive'
    ].some(value => String(value || '').toLowerCase().includes(q)));
  }

  loadUserForEdit(id: string): void {
    this.loading = true;
    this.error = '';
    this.loadUser(id)
      .catch((err) => this.error = err?.message || 'Failed to load user.')
      .finally(() => this.loading = false);
  }

  loadUser(id: string): Promise<void> {
    return this.toPromise(this.api.get<Record<string, any>>(`/adm-users/${encodeURIComponent(id)}`))
      .then((row) => {
        const normalized = this.normalizeObject(row || {});
        this.model = {
          ...this.emptyModel(),
          ...normalized,
          id: normalized['id'] || normalized['userId'] || id,
          userId: normalized['userId'] || normalized['id'] || id,
          username: normalized['username'] || '',
          empId: normalized['empId'] || '',
          email: normalized['email'] || '',
          password: '',
          isActive: normalized['isActive'] ?? true,
          roleIds: this.normalizeIds(normalized['roleIds'], normalized['RoleIds'], normalized['roleId'], normalized['primaryRoleId']),
          primaryRoleId: normalized['primaryRoleId'] || normalized['roleId'] || '',
          companyIds: this.normalizeIds(normalized['companyIds'], normalized['CompanyIds'], normalized['companyId'], normalized['compId'], normalized['defaultCompanyId']),
          defaultCompanyId: normalized['defaultCompanyId'] || normalized['companyId'] || normalized['compId'] || '',
          areaIds: this.normalizeIds(normalized['areaIds'], normalized['AreaIds'], normalized['areaId'], normalized['defaultAreaId']),
          defaultAreaId: normalized['defaultAreaId'] || normalized['areaId'] || '',
          profileImageUrl: normalized['profileImageUrl'] || '',
          signatureImageUrl: normalized['signatureImageUrl'] || ''
        };
        this.profilePreviewUrl = this.model.profileImageUrl || '';
        this.signaturePreviewUrl = this.model.signatureImageUrl || '';
        this.ensureDefaultsAreSelected();
      });
  }

  delete(row: UserRow): void {
    const id = this.rowId(row);
    if (!id) return;
    const name = row.username || row.email || 'this user';
    this.confirmationService.confirm({
      header: 'Delete User',
      message: `Move "${name}" to deleted/inactive list?`,
      icon: 'pi pi-trash',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.deletingId = id;
        this.api.delete(`/adm-users/${encodeURIComponent(id)}`)
          .pipe(finalize(() => this.deletingId = ''))
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted successfully.' });
              this.loadUsers();
            },
            error: (err) => this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: err?.message || 'Failed to delete user.' })
          });
      }
    });
  }

  toggleSelection(key: MultiKey, id: string): void {
    const values = new Set(this.model[key] || []);
    if (values.has(id)) values.delete(id);
    else values.add(id);
    this.model[key] = Array.from(values);
    this.ensureDefaultsAreSelected();
  }

  selectAll(key: MultiKey, items: LookupItem[]): void {
    this.model[key] = items.map(x => x.id);
    this.ensureDefaultsAreSelected();
  }

  clearAll(key: MultiKey): void {
    this.model[key] = [];
    if (key === 'roleIds') this.model.primaryRoleId = '';
    if (key === 'companyIds') this.model.defaultCompanyId = '';
    if (key === 'areaIds') this.model.defaultAreaId = '';
  }

  isSelected(key: MultiKey, id: string): boolean { return (this.model[key] || []).includes(id); }

  setPrimaryRole(id: string): void {
    this.model.primaryRoleId = id;
    if (id && !this.model.roleIds.includes(id)) this.model.roleIds = [...this.model.roleIds, id];
  }
  setDefaultCompany(id: string): void {
    this.model.defaultCompanyId = id;
    if (id && !this.model.companyIds.includes(id)) this.model.companyIds = [...this.model.companyIds, id];
  }
  setDefaultArea(id: string): void {
    this.model.defaultAreaId = id;
    if (id && !this.model.areaIds.includes(id)) this.model.areaIds = [...this.model.areaIds, id];
  }

  onProfileImageSelected(event: Event): void { this.onImageSelected(event, 'profile'); }

  onSignatureImageSelected(event: Event): void { this.onImageSelected(event, 'signature'); }

  clearProfileImage(): void { this.profileImageFile = null; this.profilePreviewUrl = ''; this.model.profileImageUrl = ''; }

  clearSignatureImage(): void { this.signatureImageFile = null; this.signaturePreviewUrl = ''; this.model.signatureImageUrl = ''; }

  save(): void {
    this.error = '';
    const validation = this.validate();
    if (validation) {
      this.error = validation;
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: validation });
      return;
    }

    this.saving = true;
    this.uploadSelectedImages()
      .then(() => {
        const payload = this.buildPayload();
        const request = this.isEdit
          ? this.api.put(`/adm-users/${encodeURIComponent(this.userId)}`, payload)
          : this.api.post('/adm-users', payload);
        return firstValueFrom(request);
      })
      .then(() => {
        this.saving = false;
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'User information saved successfully.' });
        this.router.navigateByUrl('/erp/administration/user-setup/create-user');
      })
      .catch((err) => {
        this.saving = false;
        this.error = err?.message || 'Failed to save user.';
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: this.error });
      });
    return;

    /* request.pipe(finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'User information saved successfully.' });
        this.router.navigateByUrl('/erp/administration/user-setup/create-user');
      },
      error: (err) => {
        this.error = err?.message || 'Failed to save user.';
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: this.error });
      }
    }); */
  }

  reset(): void {
    if (this.mode === 'list') {
      this.listSearch = '';
      this.applyListFilter();
      return;
    }
    this.model = this.emptyModel();
    this.roleSearch = '';
    this.companySearch = '';
    this.areaSearch = '';
  }

  rowId(row: UserRow): string {
    return String(row?.id || row?.userId || '');
  }

  private resolveMode(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    const url = this.router.url.split('?')[0].toLowerCase();
    if (this.userId) this.mode = 'edit';
    else if (url.endsWith('/create-user/create')) this.mode = 'create';
    else this.mode = 'list';
    if (this.mode === 'create') this.model = this.emptyModel();
  }

  private buildPayload(): Record<string, any> {
    this.ensureDefaultsAreSelected();
    const payload: Record<string, any> = {
      username: this.model.username?.trim(),
      empId: this.model.empId?.trim() || null,
      email: this.model.email?.trim(),
      password: this.model.password || null,
      isActive: !!this.model.isActive,
      roleIds: this.model.roleIds || [],
      primaryRoleId: this.model.primaryRoleId || null,
      roleId: this.model.primaryRoleId || null,
      companyIds: this.model.companyIds || [],
      defaultCompanyId: this.model.defaultCompanyId || null,
      companyId: this.model.defaultCompanyId || null,
      compId: this.model.defaultCompanyId || null,
      areaIds: this.model.areaIds || [],
      defaultAreaId: this.model.defaultAreaId || null,
      areaId: this.model.defaultAreaId || null,
      profileImageUrl: this.model.profileImageUrl || null,
      signatureImageUrl: this.model.signatureImageUrl || null
    };
    if (this.isEdit) {
      payload['id'] = this.userId;
      payload['userId'] = this.userId;
      if (!payload['password']) delete payload['password'];
    }
    return payload;
  }

  private validate(): string {
    if (!this.model.username?.trim()) return 'Username is required.';
    if (!this.model.email?.trim()) return 'Email is required.';
    if (!this.isEdit && !this.model.password) return 'Password is required for new user.';
    if (!this.model.roleIds.length) return 'Select at least one role.';
    if (!this.model.primaryRoleId) return 'Select primary role.';
    if (!this.model.roleIds.includes(this.model.primaryRoleId)) return 'Primary role must be one of the assigned roles.';
    if (!this.model.companyIds.length) return 'Select at least one company.';
    if (!this.model.defaultCompanyId) return 'Select default company.';
    if (!this.model.companyIds.includes(this.model.defaultCompanyId)) return 'Default company must be one of the assigned companies.';
    if (!this.model.areaIds.length) return 'Select at least one area.';
    if (!this.model.defaultAreaId) return 'Select default area.';
    if (!this.model.areaIds.includes(this.model.defaultAreaId)) return 'Default area must be one of the assigned areas.';
    return '';
  }

  private ensureDefaultsAreSelected(): void {
    if (this.model.primaryRoleId && !this.model.roleIds.includes(this.model.primaryRoleId)) this.model.roleIds = [...this.model.roleIds, this.model.primaryRoleId];
    if (!this.model.primaryRoleId && this.model.roleIds.length) this.model.primaryRoleId = this.model.roleIds[0];
    if (this.model.defaultCompanyId && !this.model.companyIds.includes(this.model.defaultCompanyId)) this.model.companyIds = [...this.model.companyIds, this.model.defaultCompanyId];
    if (!this.model.defaultCompanyId && this.model.companyIds.length) this.model.defaultCompanyId = this.model.companyIds[0];
    if (this.model.defaultAreaId && !this.model.areaIds.includes(this.model.defaultAreaId)) this.model.areaIds = [...this.model.areaIds, this.model.defaultAreaId];
    if (!this.model.defaultAreaId && this.model.areaIds.length) this.model.defaultAreaId = this.model.areaIds[0];
  }

  private filterItems(items: LookupItem[], term: string): LookupItem[] {
    const q = (term || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter(x => x.name.toLowerCase().includes(q));
  }

  private namesFor(items: LookupItem[], ids: string[]): string[] {
    return (ids || []).map(id => this.nameFor(items, id)).filter(Boolean);
  }
  private nameFor(items: LookupItem[], id: string): string { return items.find(x => x.id === id)?.name || ''; }

  private normalizeIds(value: unknown, ...fallbacks: unknown[]): string[] {
    const source = Array.isArray(value) ? value : (typeof value === 'string' && value.includes(',') ? value.split(',') : []);
    const result = new Set<string>();
    for (const item of source) if (item) result.add(String(item));
    for (const item of fallbacks) if (item) result.add(String(item));
    return Array.from(result);
  }

  private normalizeObject(row: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = { ...row };
    Object.keys(row || {}).forEach(key => {
      const camel = key.charAt(0).toLowerCase() + key.slice(1);
      normalized[camel] = normalized[camel] ?? row[key];
    });
    return normalized;
  }

  private normalizeArray<T>(res: any): T[] {
    if (Array.isArray(res)) return res as T[];
    if (Array.isArray(res?.items)) return res.items as T[];
    if (Array.isArray(res?.data)) return res.data as T[];
    if (Array.isArray(res?.result)) return res.result as T[];
    if (Array.isArray(res?.records)) return res.records as T[];
    return [];
  }

  private normalizeUserRow(row: any): UserRow {
    const n = this.normalizeObject(row || {});
    return {
      id: n['id'] || n['userId'],
      userId: n['userId'] || n['id'],
      username: n['username'] || '',
      empId: n['empId'] || '',
      email: n['email'] || '',
      roleName: n['roleName'] || n['RoleName'] || n['primaryRoleName'] || '',
      areaName: n['areaName'] || n['AreaName'] || n['defaultAreaName'] || '',
      companyNames: n['companyNames'] || n['CompanyNames'] || n['companyName'] || '',
      isActive: n['isActive'] ?? false
    };
  }

  private emptyModel(): UserFormModel {
    return {
      username: '', empId: '', email: '', password: '', isActive: true,
      roleIds: [], primaryRoleId: '', companyIds: [], defaultCompanyId: '', areaIds: [], defaultAreaId: '',
      profileImageUrl: '', signatureImageUrl: ''
    };
  }

  private onImageSelected(event: Event, type: 'profile' | 'signature'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.messageService.add({ severity: 'warn', summary: 'Invalid File', detail: 'Please select an image file.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.messageService.add({ severity: 'warn', summary: 'Large File', detail: 'Image size must be 2 MB or less.' });
      return;
    }
    const url = URL.createObjectURL(file);
    if (type === 'profile') { this.profileImageFile = file; this.profilePreviewUrl = url; }
    else { this.signatureImageFile = file; this.signaturePreviewUrl = url; }
  }

  private async uploadSelectedImages(): Promise<void> {
    if (this.profileImageFile) {
      const result = await this.uploadImage(this.profileImageFile, 'profile');
      this.model.profileImageUrl = result.url;
    }
    if (this.signatureImageFile) {
      const result = await this.uploadImage(this.signatureImageFile, 'signature');
      this.model.signatureImageUrl = result.url;
    }
  }

  private uploadImage(file: File, type: 'profile' | 'signature'): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('type', type);
    return firstValueFrom(this.api.post<{ url: string; fileName: string }>('/adm-users/upload-image', formData));
  }

  private toPromise<T>(source: Observable<T>): Promise<T> { return firstValueFrom(source); }
}

