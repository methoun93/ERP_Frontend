import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../services/api-client.service';
import { ErpPageDefinition } from './erp-page-engine.types';
import { ERP_PAGE_REGISTRY } from './erp-page-registry';

@Injectable({ providedIn: 'root' })
export class ErpPageEngineService {
  constructor(private readonly api: ApiClientService) {}

  getPageDefinition(route: string): Observable<ErpPageDefinition> {
    const normalized = this.normalize(route);
    const local = ERP_PAGE_REGISTRY.find(x => this.normalize(x.route) === normalized);
    if (local) return of(local);

    // Backend future endpoint. Keep this route configurable on backend side.
    return this.api.get<ErpPageDefinition>(`/erp-page-definition?route=${encodeURIComponent(normalized)}`);
  }

  createEmptyDefinition(route: string): ErpPageDefinition {
    const last = this.normalize(route).split('/').filter(Boolean).pop() || 'dynamic-page';
    const title = last.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ');
    return {
      route,
      title,
      subtitle: 'No page configuration found yet. Add page config in DB or ERP_PAGE_REGISTRY.',
      pageType: 'master',
      layout: 'table-only',
      tables: []
    };
  }

  private normalize(route: string): string {
    const withoutQuery = route.split('?')[0].split('#')[0];
    const withoutErp = withoutQuery.startsWith('/erp/') ? withoutQuery.substring(4) : withoutQuery;
    return `/${withoutErp.replace(/^\/+|\/+$/g, '')}`.toLowerCase();
  }
}
