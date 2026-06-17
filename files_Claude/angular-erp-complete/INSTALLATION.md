# 🚀 Angular ERP - Installation Guide

## Prerequisites
- Node.js 16+ 
- Angular 18+
- npm or yarn

## Step 1: Install Dependencies

```bash
npm install primeng primeicons @angular/common @angular/forms
```

## Step 2: Copy Service Files

Copy these files to `src/app/core/services/`:

```
crud.service.ts
notification.service.ts
file-upload.service.ts
```

## Step 3: Copy Component Files

Copy `crud-master.component.ts` to `src/app/shared/components/`

## Step 4: Copy Configuration Files

Copy all files from `page-configs/` to `src/app/shared/config/page-configs/`

And update these in `src/app/shared/config/`:
- `api-routes.ts`
- `erp-navigation.ts` (already exists, no changes needed)

## Step 5: Update app.config.ts

Add `MessageService` from PrimeNG:

```typescript
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    MessageService, // Add this
    // ... other providers
  ],
};
```

## Step 6: Update app.ts (Main Component)

Ensure your main app component imports `ToastModule`:

```typescript
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule], // Add ToastModule
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
```

## Step 7: Add Toast Component to Main Template

Add to `app.html`:

```html
<p-toast></p-toast>
<router-outlet></router-outlet>
```

## Step 8: Create Page Components

For each CRUD page, create a component like:

```typescript
// src/app/features/base-setup/buyers/buyers.page.ts
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

## Step 9: Add Routes

Update `app.routes.ts` to include your CRUD pages:

```typescript
import { BuyersPage } from './features/base-setup/buyers/buyers.page';
import { SuppliersPage } from './features/base-setup/suppliers/suppliers.page';
// ... other imports

export const routes: Routes = [
  // ... existing routes
  {
    path: 'erp',
    component: ErpShell,
    canActivate: [companyContextGuard],
    children: [
      // ... existing routes
      {
        path: 'base-setup/buyers',
        component: BuyersPage,
      },
      {
        path: 'base-setup/suppliers',
        component: SuppliersPage,
      },
      // Add more routes here
    ],
  },
];
```

## Step 10: Verify Environment Configuration

Check `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5001/api', // Your API URL
};
```

## Step 11: Test

1. Start your Angular dev server:
```bash
ng serve
```

2. Navigate to a CRUD page (e.g., `/erp/base-setup/buyers`)

3. Test:
   - ✅ List loads data
   - ✅ Search works
   - ✅ Pagination works
   - ✅ Create button opens form
   - ✅ Form submission works
   - ✅ Edit button loads data in form
   - ✅ Delete shows confirmation
   - ✅ Notifications appear

## Common Issues & Solutions

### Issue: "Cannot find module @/" 
**Solution:** Ensure `tsconfig.json` has path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Issue: "No provider for MessageService"
**Solution:** Add `MessageService` to `app.config.ts` providers

### Issue: API calls fail with CORS error
**Solution:** Check backend CORS configuration allows your frontend URL

### Issue: Notifications don't show
**Solution:** 
1. Ensure `<p-toast></p-toast>` is in your main template
2. Ensure `ToastModule` is imported in main component

### Issue: Form doesn't submit
**Solution:**
1. Check required fields are filled
2. Verify API endpoint is correct in config
3. Check network tab for API errors

## Next Steps

1. Create configs for all your CRUD pages
2. Add routes for all pages
3. Test with your backend API
4. Customize styling if needed (#059669 is primary color)

## Support

For issues or questions:
1. Check README.md for feature documentation
2. Review example configs in `page-configs/`
3. Check browser console for errors
4. Check Network tab for API issues

---

**Installation complete! 🎉**
