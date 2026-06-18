import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, finalize, firstValueFrom } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiClientService } from '../../../../core/services/api-client.service';

interface LookupItem { id: string; name: string; }
interface ModuleItem { moduleId: string; moduleName: string; moduleIcon?: string; moduleRoute?: string; sortOrder?: number; }
interface MenuItem { menuId: string; menuName: string; menuIcon?: string; menuRoute?: string; sortOrder?: number; subMenus?: SubMenuItem[]; }
interface SubMenuItem { subMenuId: string; subMenuName: string; subMenuIcon?: string; subMenuRoute?: string; sortOrder?: number; }
interface RolePermissionItem {
  id?: string;
  roleId: string;
  moduleId: string;
  menuId: string;
  subMenuId?: string | null;
  isPermitted: boolean;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canPrint: boolean;
  canExport: boolean;
  canApprove: boolean;
}
interface PermissionRow extends RolePermissionItem {
  menuName: string;
  subMenuName: string;
  menuIcon?: string;
  subMenuIcon?: string;
}

type PermissionKey = 'canView' | 'canCreate' | 'canEdit' | 'canUpdate' | 'canDelete' | 'canPrint' | 'canExport' | 'canApprove';

@Component({
  selector: 'app-role-permission-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-permission-page.html',
  styleUrl: './role-permission-page.scss'
})
export class RolePermissionPage implements OnInit {
  roles: LookupItem[] = [];
  modules: ModuleItem[] = [];
  menus: MenuItem[] = [];
  rows: PermissionRow[] = [];
  visibleRowsCache: PermissionRow[] = [];
  groupedRowsCache: { menu: MenuItem; rows: PermissionRow[] }[] = [];

  selectedRoleId = '';
  selectedModuleId = '';
  selectedMenuId = 'all';
  cloneSourceRoleId = '';
  cloneOverwrite = true;
  searchTerm = '';
  selectedRow: PermissionRow | null = null;
  expandedMenuIds = new Set<string>();

  loading = false;
  saving = false;
  error = '';
  success = '';

  readonly permissions: { key: PermissionKey; label: string; short: string }[] = [
    { key: 'canView', label: 'View', short: 'V' },
    { key: 'canCreate', label: 'Create', short: 'C' },
    { key: 'canEdit', label: 'Edit', short: 'E' },
    { key: 'canUpdate', label: 'Update', short: 'U' },
    { key: 'canDelete', label: 'Delete', short: 'D' },
    { key: 'canPrint', label: 'Print', short: 'P' },
    { key: 'canExport', label: 'Export', short: 'X' },
    { key: 'canApprove', label: 'Approve', short: 'A' }
  ];

  constructor(
    private readonly api: ApiClientService,
    private readonly confirmationService: ConfirmationService,
    private readonly messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.error = '';
    Promise.all([
      this.toPromise(this.api.get<LookupItem[]>('/administration/lookups/user-roles')),
      this.toPromise(this.api.get<ModuleItem[]>('/auth/modules'))
    ])
      .then(([roles, modules]) => {
        this.roles = roles || [];
        this.modules = modules || [];
        if (!this.selectedModuleId && this.modules.length) {
          this.selectedModuleId = this.modules[0].moduleId;
        }
        return this.loadModuleTree(false);
      })
      .catch((err) => this.error = err?.message || 'Failed to load role permission data.')
      .finally(() => this.loading = false);
  }

  onModuleChange(): void {
    this.selectedMenuId = 'all';
    this.searchTerm = '';
    this.selectedRow = null;
    this.expandedMenuIds.clear();
    this.refreshVisibleRows();
    this.loadModuleTree(true);
  }

  onRoleChange(): void {
    if (this.cloneSourceRoleId === this.selectedRoleId) {
      this.cloneSourceRoleId = '';
    }
    this.mergeRolePermissions();
  }

