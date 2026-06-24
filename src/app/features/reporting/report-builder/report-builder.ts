import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ReportingApiService } from '../services/reporting-api.service';
import { ReportElement, ReportLayout, ReportTableColumn } from '../models/reporting.models';

type SectionKey = 'reportHeader' | 'pageHeader' | 'details' | 'groupFooter' | 'reportFooter' | 'pageFooter';
type BuilderTool = 'pointer' | 'text' | 'field' | 'line' | 'rectangle' | 'image' | 'barcode' | 'table';

interface DesignerElement extends ReportElement {
  band: SectionKey;
  style: Record<string, any>;
}

interface BandDef {
  key: SectionKey;
  title: string;
  top: number;
  height: number;
}

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-builder.html',
  styleUrls: ['./report-builder.scss']
})
export class ReportBuilder implements OnInit {
  reportId = '';
  reportName = 'New Report';
  procedureName = 'sp_SalesSummary';
  activeTab: 'design' | 'format' | 'pageSetup' = 'design';
  selectedTool: BuilderTool = 'pointer';
  zoom = 100;

  availableFields: string[] = [];
  selectedFields: string[] = [];
  searchText = '';
  isLoadingFields = false;
  statusMessage = '';

  elements: DesignerElement[] = [];
  selectedElement?: DesignerElement;
  previewRows: Record<string, any>[] = [];
  showPreview = true;

  private dragStart?: { id: string; x: number; y: number; elementX: number; elementY: number };
  private resizeStart?: { id: string; x: number; y: number; width: number; height: number };

  bands: BandDef[] = [
    { key: 'reportHeader', title: 'Report Header', top: 0, height: 90 },
    { key: 'pageHeader', title: 'Page Header', top: 90, height: 70 },
    { key: 'details', title: 'Details', top: 160, height: 80 },
    { key: 'groupFooter', title: 'Group Footer', top: 240, height: 55 },
    { key: 'reportFooter', title: 'Report Footer', top: 295, height: 55 },
    { key: 'pageFooter', title: 'Page Footer', top: 350, height: 70 }
  ];

  readonly commonStoredProcedures = [
    'sp_SalesSummary',
    'rpt_Administration_UserRoleReport',
    'sp_PurchaseSummary',
    'sp_StockLedger',
    'sp_CustomerLedger'
  ];

  private readonly fallbackFieldMap: Record<string, string[]> = {
    sp_SalesSummary: ['InvoiceNo', 'SaleDate', 'CustomerName', 'ProductName', 'Quantity', 'UnitPrice', 'Discount', 'TotalAmount'],
    rpt_Administration_UserRoleReport: ['Username', 'EmpId', 'Email', 'RoleName', 'AreaName', 'StatusName'],
    sp_PurchaseSummary: ['PurchaseNo', 'PurchaseDate', 'SupplierName', 'ItemName', 'Quantity', 'Rate', 'Amount'],
    sp_StockLedger: ['TranDate', 'ItemName', 'OpeningQty', 'ReceiveQty', 'IssueQty', 'ClosingQty'],
    sp_CustomerLedger: ['TranDate', 'VoucherNo', 'CustomerName', 'Debit', 'Credit', 'Balance']
  };

  layout: ReportLayout = {
    version: 2,
    pageSettings: {
      pageSize: 'A4', orientation: 'Portrait', marginTop: 12, marginRight: 12, marginBottom: 12, marginLeft: 12,
      showPageNo: true, showPrintDate: true, showPrintedBy: true, repeatHeader: true, pageBreakAfterGroup: false, keepRowTogether: true
    },
    theme: {
      primaryColor: '#0d6efd', headerBackground: '#003b75', headerTextColor: '#ffffff', borderColor: '#cbd5e1',
      textColor: '#111827', tableAltRowBackground: '#f8fafc', groupHeaderBackground: '#e0f2fe', totalBackground: '#e2e8f0'
    },
    dataSource: { procedureName: this.procedureName, fields: [], groupBy: '' },
    elements: []
  };

  constructor(private readonly reportingApi: ReportingApiService, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.reportId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id') || '';
    this.loadFields();
  }

