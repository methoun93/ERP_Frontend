import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReportingApiService } from '../services/reporting-api.service';
import { RptReport } from '../models/reporting.models';

@Component({
  selector: 'app-reporting-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporting-dashboard.html',
  styleUrls: ['./reporting-dashboard.scss']
})
export class ReportingDashboard implements OnInit {
  loading = false;
  reports: RptReport[] = [];

  readonly quickActions = [
    {
      title: 'Report Library',
      description: 'Browse all module-wise reports and open preview/design screens.',
      icon: 'pi pi-folder-open',
      route: '/erp/reporting/library'
    },
    {
      title: 'Report Builder',
      description: 'Design printable reports with template, variant, parameter and page setup.',
      icon: 'pi pi-pencil',
      route: '/erp/reporting/builder'
    },
    {
      title: 'Print Preview',
      description: 'Open report preview and print/export output.',
      icon: 'pi pi-print',
      route: '/erp/reporting/preview'
    }
  ];

  constructor(private readonly api: ReportingApiService, private readonly router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.getReports().subscribe({
      next: reports => {
        this.reports = reports ?? [];
        this.loading = false;
      },
      error: () => {
        this.reports = [];
        this.loading = false;
      }
    });
  }

  get totalReports(): number {
    return this.reports.length;
  }

  get layoutReports(): number {
    return this.reports.filter(report => (report.reportType || '').toUpperCase() === 'LAYOUT').length;
  }

  get gridReports(): number {
    return this.reports.filter(report => (report.reportType || '').toUpperCase() === 'GRID').length;
  }

  get activeReports(): number {
    return this.reports.filter(report => report.isActive !== false).length;
  }

  open(route: string): void {
    this.router.navigateByUrl(route);
  }
}
