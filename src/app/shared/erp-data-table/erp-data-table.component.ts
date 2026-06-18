import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ErpDataTableColumn, ErpSortChange, ErpTableAction } from './erp-data-table.types';
import { ERP_UI_CONFIG } from '../../core/config/erp-ui.config';

export interface ErpPageChange {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-erp-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './erp-data-table.component.html',
  styleUrls: ['./erp-data-table.component.scss']
})
export class ErpDataTableComponent<T = any> implements OnChanges {
  @Input() title = '';
  @Input() searchPlaceholder = 'Search...';
  @Input() columns: ErpDataTableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() actions: ErpTableAction<T>[] = [];
  @Input() loading = false;
  @Input() showRefresh = true;
  @Input() showExport = true;
  @Input() pageSize: number = ERP_UI_CONFIG.defaultPageSize;
  @Input() pageSizeOptions: readonly number[] = ERP_UI_CONFIG.pageSizeOptions;
  @Input() totalRecords = 0;
  @Input() serverSide = true;

  @Output() refresh = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<ErpSortChange>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<ErpPageChange>();
  @Output() exportClick = new EventEmitter<'csv' | 'excel' | 'pdf'>();

  searchText = '';
  sortKey = '';
  sortDirection: 'asc' | 'desc' | '' = '';
  page = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageSize'] && this.pageSize < 1) {
      this.pageSize = ERP_UI_CONFIG.defaultPageSize;
    }
  }

  get visibleData(): T[] {
    return this.serverSide ? [...this.data] : this.filteredData;
  }

  get filteredData(): T[] {
    const text = this.searchText.trim().toLowerCase();
    let rows = !text ? [...this.data] : this.data.filter(row => JSON.stringify(row).toLowerCase().includes(text));
    if (this.sortKey && this.sortDirection) {
      rows = rows.sort((a: any, b: any) => {
        const column = this.columns.find(c => c.key === this.sortKey);
        const av = this.getCellValue(a, column);
        const bv = this.getCellValue(b, column);
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (this.sortDirection === 'asc' ? 1 : -1);
      });
    }
    return rows;
  }

  get pagedData(): T[] {
    if (this.serverSide) return this.data;
    const start = (this.page - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalEntries(): number {
    return this.serverSide ? this.totalRecords : this.filteredData.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalEntries / this.pageSize));
  }

  get fromEntry(): number {
    return this.totalEntries && this.pagedData.length ? ((this.page - 1) * this.pageSize + 1) : 0;
  }

  get toEntry(): number {
    return Math.min((this.page - 1) * this.pageSize + this.pagedData.length, this.totalEntries);
  }

  onSearch(value: string): void {
    this.searchText = value;
    this.page = 1;
    this.searchChange.emit(value);
  }

  onPageSizeChange(value: number): void {
    this.pageSize = Number(value ?? ERP_UI_CONFIG.defaultPageSize);
    this.page = 1;
    this.emitPageChange();
  }

  goToPage(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages);
    if (nextPage === this.page) return;
    this.page = nextPage;
    this.emitPageChange();
  }

  sort(column: ErpDataTableColumn<T>): void {
    if (!column.sortable) return;
    if (this.sortKey !== column.key) {
      this.sortKey = column.key;
      this.sortDirection = 'asc';
    } else {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
    }
    this.sortChange.emit({ key: this.sortKey, direction: this.sortDirection });
  }

  exportCsv(): void {
    this.exportClick.emit('csv');
    const headers = this.columns.map(c => c.header).join(',');
    const rows = this.visibleData.map((row: any) => this.columns.map(c => `"${String(this.getCellValue(row, c) ?? '').replace(/"/g, '""')}"`).join(','));
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.title || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  getCellValue(row: any, column?: ErpDataTableColumn<T>): any {
    if (!row || !column) return '';
    const keys = [column.key, ...(column.fallbackKeys || [])];
    for (const key of keys) {
      const value = this.readPath(row, String(key));
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  }

  private readPath(row: any, path: string): any {
    if (!path.includes('.')) {
      if (row[path] !== undefined) return row[path];
      const actualKey = Object.keys(row || {}).find(key => key.toLowerCase() === path.toLowerCase());
      return actualKey ? row[actualKey] : undefined;
    }
    return path.split('.').reduce((acc, part) => {
      if (acc == null) return undefined;
      if (acc[part] !== undefined) return acc[part];
      const actualKey = Object.keys(acc || {}).find(key => key.toLowerCase() === part.toLowerCase());
      return actualKey ? acc[actualKey] : undefined;
    }, row);
  }

  formatValue(value: any, type?: string): string {
    if (value === null || value === undefined || value === '') return '-';
    if (type === 'status') return this.isActiveStatus(value) ? 'Active' : 'Inactive';
    if (type === 'date') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    }
    return String(value);
  }

  isActiveStatus(value: any): boolean {
    if (typeof value === 'boolean') return value;
    const text = String(value ?? '').toLowerCase();
    return text === 'active' || text === 'true' || text === '1' || text === 'yes';
  }

  runAction(action: ErpTableAction<T>, row: T): void {
    action.handler?.(row);
  }

  private emitPageChange(): void {
    this.pageChange.emit({ page: this.page, pageSize: this.pageSize });
  }
}
