import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../core/page-engine/erp-page-engine.types';
import { ErpFormField } from '../../../shared/erp-form-master/erp-form-master.types';
import { ErpDataTableColumn } from '../../../shared/erp-data-table/erp-data-table.types';

type FieldType = 'text' | 'number' | 'email' | 'textarea' | 'checkbox' | 'select' | 'searchSelect';

type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  lookupApi?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  placeholder?: string;
  step?: string | number;
};

type PageDef = {
  route: string;
  title: string;
  endpointEntity: string;
  idKey: string;
  fields: FieldDef[];
  columns?: ErpDataTableColumn<any>[];
};

const routeBases = [
  '/administration/textile-setup',
  '/administration/merchandising-setup',
  '/administration/merchendising-setup'
];
const baseApi = '/administration/merchendising-setup';

const activeField: FieldDef = { key: 'isActive', label: 'Active', type: 'checkbox' };
const sortField: FieldDef = { key: 'sortOrder', label: 'Sort Order', type: 'number' };

function text(key: string, label: string, required = false, placeholder?: string): FieldDef {
  return { key, label, type: 'text', required, placeholder };
}

function number(key: string, label: string, required = false, step?: string | number): FieldDef {
  return { key, label, type: 'number', required, step };
}

function textarea(key: string, label = 'Remarks'): FieldDef {
  return { key, label, type: 'textarea' };
}

function lookup(key: string, label: string, lookupApi: string): FieldDef {
  return { key, label, type: 'searchSelect', lookupApi, optionValueKey: 'id', optionLabelKey: 'name' };
}

function fieldsToFormFields(fields: FieldDef[]): ErpFormField<any>[] {
  return fields.map(field => ({
    key: field.key,
    label: field.label,
    type: field.type || 'text',
    required: !!field.required,
    validators: field.required ? [Validators.required] : undefined,
    lookupApi: field.lookupApi,
    optionValueKey: field.optionValueKey,
    optionLabelKey: field.optionLabelKey,
    placeholder: field.placeholder,
    step: field.step
  } as ErpFormField<any>));
}

function col(key: string, header: string, type: 'text' | 'number' | 'status' = 'text'): ErpDataTableColumn<any> {
  const pascal = key.charAt(0).toUpperCase() + key.slice(1);
  return { key, header, type, sortable: true, fallbackKeys: [pascal] };
}

function defaultCodeKey(idKey: string): string {
  return idKey.replace(/Id$/i, 'Code').replace(/^./, c => c.toLowerCase());
}

function defaultNameKey(idKey: string): string {
  return idKey.replace(/Id$/i, 'Name').replace(/^./, c => c.toLowerCase());
}