  loadModuleTree(showLoader = true): Promise<void> {
    if (!this.selectedModuleId) {
      this.menus = [];
      this.rows = [];
      return Promise.resolve();
    }

    if (showLoader) this.loading = true;
    this.error = '';

    return this.toPromise(this.api.get<MenuItem[]>(`/auth/tree?moduleId=${this.selectedModuleId}`))
      .then((menus) => {
        this.menus = menus || [];
        this.buildRows([]);
        return this.mergeRolePermissions();
      })
      .catch((err) => this.error = err?.message || 'Failed to load module menu tree.')
      .finally(() => { if (showLoader) this.loading = false; });
  }

  mergeRolePermissions(): Promise<void> {
    if (!this.selectedRoleId) {
      this.buildRows([]);
      return Promise.resolve();
    }

    return this.toPromise(this.api.get<RolePermissionItem[]>(`/adm-role-permissions/by-role/${this.selectedRoleId}`))
      .then((existing) => this.buildRows(existing || []))
      .catch((err) => this.error = err?.message || 'Failed to load saved permissions for this role.');
  }

  buildRows(existing: RolePermissionItem[]): void {
    const permissionMap = new Map<string, RolePermissionItem>();
    for (const item of existing) {
      if (item.moduleId !== this.selectedModuleId) continue;
      permissionMap.set(this.rowKey(item.menuId, item.subMenuId), item);
    }

    const rows: PermissionRow[] = [];
    for (const menu of this.menus) {
      const children = menu.subMenus?.length ? menu.subMenus : [null];
      for (const subMenu of children) {
        const key = this.rowKey(menu.menuId, subMenu?.subMenuId || null);
        const saved = permissionMap.get(key);
        rows.push({
          id: saved?.id,
          roleId: this.selectedRoleId,
          moduleId: this.selectedModuleId,
          menuId: menu.menuId,
          subMenuId: subMenu?.subMenuId || null,
          menuName: menu.menuName,
          subMenuName: subMenu?.subMenuName || '(Menu level)',
          menuIcon: menu.menuIcon,
          subMenuIcon: subMenu?.subMenuIcon,
          isPermitted: saved?.isPermitted ?? false,
          canView: saved?.canView ?? false,
          canCreate: saved?.canCreate ?? false,
          canEdit: saved?.canEdit ?? false,
          canUpdate: saved?.canUpdate ?? false,
          canDelete: saved?.canDelete ?? false,
          canPrint: saved?.canPrint ?? false,
          canExport: saved?.canExport ?? false,
          canApprove: saved?.canApprove ?? false
        });
      }
    }

    this.rows = rows;
    this.expandedMenuIds = new Set(this.menus.map(menu => menu.menuId));
    this.refreshVisibleRows();
    this.selectedRow = this.visibleRowsCache[0] || null;
  }

  get selectedRoleName(): string {
    return this.roles.find(role => role.id === this.selectedRoleId)?.name || 'No role selected';
  }

  get selectedModuleName(): string {
    return this.modules.find(module => module.moduleId === this.selectedModuleId)?.moduleName || 'No module selected';
  }

  refreshVisibleRows(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.visibleRowsCache = this.rows.filter(row => {
      const menuMatches = !this.selectedMenuId || this.selectedMenuId === 'all' || row.menuId === this.selectedMenuId;
      if (!menuMatches) return false;
      if (!term) return true;
      return row.menuName.toLowerCase().includes(term) || row.subMenuName.toLowerCase().includes(term);
    });

    this.groupedRowsCache = this.menus
      .filter(menu => !this.selectedMenuId || this.selectedMenuId === 'all' || menu.menuId === this.selectedMenuId)
      .map(menu => ({
        menu,
        rows: this.visibleRowsCache.filter(row => row.menuId === menu.menuId)
      }))
      .filter(group => group.rows.length > 0);
  }

  onSearchChange(): void {
    this.refreshVisibleRows();
    if (this.selectedRow && !this.visibleRowsCache.some(row => this.trackByRow(0, row) === this.trackByRow(0, this.selectedRow!))) {
      this.selectedRow = this.visibleRowsCache[0] || null;
    }
  }

