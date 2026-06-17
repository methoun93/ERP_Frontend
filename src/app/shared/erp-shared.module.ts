import { NgModule } from '@angular/core';
import { ErpFormMasterComponent } from './erp-form-master/erp-form-master.component';
import { ErpDataTableComponent } from './erp-data-table/erp-data-table.component';

@NgModule({
  imports: [ErpFormMasterComponent, ErpDataTableComponent],
  exports: [ErpFormMasterComponent, ErpDataTableComponent]
})
export class ErpSharedModule {}
