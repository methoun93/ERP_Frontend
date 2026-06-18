import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import interact from 'interactjs';
import { ReportElement, ReportLayout } from '../models/reporting.models';

type BuilderTab = 'design' | 'template' | 'variant' | 'parameter' | 'theme' | 'image' | 'page';

type ToolDefinition = {
  type: ReportElement['type'];
  label: string;
  icon: string;
  defaultWidth?: number;
  defaultHeight?: number;
};

@Component({
  selector: 'app-report-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-builder.html',
  styleUrls: ['./report-builder.scss']
})
export class ReportBuilder implements AfterViewInit, OnDestroy {
  @ViewChild('paperCanvas') paperCanvas?: ElementRef<HTMLDivElement>;
  @ViewChild('paperViewport') paperViewport?: ElementRef<HTMLDivElement>;

  activeTab: BuilderTab = 'design';
  selectedElement?: ReportElement;
  reportName = 'Purchase Order Print';
  reportNo = 'MER-RPT-000001';
  reportKey = 'PO_PRINT';
  procedureName = 'rpt_Merchandising_OrderPrint';
  showGrid = true;
  snapToGrid = true;
  gridSize = 10;
  zoom = 70;

  layout: ReportLayout = {
    pageSettings: {
      pageSize: 'A4',
      orientation: 'Portrait',
      marginTop: 12,
      marginRight: 12,
      marginBottom: 12,
      marginLeft: 12,
      showPageNo: true,
      showPrintDate: true,
      repeatHeader: true
    },
    theme: {
      primaryColor: '#0f766e',
      headerBackground: '#0f3b75',
      headerTextColor: '#ffffff',
      borderColor: '#cbd5e1',
      textColor: '#111827'
    },
    elements: [
      { id: 'txt-company', type: 'text', label: 'Company Name', text: 'Company Name', x: 240, y: 24, width: 260, height: 28, style: { fontSize: 20, fontWeight: 800 } },
      { id: 'txt-title', type: 'text', label: 'Report Title', text: 'PURCHASE ORDER', x: 255, y: 78, width: 230, height: 26, style: { fontSize: 18, fontWeight: 800 } },
      { id: 'img-logo', type: 'image', label: 'Logo', imageUrl: '/assets/logo.png', x: 52, y: 26, width: 72, height: 58 },
      {
        id: 'tbl-main', type: 'table', label: 'Main Table', x: 48, y: 210, width: 660, height: 160, columns: [
          { field: 'ItemCode', caption: 'Item Code', width: 90 },
          { field: 'ItemDescription', caption: 'Item Description', width: 190 },
          { field: 'Uom', caption: 'UOM', width: 70, align: 'center' },
          { field: 'Qty', caption: 'Qty', width: 80, align: 'right', aggregate: 'sum' },
          { field: 'Rate', caption: 'Rate', width: 80, align: 'right' },
          { field: 'Amount', caption: 'Amount', width: 100, align: 'right', aggregate: 'sum' }
        ]
      },
      { id: 'txt-signature', type: 'text', label: 'Signature', text: 'Authorized Signature', x: 560, y: 455, width: 150, height: 24 }
    ]
  };

  tools: ToolDefinition[] = [
    { type: 'text', label: 'Text', icon: 'T', defaultWidth: 160, defaultHeight: 34 },
    { type: 'field', label: 'Field', icon: '{}', defaultWidth: 170, defaultHeight: 34 },
    { type: 'image', label: 'Image', icon: '▧', defaultWidth: 110, defaultHeight: 80 },
    { type: 'table', label: 'Table', icon: '▦', defaultWidth: 560, defaultHeight: 150 },
    { type: 'line', label: 'Line', icon: '─', defaultWidth: 220, defaultHeight: 12 },
    { type: 'rectangle', label: 'Rectangle', icon: '▭', defaultWidth: 190, defaultHeight: 80 },
    { type: 'barcode', label: 'Barcode', icon: '▥', defaultWidth: 190, defaultHeight: 55 },
    { type: 'qr', label: 'QR Code', icon: '▣', defaultWidth: 90, defaultHeight: 90 },
    { type: 'pageBreak', label: 'Page Break', icon: '↧', defaultWidth: 680, defaultHeight: 28 }
  ];

