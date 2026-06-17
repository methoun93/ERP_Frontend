import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ErpNavigationService } from '../../core/navigation/erp-navigation.service';
import { ErpPageEngineService } from '../../core/page-engine/erp-page-engine.service';
import { ErpPageDefinition } from '../../core/page-engine/erp-page-engine.types';
import { CrudMasterComponent, CrudMasterConfig } from '../../shared/components/crud-master.component';

@Component({
  selector: 'app-dynamic-erp-page',
  standalone: true,
  imports: [CommonModule, CrudMasterComponent],
  templateUrl: './dynamic-erp-page.html',
  styleUrl: './dynamic-erp-page.scss',
})
export class DynamicErpPage implements OnInit, OnDestroy {
  currentUrl = '';
  title = 'ERP Page';
  pageConfig?: CrudMasterConfig;
  loading = false;
  error = '';
  private subscription?: Subscription;
  private pageSub?: Subscription;

  constructor(
    private readonly router: Router,
    private readonly navigation: ErpNavigationService,
    private readonly pageEngine: ErpPageEngineService
  ) {}

  ngOnInit(): void {
    this.applyUrl(this.router.url);
    this.subscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.applyUrl(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.pageSub?.unsubscribe();
  }

  private applyUrl(url: string): void {
    this.currentUrl = this.cleanUrl(url);
    const baseRoute = this.baseRoute(this.currentUrl);
    const found = this.navigation.findByUrl(baseRoute);
    this.title = found.subMenu?.title || found.menu?.title || found.module?.title || this.toTitle(baseRoute.split('/').filter(Boolean).pop() || 'ERP Page');

    this.loading = true;
    this.error = '';
    this.pageSub?.unsubscribe();
    this.pageSub = this.pageEngine.getPageDefinition(baseRoute).subscribe({
      next: (definition) => {
        this.pageConfig = this.toCrudConfig(definition, baseRoute);
        this.loading = false;
      },
      error: (err) => {
        this.pageConfig = undefined;
        this.error = err?.message || 'No page configuration found.';
        this.loading = false;
      }
    });
  }

  private toCrudConfig(def: ErpPageDefinition, route: string): CrudMasterConfig {
    const table = def.tables?.[0];
    const fields = def.form?.sections?.flatMap(section => section.fields) || [];
    const endpoint = def.form?.api?.list || table?.api?.list || (def as any).endpoint || '';
    return {
      route,
      title: def.title,
      subtitle: def.subtitle,
      endpoint,
      idKey: ((def as any).idKey || 'id') as any,
      fields: fields as any,
      sections: (def.form?.sections || []) as any,
      tableColumns: (table?.columns || []) as any,
      gridCols: (def.form?.sections?.[0]?.columns as any) || 3,
      pageSize: table?.pageSize || 10,
      searchPlaceholder: table?.searchPlaceholder,
      permissions: {
        view: def.permission,
        create: def.actions?.find(a => a.key === 'add')?.permission,
        update: table?.actions?.find(a => a.key === 'edit')?.permission,
        delete: table?.actions?.find(a => a.key === 'delete')?.permission,
        export: def.actions?.find(a => a.key === 'export')?.permission,
      },
      actions: def.actions as any,
      initialValue: def.form?.initialValue
    };
  }

  private baseRoute(url: string): string {
    const clean = this.cleanUrl(url);
    return clean
      .replace(/\/create$/i, '')
      .replace(/\/edit\/[^/]+$/i, '')
      .replace(/\/view\/[^/]+$/i, '');
  }

  private cleanUrl(url: string): string {
    return (url || '/').split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  }

  private toTitle(value: string): string {
    return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}
