import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ErpNavigationService } from '../../../core/navigation/erp-navigation.service';

@Component({
  standalone: true,
  selector: 'app-workspace-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './workspace-home.html',
  styleUrl: './workspace-home.scss',
})
export class WorkspaceHome {
  moduleKey = '';
  module: any;
  menus: any[] = [];

  constructor(private readonly route: ActivatedRoute, private readonly navigation: ErpNavigationService) {
this.moduleKey=this.route.snapshot.parent?.paramMap.get('moduleKey') ?? '';
this.module=this.navigation.getModule(this.moduleKey);
this.menus=this.navigation.getMenus(this.moduleKey);
}
}