  parameters = [
    { parameterName: 'orderId', displayName: 'Order ID', dataType: 'Guid', controlType: 'Hidden', isRequired: true },
    { parameterName: 'buyerId', displayName: 'Buyer', dataType: 'Guid', controlType: 'Dropdown', isRequired: false },
    { parameterName: 'fromDate', displayName: 'From Date', dataType: 'Date', controlType: 'Date', isRequired: false },
    { parameterName: 'toDate', displayName: 'To Date', dataType: 'Date', controlType: 'Date', isRequired: false }
  ];

  variants = [
    { variantCode: 'DEFAULT', variantName: 'Default', isDefault: true },
    { variantCode: 'BUYER_COPY', variantName: 'Buyer Copy', isDefault: false },
    { variantCode: 'FACTORY_COPY', variantName: 'Factory Copy', isDefault: false }
  ];

  templates = [
    { templateName: 'Default Template', scope: 'All Company', isDefault: true },
    { templateName: 'Company A Template', scope: 'Company', isDefault: false },
    { templateName: 'Gazipur Area Template', scope: 'Area', isDefault: false }
  ];

  ngAfterViewInit(): void {
    this.enableDesignerInteractions();
    setTimeout(() => this.fitToScreen());
  }

  ngOnDestroy(): void {
    interact('.report-design-element').unset();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.fitToScreen();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT';
    if (isInput) return;

    if ((event.key === 'Delete' || event.key === 'Backspace') && this.selectedElement) {
      event.preventDefault();
      this.removeSelectedElement();
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd' && this.selectedElement) {
      event.preventDefault();
      this.duplicateSelectedElement();
    }
  }

  addElement(type: ReportElement['type']): void {
    const tool = this.tools.find(x => x.type === type);
    const id = `${type}-${Date.now()}`;
    const element: ReportElement = {
      id,
      type,
      label: this.toTitle(type),
      text: this.defaultText(type),
      x: 80,
      y: 120,
      width: tool?.defaultWidth ?? 160,
      height: tool?.defaultHeight ?? 34,
      style: { fontSize: 13, fontWeight: 600 }
    };

    if (type === 'field') {
      element.field = 'FieldName';
      element.text = '[FieldName]';
    }

    if (type === 'image') element.imageUrl = '/uploads/company/logo.png';

    if (type === 'table') {
      element.columns = [
        { field: 'ItemCode', caption: 'Item Code', width: 120 },
        { field: 'ItemDescription', caption: 'Item Description', width: 220 },
        { field: 'Qty', caption: 'Qty', width: 90, align: 'right' }
      ];
    }

    this.layout.elements.push(element);
    this.selectedElement = element;
    this.refreshDesignerInteractions();
  }

  selectElement(element: ReportElement, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedElement = element;
  }

  clearSelection(): void {
    this.selectedElement = undefined;
  }

  removeSelectedElement(): void {
    if (!this.selectedElement) return;
    this.layout.elements = this.layout.elements.filter(x => x.id !== this.selectedElement?.id);
    this.selectedElement = undefined;
    this.refreshDesignerInteractions();
  }

  duplicateSelectedElement(): void {
    if (!this.selectedElement) return;
    const source = this.selectedElement;
    const copy: ReportElement = JSON.parse(JSON.stringify(source));
    copy.id = `${source.type}-${Date.now()}`;
    copy.label = `${source.label} Copy`;
    copy.x = this.snap(source.x + 24);
    copy.y = this.snap(source.y + 24);
    this.layout.elements.push(copy);
    this.selectedElement = copy;
    this.refreshDesignerInteractions();
  }