function pageForRouteBase(def: PageDef, routeBase: string): ErpPageDefinition<any, any> & { idKey?: string } {
  const endpoint = `${baseApi}/${def.endpointEntity}`;
  const fields = [...def.fields, sortField, activeField];

  return {
    route: `${routeBase}/${def.route}`,
    title: def.title,
    subtitle: `Manage ${def.title.toLowerCase()} information.`,
    pageType: 'master',
    layout: 'table-only',
    idKey: def.idKey,
    permission: 'TextileSetup.View',
    actions: [
      { key: 'add', label: `Add ${def.title}`, icon: 'pi pi-plus', permission: 'TextileSetup.Create' },
      { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
      { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'TextileSetup.Export' }
    ],
    form: {
      key: def.route,
      title: `${def.title} Information`,
      api: { list: endpoint, getById: endpoint, create: endpoint, update: endpoint, delete: endpoint },
      initialValue: { isActive: true, sortOrder: 0 },
      sections: [
        {
          title: `${def.title} Information`,
          description: 'Fill in the required information and save.',
          icon: 'pi pi-tags',
          columns: 3,
          fields: fieldsToFormFields(fields)
        }
      ]
    },
    tables: [
      {
        key: `${def.route}List`,
        title: `${def.title} List`,
        searchPlaceholder: `Search ${def.title.toLowerCase()}...`,
        pageSize: 10,
        api: { list: endpoint, export: `${endpoint}/export`, delete: endpoint },
        columns: def.columns || [
          col(defaultCodeKey(def.idKey), 'Code'),
          col(defaultNameKey(def.idKey), 'Name'),
          col('sortOrder', 'Sort Order', 'number'),
          col('isActive', 'Status', 'status')
        ],
        actions: [
          { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'TextileSetup.Update' },
          { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'TextileSetup.Delete' }
        ]
      }
    ]
  };
}

function pages(def: PageDef): (ErpPageDefinition & { idKey?: string })[] {
  return routeBases.map(routeBase => pageForRouteBase(def, routeBase));
}

export const TEXTILE_SETUP_PAGES: (ErpPageDefinition & { idKey?: string })[] = [
  ...pages({
    route: 'tex-compositions',
    title: 'Textile Composition',
    endpointEntity: 'tex-compositions',
    idKey: 'compositionId',
    fields: [
      text('compositionCode', 'Composition Code'),
      text('compositionName', 'Composition Name', true),
      text('shortName', 'Short Name'),
      number('compositionPercent', 'Composition %', false, '0.0001'),
      textarea('remarks')
    ],
    columns: [col('compositionCode', 'Composition Code'), col('compositionName', 'Composition Name'), col('shortName', 'Short Name'), col('compositionPercent', 'Composition %', 'number'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  ...pages({
    route: 'tex-yarn-counts',
    title: 'Yarn Count',
    endpointEntity: 'tex-yarn-counts',
    idKey: 'yarnCountId',
    fields: [text('yarnCountCode', 'Yarn Count Code'), text('yarnCountName', 'Yarn Count Name', true), text('countValue', 'Count Value'), textarea('remarks')],
    columns: [col('yarnCountCode', 'Yarn Count Code'), col('yarnCountName', 'Yarn Count Name'), col('countValue', 'Count Value'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  ...pages({
    route: 'tex-yarn-types',
    title: 'Yarn Type',
    endpointEntity: 'tex-yarn-types',
    idKey: 'yarnTypeId',
    fields: [text('yarnTypeCode', 'Yarn Type Code'), text('yarnTypeName', 'Yarn Type Name', true), textarea('remarks')]
  }),
  ...pages({
    route: 'tex-fibers',
    title: 'Fiber',
    endpointEntity: 'tex-fibers',
    idKey: 'fiberId',
    fields: [text('fiberCode', 'Fiber Code'), text('fiberName', 'Fiber Name', true), textarea('remarks')]
  }),
  ...pages({
    route: 'tex-fabric-types',
    title: 'Fabric Type',
    endpointEntity: 'tex-fabric-types',
    idKey: 'fabricTypeId',
    fields: [text('fabricTypeCode', 'Fabric Type Code'), text('fabricTypeName', 'Fabric Type Name', true), textarea('remarks')]
  }),
  ...pages({
    route: 'tex-gsms',
    title: 'GSM',
    endpointEntity: 'tex-gsms',
    idKey: 'gsmId',
    fields: [number('gsmValue', 'GSM Value', true, '0.01'), textarea('remarks')],
    columns: [col('gsmValue', 'GSM Value', 'number'), col('remarks', 'Remarks'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  ...pages({
    route: 'tex-dia-widths',
    title: 'Dia Width',
    endpointEntity: 'tex-dia-widths',
    idKey: 'diaWidthId',
    fields: [text('diaWidthCode', 'Dia Width Code'), text('diaWidthName', 'Dia Width Name', true)]
  }),
  ...pages({
    route: 'tex-finishes',
    title: 'Finish',
    endpointEntity: 'tex-finishes',
    idKey: 'finishId',
    fields: [text('finishCode', 'Finish Code'), text('finishName', 'Finish Name', true)]
  }),
  ...pages({
    route: 'tex-fabric-constructions',
    title: 'Fabric Construction',
    endpointEntity: 'tex-fabric-constructions',
    idKey: 'fabricConstructionId',
    fields: [text('fabricConstructionCode', 'Fabric Construction Code'), text('fabricConstructionName', 'Fabric Construction Name', true)]
  }),
  ...pages({
    route: 'tex-fabrics',
    title: 'Fabric',
    endpointEntity: 'tex-fabrics',
    idKey: 'fabricId',
    fields: [
      text('fabricCode', 'Fabric Code'),
      text('fabricName', 'Fabric Name', true),
      lookup('fabricTypeId', 'Fabric Type', '/administration/lookups/textile-fabric-types'),
      lookup('fabricConstructionId', 'Fabric Construction', '/administration/lookups/textile-fabric-constructions'),
      lookup('compositionId', 'Composition', '/administration/lookups/textile-compositions'),
      lookup('yarnTypeId', 'Yarn Type', '/administration/lookups/textile-yarn-types'),
      lookup('yarnCountId', 'Yarn Count', '/administration/lookups/textile-yarn-counts'),
      lookup('gsmId', 'GSM', '/administration/lookups/textile-gsms'),
      lookup('diaWidthId', 'Dia Width', '/administration/lookups/textile-dia-widths'),
      lookup('finishId', 'Finish', '/administration/lookups/textile-finishes'),
      textarea('remarks')
    ],
    columns: [col('fabricCode', 'Fabric Code'), col('fabricName', 'Fabric Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  })
];