  get filteredFields(): string[] {
    const q = this.searchText.trim().toLowerCase();
    return q ? this.availableFields.filter(x => x.toLowerCase().includes(q)) : this.availableFields;
  }

  get pageWidth(): number { return this.layout.pageSettings.orientation === 'Landscape' ? 1123 : 794; }
  get pageHeight(): number { return this.layout.pageSettings.orientation === 'Landscape' ? 794 : 1123; }
  get canvasHeight(): number { return this.bands[this.bands.length - 1].top + this.bands[this.bands.length - 1].height; }

  setProcedure(value: string): void {
    this.procedureName = value;
    this.layout.dataSource.procedureName = value;
  }

  loadFields(): void {
    const sp = (this.procedureName || '').trim();
    if (!sp) {
      this.statusMessage = 'Stored procedure name din.';
      return;
    }

    this.isLoadingFields = true;
    this.statusMessage = 'Loading fields...';
    this.reportingApi.discoverFields(sp).pipe(catchError(() => of([]))).subscribe(fields => {
      const fallback = this.getFallbackFields(sp);
      const finalFields = (fields && fields.length ? fields : fallback).filter(Boolean);
      this.availableFields = Array.from(new Set(finalFields));
      this.layout.dataSource.fields = [...this.availableFields];
      this.selectedFields = [...this.availableFields];
      this.isLoadingFields = false;
      this.statusMessage = this.availableFields.length ? `${this.availableFields.length} fields loaded.` : 'Field load hoy nai. SP name check korun.';
      if (this.availableFields.length && !this.elements.length) this.createDefaultDesign();
      this.buildPreviewRows();
    });
  }

  private getFallbackFields(sp: string): string[] {
    return this.fallbackFieldMap[sp] || this.fallbackFieldMap[Object.keys(this.fallbackFieldMap).find(k => k.toLowerCase() === sp.toLowerCase()) || ''] || [];
  }

  createDefaultDesign(): void {
    this.elements = [];
    this.addElement('text', 'Company Name', 220, 22, 240, 26, 'reportHeader', { fontSize: 16, fontWeight: 700, textAlign: 'center' });
    this.addElement('text', this.reportName || 'Report Title', 285, 54, 230, 26, 'reportHeader', { fontSize: 18, fontWeight: 700, textAlign: 'center', color: '#003b75' });
    this.addTableFromFields(this.selectedFields.length ? this.selectedFields : this.availableFields);
  }

  addTableFromFields(fields: string[]): void {
    const visibleFields = fields.slice(0, 8);
    if (!visibleFields.length) return;
    const columns: ReportTableColumn[] = visibleFields.map(field => ({ field, caption: this.toCaption(field), width: Math.max(85, Math.floor(720 / visibleFields.length)), align: this.isNumericField(field) ? 'right' : 'left', aggregate: this.isAmountField(field) ? 'sum' : '' }));
    const table = this.addElement('table', 'Table', 20, 172, 750, 64, 'details', { fontSize: 11 }, columns);
    this.selectedElement = table;
  }

  addSingleField(field: string, band: SectionKey = 'details'): void {
    const y = band === 'details' ? 185 : this.getBandTop(band) + 25;
    this.selectedElement = this.addElement('field', field, 40, y, 150, 26, band, { fontSize: 12, border: '1px solid #cbd5e1', textAlign: this.isNumericField(field) ? 'right' : 'left' });
  }

  addToolElement(tool: BuilderTool): void {
    this.selectedTool = tool;
    if (tool === 'pointer') return;
    if (tool === 'table') return this.addTableFromFields(this.selectedFields.length ? this.selectedFields : this.availableFields);
    const band: SectionKey = tool === 'text' || tool === 'image' ? 'reportHeader' : 'details';
    const label = tool === 'text' ? 'Text' : tool === 'field' ? (this.availableFields[0] || 'Field') : tool;
    const height = tool === 'line' ? 6 : tool === 'rectangle' ? 50 : tool === 'image' ? 70 : 26;
    const width = tool === 'line' ? 220 : tool === 'rectangle' ? 180 : tool === 'image' ? 100 : 150;
    this.selectedElement = this.addElement(tool === 'field' ? 'field' : tool as any, label, 40, this.getBandTop(band) + 25, width, height, band, { fontSize: 12 });
    this.selectedTool = 'pointer';
  }

