import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../erp-page-engine.types';

export const AREA_INFO_PAGE: ErpPageDefinition & { idKey?: string } = {
  route: '/administration/company-setup/adm-area-info',
  title: 'Area Information',
  subtitle: 'Manage company-wise area and factory location information.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'areaId',
  permission: 'AreaInfo.View',
  actions: [
    { key: 'add', label: 'Add Area', icon: 'pi pi-plus', permission: 'AreaInfo.Create' },
    { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
    { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'AreaInfo.Export' }
  ],
  form: {
    key: 'areaInfo',
    title: 'Area Information',
    api: {
      list: '/adm-area-infos',
      getById: '/adm-area-infos',
      create: '/adm-area-infos',
      update: '/adm-area-infos',
      delete: '/adm-area-infos'
    },
    initialValue: { isActive: true },
    sections: [
      {
        title: 'Area Information',
        description: 'Area belongs to a company. Keep company and area information separate.',
        icon: 'pi pi-map-marker',
        columns: 2,
        fields: [
          { key: 'compId', label: 'Company', type: 'searchSelect', required: true, validators: [Validators.required] },
          { key: 'areaName', label: 'Area Name', type: 'text', required: true, validators: [Validators.required] },
          { key: 'areaNameBng', label: 'Area Name Bangla', type: 'text' },
          { key: 'shortName', label: 'Short Name', type: 'text' },
          { key: 'shortNameBng', label: 'Short Name Bangla', type: 'text' },
          { key: 'areaAddressEng', label: 'Address English', type: 'textarea', colSpan: 2 },
          { key: 'areaAddressBng', label: 'Address Bangla', type: 'textarea', colSpan: 2 },
          { key: 'sortOrder', label: 'Sort Order', type: 'number' },
          { key: 'isActive', label: 'Active', type: 'checkbox', hint: 'Enable this area for active use.' }
        ]
      }
    ]
  },
  tables: [
    {
      key: 'areaInfoList',
      title: 'Area List',
      searchPlaceholder: 'Search by company name, area name, short name...',
      pageSize: 10,
      api: {
        list: '/adm-area-infos',
        export: '/adm-area-infos/export',
        delete: '/adm-area-infos'
      },
      columns: [
        { key: 'companyName', header: 'Company Name', sortable: true, fallbackKeys: ['compName', 'company.compName', 'companyName', 'company.name', 'comp.companyName'] },
        { key: 'areaName', header: 'Area Name', sortable: true },
        { key: 'shortName', header: 'Short Name', sortable: true },
        { key: 'sortOrder', header: 'Sort Order', type: 'number', sortable: true },
        { key: 'isActive', header: 'Status', type: 'status', sortable: true }
      ],
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'AreaInfo.Update' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'AreaInfo.Delete' }
      ]
    }
  ]
};