  bringForward(): void {
    if (!this.selectedElement) return;
    const index = this.layout.elements.findIndex(x => x.id === this.selectedElement?.id);
    if (index < 0 || index === this.layout.elements.length - 1) return;
    const [element] = this.layout.elements.splice(index, 1);
    this.layout.elements.splice(index + 1, 0, element);
  }

  sendBackward(): void {
    if (!this.selectedElement) return;
    const index = this.layout.elements.findIndex(x => x.id === this.selectedElement?.id);
    if (index <= 0) return;
    const [element] = this.layout.elements.splice(index, 1);
    this.layout.elements.splice(index - 1, 0, element);
  }

  addTableColumn(): void {
    if (!this.selectedElement || this.selectedElement.type !== 'table') return;
    this.selectedElement.columns ??= [];
    const next = this.selectedElement.columns.length + 1;
    this.selectedElement.columns.push({ field: `Field${next}`, caption: `Column ${next}`, width: 120 });
  }

  removeTableColumn(index: number): void {
    if (!this.selectedElement?.columns) return;
    this.selectedElement.columns.splice(index, 1);
  }


  fitToScreen(): void {
    const viewport = this.paperViewport?.nativeElement;
    if (!viewport) return;

    const isLandscape = this.layout.pageSettings.orientation === 'Landscape';
    const paperWidth = isLandscape ? 1123 : 794;
    const paperHeight = isLandscape ? 794 : 1123;
    const availableWidth = Math.max(320, viewport.clientWidth - 32);
    const availableHeight = Math.max(320, viewport.clientHeight - 32);
    const widthZoom = (availableWidth / paperWidth) * 100;
    const heightZoom = (availableHeight / paperHeight) * 100;
    this.zoom = Math.max(45, Math.min(100, Math.floor(Math.min(widthZoom, heightZoom))));
  }

  saveLayout(): void {
    const json = JSON.stringify(this.layout, null, 2);
    console.log('LayoutJson', json);
    alert('Layout JSON generated. Connect this save action with Rpt_ReportTemplates API.');
  }

