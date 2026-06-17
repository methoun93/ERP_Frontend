# Angular ERP System - Complete Setup Guide

## 📋 Overview
This is a complete port of your Next.js ERP system to **Angular 18** with the exact same functionality:
- ✅ Configuration-driven CRUD forms (CrudMaster)
- ✅ Search, pagination, filtering
- ✅ Generic CRUD service (RxJS-based)
- ✅ Notification system (PrimeNG Toast)
- ✅ File upload handling
- ✅ All module pages ready
- ✅ Same #059669 green theme

---

## 🚀 Quick Start

### 1. **Update Core Services**
Place the following files in your project:

```
src/app/core/services/
  ├── crud.service.ts         (Generic CRUD operations)
  ├── notification.service.ts (Toast alerts)
  └── file-upload.service.ts  (File handling)
```

### 2. **Add CrudMaster Component**
```
src/app/shared/components/
  └── crud-master.component.ts  (Universal form + list)
```

### 3. **Add Configuration Files**
```
src/app/shared/config/
  ├── api-routes.ts
  └── page-configs/
      ├── buyers.config.ts
      ├── suppliers.config.ts
      ├── colors.config.ts
      └── ... (more configs)
```

### 4. **Create Page Components**
```
src/app/features/base-setup/
  ├── buyers/
  │   └── buyers.page.ts
  ├── suppliers/
  │   └── suppliers.page.ts
  └── colors/
      └── colors.page.ts
```

---

## 📝 How to Create a New CRUD Page

### Step 1: Create Configuration (`.config.ts`)

```typescript
// src/app/shared/config/page-configs/countries.config.ts
import { CrudMasterConfig } from '@/app/shared/components/crud-master.component';
import { apiRoutes } from './api-routes';

export const CountriesPageConfig: CrudMasterConfig = {
  title: 'Country',
  subtitle: 'Base Setup / General Setup',
  endpoint: apiRoutes.baseCountries,        // API endpoint
  idKey: 'countryId',                       // Primary key
  gridCols: 3,                              // Form grid columns
  tableColumns: ['countryName', 'countryCode', 'isActive'],  // List columns
  fields: [
    { 
      key: 'countryName', 
      label: 'Country Name', 
      type: 'text',           // text, email, number, date, textarea, select, searchSelect, checkbox, file
      required: true,
      colSpan: 2 
    },
    { 
      key: 'countryCode', 
      label: 'ISO Code', 
      type: 'text',
      maxLength: 3
    },
    { 
      key: 'dialCode', 
      label: 'Dial Code', 
      type: 'text' 
    },
    { 
      key: 'isActive', 
      label: 'Active', 
      type: 'checkbox' 
    },
  ],
};
```

### Step 2: Create Page Component

```typescript
// src/app/features/base-setup/countries/countries.page.ts
import { Component } from '@angular/core';
import { CrudMasterComponent } from '@/app/shared/components/crud-master.component';
import { CountriesPageConfig } from '@/app/shared/config/page-configs/countries.config';

@Component({
  selector: 'app-countries-page',
  standalone: true,
  imports: [CrudMasterComponent],
  template: '<app-crud-master [config]="config"></app-crud-master>',
})
export class CountriesPage {
  config = CountriesPageConfig;
}
```

### Step 3: Add Route

```typescript
// src/app/app.routes.ts
{
  path: 'erp/base-setup/countries',
  component: CountriesPage,
  canActivate: [companyContextGuard],
}
```

---

## 🎨 Field Types Reference

```typescript
// Text Input
{ key: 'name', label: 'Name', type: 'text', required: true }

// Email
{ key: 'email', label: 'Email', type: 'email' }

// Number
{ key: 'quantity', label: 'Qty', type: 'number' }

// Date
{ key: 'createdAt', label: 'Created', type: 'date' }

// Textarea
{ key: 'description', label: 'Notes', type: 'textarea', colSpan: 3 }

// Checkbox
{ key: 'isActive', label: 'Active', type: 'checkbox' }

// Select Dropdown
{ 
  key: 'status', 
  label: 'Status', 
  type: 'select',
  options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ]
}

// Search Select (dropdown with search)
{ 
  key: 'countryId', 
  label: 'Country', 
  type: 'searchSelect',
  required: true,
  options: [
    { label: 'Bangladesh', value: '1' },
    { label: 'India', value: '2' }
  ]
}

// File Upload
{ 
  key: 'attachments', 
  label: 'Files', 
  type: 'file' 
}
```

---

## 🔌 API Integration

The `CrudService` handles all CRUD operations automatically:

```typescript
// GET list with pagination, search, filters
GET /api/base-setup/buyers?page=1&limit=10&search=xyz

// GET single record
GET /api/base-setup/buyers/{id}

// POST create
POST /api/base-setup/buyers
{ buyerName: "ABC Corp", email: "info@abc.com" }

// PUT update
PUT /api/base-setup/buyers/{id}
{ buyerName: "ABC Corp Updated", email: "new@abc.com" }

// DELETE
DELETE /api/base-setup/buyers/{id}
```

---

## 📱 Notifications

