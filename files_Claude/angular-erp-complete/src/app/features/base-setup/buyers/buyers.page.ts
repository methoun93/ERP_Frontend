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
