import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../core/page-engine/erp-page-engine.types';
import { ErpFormField } from '../../../shared/erp-form-master/erp-form-master.types';
import { ErpDataTableColumn } from '../../../shared/erp-data-table/erp-data-table.types';

type FieldDef = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'textarea' | 'checkbox' | 'select' | 'searchSelect';
  required?: boolean;
  lookupApi?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  placeholder?: string;
};

type PageDef = {
  route: string;
  title: string;
  endpointEntity: string;
  idKey: string;
  fields: FieldDef[];
  columns?: ErpDataTableColumn<any>[];
};

const baseRoute = '/administration/merchendising-setup';
const baseApi = '/administration/merchendising-setup';

const activeField: FieldDef = { key: 'isActive', label: 'Active', type: 'checkbox' };
const sortField: FieldDef = { key: 'sortOrder', label: 'Sort Order', type: 'number' };

function text(key: string, label: string, required = false, placeholder?: string): FieldDef {
  return { key, label, type: 'text', required, placeholder };
}

function email(key: string, label = 'Email'): FieldDef {
  return { key, label, type: 'email', placeholder: 'example@company.com' };
}

function lookup(key: string, label: string, lookupApi: string, optionValueKey: string, optionLabelKey: string): FieldDef {
  return { key, label, type: 'searchSelect', lookupApi, optionValueKey, optionLabelKey };
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
    placeholder: field.placeholder
  } as ErpFormField<any>));
}

function col(key: string, header: string, type: 'text' | 'number' | 'status' = 'text'): ErpDataTableColumn<any> {
  const pascal = key.charAt(0).toUpperCase() + key.slice(1);
  return { key, header, type, sortable: true, fallbackKeys: [pascal] };
}

function page(def: PageDef): ErpPageDefinition<any, any> & { idKey?: string } {
  const endpoint = `${baseApi}/${def.endpointEntity}`;
  const fields = [...def.fields, sortField, activeField];
  return {
    route: `${baseRoute}/${def.route}`,
    title: def.title,
    subtitle: `Manage ${def.title.toLowerCase()} information.`,
    pageType: 'master',
    layout: 'table-only',
    idKey: def.idKey,
    permission: 'MerchendisingSetup.View',
    actions: [
      { key: 'add', label: `Add ${def.title}`, icon: 'pi pi-plus', permission: 'MerchendisingSetup.Create' },
      { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
      { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'MerchendisingSetup.Export' }
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
          icon: 'pi pi-list',
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
          col(def.idKey.replace(/Id$/i, 'Code').replace(/^./, c => c.toLowerCase()), 'Code'),
          col(def.idKey.replace(/Id$/i, 'Name').replace(/^./, c => c.toLowerCase()), 'Name'),
          col('sortOrder', 'Sort Order', 'number'),
          col('isActive', 'Status', 'status')
        ],
        actions: [
          { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'MerchendisingSetup.Update' },
          { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'MerchendisingSetup.Delete' }
        ]
      }
    ]
  };
}

