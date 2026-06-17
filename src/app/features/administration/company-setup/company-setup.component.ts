import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ErpFormMasterComponent } from '../../../shared/erp-form-master/erp-form-master.component';
import { ErpFormSection } from '../../../shared/erp-form-master/erp-form-master.types';
import { ErpDataTableComponent } from '../../../shared/erp-data-table/erp-data-table.component';
import { ErpDataTableColumn, ErpTableAction } from '../../../shared/erp-data-table/erp-data-table.types';

interface CompanyForm {
  companyName: string;
  companyCode: string;
  shortName: string;
  phone: string;
  email: string;
  country: string;
  currency: string;
  address: string;
  city: string;
  status: string;
}

interface AreaForm {
  companyId: number | null;
  areaName: string;
  areaCode: string;
  description: string;
  status: string;
}

@Component({
  selector: 'app-company-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ErpFormMasterComponent, ErpDataTableComponent],
  templateUrl: './company-setup.component.html',
  styleUrls: ['./company-setup.component.scss']
})
export class CompanySetupComponent {
  savingCompany = false;
  savingArea = false;

  companyForm!: FormGroup;
  areaForm!: FormGroup;

  statusOptions = [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }];
  companyOptions = [{ value: 1, label: 'Test Company Ltd.' }, { value: 2, label: 'Alpha Garments Ltd.' }];

  companySections: ErpFormSection<CompanyForm>[] = [{
    title: 'Company Information',
    columns: 3,
    fields: [
      { key: 'companyName', label: 'Company Name', required: true },
      { key: 'companyCode', label: 'Company Code', required: true },
      { key: 'address', label: 'Address', type: 'textarea', required: true },
      { key: 'shortName', label: 'Short Name', required: true },
      { key: 'phone', label: 'Phone' },
      { key: 'city', label: 'City', required: true },
      { key: 'country', label: 'Country', type: 'select', required: true, options: [{ value: 'Bangladesh', label: 'Bangladesh' }] },
      { key: 'currency', label: 'Currency', type: 'select', options: [{ value: 'BDT', label: 'BDT - Bangladesh Taka' }] },
      { key: 'status', label: 'Status', type: 'select', required: true, options: this.statusOptions },
      { key: 'email', label: 'Email', type: 'email' }
    ]
  }];

  areaSections: ErpFormSection<AreaForm>[] = [{
    title: 'Area Information',
    columns: 2,
    fields: [
      { key: 'companyId', label: 'Company', type: 'select', required: true, options: this.companyOptions },
      { key: 'areaName', label: 'Area Name', required: true },
      { key: 'areaCode', label: 'Area Code', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', required: true, options: this.statusOptions }
    ]
  }];

  companyColumns: ErpDataTableColumn[] = [
    { key: 'companyName', header: 'Company Name', sortable: true },
    { key: 'companyCode', header: 'Code', sortable: true },
    { key: 'shortName', header: 'Short Name', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'city', header: 'City', sortable: true },
    { key: 'status', header: 'Status', type: 'status', sortable: true }
  ];

  areaColumns: ErpDataTableColumn[] = [
    { key: 'companyName', header: 'Company', sortable: true },
    { key: 'areaName', header: 'Area Name', sortable: true },
    { key: 'areaCode', header: 'Area Code', sortable: true },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status', type: 'status', sortable: true }
  ];

  companyRows = [
    { companyName: 'Test Company Ltd.', companyCode: 'TCL-001', shortName: 'TCL', phone: '+880 1711-123456', email: 'info@testcompany.com', country: 'Bangladesh', city: 'Dhaka', status: 'Active' },
    { companyName: 'Alpha Garments Ltd.', companyCode: 'AGL-002', shortName: 'AGL', phone: '+880 1811-654321', email: 'contact@alpha.com', country: 'Bangladesh', city: 'Gazipur', status: 'Active' },
    { companyName: 'Beta Textiles', companyCode: 'BTL-003', shortName: 'BTL', phone: '+880 1911-987654', email: 'info@beta.com', country: 'Bangladesh', city: 'Narayanganj', status: 'Inactive' }
  ];

  areaRows = [
    { companyName: 'Test Company Ltd.', areaName: 'Uttara', areaCode: 'UTT-001', description: 'Uttara Industrial Area, Dhaka', status: 'Active' },
    { companyName: 'Test Company Ltd.', areaName: 'Tongi', areaCode: 'TON-002', description: 'Tongi Industrial Area, Gazipur', status: 'Active' },
    { companyName: 'Test Company Ltd.', areaName: 'Chittagong', areaCode: 'CTG-004', description: 'Chittagong EPZ Area', status: 'Inactive' }
  ];

  tableActions: ErpTableAction[] = [
    { key: 'edit', label: 'Edit', icon: '✎', handler: (row: unknown) => console.log('edit', row) },
    { key: 'delete', label: 'Delete', icon: '🗑', danger: true, handler: (row: unknown) => console.log('delete', row) }
  ];

  constructor(private fb: FormBuilder) {
    this.companyForm = this.fb.group({
      companyName: ['Test Company Ltd.', Validators.required],
      companyCode: ['TCL-001', Validators.required],
      shortName: ['TCL', Validators.required],
      phone: ['+880 1711-123456'],
      email: ['info@testcompany.com'],
      country: ['Bangladesh', Validators.required],
      currency: ['BDT'],
      address: ['House # 123, Road # 5, Uttara, Dhaka-1230, Bangladesh', Validators.required],
      city: ['Dhaka', Validators.required],
      status: ['Active', Validators.required]
    });

    this.areaForm = this.fb.group({
      companyId: [1, Validators.required],
      areaName: ['Uttara', Validators.required],
      areaCode: ['UTT-001', Validators.required],
      description: ['Uttara Industrial Area, Dhaka'],
      status: ['Active', Validators.required]
    });
  }

  saveCompany(): void { console.log('save company', this.companyForm.value); }
  saveArea(): void { console.log('save area', this.areaForm.value); }
  resetCompany(): void { this.companyForm.reset({ status: 'Active', country: 'Bangladesh', currency: 'BDT' }); }
  resetArea(): void { this.areaForm.reset({ status: 'Active' }); }
}
