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

  fallbackReports: RptReport[] = [
    { id: 'demo-po', reportNo: 'MER-RPT-000001', reportKey: 'PO_PRINT', reportName: 'Purchase Order Print', moduleName: 'Merchandising', procedureName: 'rpt_Merchandising_OrderPrint', reportType: 'LAYOUT', isActive: true },
    { id: 'demo-invoice', reportNo: 'COM-RPT-000001', reportKey: 'COMMERCIAL_INVOICE', reportName: 'Commercial Invoice', moduleName: 'Commercial', procedureName: 'rpt_Commercial_Invoice', reportType: 'LAYOUT', isActive: true },
    { id: 'demo-stock', reportNo: 'INV-RPT-000001', reportKey: 'STOCK_POSITION', reportName: 'Stock Position', moduleName: 'Inventory', procedureName: 'rpt_Stock_Position', reportType: 'GRID', isActive: true }
  ];

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
        this.reports = this.fallbackReports;
        this.loading = false;
      }
    });
  }

  openBuilder(report?: RptReport): void {
    const url = report?.id ? ['/erp/reporting/builder', report.id] : ['/erp/reporting/builder'];
    this.router.navigate(url);
  }

  openPreview(report: RptReport): void {
    this.router.navigate(['/erp/reporting/preview'], { queryParams: { reportId: report.id, reportKey: report.reportKey } });
  }
}
