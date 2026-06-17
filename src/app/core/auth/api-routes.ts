export const apiRoutes = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    me: '/auth/me',
    changePassword: '/auth/change-password',
    modules: '/auth/modules',
    tree: '/auth/tree',
    companies: '/auth/companies',
    companyAreas: (companyId: string | number) => `/auth/companies/${companyId}/areas`,
    selectContext: '/auth/select-context',
  },
};
