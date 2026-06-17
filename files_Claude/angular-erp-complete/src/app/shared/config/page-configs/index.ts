/**
 * PAGE CONFIGURATION EXPORTS
 * Re-export all page configurations for easy importing
 */

// Base Setup - General Setup
export { BuyersPageConfig } from './page-configs/buyers.config';
export { SuppliersPageConfig } from './page-configs/suppliers.config';
export { ColorsPageConfig } from './page-configs/colors.config';
export { SizesPageConfig } from './page-configs/sizes.config';

/**
 * USAGE EXAMPLE:
 * 
 * In your page component:
 * 
 * import { Component } from '@angular/core';
 * import { CrudMasterComponent } from '@/app/shared/components/crud-master.component';
 * import { BuyersPageConfig } from '@/app/shared/config';
 * 
 * @Component({
 *   selector: 'app-buyers-page',
 *   standalone: true,
 *   imports: [CrudMasterComponent],
 *   template: '<app-crud-master [config]="config"></app-crud-master>',
 * })
 * export class BuyersPage {
 *   config = BuyersPageConfig;
 * }
 */
