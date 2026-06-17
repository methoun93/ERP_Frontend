import { Component } from '@angular/core';
import { CrudMasterComponent } from '../../../shared/components/crud-master.component';
import { BuyersPageConfig } from '../../../shared/config/page-configs/buyers.config';

@Component({
  selector: 'app-buyers-page',
  standalone: true,
  imports: [CrudMasterComponent],
  template: '<app-crud-master [config]="config"></app-crud-master>',
})
export class BuyersPage {
  config = BuyersPageConfig;
}