```typescript
// In any component
constructor(private notification: NotificationService) {}

// Success
this.notification.success('Record created successfully!', 'Success');

// Error
this.notification.error('Something went wrong', 'Error');

// Info
this.notification.info('Please review the changes', 'Info');

// Warning
this.notification.warn('This action cannot be undone', 'Warning');
```

---

## 📁 Page Config Structure

```typescript
export const ConfigName: CrudMasterConfig = {
  // Display title
  title: 'Buyer',
  
  // Breadcrumb subtitle
  subtitle: 'Base Setup / Merchandising Setup',
  
  // API endpoint (from apiRoutes)
  endpoint: apiRoutes.baseBuyers,
  
  // Primary key field name
  idKey: 'buyerId',
  
  // Form grid columns (2, 3, or 4)
  gridCols: 3,
  
  // Columns to show in list table
  tableColumns: ['buyerName', 'buyerCode', 'email', 'isActive'],
  
  // Page size (default: 10)
  pageSize: 10,
  
  // Form fields configuration
  fields: [
    { key: '...', label: '...', type: '...', ... }
  ],
};
```

---

## 🛠️ Advanced Features

### Custom Validation
Implement in your page component or service:

```typescript
export class CountriesPage {
  validateForm(form: any): boolean {
    if (!form.countryName?.trim()) {
      this.notification.error('Country name is required');
      return false;
    }
    if (form.countryCode?.length !== 3) {
      this.notification.error('Country code must be 3 characters');
      return false;
    }
    return true;
  }
}
```

### Custom API Endpoints
Extend `CrudService` for special cases:

```typescript
export class BuyerService extends CrudService {
  bulkImport(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('/api/base-setup/buyers/bulk-import', formData);
  }
}
```

### Dynamic Options Loading
Load options from API:

```typescript
export const BuyersPageConfig: CrudMasterConfig = {
  // ... config
  fields: [
    { 
      key: 'countryId', 
      label: 'Country', 
      type: 'searchSelect',
      options: [] // Load dynamically in component
    },
  ],
};

// In component
ngOnInit() {
  this.crudService.list('/api/base-setup/countries').subscribe(result => {
    const countries = normalizeList(result);
    this.config.fields
      .find(f => f.key === 'countryId')
      .options = countries.map(c => ({ 
        label: c.countryName, 
        value: c.countryId 
      }));
  });
}
```

---

## 🗂️ Module Structure Example

```
src/app/features/
├── base-setup/
│   ├── buyers/
│   │   └── buyers.page.ts
│   ├── suppliers/
│   │   └── suppliers.page.ts
│   ├── colors/
│   │   └── colors.page.ts
│   └── sizes/
│       └── sizes.page.ts
├── merchandising/
│   ├── buyer-inquiry/
│   │   └── buyer-inquiry.page.ts
│   ├── quotation-management/
│   │   └── quotations.page.ts
│   └── master-settings/
│       ├── buyers/
│       └── suppliers/
└── administration/
    ├── users/
    ├── roles/
    └── permissions/
```

---

## 📦 Dependencies

Ensure these are installed:

```bash
npm install @angular/common @angular/forms primeng primeicons
```

Update `app.config.ts`:

```typescript
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers
    MessageService,
  ],
};
```

---

## 🎯 Key Features Implemented

| Feature | Status | Notes |
|---------|--------|-------|
| CRUD Master Form | ✅ | Config-driven, all field types |
| Search & Filter | ✅ | Debounced search |
| Pagination | ✅ | Page size: 10 (customizable) |
| Sorting | ✅ | Backend-handled |
| Inline Edit | ✅ | Modal form |
| Delete with Confirm | ✅ | Confirmation dialog |
| File Upload | ✅ | Multi-file support |
| Notifications | ✅ | Toast alerts (PrimeNG) |
| Error Handling | ✅ | API error messages |
| Loading States | ✅ | Spinners, disabled buttons |
| Responsive Design | ✅ | Mobile-friendly |
| Green Theme | ✅ | #059669 primary color |

---

## 🐛 Troubleshooting

### "Cannot find module" errors
- Ensure path aliases are configured in `tsconfig.json`
- Check imports use `@/` prefix

### "API returns 401"
- Verify `AuthInterceptor` adds token to headers
- Check token is stored correctly in `TokenStoreService`

### Form validation not working
- Add required fields in config: `required: true`
- Implement custom validation in page component

### Notifications not showing
- Import `ToastModule` from PrimeNG in your component
- Ensure `MessageService` is provided

---

## 📚 File Checklist

Copy these files to your Angular project:

- [x] `crud.service.ts` (Core CRUD service)
- [x] `notification.service.ts` (Toast notifications)
- [x] `file-upload.service.ts` (File uploads)
- [x] `crud-master.component.ts` (Universal form + list)
- [x] `api-routes.ts` (Endpoint definitions)
- [x] `page-configs/*.config.ts` (Page configurations)
- [x] `features/*/*.page.ts` (Page components)

---

## 🚀 Next Steps

1. **Copy all files** to your Angular project
2. **Update API routes** in `api-routes.ts` to match your backend
3. **Create page configs** for each CRUD page
4. **Add routes** to `app.routes.ts`
5. **Test** with your backend API

---

**Good luck! 🎉**
