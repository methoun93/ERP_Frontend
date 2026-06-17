import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ERP_NAVIGATION } from '../../shared/config/erp-navigation';

interface ErpNavChild {
  label: string;
  route: string;
}

interface ErpNavGroup {
  label: string;
  icon: string;
  route?: string;
  children?: ErpNavChild[];
}

interface ErpNavModule {
  label: string;
  key: string;
  route: string;
  groups: ErpNavGroup[];
}

@Component({
  selector: 'app-module-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './module-page.html',
  styleUrl: './module-page.scss',
})
export class ModulePage {
  module: ErpNavModule | undefined;
  groups: ErpNavGroup[] = [];
  moduleKey = '';
  pageTitle = '';
  pageSubtitle = '';
  pageType = '';

  constructor(private readonly route: ActivatedRoute) {
    this.moduleKey = this.route.snapshot.data['moduleKey'] as string || '';
    this.pageTitle = this.route.snapshot.data['title'] as string || 'ERP Module';
    this.pageSubtitle = this.route.snapshot.data['subtitle'] as string || '';
    this.pageType = this.route.snapshot.data['pageType'] as string || '';

    // Load module and its groups
    if (this.moduleKey) {
      this.module = ERP_NAVIGATION.find(m => m.key === this.moduleKey);
      this.groups = this.module?.groups || [];
    }
  }
}