  printPreview(): void {
    if (!this.paperCanvas?.nativeElement) return;

    const paper = this.paperCanvas.nativeElement.cloneNode(true) as HTMLElement;
    paper.classList.remove('show-grid');
    paper.querySelectorAll('.element-delete, .resize-hint').forEach(x => x.remove());
    paper.querySelectorAll('.selected').forEach(x => x.classList.remove('selected'));

    const preview = window.open('', '_blank', 'width=1100,height=800');
    if (!preview) {
      alert('Popup blocked. Please allow popups for report preview.');
      return;
    }

    preview.document.open();
    preview.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${this.reportNo} - ${this.reportName}</title>
          <style>${this.getPrintStyles()}</style>
        </head>
        <body>
          <main class="preview-shell">
            <div class="preview-toolbar no-print">
              <strong>${this.reportNo}</strong>
              <span>${this.reportName}</span>
              <button onclick="window.print()">Print</button>
              <button onclick="window.close()">Close</button>
            </div>
            <section class="report-only">
              ${paper.outerHTML}
            </section>
          </main>
        </body>
      </html>`);
    preview.document.close();
    preview.focus();
  }

  private getPrintStyles(): string {
    return `
      * { box-sizing: border-box; }
      body { margin: 0; background: #e5e7eb; font-family: Arial, sans-serif; color: #111827; }
      .preview-shell { min-height: 100vh; padding: 18px; }
      .preview-toolbar { display: flex; gap: 12px; align-items: center; margin: 0 auto 14px; max-width: 1123px; background: #fff; border: 1px solid #d7e1ef; border-radius: 10px; padding: 10px 12px; box-shadow: 0 8px 20px rgba(15,35,69,.08); }
      .preview-toolbar span { color: #64748b; flex: 1; }
      .preview-toolbar button { border: 1px solid #d7e1ef; background: #fff; border-radius: 8px; padding: 8px 12px; font-weight: 700; cursor: pointer; }
      .report-only { display: flex; justify-content: center; }
      .paper { width: 794px; height: 1123px; background: #fff; border: 1px solid #d8e2ef; box-shadow: 0 10px 35px rgba(0,0,0,.18); position: relative; overflow: hidden; }
      .paper.landscape { width: 1123px; height: 794px; }
      .element { position: absolute; display: flex; align-items: center; justify-content: center; color: #111827; font-weight: 600; user-select: none; box-sizing: border-box; background: transparent; border: 0 !important; box-shadow: none !important; }
      .image-box { width: 100%; height: 100%; border: 1px solid #d7e1ef; display: grid; place-items: center; text-align: center; color: #64748b; background: #f8fafc; line-height: 1.2; }
      .table-element { display: block; overflow: hidden; }
      .table-element table { width: 100%; height: 100%; border-collapse: collapse; font-size: 11px; background: #fff; }
      .table-element th { background: #0f3b75; color: #fff; }
      .table-element th, .table-element td { border: 1px solid #cbd5e1; padding: 5px; text-align: center; }
      .total td { font-weight: 800; text-align: right !important; background: #f1f5f9; }
      .line { width: 100%; border-top: 2px solid #111827; }
      .rectangle-element { border: 2px solid #111827 !important; }
      .rectangle-label { color: #64748b; font-size: 12px; }
      .barcode-text { font-family: 'Courier New', monospace; font-size: 28px; letter-spacing: 2px; }
      .qr-box { width: 100%; height: 100%; border: 8px solid #111827; display: grid; place-items: center; font-weight: 900; }
      .page-break { width: 100%; border-top: 2px dashed #ef4444; color: #ef4444; font-size: 12px; text-align: center; padding-top: 4px; }
      @page { size: A4; margin: 0; }
      @media print {
        body { background: #fff; }
        .no-print { display: none !important; }
        .preview-shell { padding: 0; }
        .report-only { display: block; }
        .paper { border: 0; box-shadow: none; margin: 0; page-break-after: always; }
        .paper.landscape { width: 1123px; height: 794px; }
      }
    `;
  }

  trackByElementId(_: number, element: ReportElement): string {
    return element.id;
  }

  private enableDesignerInteractions(): void {
    const getElement = (target: HTMLElement): ReportElement | undefined => {
      const id = target.dataset['elementId'];
      return this.layout.elements.find(x => x.id === id);
    };

    interact('.report-design-element')
      .draggable({
        inertia: false,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: '.paper',
            endOnly: false
          })
        ],
        listeners: {
          move: event => {
            const element = getElement(event.target as HTMLElement);
            if (!element) return;
            this.selectedElement = element;
            element.x = this.snap(element.x + event.dx);
            element.y = this.snap(element.y + event.dy);
          }
        }
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        modifiers: [
          interact.modifiers.restrictEdges({ outer: '.paper' }),
          interact.modifiers.restrictSize({ min: { width: 24, height: 14 } })
        ],
        listeners: {
          move: event => {
            const element = getElement(event.target as HTMLElement);
            if (!element) return;
            this.selectedElement = element;
            element.x = this.snap(element.x + event.deltaRect.left);
            element.y = this.snap(element.y + event.deltaRect.top);
            element.width = Math.max(24, this.snap(event.rect.width));
            element.height = Math.max(14, this.snap(event.rect.height));
          }
        }
      });
  }

  private refreshDesignerInteractions(): void {
    setTimeout(() => this.enableDesignerInteractions());
  }

  private snap(value: number): number {
    if (!this.snapToGrid) return Math.round(value);
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  private defaultText(type: ReportElement['type']): string {
    if (type === 'barcode') return '||||||||||||';
    if (type === 'qr') return 'QR';
    if (type === 'pageBreak') return 'PAGE BREAK';
    return this.toTitle(type);
  }

  private toTitle(value: string): string {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, x => x.toUpperCase());
  }
}
