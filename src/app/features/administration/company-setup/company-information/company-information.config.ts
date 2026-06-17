import { Validators } from '@angular/forms';
import { ErpPageDefinition } from '../../../../core/page-engine/erp-page-engine.types';
import { CompanyInformationForm, CompanyInformationRow } from './company-information.models';

export const COMPANY_INFORMATION_PAGE: ErpPageDefinition<CompanyInformationForm, CompanyInformationRow> & { idKey?: string } = {
  route: '/administration/company-setup/adm-company-info',
  title: 'Company Information',
  subtitle: 'Manage company profile and business configuration.',
  pageType: 'master',
  layout: 'table-only',
  idKey: 'compId',
  permission: 'CompanyInfo.View',
  actions: [
    { key: 'add', label: 'Add Company', icon: 'pi pi-plus', permission: 'CompanyInfo.Create' },
    { key: 'refresh', label: 'Refresh', icon: 'pi pi-refresh' },
    { key: 'export', label: 'Export', icon: 'pi pi-download', permission: 'CompanyInfo.Export' }
  ],
  form: {
    key: 'companyInfo',
    title: 'Company Information',
    api: {
      list: '/adm-company-infos',
      getById: '/adm-company-infos',
      create: '/adm-company-infos',
      update: '/adm-company-infos',
      delete: '/adm-company-infos'
    },
    initialValue: { isActive: true, setupCompWise: false },
    sections: [
      {
        title: 'Basic Company Information',
        description: 'Company identity, short names and contact information.',
        icon: 'pi pi-building',
        columns: 2,
        fields: [
          { key: 'compName', label: 'Company Name', type: 'text', required: true, validators: [Validators.required] },
          { key: 'compNameBng', label: 'Company Name Bangla', type: 'text' },
          { key: 'shortNameEng', label: 'Short Name English', type: 'text', required: true, validators: [Validators.required] },
          { key: 'shortNameBng', label: 'Short Name Bangla', type: 'text' },
          { key: 'email', label: 'Email', type: 'email', validators: [Validators.email] },
          { key: 'phoneNo', label: 'Phone No', type: 'text' },
          { key: 'addressEng', label: 'Address English', type: 'textarea', colSpan: 2 },
          { key: 'addressBng', label: 'Address Bangla', type: 'textarea', colSpan: 2 }
        ]
      },
      {
        title: 'Mail & Setup Configuration',
        description: 'Mail sender settings and company-wise setup behavior.',
        icon: 'pi pi-envelope',
        columns: 2,
        fields: [
          { key: 'mailPort', label: 'Mail Port', type: 'number' },
          { key: 'mailPass', label: 'Mail Password', type: 'text' },
          { key: 'mailFrom', label: 'Mail From', type: 'email', validators: [Validators.email] },
          { key: 'sortOrder', label: 'Sort Order', type: 'number' },
          { key: 'setupCompWise', label: 'Setup Company Wise', type: 'checkbox', hint: 'Enable separate setup/configuration by company.' },
          { key: 'isActive', label: 'Active', type: 'checkbox', hint: 'Enable this record for active use.' }
        ]
      },
      {
        title: 'Branding & Documents',
        description: 'Upload company logo, report header and authorized signatory.',
        icon: 'pi pi-image',
        columns: 3,
        fields: [
          { key: 'logoFileName', label: 'Company Logo', type: 'file', accept: 'image/*', preview: true, hint: 'Recommended: PNG/JPG, transparent logo.' },
          { key: 'comHeaderFileName', label: 'Company Header', type: 'file', accept: 'image/*,.pdf', preview: true, hint: 'Report header image or PDF.' },
          { key: 'signatoryFileName', label: 'Signatory', type: 'file', accept: 'image/*', preview: true, hint: 'Authorized signature image.' },
          { key: 'logoFileLocation', label: 'Logo Location', type: 'hidden' },
          { key: 'comHeaderFileLocation', label: 'Header Location', type: 'hidden' },
          { key: 'signatoryFileLoc', label: 'Signatory Location', type: 'hidden' }
        ]
      }
    ]
  },
  tables: [
    {
      key: 'companyInfoList',
      title: 'Company List',
      searchPlaceholder: 'Search by company name, short name, email...',
      pageSize: 10,
      api: {
        list: '/adm-company-infos',
        export: '/adm-company-infos/export',
        delete: '/adm-company-infos'
      },
      columns: [
        { key: 'compName', header: 'Company Name', sortable: true },
        { key: 'shortNameEng', header: 'Short Name', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'phoneNo', header: 'Phone', sortable: true },
        { key: 'sortOrder', header: 'Sort Order', type: 'number', sortable: true },
        { key: 'isActive', header: 'Status', type: 'status', sortable: true }
      ],
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pi pi-pencil', permission: 'CompanyInfo.Update' },
        { key: 'delete', label: 'Delete', icon: 'pi pi-trash', danger: true, permission: 'CompanyInfo.Delete' }
      ]
    }
  ]
};
