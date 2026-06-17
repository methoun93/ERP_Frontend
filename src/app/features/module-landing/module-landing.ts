import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ErpNavigationService } from '../../core/navigation/erp-navigation.service';
import { TokenStoreService } from '../../core/services/token-store.service';

@Component({
  standalone: true,
  selector: 'app-module-landing',
  imports: [CommonModule, RouterLink],
  templateUrl: './module-landing.html',
  styleUrl: './module-landing.scss',
})
export class ModuleLanding {
  modules: any[] = [];
  context: any;
  user: any;

  constructor(
    private readonly navigation: ErpNavigationService,
    private readonly tokenStore: TokenStoreService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.modules = this.navigation.getModules();
    this.context = this.tokenStore.getContext();
    this.user = this.tokenStore.getUser();
  }

  selectModule(moduleKey: string): void {
    this.tokenStore.setModule(moduleKey);
  }

  changeCompany(): void {
    this.tokenStore.clearContext();
    this.router.navigateByUrl('/company-gateway');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
