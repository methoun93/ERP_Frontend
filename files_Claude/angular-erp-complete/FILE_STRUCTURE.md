# 📁 Angular ERP - File Structure

```
src/app/
│
├── core/
│   └── services/
│       ├── crud.service.ts              ✨ CRUD operations (list, create, update, delete)
│       ├── notification.service.ts      ✨ Toast notifications
│       ├── file-upload.service.ts       ✨ File upload handling
│       ├── api-client.service.ts        ✅ (Existing)
│       ├── token-store.service.ts       ✅ (Existing)
│       └── ...other services
│
├── shared/
│   ├── components/
│   │   ├── crud-master.component.ts     ✨ Universal form + list component
│   │   ├── erp-form-master/             ✅ (Existing)
│   │   └── ui/                          ✅ (Existing)
│   │
│   └── config/
│       ├── api-routes.ts                ✨ All API endpoints
│       ├── erp-navigation.ts            ✅ (Existing)
│       ├── index.ts                     ✅ (Existing)
│       │
│       └── page-configs/                ✨ ALL CONFIGURATIONS HERE
│           ├── index.ts                 ✨ Configuration exports
│           ├── buyers.config.ts         ✨ Buyers CRUD config
│           ├── suppliers.config.ts      ✨ Suppliers CRUD config
│           ├── colors.config.ts         ✨ Colors CRUD config
│           ├── sizes.config.ts          ✨ Sizes CRUD config
│           ├── seasons.config.ts        ✨ Seasons CRUD config
│           ├── uoms.config.ts           ✨ UOMs CRUD config
│           ├── currencies.config.ts     ✨ Currencies CRUD config
│           ├── countries.config.ts      ✨ Countries CRUD config
│           ├── ports.config.ts          ✨ Ports CRUD config
│           ├── incoterms.config.ts      ✨ Incoterms CRUD config
│           ├── payment-terms.config.ts  ✨ Payment Terms CRUD config
│           ├── fabrics.config.ts        ✨ Fabrics CRUD config
│           ├── fabric-types.config.ts   ✨ Fabric Types CRUD config
│           ├── gsm.config.ts            ✨ GSM CRUD config
│           ├── yarn-counts.config.ts    ✨ Yarn Counts CRUD config
│           ├── garment-items.config.ts  ✨ Garment Items CRUD config
│           ├── departments.config.ts    ✨ Departments CRUD config
│           ├── users.config.ts          ✨ Users CRUD config
│           └── roles.config.ts          ✨ Roles CRUD config
│
└── features/
    ├── base-setup/
    │   ├── buyers/
    │   │   └── buyers.page.ts           ✨ Buyers page component
    │   ├── suppliers/
    │   │   └── suppliers.page.ts        ✨ Suppliers page component
    │   ├── colors/
    │   │   └── colors.page.ts           ✨ Colors page component
    │   ├── sizes/
    │   │   └── sizes.page.ts            ✨ Sizes page component
    │   ├── countries/
    │   │   └── countries.page.ts        ✨ Countries page component
    │   ├── ports/
    │   │   └── ports.page.ts            ✨ Ports page component
    │   ├── incoterms/
    │   │   └── incoterms.page.ts        ✨ Incoterms page component
    │   ├── payment-terms/
    │   │   └── payment-terms.page.ts    ✨ Payment Terms page component
    │   ├── seasons/
    │   │   └── seasons.page.ts          ✨ Seasons page component
    │   ├── uoms/
    │   │   └── uoms.page.ts             ✨ UOMs page component
    │   ├── currencies/
    │   │   └── currencies.page.ts       ✨ Currencies page component
    │   ├── fabrics/
    │   │   └── fabrics.page.ts          ✨ Fabrics page component
    │   ├── fabric-types/
    │   │   └── fabric-types.page.ts     ✨ Fabric Types page component
    │   ├── gsm/
    │   │   └── gsm.page.ts              ✨ GSM page component
    │   └── yarn-counts/
    │       └── yarn-counts.page.ts      ✨ Yarn Counts page component
    │
    ├── merchandising/
    │   ├── buyers/
    │   │   └── buyers.page.ts           ✨ Merchandising Buyers page
    │   ├── suppliers/
    │   │   └── suppliers.page.ts        ✨ Merchandising Suppliers page
    │   ├── colors/
    │   │   └── colors.page.ts           ✨ Merchandising Colors page
    │   ├── sizes/
    │   │   └── sizes.page.ts            ✨ Merchandising Sizes page
    │   ├── garment-items/
    │   │   └── garment-items.page.ts    ✨ Garment Items page
    │   ├── departments/
    │   │   └── departments.page.ts      ✨ Departments page
    │   └── pay-modes/
    │       └── pay-modes.page.ts        ✨ Pay Modes page
    │
    └── administration/
        ├── users/
        │   └── users.page.ts            ✨ Users CRUD page
        ├── roles/
        │   └── roles.page.ts            ✨ Roles CRUD page
        └── permissions/
            └── permissions.page.ts      ✨ Permissions CRUD page

ROOT DOCUMENTATION
├── README.md                            📖 Feature overview & usage guide
└── INSTALLATION.md                      📖 Installation instructions
```

---

## Legend
- ✨ **NEW** - Files added in this package
- ✅ **EXISTING** - Files already in your Angular project (keep them)

---

## Total Files Added
- **3** Core Services
- **1** Reusable Component (CrudMaster)
- **1** API Routes Config
- **18+** Page Configurations (extend as needed)
- **30+** Page Components (create following the pattern)
- **2** Documentation files

---

## Quick Integration Checklist

- [ ] Copy `crud.service.ts` to `src/app/core/services/`
- [ ] Copy `notification.service.ts` to `src/app/core/services/`
- [ ] Copy `file-upload.service.ts` to `src/app/core/services/`
- [ ] Copy `crud-master.component.ts` to `src/app/shared/components/`
- [ ] Copy `api-routes.ts` to `src/app/shared/config/`
- [ ] Copy all `.config.ts` files to `src/app/shared/config/page-configs/`
- [ ] Create page components following the pattern
- [ ] Add routes to `app.routes.ts`
- [ ] Add `MessageService` to `app.config.ts`
- [ ] Add `ToastModule` to main component
- [ ] Test with backend API

---

**Happy coding! 🚀**
