import { CrudMasterConfig } from '../../components/crud-master.component';

export const BuyersPageConfig: CrudMasterConfig = {
  route: '/base-setup/merchandising-setup/base-buyers',
  title: 'Buyers',
  subtitle: 'Manage buyers.',
  endpoint: '/base-buyers',
  idKey: 'buyerId',
  fields: [],
  tableColumns: [],
  gridCols: 3,
};
