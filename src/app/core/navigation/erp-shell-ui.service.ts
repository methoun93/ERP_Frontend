import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ErpShellUiService {
  private readonly collapsedSubject = new BehaviorSubject<boolean>(document.body.classList.contains('erp-sidebar-collapsed'));
  readonly sidebarCollapsed$ = this.collapsedSubject.asObservable();

  toggleSidebar(): void {
    this.setCollapsed(!this.collapsedSubject.value);
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsedSubject.next(collapsed);
    document.body.classList.toggle('erp-sidebar-collapsed', collapsed);
  }
}
