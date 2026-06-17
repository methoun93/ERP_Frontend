import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
import { ErpNavigationService } from '../../core/navigation/erp-navigation.service';
import { BreadcrumbItem } from '../../core/navigation/erp-navigation.models';

@Component({
  selector: 'app-erp-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, Header, Sidebar],
  templateUrl: './erp-shell.html',
  styleUrl: './erp-shell.scss',
})
export class ErpShell implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private readonly navigation: ErpNavigationService, private readonly router: Router) {
    this.navigation.breadcrumbs$.subscribe((items) => (this.breadcrumbs = items));
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.ensureTreeForUrl(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    this.navigation.loadFromApi().subscribe(() => this.ensureTreeForUrl(this.router.url));
  }

  goBreadcrumb(item: BreadcrumbItem, last: boolean, event: MouseEvent): void {
    event.preventDefault();
    const targetUrl = item.url || '/erp/workspace';

    if (targetUrl === '/erp/workspace') {
      this.navigation.setBreadcrumbsForSelection();
      this.router.navigateByUrl('/erp/workspace');
      return;
    }

    this.navigation.resolveUrlAfterTree(targetUrl).subscribe((found) => {
      if (found.module) {
        this.navigation.setBreadcrumbsForSelection(found.module, found.menu, found.subMenu);
        this.router.navigateByUrl(targetUrl);
        return;
      }

      this.navigation.setBreadcrumbsForSelection();
      this.router.navigateByUrl('/erp/workspace');
    });
  }

  breadcrumbUrl(item: BreadcrumbItem, last: boolean): string | null {
    return item.url || '/erp/workspace';
  }

  private ensureTreeForUrl(url: string): void {
    const clean = url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
    if (clean === '/erp/workspace' || clean === '/erp/dashboard' || clean === '/erp' || clean === '/') {
      this.navigation.setBreadcrumbsForSelection();
      return;
    }

    this.navigation.resolveUrlAfterTree(clean).subscribe((found) => {
      if (found.module) {
        this.navigation.setBreadcrumbsForSelection(found.module, found.menu, found.subMenu);
      } else {
        this.navigation.setBreadcrumbsForSelection();
        this.router.navigateByUrl('/erp/not-found');
      }
    });
  }
}
