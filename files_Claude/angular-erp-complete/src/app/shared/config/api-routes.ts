export const apiRoutes = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    companies: '/auth/companies',
    companyAreas: (companyId: string | number) => `/auth/company-areas/${companyId}`,
    selectContext: '/auth/select-context',
    changePassword: '/auth/change-password',
  },

  // Base Setup - General Setup
  baseCountries: '/api/base-setup/countries',
  basePorts: '/api/base-setup/ports',
  baseIncoterms: '/api/base-setup/incoterms',
  basePaymentTerms: '/api/base-setup/payment-terms',

  // Base Setup - Merchandising Setup
  baseBuyers: '/api/base-setup/buyers',
  baseSuppliers: '/api/base-setup/suppliers',
  baseColors: '/api/base-setup/colors',
  baseSizes: '/api/base-setup/sizes',
  baseSeasons: '/api/base-setup/seasons',
  baseUoms: '/api/base-setup/uoms',
  baseCurrencies: '/api/base-setup/currencies',

  // Base Setup - Textile Setup
  baseFabrics: '/api/base-setup/fabrics',
  baseFabricTypes: '/api/base-setup/fabric-types',
  baseGsm: '/api/base-setup/gsm',
  baseYarnCounts: '/api/base-setup/yarn-counts',

  // Merchandising - Quotation Management
  buyerInquiries: '/api/merchandising/buyer-inquiries',
  buyerInquiry: '/api/merchandising/buyer-inquiry',

  // Merchandising - Master Settings
  merchBuyers: '/api/merchandising/buyers',
  merchSuppliers: '/api/merchandising/suppliers',
  merchColors: '/api/merchandising/colors',
  merchSizes: '/api/merchandising/sizes',
  merchSeasons: '/api/merchandising/seasons',
  merchUoms: '/api/merchandising/uoms',
  merchCurrencies: '/api/merchandising/currencies',
  merchPayModes: '/api/merchandising/pay-modes',
  merchGarmentItems: '/api/merchandising/garment-items',
  merchDepartments: '/api/merchandising/departments',

  // Administration
  admUsers: '/api/administration/users',
  admRoles: '/api/administration/roles',
  admPermissions: '/api/administration/permissions',
  admModules: '/api/administration/modules',
  admMenus: '/api/administration/menus',
  admSubMenus: '/api/administration/sub-menus',
  admCompanies: '/api/administration/companies',
  admAreas: '/api/administration/areas',
  admRolePermissions: '/api/administration/role-permissions',
  admUserPermissions: '/api/administration/user-permissions',
};