  private addElement(type: any, label: string, x: number, y: number, width: number, height: number, band: SectionKey, style: Record<string, any> = {}, columns?: ReportTableColumn[]): DesignerElement {
    const element: DesignerElement = {
      id: this.newId(), type, label, x, y, width, height, band, section: 'body',
      text: type === 'text' ? label : undefined,
      field: type === 'field' ? label : undefined,
      columns,
      style: { color: '#111827', background: '#ffffff', borderColor: '#cbd5e1', fontSize: 12, fontWeight: 400, textAlign: 'left', ...style }
    };
    this.elements.push(element);
    this.syncLayout();
    return element;
  }

  private syncLayout(): void { this.layout.elements = this.elements as any; }

  onFieldDragStart(event: DragEvent, field: string): void { event.dataTransfer?.setData('field', field); }
  allowDrop(event: DragEvent): void { event.preventDefault(); }
  onCanvasDrop(event: DragEvent): void {
    event.preventDefault();
    const field = event.dataTransfer?.getData('field');
    if (!field) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left) / (this.zoom / 100));
    const y = Math.round((event.clientY - rect.top) / (this.zoom / 100));
    this.addSingleField(field, this.getBandByY(y));
    if (this.selectedElement) { this.selectedElement.x = x; this.selectedElement.y = y; }
  }

  selectElement(element: DesignerElement, event?: MouseEvent): void { event?.stopPropagation(); this.selectedElement = element; }
  clearSelection(): void { this.selectedElement = undefined; }

  startMove(event: MouseEvent, element: DesignerElement): void {
    if ((event.target as HTMLElement).classList.contains('resize-handle')) return;
    event.preventDefault(); event.stopPropagation(); this.selectElement(element);
    this.dragStart = { id: element.id, x: event.clientX, y: event.clientY, elementX: element.x, elementY: element.y };
  }

  startResize(event: MouseEvent, element: DesignerElement): void {
    event.preventDefault(); event.stopPropagation(); this.selectElement(element);
    this.resizeStart = { id: element.id, x: event.clientX, y: event.clientY, width: element.width, height: element.height };
  }

  onMouseMove(event: MouseEvent): void {
    if (this.dragStart) {
      const el = this.elements.find(x => x.id === this.dragStart?.id); if (!el) return;
      el.x = Math.max(0, Math.round(this.dragStart.elementX + (event.clientX - this.dragStart.x) / (this.zoom / 100)));
      el.y = Math.max(0, Math.round(this.dragStart.elementY + (event.clientY - this.dragStart.y) / (this.zoom / 100)));
      el.band = this.getBandByY(el.y); this.syncLayout();
    }
    if (this.resizeStart) {
      const el = this.elements.find(x => x.id === this.resizeStart?.id); if (!el) return;
      el.width = Math.max(25, Math.round(this.resizeStart.width + (event.clientX - this.resizeStart.x) / (this.zoom / 100)));
      el.height = Math.max(12, Math.round(this.resizeStart.height + (event.clientY - this.resizeStart.y) / (this.zoom / 100)));
      this.syncLayout();
    }
  }

  stopMouseAction(): void { this.dragStart = undefined; this.resizeStart = undefined; }

  deleteSelected(): void {
    if (!this.selectedElement) return;
    this.elements = this.elements.filter(x => x.id !== this.selectedElement?.id);
    this.selectedElement = undefined; this.syncLayout();
  }

  duplicateSelected(): void {
    if (!this.selectedElement) return;
    const copy: DesignerElement = JSON.parse(JSON.stringify(this.selectedElement));
    copy.id = this.newId(); copy.x += 16; copy.y += 16; this.elements.push(copy); this.selectedElement = copy; this.syncLayout();
  }

  addColumn(field?: string): void {
    if (!this.selectedElement || this.selectedElement.type !== 'table') return;
    const useField = field || this.availableFields.find(x => !this.selectedElement?.columns?.some(c => c.field === x)) || this.availableFields[0] || 'Field';
    this.selectedElement.columns = this.selectedElement.columns || [];
    this.selectedElement.columns.push({ field: useField, caption: this.toCaption(useField), width: 100, align: this.isNumericField(useField) ? 'right' : 'left', aggregate: this.isAmountField(useField) ? 'sum' : '' });
    this.syncLayout();
  }

  removeColumn(index: number): void { if (this.selectedElement?.columns) this.selectedElement.columns.splice(index, 1); this.syncLayout(); }

  toggleField(field: string): void {
    this.selectedFields = this.selectedFields.includes(field) ? this.selectedFields.filter(x => x !== field) : [...this.selectedFields, field];
  }

  selectAllFields(): void { this.selectedFields = [...this.availableFields]; }
  clearSelectedFields(): void { this.selectedFields = []; }

  createTableFromSelectedFields(): void { this.addTableFromFields(this.selectedFields.length ? this.selectedFields : this.availableFields); }

  buildPreviewRows(): void {
    const fields = this.availableFields.length ? this.availableFields : this.getFallbackFields(this.procedureName);
    this.previewRows = [1, 2, 3, 4, 5].map(i => {
      const row: Record<string, any> = {};
      for (const f of fields) row[f] = this.sampleValue(f, i);
      return row;
    });
  }

  preview(): void { this.showPreview = true; this.buildPreviewRows(); }

  save(): void {
    this.syncLayout();
    const payload = {
      reportId: this.reportId || null,
      reportNo: null,
      reportKey: (this.reportName || 'New_Report').replace(/\s+/g, '_'),
      reportName: this.reportName || 'New Report',
      moduleId: null,
      procedureName: this.procedureName,
      reportType: 'LAYOUT',
      selectedVariantCode: 'DEFAULT',
      layoutJson: JSON.stringify(this.layout),
      variants: [{ variantCode: 'DEFAULT', variantName: 'Default', isDefault: true, isActive: true }],
      parameters: [],
      templates: [{ templateName: 'Default', layoutJson: JSON.stringify(this.layout), isDefault: true, isActive: true, variantCode: 'DEFAULT' }]
    };
    this.reportingApi.saveDesigner(payload as any).pipe(catchError(() => of(null))).subscribe(result => {
      this.statusMessage = result ? 'Report saved.' : 'Local design ready, but save API fail koreche.';
    });
  }

  getBandTop(key: SectionKey): number { return this.bands.find(x => x.key === key)?.top || 0; }
  getBandByY(y: number): SectionKey { return (this.bands.slice().reverse().find(b => y >= b.top)?.key || 'details'); }
  getFieldType(field: string): string { return this.isNumericField(field) ? '123' : this.isDateField(field) ? 'DATE' : 'ABC'; }
  isNumericField(field: string): boolean { return /(amount|qty|quantity|price|rate|total|balance|debit|credit|discount|empid|id)$/i.test(field); }
  isDateField(field: string): boolean { return /date/i.test(field); }
  isAmountField(field: string): boolean { return /(amount|total|balance|debit|credit)$/i.test(field); }
  toCaption(field: string): string { return field.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' '); }
  private newId(): string { return 'el_' + Math.random().toString(36).slice(2, 10); }
  private sampleValue(field: string, i: number): any {
    if (/email/i.test(field)) return `user${i}@company.com`;
    if (/user/i.test(field)) return i === 1 ? 'admin' : `user${i}`;
    if (/role/i.test(field)) return i % 2 ? 'Merchandiser' : 'Super Admin';
    if (/area/i.test(field)) return 'Gazipur';
    if (/status/i.test(field)) return 'Active';
    if (/date/i.test(field)) return `0${i}-May-2024`;
    if (/invoice/i.test(field)) return `INV-000${i}`;
    if (/customer/i.test(field)) return i % 2 ? 'ABC Traders' : 'XYZ Store';
    if (/product|item/i.test(field)) return `Product ${String.fromCharCode(64 + i)}`;
    if (this.isNumericField(field)) return this.isAmountField(field) ? (i * 250).toFixed(2) : i * 2;
    return `${this.toCaption(field)} ${i}`;
  }
}
