import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReportingApiService } from '../services/reporting-api.service';
import { RenderReportResponse, ReportElement, ReportLayout, ReportTableColumn } from '../models/reporting.models';

@Component({
  selector: 'app-report-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-preview.html',
  styleUrls: ['./report-preview.scss']
})
export class ReportPreview implements OnInit {
  loading = false;
  error = '';
  reportId = '';
  reportNo = '';
  reportKey = '';
  variantCode = 'DEFAULT';
  parametersJson = '{}';
  autoPrint = false;

  response?: RenderReportResponse;
  layout?: ReportLayout;
  rows: Record<string, unknown>[] = [];

  constructor(private readonly route: ActivatedRoute, private readonly api: ReportingApiService) {}

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    this.reportId = query.get('reportId') || '';
    this.reportNo = query.get('reportNo') || '';
    this.reportKey = query.get('reportKey') || '';
    this.variantCode = query.get('variantCode') || 'DEFAULT';
    this.parametersJson = query.get('parameters') || '{}';
    this.autoPrint = query.get('autoPrint') === '1';
    this.render();
  }

  render(): void {
    this.loading = true;
    this.error = '';

    const parameters = this.safeParseParameters();
    this.api.render({
      reportId: this.reportId || undefined,
      reportNo: this.reportNo || undefined,
      reportKey: this.reportKey || undefined,
      variantCode: this.variantCode || 'DEFAULT',
      parameters
    }).subscribe({
      next: result => {
        this.response = result;
        this.layout = this.normalizeLayout(result);
        this.rows = this.normalizeRows(result);
        this.loading = false;

        if (!this.layout) {
          this.error = 'Render API returned no saved LayoutJson. Save a template first, then preview again.';
          return;
        }
        if (this.autoPrint) {
          setTimeout(() => this.print(), 300);
        }
      },
      error: err => {
        this.error = err?.message || 'Could not render report from backend.';
        this.response = undefined;
        this.layout = undefined;
        this.rows = [];
        this.loading = false;
      }
    });
  }

  print(): void {
    if (!this.layout) return;
    const html = this.reportHtmlForExport();
    const preview = window.open('', '_blank', 'width=1100,height=820');
    if (!preview) {
      window.print();
      return;
    }
    preview.document.open();
    preview.document.write(html);
    preview.document.close();
    preview.focus();
    setTimeout(() => preview.print(), 250);
  }

  exportPdf(): void {
    // Browser print dialog can save as PDF without printing the ERP shell.
    this.print();
  }

  exportExcel(): void {
    const table = this.sortedElements.find(x => x.type === 'table');
    const columns = table ? this.displayColumns(table) : [];
    if (!columns.length || !this.rows.length) return;

    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      columns.map(column => escape(column.caption || column.field)).join(','),
      ...this.rows.map(row => columns.map(column => escape(this.value(row, column.field))).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.reportKey || this.reportNo || 'report'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  get pageWidth(): number {
    return this.layout?.pageSettings?.orientation === 'Landscape' ? 1123 : 794;
  }

  get pageHeight(): number {
    return this.layout?.pageSettings?.orientation === 'Landscape' ? 794 : 1123;
  }

  get titleText(): string {
    const report = this.readObject(this.response, 'report');
    const no = String(this.read(report, 'reportNo') || this.reportNo || this.reportKey || 'Report');
    const name = String(this.read(report, 'reportName') || '');
    return name ? `${no} - ${name}` : no;
  }

  get sortedElements(): ReportElement[] {
    return [...(this.layout?.elements || [])];
  }

  elementStyle(element: ReportElement): Record<string, string> {
    const style = element.style || {};
    return {
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      color: String(style['color'] || this.layout?.theme?.textColor || '#111827'),
      background: String(style['background'] || 'transparent'),
      fontSize: `${Number(style['fontSize'] || 12)}px`,
      fontWeight: String(style['fontWeight'] || 600),
      textAlign: String(style['textAlign'] || 'center'),
      borderColor: String(style['borderColor'] || this.layout?.theme?.borderColor || 'transparent'),
      justifyContent: this.justifyFromTextAlign(String(style['textAlign'] || 'center'))
    };
  }

  cellStyle(element: ReportElement, column: ReportTableColumn, row: Record<string, unknown>): Record<string, string> {
    const rule = (element.conditions || []).find(condition => condition.field?.toLowerCase() === column.field?.toLowerCase() && this.matchesCondition(row, condition));
    const styles: Record<string, string> = {};
    if (rule?.background) styles['background'] = String(rule.background);
    if (rule?.color) styles['color'] = String(rule.color);
    if (rule?.fontWeight) styles['fontWeight'] = String(rule.fontWeight);
    return styles;
  }


  tableHeaderStyle(element: ReportElement): Record<string, string | number> {
    return {
      background: this.layout?.theme?.headerBackground || '#0f3b75',
      color: this.layout?.theme?.headerTextColor || '#ffffff',
      borderColor: this.layout?.theme?.borderColor || '#cbd5e1',
      padding: `${this.tableCellPadding(element)}px`,
      lineHeight: '1.15'
    };
  }

  tableCellBaseStyle(element: ReportElement): Record<string, string | number> {
    return {
      borderColor: this.layout?.theme?.borderColor || '#cbd5e1',
      padding: `${this.tableCellPadding(element)}px`,
      lineHeight: '1.15'
    };
  }

  totalRowStyle(element: ReportElement): Record<string, string | number> {
    return {
      background: this.layout?.theme?.totalBackground || '#e2e8f0',
      borderColor: this.layout?.theme?.borderColor || '#cbd5e1',
      padding: `${this.tableCellPadding(element)}px`,
      lineHeight: '1.15'
    };
  }

  tableHeaderHeight(element: ReportElement): number {
    return this.styleNumber(element, 'tableHeaderHeight', 28);
  }

  tableRowHeight(element: ReportElement): number {
    return this.styleNumber(element, 'tableRowHeight', 26);
  }

  tableCellPadding(element: ReportElement): number {
    return this.styleNumber(element, 'tableCellPadding', 4);
  }

  tableFontSize(element: ReportElement): number {
    return this.styleNumber(element, 'tableFontSize', 11);
  }

  private styleNumber(element: ReportElement, key: string, fallback: number): number {
    const value = element.style?.[key];
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
  }

  renderText(element: ReportElement, row?: Record<string, unknown>): string {
    const source = element.text || (element.field ? `[${element.field}]` : element.label || '');
    return this.bindText(source, row || this.firstRow);
  }

  imageSource(element: ReportElement): string {
    const raw = element.imageUrl || element.text || '';
    const bound = this.bindText(raw, this.firstRow).trim();
    return bound && !bound.startsWith('[') ? bound : '';
  }

  tableRows(_: ReportElement): Record<string, unknown>[] {
    return this.rows.length ? this.rows : [];
  }

  displayColumns(element: ReportElement): ReportTableColumn[] {
    return (element.columns || []).filter(column => column.visible !== false);
  }

  value(row: Record<string, unknown>, field: string): unknown {
    return this.getValue(row, field) ?? '';
  }

  total(element: ReportElement, column: ReportTableColumn): number | string {
    if (!column.aggregate) return '';
    const values = this.rows.map(row => Number(this.getValue(row, column.field) || 0));
    if (column.aggregate === 'count') return this.rows.length;
    if (!values.length) return 0;
    if (column.aggregate === 'avg') return this.formatNumber(values.reduce((sum, value) => sum + value, 0) / values.length);
    if (column.aggregate === 'min') return this.formatNumber(Math.min(...values));
    if (column.aggregate === 'max') return this.formatNumber(Math.max(...values));
    return this.formatNumber(values.reduce((sum, value) => sum + value, 0));
  }

  hasTotal(element: ReportElement): boolean {
    return !!element.columns?.some(column => !!column.aggregate);
  }

  trackByElementId(_: number, item: ReportElement): string {
    return item.id;
  }

  private get firstRow(): Record<string, unknown> {
    return this.rows[0] || {};
  }

  private bindText(text: string, row: Record<string, unknown>): string {
    const now = new Date();
    let result = text
      .replace(/{{\s*page\s*}}/gi, '1')
      .replace(/{{\s*pages\s*}}/gi, '1')
      .replace(/{{\s*printDate\s*}}/gi, now.toLocaleString())
      .replace(/{{\s*printedBy\s*}}/gi, this.getPrintedBy());

    result = result.replace(/\[\s*sum\s*:\s*([^\]]+)\]/gi, (_, field: string) => {
      const sum = this.rows.reduce((total, item) => total + Number(this.getValue(item, field.trim()) || 0), 0);
      return this.formatNumber(sum);
    });

    result = result.replace(/\[\s*count\s*:\s*([^\]]+)\]/gi, () => String(this.rows.length));

    result = result.replace(/\[([^\]]+)\]/g, (_, field: string) => {
      const value = this.getValue(row, field.trim());
      return value === null || value === undefined ? '' : String(value);
    });

    return result;
  }

  private getValue(row: Record<string, unknown>, field: string): unknown {
    if (!row || !field) return undefined;
    if (Object.prototype.hasOwnProperty.call(row, field)) return row[field];
    const normalized = field.toLowerCase();
    const key = Object.keys(row).find(item => item.toLowerCase() === normalized);
    return key ? row[key] : undefined;
  }

  private formatNumber(value: number): string {
    return Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';
  }

  private safeParseParameters(): Record<string, unknown> {
    try {
      const parsed = JSON.parse(this.parametersJson || '{}');
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  private normalizeLayout(result: RenderReportResponse): ReportLayout | undefined {
    const direct = this.read(result, 'layout') as ReportLayout | undefined;
    if (direct) return direct;

    const directJson = this.read(result, 'layoutJson');
    const fromDirectJson = this.parseLayout(directJson);
    if (fromDirectJson) return fromDirectJson;

    const template = this.readObject(result, 'template');
    const fromTemplate = this.parseLayout(this.read(template, 'layoutJson'));
    if (fromTemplate) return fromTemplate;

    return undefined;
  }

  private normalizeRows(result: RenderReportResponse): Record<string, unknown>[] {
    const raw = this.read(result, 'data') as unknown;
    if (Array.isArray(raw)) return raw as Record<string, unknown>[];
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      const candidates = [obj['rows'], obj['Rows'], obj['items'], obj['Items'], obj['data'], obj['Data'], obj['table'], obj['Table']];
      const found = candidates.find(Array.isArray);
      if (Array.isArray(found)) return found as Record<string, unknown>[];
    }
    return [];
  }

  private parseLayout(value: unknown): ReportLayout | undefined {
    if (!value) return undefined;
    if (typeof value === 'object') return value as ReportLayout;
    if (typeof value !== 'string') return undefined;
    try {
      return JSON.parse(value) as ReportLayout;
    } catch {
      return undefined;
    }
  }

  private readObject(source: unknown, key: string): Record<string, unknown> | undefined {
    const value = this.read(source, key);
    return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
  }

  private read(source: unknown, key: string): unknown {
    if (!source || typeof source !== 'object') return undefined;
    const obj = source as Record<string, unknown>;
    if (key in obj) return obj[key];
    const pascal = key.charAt(0).toUpperCase() + key.slice(1);
    if (pascal in obj) return obj[pascal];
    const found = Object.keys(obj).find(item => item.toLowerCase() === key.toLowerCase());
    return found ? obj[found] : undefined;
  }

  private justifyFromTextAlign(value: string): string {
    if (value === 'left') return 'flex-start';
    if (value === 'right') return 'flex-end';
    return 'center';
  }


  private reportHtmlForExport(): string {
    const paper = document.querySelector('.paper')?.cloneNode(true) as HTMLElement | null;
    const content = paper?.outerHTML || '';
    return `<!doctype html><html><head><title>${this.titleText}</title><style>${this.printCss()}</style></head><body><section class="print-host">${content}</section></body></html>`;
  }

  private printCss(): string {
    const orientation = this.layout?.pageSettings?.orientation?.toLowerCase() || 'portrait';
    const pageSize = this.layout?.pageSettings?.pageSize || 'A4';
    return `
      * { box-sizing: border-box; }
      body { margin: 0; background: #fff; font-family: Arial, sans-serif; color: #111827; }
      .print-host { width: 100%; display: flex; justify-content: center; }
      .paper { position: relative; width: ${this.pageWidth}px; height: ${this.pageHeight}px; background: #fff; overflow: hidden; margin: 0 auto; border: 0 !important; box-shadow: none !important; }
      .element { position: absolute; overflow: hidden; padding: 4px; display: flex; align-items: center; justify-content: center; border: 1px solid transparent; white-space: pre-wrap; }
      .element.table { padding: 0 !important; border: 0 !important; }
      .element img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
      .element table { width: 100%; height: 100%; border-collapse: collapse; border-spacing: 0; font-size: 11px; table-layout: fixed; }
      .element th { background: ${this.layout?.theme?.headerBackground || '#0f3b75'}; color: ${this.layout?.theme?.headerTextColor || '#fff'}; border: 1px solid ${this.layout?.theme?.borderColor || '#cbd5e1'}; padding: 4px; line-height: 1.15; }
      .element td { border: 1px solid ${this.layout?.theme?.borderColor || '#cbd5e1'}; padding: 4px; line-height: 1.15; }
      .element td.right { text-align: right; }
      .element td.center { text-align: center; }
      .total-row td { background: ${this.layout?.theme?.totalBackground || '#e2e8f0'}; font-weight: 800; }
      @page { size: ${pageSize} ${orientation}; margin: 0; }
    `;
  }

  private getPrintedBy(): string {
    const row = this.firstRow;
    const printedBy = this.getValue(row, 'PrintedBy') || this.getValue(row, 'CreatedBy') || this.getValue(row, 'Username');
    return printedBy ? String(printedBy) : 'Current User';
  }

  private matchesCondition(row: Record<string, unknown>, condition: { field: string; operator: string; value: string | number | boolean }): boolean {
    const actual = this.getValue(row, condition.field);
    const expected = condition.value;
    const actualNumber = Number(actual);
    const expectedNumber = Number(expected);
    switch (condition.operator) {
      case 'eq': return String(actual) === String(expected);
      case 'ne': return String(actual) !== String(expected);
      case 'gt': return actualNumber > expectedNumber;
      case 'gte': return actualNumber >= expectedNumber;
      case 'lt': return actualNumber < expectedNumber;
      case 'lte': return actualNumber <= expectedNumber;
      case 'contains': return String(actual || '').toLowerCase().includes(String(expected || '').toLowerCase());
      default: return false;
    }
  }
}
