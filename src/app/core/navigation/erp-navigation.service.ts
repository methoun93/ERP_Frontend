import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, map, of, switchMap, tap } from 'rxjs';
import { apiRoutes } from '../auth/api-routes';
import { ApiClientService } from '../services/api-client.service';
import { BreadcrumbItem, MenuDto, ModuleDto, SubMenuDto } from './erp-navigation.models';

type AnyRow = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class ErpNavigationService {
  private readonly modulesSubject = new BehaviorSubject<ModuleDto[]>([]);
  private readonly breadcrumbsSubject = new BehaviorSubject<BreadcrumbItem[]>([
    { label: 'Home', url: '/erp/workspace' },
    { label: 'Dashboard', url: '/erp/workspace' },
  ]);
  private loadingStarted = false;
  private readonly treeLoading = new Set<string>();

  readonly modules$ = this.modulesSubject.asObservable();
  readonly breadcrumbs$ = this.breadcrumbsSubject.asObservable();

  constructor(private readonly router: Router, private readonly api: ApiClientService) {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.breadcrumbsSubject.next(this.buildBreadcrumbs(event.urlAfterRedirects));
    });
  }

  loadFromApi(force = false): Observable<ModuleDto[]> {
    if (this.loadingStarted && !force) return of(this.getModules());
    this.loadingStarted = true;

    return this.api.get<unknown>(apiRoutes.auth.modules).pipe(
      map((response) => this.extractArray(response, ['data', 'Data', 'result', 'Result', 'items', 'Items', 'modules', 'Modules'])),
      map((rows) => this.normalizeModules(rows.map((row) => this.mapModule(row)))),
      tap((modules) => this.setModulesFromApi(modules)),
      catchError((error) => {
        console.error('Navigation modules API failed.', error);
        this.setModulesFromApi([]);
        return of([]);
      })
    );
  }

  getModules(): ModuleDto[] {
    return this.modulesSubject.value;
  }

  setModulesFromApi(modules: ModuleDto[]): void {
    this.modulesSubject.next(this.normalizeModules(modules));
    this.breadcrumbsSubject.next(this.buildBreadcrumbs(this.router.url));
  }

  getModule(key: string | null | undefined): ModuleDto | undefined {
    if (!key) return undefined;
    return this.getModules().find((module) => module.key === key || module.id === key || this.toSlug(module.title) === key || this.cleanUrl(module.route).endsWith(`/${key}`));
  }

  getMenus(key: string | null | undefined): MenuDto[] {
    return this.getModule(key)?.menus ?? [];
  }


  getModuleFromUrl(url: string): ModuleDto | undefined {
    const clean = this.cleanUrl(url);
    const parts = clean.split('/').filter(Boolean);
    const erpIndex = parts.indexOf('erp');
    const moduleKey = erpIndex >= 0 ? parts[erpIndex + 1] : undefined;
    if (!moduleKey || moduleKey === 'workspace' || moduleKey === 'dashboard' || moduleKey === 'not-found') return undefined;

    const modules = [...this.getModules()].sort((a, b) => this.cleanUrl(b.route).length - this.cleanUrl(a.route).length);

    return modules.find((module) => {
      const route = this.cleanUrl(module.route);
      return module.key === moduleKey
        || module.id === moduleKey
        || this.toSlug(module.title) === moduleKey
        || route === `/erp/${moduleKey}`
        || route.endsWith(`/${moduleKey}`)
        || this.sameOrChildUrl(clean, route);
    });
  }

  loadTreeForModule(module: ModuleDto): Observable<ModuleDto> {
    const current = this.getModule(module.id) ?? module;
    if ((current.menus?.length ?? 0) > 0) return of(current);
    if (this.treeLoading.has(current.id)) return of(current);

    this.treeLoading.add(current.id);
    const moduleId = encodeURIComponent(current.id);

    return this.api.get<unknown>(`${apiRoutes.auth.tree}?moduleId=${moduleId}`).pipe(
      map((response) => {
        const menus = this.mapMenusFromTree(response, current);
        const updated: ModuleDto = { ...current, menus };
        this.replaceModule(updated);
        return updated;
      }),
      catchError((error) => {
        console.error(`Navigation tree API failed for module ${current.title}.`, error);
        const updated: ModuleDto = { ...current, menus: [] };
        this.replaceModule(updated);
        return of(updated);
      }),
      tap(() => this.treeLoading.delete(current.id))
    );
  }

  findByUrl(url: string): { module?: ModuleDto; menu?: MenuDto; subMenu?: SubMenuDto } {
    const cleanUrl = this.cleanUrl(url);

    for (const module of this.getModules()) {
      for (const menu of module.menus ?? []) {
        for (const subMenu of menu.subMenus ?? []) {
          if (subMenu.route && this.sameOrChildUrl(cleanUrl, subMenu.route)) return { module, menu, subMenu };
        }
      }
    }

    for (const module of this.getModules()) {
      for (const menu of module.menus ?? []) {
        if (menu.route && this.sameOrChildUrl(cleanUrl, menu.route)) return { module, menu };
      }
    }

    for (const module of this.getModules()) {
      if (module.route && this.cleanUrl(module.route) === cleanUrl) return { module };
    }

    const module = this.getModuleFromUrl(cleanUrl);
    return module ? { module } : {};
  }

  isKnownErpUrl(url: string): boolean {
    const cleanUrl = this.cleanUrl(url);
    if (cleanUrl === '/erp' || cleanUrl === '/erp/workspace' || cleanUrl === '/erp/dashboard') return true;
    const found = this.findByUrl(cleanUrl);
    return !!found.module || !!this.getModuleFromUrl(cleanUrl);
  }

  setBreadcrumbsForSelection(module?: ModuleDto, menu?: MenuDto, subMenu?: SubMenuDto): void {
    const crumbs: BreadcrumbItem[] = [{ label: 'Home', url: '/erp/workspace' }];

    if (!module) {
      this.breadcrumbsSubject.next([...crumbs, { label: 'Dashboard', url: '/erp/workspace' }]);
      return;
    }

    crumbs.push({ label: module.title, url: module.route || null });
    if (menu) crumbs.push({ label: menu.title, url: menu.route || null });
    if (subMenu) crumbs.push({ label: subMenu.title, url: subMenu.route || null });

    this.breadcrumbsSubject.next(crumbs);
  }

  buildBreadcrumbs(url: string): BreadcrumbItem[] {
    const crumbs: BreadcrumbItem[] = [{ label: 'Home', url: '/erp/workspace' }];
    const cleanUrl = this.cleanUrl(url);

    if (cleanUrl === '/erp' || cleanUrl === '/erp/workspace' || cleanUrl === '/' || cleanUrl === '/erp/dashboard') {
      return [...crumbs, { label: 'Dashboard', url: '/erp/workspace' }];
    }

    if (cleanUrl === '/not-found' || cleanUrl === '/erp/not-found') {
      return [...crumbs, { label: 'Page Not Found' }];
    }

    const found = this.findByUrl(cleanUrl);
    const fallbackModule = found.module ?? this.getModuleFromUrl(cleanUrl);

    if (fallbackModule) {
      crumbs.push({ label: fallbackModule.title, url: fallbackModule.route || null });
      if (found.menu) crumbs.push({ label: found.menu.title, url: found.menu.route || null });
      if (found.subMenu) crumbs.push({ label: found.subMenu.title, url: found.subMenu.route || null });
      return crumbs;
    }

    return [...crumbs, { label: 'Page Not Found' }];
  }

  resolveUrlAfterTree(url: string): Observable<{ module?: ModuleDto; menu?: MenuDto; subMenu?: SubMenuDto }> {
    const clean = this.cleanUrl(url);
    const resolveNow = (): Observable<{ module?: ModuleDto; menu?: MenuDto; subMenu?: SubMenuDto }> => {
      const existing = this.findByUrl(clean);
      if (existing.subMenu || existing.menu) return of(existing);

      const module = existing.module ?? this.getModuleFromUrl(clean);
      if (!module) return of({});

      return this.loadTreeForModule(module).pipe(
        map((loadedModule) => {
          const found = this.findByUrl(clean);
          return found.module ? found : { module: loadedModule };
        })
      );
    };

    if (this.getModules().length) return resolveNow();
    return this.loadFromApi().pipe(switchMap(() => resolveNow()));
  }

  private replaceModule(updated: ModuleDto): void {
    const modules = this.getModules().map((module) => (module.id === updated.id ? updated : module));
    this.modulesSubject.next(this.normalizeModules(modules));
    this.breadcrumbsSubject.next(this.buildBreadcrumbs(this.router.url));
  }

  private mapMenusFromTree(tree: unknown, module: ModuleDto): MenuDto[] {
    const rows = this.extractArray(tree, [
      'data', 'Data', 'result', 'Result', 'value', 'Value',
      'menus', 'Menus', 'mainMenus', 'MainMenus', 'menuTreeLists', 'MenuTreeLists', 'menuTrees', 'MenuTrees', 'items', 'Items', 'tree', 'Tree',
    ]);

    let menuRows = rows;
    if (rows.length === 1) {
      const nested = this.extractArray(rows[0], ['menus', 'Menus', 'mainMenus', 'MainMenus', 'menuTreeLists', 'MenuTreeLists', 'items', 'Items', 'children', 'Children']);
      if (nested.length) menuRows = nested;
    }

    return menuRows
      .map((row) => this.mapMenu(row, module))
      .filter((menu) => menu.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  private mapModule(row: unknown): ModuleDto {
    const item = this.asObject(row);
    const title = this.text(item, ['moduleName', 'ModuleName', 'name', 'Name', 'title', 'Title']) || 'Module';
    const id = this.text(item, ['moduleId', 'ModuleId', 'id', 'Id', 'moduleID', 'ModuleID']) || this.toSlug(title);
    const route = this.route(this.text(item, ['moduleRoute', 'ModuleRoute', 'route', 'Route', 'url', 'Url']), `/erp/${this.toSlug(title)}`);

    return {
      id,
      key: this.toSlug(this.text(item, ['moduleKey', 'ModuleKey', 'key', 'Key']) || title || id),
      title,
      subtitle: this.text(item, ['subtitle', 'Subtitle', 'description', 'Description']),
      icon: this.icon(this.text(item, ['moduleIcon', 'ModuleIcon', 'icon', 'Icon']), 'pi pi-folder'),
      route,
      menus: [],
      isActive: this.bool(item, ['isActive', 'IsActive', 'active', 'Active'], true),
      sortOrder: this.num(item, ['sortOrder', 'SortOrder', 'displayOrder', 'DisplayOrder', 'slNo', 'SlNo']),
    };
  }

  private mapMenu(row: unknown, module: ModuleDto): MenuDto {
    const item = this.asObject(row);
    const title = this.text(item, ['menuName', 'MenuName', 'mainMenuName', 'MainMenuName', 'name', 'Name', 'title', 'Title']) || 'Menu';
    const id = this.text(item, ['menuId', 'MenuId', 'mainMenuId', 'MainMenuId', 'id', 'Id']) || this.toSlug(title);
    const route = this.route(this.text(item, ['menuRoute', 'MenuRoute', 'mainMenuRoute', 'MainMenuRoute', 'route', 'Route', 'url', 'Url']), `${module.route}/${this.toSlug(title)}`);

    return {
      id,
      title,
      icon: this.icon(this.text(item, ['menuIcon', 'MenuIcon', 'mainMenuIcon', 'MainMenuIcon', 'icon', 'Icon']), 'pi pi-circle'),
      route,
      subMenus: this.mapSubMenus(item, route),
      isActive: this.bool(item, ['isActive', 'IsActive', 'active', 'Active'], true),
      sortOrder: this.num(item, ['sortOrder', 'SortOrder', 'displayOrder', 'DisplayOrder', 'slNo', 'SlNo']),
    };
  }

  private mapSubMenus(menuRow: AnyRow, menuRoute: string): SubMenuDto[] {
    const rows = this.firstArray(menuRow, ['subMenus', 'SubMenus', 'submenus', 'Submenus', 'subMenuLists', 'SubMenuLists', 'submenuLists', 'SubmenuLists', 'subMenuTreeLists', 'SubMenuTreeLists', 'children', 'Children', 'items', 'Items']);
    return rows
      .map((row) => {
        const item = this.asObject(row);
        const title = this.text(item, ['subMenuName', 'SubMenuName', 'submenuName', 'SubmenuName', 'name', 'Name', 'title', 'Title']) || 'Submenu';
        const id = this.text(item, ['subMenuId', 'SubMenuId', 'submenuId', 'SubmenuId', 'id', 'Id']) || this.toSlug(title);
        return {
          id,
          title,
          icon: this.icon(this.text(item, ['subMenuIcon', 'SubMenuIcon', 'submenuIcon', 'SubmenuIcon', 'icon', 'Icon']), 'pi pi-angle-right'),
          route: this.route(this.text(item, ['subMenuRoute', 'SubMenuRoute', 'submenuRoute', 'SubmenuRoute', 'route', 'Route', 'url', 'Url']), `${menuRoute}/${this.toSlug(title)}`),
          isActive: this.bool(item, ['isActive', 'IsActive', 'active', 'Active'], true),
          sortOrder: this.num(item, ['sortOrder', 'SortOrder', 'displayOrder', 'DisplayOrder', 'slNo', 'SlNo']),
        };
      })
      .filter((subMenu) => subMenu.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  private normalizeModules(modules: ModuleDto[]): ModuleDto[] {
    return (modules ?? [])
      .filter((module) => module?.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((module) => ({
        ...module,
        key: module.key || this.toSlug(module.title || module.id),
        route: this.route(module.route, `/erp/${module.key || this.toSlug(module.title || module.id)}`),
        icon: this.icon(module.icon, 'pi pi-folder'),
        menus: (module.menus ?? [])
          .filter((menu) => menu?.isActive !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((menu) => ({
            ...menu,
            icon: this.icon(menu.icon, 'pi pi-circle'),
            route: menu.route ? this.route(menu.route, `${module.route}/${this.toSlug(menu.title)}`) : undefined,
            subMenus: (menu.subMenus ?? [])
              .filter((subMenu) => subMenu?.isActive !== false)
              .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((subMenu) => ({
                ...subMenu,
                icon: this.icon(subMenu.icon, 'pi pi-angle-right'),
                route: this.route(subMenu.route, `${menu.route || module.route}/${this.toSlug(subMenu.title)}`),
              })),
          })),
      }));
  }

  private extractArray(value: unknown, keys: string[]): AnyRow[] {
    if (Array.isArray(value)) return value.map((item) => this.asObject(item));

    const obj = this.asObject(value);
    for (const key of keys) {
      const nested = obj[key];
      if (Array.isArray(nested)) return nested.map((item) => this.asObject(item));
      if (nested && typeof nested === 'object') {
        const nestedArray = this.extractArray(nested, keys);
        if (nestedArray.length) return nestedArray;
      }
    }

    return [];
  }

  private firstArray(row: AnyRow, keys: string[]): AnyRow[] {
    for (const key of keys) {
      const value = row[key];
      if (Array.isArray(value)) return value.map((item) => this.asObject(item));
    }
    return [];
  }

  private text(row: AnyRow, keys: string[]): string {
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
    return '';
  }

  private num(row: AnyRow, keys: string[]): number | undefined {
    const value = this.text(row, keys);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private bool(row: AnyRow, keys: string[], fallback: boolean): boolean {
    const value = this.text(row, keys);
    if (!value) return fallback;
    return !['false', '0', 'no', 'inactive'].includes(value.toLowerCase());
  }

  private icon(value: string | undefined, fallback: string): string {
    const icon = (value || '').trim();
    if (!icon) return fallback;
    if (icon.includes(' ')) return icon;
    if (icon.startsWith('pi-')) return `pi ${icon}`;
    return `pi pi-${icon}`;
  }

  private route(value: string | undefined, fallback: string): string {
    const rawRoute = (value || '').trim();
    const route = rawRoute || fallback;
    if (/^https?:\/\//i.test(route)) return route;

    const absoluteRoute = route.startsWith('/') ? route : `/${route}`;
    if (absoluteRoute === '/erp' || absoluteRoute.startsWith('/erp/')) return absoluteRoute;
    if (absoluteRoute === '/workspace' || absoluteRoute === '/dashboard') return `/erp${absoluteRoute}`;

    return `/erp${absoluteRoute}`;
  }

  private sameOrChildUrl(current: string, base: string): boolean {
    if (!base) return false;
    const normalizedBase = this.cleanUrl(base).replace(/\/$/, '');
    return current === normalizedBase || current.startsWith(`${normalizedBase}/`);
  }

  private cleanUrl(url: string): string {
    return (url || '/').split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  }

  private toSlug(value: string): string {
    return (value || 'module')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'module';
  }

  private asObject(value: unknown): AnyRow {
    return value && typeof value === 'object' ? (value as AnyRow) : {};
  }
}
