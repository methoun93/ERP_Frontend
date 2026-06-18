import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ReportingApiService } from '../core/reporting-api.service';
import { ReportParameter, ReportRenderResponse, ReportVariant } from '../core/reporting.models';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-viewer.html',
  styleUrl: './report-viewer.scss',
})
export class ReportViewer implements OnInit {
  reportKey = '';
  variantCode = '';
  variants: ReportVariant[] = [];
  parameters: ReportParameter[] = [];
  parameterValues: Record<string, unknown> = {};
  report?: ReportRenderResponse;
  loading = false;
  error = '';

  constructor(private readonly route: ActivatedRoute, private readonly api: ReportingApiService) {}

  ngOnInit(): void {
    this.reportKey = this.route.snapshot.paramMap.get('reportKey') || '';
    if (!this.reportKey) return;
    this.loading = true;
    forkJoin({
      variants: this.api.getVariants(this.reportKey),
      parameters: this.api.getParameters(this.reportKey),
    }).subscribe({
      next: ({ variants, parameters }) => {
        this.variants = variants;
        this.parameters = parameters;
        this.variantCode = variants.find((x) => x.isDefault)?.variantCode || variants[0]?.variantCode || '';
        for (const parameter of parameters) this.parameterValues[parameter.parameterName] = parameter.defaultValue ?? null;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Report metadata load failed.';
        this.loading = false;
      },
    });
  }

  preview(): void {
    this.loading = true;
    this.error = '';
    this.api.render({ reportKey: this.reportKey, variantCode: this.variantCode, parameters: this.parameterValues }).subscribe({
      next: (report) => {
        this.report = report;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Report render failed.';
        this.loading = false;
      },
    });
  }

  print(): void {
    window.print();
  }

  value(row: Record<string, unknown>, field: string): unknown {
    return row[field] ?? '';
  }
}
