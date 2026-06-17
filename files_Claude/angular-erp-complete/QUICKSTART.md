# 🚀 Quick Start Guide - Angular ERP CRUD System

## 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
npm install primeng primeicons
```

### Step 2: Copy Files (2 mins)
Copy these 3 folders to your Angular project:
- `src/app/core/services/` → Your project's `core/services/`
- `src/app/shared/components/crud-master.component.ts` → Your project's `shared/components/`
- `src/app/shared/config/` → Your project's `shared/config/`

### Step 3: Update Main App (1 min)

**In `app.config.ts`:**
```typescript
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,  // ← Add this
    // ... other providers
  ],
};
```

**In `app.ts`:**
```typescript
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],  // ← Add ToastModule
  templateUrl: './app.html',
})
export class App {}
```

**In `app.html`:**
```html
<p-toast></p-toast>  <!-- ← Add this -->
<router-outlet></router-outlet>
```

### Step 4: Create Your First Page (1 min)

Create `src/app/features/base-setup/buyers/buyers.page.ts`:
```typescript
import { Component } from '@angular/core';
import { CrudMasterComponent } from '@/app/shared/components/crud-master.component';
import { BuyersPageConfig } from '@/app/shared/config/page-configs/buyers.config';

@Component({
  selector: 'app-buyers-page',
  standalone: true,
  imports: [CrudMasterComponent],
  template: '<app-crud-master [config]="config"></app-crud-master>',
})
export class BuyersPage {
  config = BuyersPageConfig;
}
```

### Step 5: Add Route

In `app.routes.ts`:
```typescript
{
  path: 'erp/base-setup/buyers',
  component: BuyersPage,
}
```

### ✅ Done! Test It

1. `ng serve`
2. Navigate to `http://localhost:4200/erp/base-setup/buyers`
3. Click "Create New" button
4. Fill form and submit
5. See your data in the list!

---

## 🎯 Common Tasks

### Add a New CRUD Page

1. **Create config** (2 mins):
```typescript
// src/app/shared/config/page-configs/my-page.config.ts
import { CrudMasterConfig } from '@/app/shared/components/crud-master.component';
import { apiRoutes } from './api-routes';

export const MyPageConfig: CrudMasterConfig = {
  title: 'My Item',
  endpoint: apiRoutes.myEndpoint,
  idKey: 'myItemId',
  gridCols: 3,
  tableColumns: ['name', 'code', 'status'],
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' }
    ]},
  ],
};
```

2. **Create page component** (1 min):
```typescript
// src/app/features/my-module/my-page/my-page.page.ts
import { Component } from '@angular/core';
import { CrudMasterComponent } from '@/app/shared/components/crud-master.component';
import { MyPageConfig } from '@/app/shared/config/page-configs/my-page.config';

@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [CrudMasterComponent],
  template: '<app-crud-master [config]="config"></app-crud-master>',
})
export class MyPage {
  config = MyPageConfig;
}
```

3. **Add route** (30 secs):
```typescript
{ path: 'erp/my-module/my-page', component: MyPage }
```

**Total time: 3.5 minutes**

---

## 📚 Field Types

```typescript
// All available field types:
fields: [
  { key: 'name', type: 'text' },              // Text input
  { key: 'age', type: 'number' },             // Number input
  { key: 'email', type: 'email' },            // Email input
  { key: 'born', type: 'date' },              // Date picker
  { key: 'notes', type: 'textarea' },         // Multi-line text
  { key: 'status', type: 'select', options: [...] },  // Dropdown
  { key: 'country', type: 'searchSelect', options: [...] }, // Searchable dropdown
  { key: 'active', type: 'checkbox' },        // Yes/No checkbox
  { key: 'files', type: 'file' },             // File upload
]
```

---

## 🎨 Styling

Primary color is `#059669` (green). To customize:
1. Search for `#059669` in `crud-master.component.ts`
2. Replace with your color
3. Also update theme colors:
   - Success: `#059669`
   - Error: `#E11D48`
   - Warning: `#EF4444`
   - Light: `#F0FDF4` / `#ECFDF5`

---

## 🔌 API Integration

CrudMaster automatically handles:
- ✅ GET list → `GET /endpoint?page=1&limit=10&search=xyz`
- ✅ GET single → `GET /endpoint/{id}`
- ✅ POST create → `POST /endpoint` with body
- ✅ PUT update → `PUT /endpoint/{id}` with body
- ✅ DELETE → `DELETE /endpoint/{id}`

Your API just needs to follow this pattern. No special handling required!

---

## 📖 Documentation

See these files for detailed info:
- `README.md` - Feature overview
- `INSTALLATION.md` - Complete setup
- `FILE_STRUCTURE.md` - Project structure

---

## 🆘 Troubleshooting

**"Cannot find module @/"**
→ Check `tsconfig.json` has path aliases

**"No provider for MessageService"**
→ Add `MessageService` to `app.config.ts`

**Notifications don't show**
→ Add `<p-toast></p-toast>` to `app.html`

**API calls fail**
→ Check backend CORS, API endpoint in config

---

## 🎉 You're Ready!

Start building your CRUD pages in 5 minutes each! 

Questions? Check:
1. README.md
2. INSTALLATION.md
3. Example configs in `page-configs/`

Happy coding! 🚀