  onMenuFilterChange(): void {
    this.refreshVisibleRows();
    this.selectedRow = this.visibleRowsCache[0] || null;
  }

  get selectedPath(): string {
    if (!this.selectedRow) return this.selectedModuleName;
    return `${this.selectedModuleName} > ${this.selectedRow.menuName} > ${this.selectedRow.subMenuName}`;
  }

  isExpanded(menuId: string): boolean {
    return this.expandedMenuIds.has(menuId);
  }

  toggleMenu(menuId: string): void {
    if (this.expandedMenuIds.has(menuId)) {
      this.expandedMenuIds.delete(menuId);
      return;
    }
    this.expandedMenuIds.add(menuId);
  }

  expandAll(): void {
    this.expandedMenuIds = new Set(this.menus.map(menu => menu.menuId));
  }

  collapseAll(): void {
    this.expandedMenuIds.clear();
  }

  selectRow(row: PermissionRow): void {
    this.selectedRow = row;
  }

  isSelected(row: PermissionRow): boolean {
    return !!this.selectedRow && this.trackByRow(0, this.selectedRow) === this.trackByRow(0, row);
  }

  applySelected(checked: boolean): void {
    if (!this.selectedRow) return;
    this.setAll(this.selectedRow, checked);
  }

  applySelectedReadOnly(): void {
    if (!this.selectedRow) return;
    this.setReadOnly(this.selectedRow);
  }

  applyToCurrentModule(checked: boolean): void {
    this.rows.forEach(row => this.setAll(row, checked));
    this.refreshVisibleRows();
  }

  applyReadOnlyToCurrentModule(): void {
    this.rows.forEach(row => this.setReadOnly(row));
    this.refreshVisibleRows();
  }

  applyToSelectedMenu(checked: boolean): void {
    if (!this.selectedRow) return;
    this.rows
      .filter(row => row.menuId === this.selectedRow!.menuId)
      .forEach(row => this.setAll(row, checked));
    this.refreshVisibleRows();
  }

  applyReadOnlyToSelectedMenu(): void {
    if (!this.selectedRow) return;
    this.rows
      .filter(row => row.menuId === this.selectedRow!.menuId)
      .forEach(row => this.setReadOnly(row));
    this.refreshVisibleRows();
  }

  setReadOnly(row: PermissionRow): void {
    this.setAll(row, false);
    row.isPermitted = true;
    row.canView = true;
  }

  getPermissionIcon(key: PermissionKey): string {
    const icons: Record<PermissionKey, string> = {
      canView: 'pi-eye',
      canCreate: 'pi-plus-circle',
      canEdit: 'pi-pencil',
      canUpdate: 'pi-refresh',
      canDelete: 'pi-trash',
      canPrint: 'pi-print',
      canExport: 'pi-download',
      canApprove: 'pi-verified'
    };
    return icons[key];
  }


  setAll(row: PermissionRow, checked: boolean): void {
    row.isPermitted = checked;
    for (const permission of this.permissions) {
      row[permission.key] = checked;
    }
  }

  togglePermission(row: PermissionRow): void {
    row.isPermitted = this.permissions.some(permission => row[permission.key]);
    if (row.canCreate || row.canEdit || row.canUpdate || row.canDelete || row.canPrint || row.canExport || row.canApprove) {
      row.canView = true;
      row.isPermitted = true;
    }
  }

  applyToVisible(checked: boolean): void {
    this.visibleRowsCache.forEach(row => this.setAll(row, checked));
    this.refreshVisibleRows();
  }

  applyColumn(permission: PermissionKey, checked: boolean): void {
    this.visibleRowsCache.forEach(row => {
      row[permission] = checked;
      this.togglePermission(row);
    });
    this.refreshVisibleRows();
  }