export const MERCHENDISING_SETUP_PAGES: (ErpPageDefinition & { idKey?: string })[] = [
  page({
    route: 'buyer-agent',
    title: 'Buyer Agent',
    endpointEntity: 'buyer-agents',
    idKey: 'buyerAgentId',
    fields: [
      text('agentCode', 'Agent Code'),
      text('agentName', 'Agent Name'),
      text('agentContactNo', 'Contact No'),
      text('contactPerson', 'Contact Person'),
      { key: 'agentAddress', label: 'Address', type: 'textarea' }
    ],
    columns: [col('agentCode', 'Agent Code'), col('agentName', 'Agent Name'), col('agentContactNo', 'Contact No'), col('contactPerson', 'Contact Person'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'buyer-brand',
    title: 'Buyer Brand',
    endpointEntity: 'buyer-brands',
    idKey: 'buyerBrandId',
    fields: [text('brandCode', 'Brand Code'), text('brandName', 'Brand Name', true)],
    columns: [col('brandCode', 'Brand Code'), col('brandName', 'Brand Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'country',
    title: 'Country',
    endpointEntity: 'countries',
    idKey: 'countryId',
    fields: [text('countryCode', 'Country Code'), text('countryName', 'Country Name', true), text('countryRegion', 'Region')],
    columns: [col('countryCode', 'Country Code'), col('countryName', 'Country Name'), col('countryRegion', 'Region'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'color',
    title: 'Color',
    endpointEntity: 'colors',
    idKey: 'colorId',
    fields: [text('colorCode', 'Color Code'), text('colorName', 'Color Name', true)],
    columns: [col('colorCode', 'Color Code'), col('colorName', 'Color Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'uom',
    title: 'UOM',
    endpointEntity: 'uoms',
    idKey: 'uomId',
    fields: [text('uomCode', 'UOM Code'), text('uomName', 'UOM Name', true), text('uomFor', 'UOM For', true)],
    columns: [col('uomCode', 'UOM Code'), col('uomName', 'UOM Name'), col('uomFor', 'UOM For'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'buyer',
    title: 'Buyer',
    endpointEntity: 'buyers',
    idKey: 'buyerId',
    fields: [
      text('buyerCode', 'Buyer Code'),
      text('buyerName', 'Buyer Name', true),
      lookup('countryId', 'Country', `${baseApi}/countries`, 'countryId', 'countryName'),
      lookup('buyerAgentId', 'Buyer Agent', `${baseApi}/buyer-agents`, 'buyerAgentId', 'agentName'),
      lookup('buyerBrandId', 'Buyer Brand', `${baseApi}/buyer-brands`, 'buyerBrandId', 'brandName'),
      text('contactPerson', 'Contact Person'),
      email('email')
    ],
    columns: [col('buyerCode', 'Buyer Code'), col('buyerName', 'Buyer Name'), col('contactPerson', 'Contact Person'), col('email', 'Email'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'season',
    title: 'Season',
    endpointEntity: 'seasons',
    idKey: 'seasonId',
    fields: [text('seasonCode', 'Season Code'), text('seasonName', 'Season Name', true)],
    columns: [col('seasonCode', 'Season Code'), col('seasonName', 'Season Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'supplier',
    title: 'Supplier',
    endpointEntity: 'suppliers',
    idKey: 'supplierId',
    fields: [text('supplierCode', 'Supplier Code'), text('supplierName', 'Supplier Name', true), text('supplierType', 'Supplier Type'), text('supplierFor', 'Supplier For', true), text('contactPerson', 'Contact Person'), { key: 'address', label: 'Address', type: 'textarea' }],
    columns: [col('supplierCode', 'Supplier Code'), col('supplierName', 'Supplier Name'), col('supplierType', 'Supplier Type'), col('supplierFor', 'Supplier For'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'currency',
    title: 'Currency',
    endpointEntity: 'currencies',
    idKey: 'currencyId',
    fields: [text('currencyCode', 'Currency Code', true), text('currencyName', 'Currency Name', true), { key: 'currencyRate', label: 'Currency Rate', type: 'number' }],
    columns: [col('currencyCode', 'Currency Code'), col('currencyName', 'Currency Name'), col('currencyRate', 'Rate', 'number'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'garments-item',
    title: 'Garments Item',
    endpointEntity: 'garments-items',
    idKey: 'garmentsItemId',
    fields: [text('garmentsItemCode', 'Garments Item Code'), text('garmentsItemName', 'Garments Item Name', true)],
    columns: [col('garmentsItemCode', 'Item Code'), col('garmentsItemName', 'Item Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'department',
    title: 'Department',
    endpointEntity: 'departments',
    idKey: 'mmDepartmentId',
    fields: [text('mmDepartmentCode', 'Department Code'), text('mmDepartmentName', 'Department Name', true)],
    columns: [col('mmDepartmentCode', 'Department Code'), col('mmDepartmentName', 'Department Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'pay-mode',
    title: 'Pay Mode',
    endpointEntity: 'pay-modes',
    idKey: 'payModeId',
    fields: [text('payModeCode', 'Pay Mode Code'), text('payModeName', 'Pay Mode Name', true)],
    columns: [col('payModeCode', 'Pay Mode Code'), col('payModeName', 'Pay Mode Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'ship-mode',
    title: 'Ship Mode',
    endpointEntity: 'ship-modes',
    idKey: 'shipModeId',
    fields: [text('shipModeCode', 'Ship Mode Code'), text('shipModeName', 'Ship Mode Name', true)],
    columns: [col('shipModeCode', 'Ship Mode Code'), col('shipModeName', 'Ship Mode Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  }),
  page({
    route: 'size',
    title: 'Size',
    endpointEntity: 'sizes',
    idKey: 'sizeId',
    fields: [text('sizeCode', 'Size Code'), text('sizeGroup', 'Size Group', true), text('sizeName', 'Size Name', true)],
    columns: [col('sizeCode', 'Size Code'), col('sizeGroup', 'Size Group'), col('sizeName', 'Size Name'), col('sortOrder', 'Sort Order', 'number'), col('isActive', 'Status', 'status')]
  })
];
