import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { ErpNavigationService } from '../../../core/navigation/erp-navigation.service';
import { MenuDto, ModuleDto } from '../../../core/navigation/erp-navigation.models';
import { ErpShellUiService } from '../../../core/navigation/erp-shell-ui.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  modules: ModuleDto[] = [];
  activeModule?: ModuleDto;
  openMenus = new Set<string>();
  collapsed = false;
  loadingModuleId?: string;

  constructor(
    private readonly navigation: ErpNavigationService,
    private readonly router: Router,
    private readonly shellUi: ErpShellUiService
  ) {
    this.modules = this.navigation.getModules();

    this.navigation.modules$.subscribe((modules) => {
      this.modules = modules;
      this.syncFromRoute();
    });

    this.shellUi.sidebarCollapsed$.subscribe((collapsed: boolean) => (this.collapsed = collapsed));
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => this.syncFromRoute());
    this.syncFromRoute();
  }

  openModule(module: ModuleDto): void {
    this.activeModule = { ...module, menus: module.menus ?? [] };
    this.openMenus.clear();
    this.loadingModuleId = module.id;
    this.navigation.setBreadcrumbsForSelection(this.activeModule);

    if (module.route && this.router.url.split('?')[0].split('#')[0] !== module.route) {
      this.router.navigateByUrl(module.route);
    }

    this.navigation.loadTreeForModule(module).subscribe((loadedModule) => {
      this.activeModule = { ...loadedModule, menus: loadedModule.menus ?? [] };
      this.loadingModuleId = undefined;
      this.navigation.setBreadcrumbsForSelection(this.activeModule);
    });
  }

  toggleMenu(menu: MenuDto, event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();

    const key = this.menuKey(menu);
    if (this.openMenus.has(key)) {
      this.openMenus.delete(key);
      if (this.activeModule) this.navigation.setBreadcrumbsForSelection(this.activeModule);
      return;
    }

    this.openMenus.add(key);
    if (this.activeModule) this.navigation.setBreadcrumbsForSelection(this.activeModule, menu);
  }

  isMenuOpen(menu: MenuDto): boolean {
    return this.openMenus.has(this.menuKey(menu));
  }


  isSubMenuActive(route: string | null | undefined): boolean {
    if (!route) return false;
    const current = this.router.url.split('?')[0].split('#')[0].replace(/\/$/, '');
    const base = route.split('?')[0].split('#')[0].replace(/\/$/, '');
    return current === base || current.startsWith(`${base}/`);
  }

  showAllModules(): void {
    this.activeModule = undefined;
    this.openMenus.clear();
    this.navigation.setBreadcrumbsForSelection();
    if (this.router.url.split('?')[0].split('#')[0] !== '/erp/workspace') {
      this.router.navigateByUrl('/erp/workspace');
    }
  }

  toggleSidebar(): void {
    this.shellUi.toggleSidebar();
  }

  private syncFromRoute(): void {
    const url = this.router.url.split('?')[0].split('#')[0];
    if (url === '/erp/workspace' || url === '/erp/dashboard' || url === '/erp' || url === '/' || url === '/erp/not-found') {
      this.activeModule = undefined;
      this.openMenus.clear();
      if (url === '/erp/workspace' || url === '/erp/dashboard' || url === '/erp' || url === '/') this.navigation.setBreadcrumbsForSelection();
      return;
    }

    const module = this.navigation.getModuleFromUrl(url) ?? this.navigation.findByUrl(url).module;
    if (!module) {
      this.activeModule = undefined;
      this.openMenus.clear();
      return;
    }

    const currentModule = this.modules.find((item) => item.id === module.id) ?? module;
    this.activeModule = currentModule;

    if ((currentModule.menus?.length ?? 0) === 0) {
      this.loadingModuleId = currentModule.id;
      this.navigation.loadTreeForModule(currentModule).subscribe((loadedModule) => {
        this.loadingModuleId = undefined;
        this.activeModule = loadedModule;
        this.applyRouteSelection(url, loadedModule);
      });
      return;
    }

    this.applyRouteSelection(url, currentModule);
  }

  private applyRouteSelection(url: string, module: ModuleDto): void {
    const found = this.navigation.findByUrl(url);
    this.openMenus.clear();
    if (found.menu) this.openMenus.add(`${module.id}:${found.menu.id}`);
    this.navigation.setBreadcrumbsForSelection(module, found.menu, found.subMenu);
  }

  private menuKey(menu: MenuDto): string {
    return `${this.activeModule?.id ?? 'module'}:${menu.id}`;
  }
}