  getPermission(row: PermissionRow, key: PermissionKey): boolean {
    return row[key];
  }

  setPermission(row: PermissionRow, key: PermissionKey, value: boolean): void {
    row[key] = value;
    this.togglePermission(row);
  }


  clonePermissions(): void {
    this.error = '';
    this.success = '';

    if (!this.selectedRoleId) {
      this.error = 'Please select target role first.';
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: this.error });
      return;
    }
    if (!this.cloneSourceRoleId) {
      this.error = 'Please select source role to clone from.';
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: this.error });
      return;
    }
    if (this.cloneSourceRoleId === this.selectedRoleId) {
      this.error = 'Source role and target role must be different.';
      this.messageService.add({ severity: 'warn', summary: 'Invalid', detail: this.error });
      return;
    }

    const sourceName = this.roles.find(role => role.id === this.cloneSourceRoleId)?.name || 'Source Role';
    const targetName = this.roles.find(role => role.id === this.selectedRoleId)?.name || 'Target Role';
    const modeText = this.cloneOverwrite
      ? 'Existing target permissions will be overwritten.'
      : 'Only missing permissions will be copied. Existing target permissions will be kept.';

    this.confirmationService.confirm({
      header: 'Clone Role Permissions',
      message: `Clone all permissions from <b>${sourceName}</b> to <b>${targetName}</b>?<br><small>${modeText}</small>`,
      icon: 'pi pi-copy',
      acceptLabel: 'Yes, Clone',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.saving = true;
        this.api.post<{ saved?: number }>('/adm-role-permissions/clone', {
          sourceRoleId: this.cloneSourceRoleId,
          targetRoleId: this.selectedRoleId,
          overwriteExisting: this.cloneOverwrite
        })
          .pipe(finalize(() => this.saving = false))
          .subscribe({
            next: (result) => {
              this.success = `Permissions cloned successfully from ${sourceName} to ${targetName}. ${result?.saved ?? 0} record(s) copied.`;
              this.messageService.add({ severity: 'success', summary: 'Cloned', detail: this.success });
              this.mergeRolePermissions();
            },
            error: (err) => {
              this.error = err?.message || 'Failed to clone role permissions.';
              this.messageService.add({ severity: 'error', summary: 'Clone Failed', detail: this.error });
            }
          });
      }
    });
  }

  save(): void {
    this.error = '';
    this.success = '';

    if (!this.selectedRoleId) {
      this.error = 'Please select a role first.';
      return;
    }
    if (!this.selectedModuleId) {
      this.error = 'Please select a module first.';
      return;
    }

    const payload: RolePermissionItem[] = this.rows.map(row => ({
      roleId: this.selectedRoleId,
      moduleId: row.moduleId,
      menuId: row.menuId,
      subMenuId: row.subMenuId || null,
      isPermitted: row.isPermitted || row.canView,
      canView: row.canView,
      canCreate: row.canCreate,
      canEdit: row.canEdit,
      canUpdate: row.canUpdate,
      canDelete: row.canDelete,
      canPrint: row.canPrint,
      canExport: row.canExport,
      canApprove: row.canApprove
    }));

    this.saving = true;
    this.api.post<{ saved?: number }>('/adm-role-permissions/bulk', payload)
      .pipe(finalize(() => this.saving = false))
      .subscribe({
        next: (result) => {
          this.success = `Permissions saved successfully. ${result?.saved ?? payload.length} record(s) processed.`;
          this.mergeRolePermissions();
        },
        error: (err) => this.error = err?.message || 'Failed to save role permissions.'
      });
  }

  trackByRow(_: number, row: PermissionRow): string {
    return `${row.menuId}-${row.subMenuId || 'menu'}`;
  }

  private rowKey(menuId: string, subMenuId?: string | null): string {
    return `${menuId}|${subMenuId || ''}`;
  }

  private toPromise<T>(source: Observable<T>): Promise<T> {
    return firstValueFrom(source);
  }
}
