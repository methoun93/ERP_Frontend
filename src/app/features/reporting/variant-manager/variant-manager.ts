import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportingApiService } from '../core/reporting-api.service';
import { ReportVariant } from '../core/reporting.models';

@Component({
  selector: 'app-report-variant-manager',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './variant-manager.html',
  styleUrl: './variant-manager.scss',
})
export class ReportVariantManager implements OnInit {
  reportKey = '';
  variants: ReportVariant[] = [];
  loading = false;
  error = '';

  constructor(private readonly route: ActivatedRoute, private readonly api: ReportingApiService) {}

  ngOnInit(): void {
    this.reportKey = this.route.snapshot.paramMap.get('reportKey') || '';
    if (!this.reportKey) return;
    this.loading = true;
    this.api.getVariants(this.reportKey).subscribe({
      next: (variants) => {
        this.variants = variants;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Variant load failed.';
        this.loading = false;
      },
    });
  }
}
