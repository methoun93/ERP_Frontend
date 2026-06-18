import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { ChangePasswordRequest, CompanyContextArea, CompanyContextCompany } from '../../../core/auth/auth.models';
import { TokenStoreService } from '../../../core/services/token-store.service';
import { ErpNavigationService } from '../../../core/navigation/erp-navigation.service';
import { ErpShellUiService } from '../../../core/navigation/erp-shell-ui.service';
import { BreadcrumbItem, ModuleDto } from '../../../core/navigation/erp-navigation.models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];
  modules: ModuleDto[] = [];
  userMenuOpen = false;
  moduleMenuOpen = false;
  user: any;
  context: any;

  switchModalOpen = false;
  profileModalOpen = false;
  passwordModalOpen = false;

  companies: CompanyContextCompany[] = [];
  areas: CompanyContextArea[] = [];
  selectedCompanyId = '';
  selectedAreaId = '';
  loadingCompanies = false;
  loadingAreas = false;
  switchingContext = false;

  passwordModel: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  changingPassword = false;

  constructor(
    private readonly tokenStore: TokenStoreService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly navigation: ErpNavigationService,
    private readonly shellUi: ErpShellUiService,
    private readonly notification: NotificationService
  ) {
    this.refreshLocalState();
    this.modules = this.navigation.getModules();
    this.navigation.modules$.subscribe((modules) => (this.modules = modules));
    this.navigation.breadcrumbs$.subscribe((items) => (this.breadcrumbs = items));
  }

  ngOnInit(): void {
    this.auth.me().subscribe({
      next: (me: any) => {
        const normalized = this.normalizeUser(me);
        if (normalized) {
          this.tokenStore.setUser({ ...(this.tokenStore.getUser() ?? {}), ...normalized });
          this.refreshLocalState();
        }
      },
      error: () => void 0,
    });
  }

  get displayName(): string {
    return this.user?.fullName || this.user?.username || 'admin';
  }

  get roleName(): string {
    const value = this.user?.roleName || this.user?.primaryRoleName || this.user?.roleDisplayName || this.user?.role;
    return this.looksLikeGuid(value) ? 'Administrator' : (value || 'Administrator');
  }

  get avatarText(): string {
    return (this.displayName || 'A').trim().charAt(0).toUpperCase();
  }

  get avatarUrl(): string {
    const raw = this.user?.profileImageUrl || this.user?.profileImagePath || this.user?.avatarUrl || '';
    return this.toAssetUrl(raw);
  }

  get signatureUrl(): string {
    const raw = this.user?.signatureImageUrl || this.user?.signatureImagePath || '';
    return this.toAssetUrl(raw);
  }

  get companyName(): string {
    return this.context?.companyName || this.user?.companyName || 'Select Company';
  }

  get areaName(): string {
    return this.context?.areaName || this.user?.areaName || 'Select Area';
  }

  breadcrumbUrl(item: BreadcrumbItem, last: boolean): string | null {
    return last ? null : item.url ?? null;
  }

  toggleSidebar(): void {
    this.shellUi.toggleSidebar();
  }

  goModule(module: ModuleDto): void {
    this.moduleMenuOpen = false;
    this.router.navigateByUrl(module.route);
  }

  goHome(): void {
    this.router.navigateByUrl('/erp/workspace');
  }

  openSwitchCompany(): void {
    this.userMenuOpen = false;
    this.switchModalOpen = true;
    this.selectedCompanyId = String(this.context?.companyId || this.user?.companyId || '');
    this.selectedAreaId = String(this.context?.areaId || this.user?.areaId || '');
    this.loadCompaniesForSwitch();
  }

  openProfile(): void {
    this.userMenuOpen = false;
    this.profileModalOpen = true;
  }

  openChangePassword(): void {
    this.userMenuOpen = false;
    this.passwordModel = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordModalOpen = true;
  }

  loadCompaniesForSwitch(): void {
    this.loadingCompanies = true;
    this.auth.companies().subscribe({
      next: (items) => {
        this.companies = items ?? [];
        if (!this.selectedCompanyId && this.companies.length) {
          this.selectedCompanyId = String(this.companies[0].companyId);
        }
        this.loadAreasForSwitch(true);
      },
      error: (err) => this.notification.error(err, 'Company Load Failed'),
      complete: () => (this.loadingCompanies = false),
    });
  }

  loadAreasForSwitch(keepCurrentArea = false): void {
    this.areas = [];
    if (!this.selectedCompanyId) {
      this.selectedAreaId = '';
      return;
    }

    const previousAreaId = keepCurrentArea ? this.selectedAreaId : '';
    this.loadingAreas = true;
    this.auth.areas(this.selectedCompanyId).subscribe({
      next: (items) => {
        this.areas = items ?? [];
        const hasPrevious = previousAreaId && this.areas.some((area) => String(area.areaId) === String(previousAreaId));
        this.selectedAreaId = hasPrevious ? previousAreaId : (this.areas.length ? String(this.areas[0].areaId) : '');
      },
      error: (err) => this.notification.error(err, 'Area Load Failed'),
      complete: () => (this.loadingAreas = false),
    });
  }

  saveContextSwitch(): void {
    if (!this.selectedCompanyId || !this.selectedAreaId) {
      this.notification.warning('Please select company and area.', 'Selection Required');
      return;
    }

    this.switchingContext = true;
    this.auth.selectContext({ companyId: this.selectedCompanyId, areaId: this.selectedAreaId }).subscribe({
      next: () => {
        this.refreshLocalState();
        this.switchModalOpen = false;
        this.notification.success('Company and area switched successfully.', 'Context Switched');
        this.navigation.loadFromApi(true).subscribe({ error: () => void 0 });
        this.router.navigateByUrl('/erp/workspace');
      },
      error: (err) => this.notification.error(err, 'Switch Company Failed'),
      complete: () => (this.switchingContext = false),
    });
  }

  changePassword(): void {
    if (!this.passwordModel.currentPassword || !this.passwordModel.newPassword || !this.passwordModel.confirmPassword) {
      this.notification.warning('Please fill all password fields.', 'Required');
      return;
    }
    if (this.passwordModel.newPassword !== this.passwordModel.confirmPassword) {
      this.notification.warning('New password and confirm password do not match.', 'Mismatch');
      return;
    }

    this.changingPassword = true;
    this.auth.changePassword(this.passwordModel).subscribe({
      next: () => {
        this.passwordModalOpen = false;
        this.notification.success('Password changed successfully.', 'Password Updated');
      },
      error: (err) => this.notification.error(err, 'Change Password Failed'),
      complete: () => (this.changingPassword = false),
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  private refreshLocalState(): void {
    this.user = this.tokenStore.getUser();
    this.context = this.tokenStore.getContext();
  }

  private normalizeUser(source: any): any {
    const user = source?.user ?? source;
    if (!user || typeof user !== 'object') return null;
    return {
      id: String(user.id ?? user.userId ?? this.user?.id ?? ''),
      userId: String(user.userId ?? user.id ?? this.user?.userId ?? ''),
      username: user.username ?? this.user?.username,
      fullName: user.fullName ?? user.name ?? user.displayName ?? this.user?.fullName,
      email: user.email ?? this.user?.email,
      role: user.role ?? user.roleId ?? this.user?.role,
      roleName: user.roleName ?? user.primaryRoleName ?? user.roleDisplayName ?? this.user?.roleName,
      primaryRoleName: user.primaryRoleName ?? this.user?.primaryRoleName,
      profileImageUrl: user.profileImageUrl ?? user.profileImagePath ?? user.avatarUrl ?? this.user?.profileImageUrl,
      signatureImageUrl: user.signatureImageUrl ?? user.signatureImagePath ?? this.user?.signatureImageUrl,
      companyId: user.companyId ?? this.user?.companyId,
      companyName: user.companyName ?? this.user?.companyName,
      areaId: user.areaId ?? this.user?.areaId,
      areaName: user.areaName ?? this.user?.areaName,
    };
  }

  private looksLikeGuid(value: unknown): boolean {
    return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }

  private toAssetUrl(path: string): string {
    if (!path) return '';
    if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
    const apiRoot = environment.apiBaseUrl.replace(/\/api\/?$/i, '');
    return `${apiRoot}${path.startsWith('/') ? path : '/' + path}`;
  }
}
