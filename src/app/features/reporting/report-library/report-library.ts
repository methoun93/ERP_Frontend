import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportingApiService } from '../services/reporting-api.service';
import { RptReport } from '../models/reporting.models';

@Component({
  selector: 'app-report-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-library.html',
  styleUrls: ['./report-library.scss']
})
export class ReportLibrary implements OnInit {
  loading = false;
  error = '';
  searchText = '';
  moduleFilter = 'All';
  reports: RptReport[] = [];

  constructor(private readonly api: ReportingApiService, private readonly router: Router) {}

  ngOnInit(): void {
    this.loadReports();
  }

  get modules(): string[] {
    const names = this.reports.map(x => x.moduleName || 'General');
    return ['All', ...Array.from(new Set(names))];
  }

  get filteredReports(): RptReport[] {
    const keyword = this.searchText.trim().toLowerCase();
    return this.reports.filter(report => {
      const moduleName = report.moduleName || 'General';
      const matchModule = this.moduleFilter === 'All' || moduleName === this.moduleFilter;
      const matchText = !keyword || [report.reportNo, report.reportKey, report.reportName, moduleName, report.procedureName]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(keyword));
      return matchModule && matchText;
    });
  }

  loadReports(): void {
    this.loading = true;
    this.error = '';
    this.api.getReports().subscribe({
      next: reports => {
        this.reports = reports?.length ? reports : [];
        this.loading = false;
      },
      error: err => {
        this.error = err?.message || 'Could not load reports.';
        this.reports = [];
        this.loading = false;
      }
    });
  }

  openBuilder(report?: RptReport): void {
    const url = report?.id ? ['/erp/reporting/builder', report.id] : ['/erp/reporting/builder'];
    this.router.navigate(url);
  }

  cloneReport(report: RptReport): void {
    if (!report.id) return;
    if (!confirm(`Clone report ${report.reportNo || report.reportName}?`)) return;

    this.api.cloneReport(report.id).subscribe({
      next: result => {
        this.router.navigate(['/erp/reporting/builder', result.reportId]);
      },
      error: err => {
        this.error = err?.message || 'Could not clone report.';
      }
    });
  }

  openPreview(report: RptReport): void {
    this.router.navigate(['/erp/reporting/preview'], { queryParams: { reportId: report.id || '', reportNo: report.reportNo || '', reportKey: report.reportKey || '', variantCode: 'DEFAULT' } });
  }

  printReport(report: RptReport): void {
    this.router.navigate(['/erp/reporting/preview'], { queryParams: { reportId: report.id || '', reportNo: report.reportNo || '', reportKey: report.reportKey || '', variantCode: 'DEFAULT', autoPrint: '1' } });
  }
}
