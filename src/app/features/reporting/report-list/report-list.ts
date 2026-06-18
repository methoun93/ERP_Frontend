import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportingApiService } from '../core/reporting-api.service';
import { ReportListItem } from '../core/reporting.models';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './report-list.html',
  styleUrl: './report-list.scss',
})
export class ReportList implements OnInit {
  reports: ReportListItem[] = [];
  loading = false;
  error = '';

  constructor(private readonly api: ReportingApiService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.error = '';
    this.api.getReports().subscribe({
      next: (reports) => {
        this.reports = reports;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Report list load failed.';
        this.loading = false;
      },
    });
  }
}
