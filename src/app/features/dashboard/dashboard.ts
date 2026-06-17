import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErpNavigationService } from '../../core/navigation/erp-navigation.service';
import { MenuDto, ModuleDto, SubMenuDto } from '../../core/navigation/erp-navigation.models';
import { TokenStoreService } from '../../core/services/token-store.service';

type DashboardMode = 'workspace' | 'module' | 'menu' | 'submenu' | 'not-found';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  modules: ModuleDto[] = [];
  activeModule?: ModuleDto;
  activeMenu?: MenuDto;
  activeSubMenu?: SubMenuDto;
  context: any;
  user: any;
  mode: DashboardMode = 'workspace';

  private paramSubscription?: Subscription;
  private modulesSubscription?: Subscription;

  stats = [
    { label: 'Employees', value: '1,240', note: '+12 this month', icon: 'pi pi-users', tone: 'green' },
    { label: 'Active Orders', value: '342', note: '28 delayed', icon: 'pi pi-shopping-bag', tone: 'amber' },
    { label: 'Payroll', value: '৳ 4.2M', note: '+4.8%', icon: 'pi pi-money-bill', tone: 'green' },
  ];

  activities = [
    { title: 'New PO — Yarn Purchase', meta: 'PO-2024 · ৳2.4M', time: '1h ago', tone: 'green' },
    { title: 'Payroll Processed', meta: '1,198 employees', time: '2h ago', tone: 'green' },
    { title: 'Shipment — ZARA', meta: '12,000 pcs', time: '3h ago', tone: 'amber' },
    { title: 'QC Failed — Line 7', meta: 'Defect rate 4.2%', time: '4h ago', tone: 'red' },
  ];

  productionRows = [
    { day: 'Mon', value: '3,999', width: 92, warning: false },
    { day: 'Tue', value: '4,128', width: 96, warning: false },
    { day: 'Wed', value: '4,300', width: 100, warning: false },
    { day: 'Thu', value: '3,784', width: 84, warning: true },
    { day: 'Fri', value: '4,171', width: 97, warning: false },
  ];

  summary = [
    { label: 'Purchase Orders', value: '320', icon: 'pi pi-file-edit' },
    { label: 'Goods Received', value: '280', icon: 'pi pi-truck' },
    { label: 'Pending Payments', value: '45', icon: 'pi pi-credit-card' },
    { label: 'Sales Orders', value: '540', icon: 'pi pi-clipboard' },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly navigation: ErpNavigationService,
    private readonly tokenStore: TokenStoreService
  ) {
    this.context = this.tokenStore.getContext();
    this.user = this.tokenStore.getUser();
  }

  ngOnInit(): void {
    this.modulesSubscription = this.navigation.modules$.subscribe((modules) => {
      this.modules = modules;
      this.resolvePage();
    });

    this.paramSubscription = this.route.paramMap.subscribe(() => this.resolvePage());
    this.navigation.loadFromApi().subscribe(() => this.resolvePage());
  }

  ngOnDestroy(): void {
    this.paramSubscription?.unsubscribe();
    this.modulesSubscription?.unsubscribe();
  }

  private resolvePage(): void {
    const url = this.router.url.split('?')[0].split('#')[0];
    this.activeModule = undefined;
    this.activeMenu = undefined;
    this.activeSubMenu = undefined;

    if (url === '/erp/workspace' || url === '/erp/dashboard' || url === '/erp' || url === '/') {
      this.mode = 'workspace';
      return;
    }

    if (!this.modules.length) return;

    const module = this.navigation.getModuleFromUrl(url) ?? this.navigation.findByUrl(url).module;
    if (!module) {
      this.mode = 'workspace';
      this.router.navigateByUrl('/erp/workspace');
      return;
    }

    if ((module.menus?.length ?? 0) === 0) {
      this.navigation.loadTreeForModule(module).subscribe(() => this.resolvePage());
      this.activeModule = module;
      this.mode = 'module';
      return;
    }

    const found = this.navigation.findByUrl(url);
    this.activeModule = found.module ?? module;
    this.activeMenu = found.menu;
    this.activeSubMenu = found.subMenu;

    const clean = url.replace(/\/$/, '');
    if (this.activeSubMenu) this.mode = 'submenu';
    else if (this.activeMenu) this.mode = 'menu';
    else if (this.activeModule && this.activeModule.route && this.activeModule.route.replace(/\/$/, '') === clean) this.mode = 'module';
    else {
      this.mode = 'workspace';
      this.router.navigateByUrl('/erp/workspace');
    }
  }

  get companyName(): string {
    return this.context?.companyName || this.user?.companyName || 'Pakiza Knit Composite Limited';
  }

  get areaName(): string {
    return this.context?.areaName || this.user?.areaName || 'SAVAR';
  }

  get userName(): string {
    return this.user?.fullName || this.user?.username || 'admin';
  }

  get pageTitle(): string {
    if (this.mode === 'not-found') return 'Page Not Found';
    if (this.activeSubMenu) return this.activeSubMenu.title;
    if (this.activeMenu) return this.activeMenu.title;
    if (this.activeModule) return `${this.activeModule.title} Dashboard`;
    return 'Dashboard';
  }

  get pageSubtitle(): string {
    if (this.mode === 'not-found') return 'The requested ERP page is not available or not assigned in navigation.';
    if (this.activeSubMenu) return `${this.activeModule?.title || 'Module'} / ${this.activeMenu?.title || 'Menu'} workspace`;
    if (this.activeMenu) return `${this.activeModule?.title || 'Module'} menu workspace`;
    if (this.activeModule) return this.activeModule.subtitle || 'Module dashboard and quick navigation';
    return 'Today\'s ERP overview and quick access across all modules.';
  }

  get menuCards(): MenuDto[] {
    return this.activeModule?.menus || [];
  }

  get submenuCards(): SubMenuDto[] {
    return this.activeMenu?.subMenus || [];
  }
}
