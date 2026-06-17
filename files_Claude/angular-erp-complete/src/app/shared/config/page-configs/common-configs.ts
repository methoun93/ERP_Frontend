import { CrudMasterConfig } from '@/app/shared/components/crud-master.component';
import { apiRoutes } from './api-routes';

export const SeasonsPageConfig: CrudMasterConfig = {
  title: 'Season',
  subtitle: 'Base Setup / Merchandising Setup',
  endpoint: apiRoutes.baseSeasons,
  idKey: 'seasonId',
  gridCols: 2,
  tableColumns: ['seasonCode', 'seasonName', 'isActive'],
  fields: [
    { key: 'seasonCode', label: 'Season Code', type: 'text', required: true },
    { key: 'seasonName', label: 'Season Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { key: 'isActive', label: 'Active', type: 'checkbox' },
  ],
};

export const UomsPageConfig: CrudMasterConfig = {
  title: 'Unit of Measure',
  subtitle: 'Base Setup / Merchandising Setup',
  endpoint: apiRoutes.baseUoms,
  idKey: 'uomId',
  gridCols: 2,
  tableColumns: ['uomCode', 'uomName', 'isActive'],
  fields: [
    { key: 'uomCode', label: 'UOM Code', type: 'text', required: true },
    { key: 'uomName', label: 'UOM Name', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { key: 'isActive', label: 'Active', type: 'checkbox' },
  ],
};

export const CurrenciesPageConfig: CrudMasterConfig = {
  title: 'Currency',
  subtitle: 'Base Setup / Merchandising Setup',
  endpoint: apiRoutes.baseCurrencies,
  idKey: 'currencyId',
  gridCols: 2,
  tableColumns: ['currencyCode', 'currencyName', 'currencySymbol', 'isActive'],
  fields: [
    { key: 'currencyCode', label: 'Currency Code', type: 'text', required: true, maxLength: 3 },
    { key: 'currencyName', label: 'Currency Name', type: 'text', required: true },
    { key: 'currencySymbol', label: 'Symbol', type: 'text', maxLength: 5 },
    { key: 'exchangeRate', label: 'Exchange Rate', type: 'number' },
    { key: 'isActive', label: 'Active', type: 'checkbox' },
  ],
};
