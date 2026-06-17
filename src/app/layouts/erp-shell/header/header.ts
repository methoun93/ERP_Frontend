import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { TokenStoreService } from '../../../core/services/token-store.service';
import { ErpNavigationService } from '../../../core/navigation/erp-navigation.service';
import { ErpShellUiService } from '../../../core/navigation/erp-shell-ui.service';
import { BreadcrumbItem, ModuleDto } from '../../../core/navigation/erp-navigation.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  breadcrumbs: BreadcrumbItem[] = [];
  modules: ModuleDto[] = [];
  userMenuOpen = false;
  moduleMenuOpen = false;
  user: any;
  context: any;

  constructor(
    private readonly tokenStore: TokenStoreService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly navigation: ErpNavigationService,
    private readonly shellUi: ErpShellUiService
  ) {
    this.user = this.tokenStore.getUser();
    this.context = this.tokenStore.getContext();
    this.modules = this.navigation.getModules();
    this.navigation.modules$.subscribe((modules) => (this.modules = modules));
    this.navigation.breadcrumbs$.subscribe((items) => (this.breadcrumbs = items));
  }

  get displayName(): string {
    return this.user?.fullName || this.user?.username || 'admin';
  }

  get roleName(): string {
    return this.user?.role || 'Administrator';
  }

  get avatarText(): string {
    return (this.displayName || 'A').trim().charAt(0).toUpperCase();
  }

  get companyName(): string {
    return this.context?.companyName || this.user?.companyName || 'Pakiza Knit Composite Limited';
  }

  get areaName(): string {
    return this.context?.areaName || this.user?.areaName || 'SAVAR';
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

  switchCompany(): void {
    this.userMenuOpen = false;
    this.router.navigateByUrl('/company-gateway');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
