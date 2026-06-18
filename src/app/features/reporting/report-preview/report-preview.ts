import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReportingApiService } from '../services/reporting-api.service';

@Component({
  selector: 'app-report-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-preview.html',
  styleUrls: ['./report-preview.scss']
})
export class ReportPreview {
  loading = false;
  error = '';
  reportKey = '';
  variantCode = 'DEFAULT';
  orderId = 'PO-2024-00001';

  rows = [
    { itemCode: 'ITEM-001', itemDescription: 'Cotton Fabric', uom: 'MTR', qty: 1000, rate: 2.5, amount: 2500 },
    { itemCode: 'ITEM-002', itemDescription: 'Polyester Fabric', uom: 'MTR', qty: 2000, rate: 1.8, amount: 3600 },
    { itemCode: 'ITEM-003', itemDescription: 'Thread', uom: 'PCS', qty: 500, rate: 1, amount: 500 }
  ];

  constructor(private readonly route: ActivatedRoute, private readonly api: ReportingApiService) {
    this.reportKey = this.route.snapshot.queryParamMap.get('reportKey') || 'PO_PRINT';
  }

  get totalAmount(): number {
    return this.rows.reduce((sum, row) => sum + row.amount, 0);
  }

  render(): void {
    this.loading = true;
    this.error = '';
    this.api.render({ reportKey: this.reportKey, variantCode: this.variantCode, parameters: { orderId: this.orderId } }).subscribe({
      next: () => this.loading = false,
      error: err => {
        this.error = err?.message || 'Could not render report.';
        this.loading = false;
      }
    });
  }

  print(): void {
    window.print();
  }
}
