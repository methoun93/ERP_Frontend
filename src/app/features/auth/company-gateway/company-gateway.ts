import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CompanyContextArea, CompanyContextCompany } from '../../../core/auth/auth.models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-company-gateway',
  imports: [CommonModule, FormsModule],
  templateUrl: './company-gateway.html',
  styleUrl: './company-gateway.scss',
})
export class CompanyGateway implements OnInit {
  companies: CompanyContextCompany[] = [];
  areas: CompanyContextArea[] = [];
  companyId = '';
  areaId = '';
  loading = false;
  areaLoading = false;
  saving = false;
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notification: NotificationService
  ) {}


  get selectedCompanyName(): string {
    return this.companies.find((company) => company.companyId === this.companyId)?.companyName || 'Selected company';
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.error = '';
    this.auth.companies().subscribe({
      next: (items) => {
        this.companies = items;
        if (items.length === 1) {
          this.companyId = String(items[0].companyId);
          this.loadAreas();
        }
      },
      error: (err: unknown) => {
        this.error = this.notification.extractErrorMessage(err);
        this.notification.error(err, 'Company Load Failed');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  loadAreas(): void {
    this.areas = [];
    this.areaId = '';
    if (!this.companyId) return;

    this.areaLoading = true;
    this.error = '';
    this.auth.areas(this.companyId).subscribe({
      next: (items) => {
        this.areas = items;
        if (items.length === 1) this.areaId = String(items[0].areaId);
      },
      error: (err: unknown) => {
        this.error = this.notification.extractErrorMessage(err);
        this.notification.error(err, 'Area Load Failed');
        this.areaLoading = false;
      },
      complete: () => {
        this.areaLoading = false;
      },
    });
  }

  continue(): void {
    this.error = '';

    if (!this.companyId || !this.areaId) {
      this.notification.warning('Please select company and area.', 'Selection Required');
      return;
    }

    this.saving = true;
    this.auth.selectContext({ companyId: this.companyId, areaId: this.areaId }).subscribe({
      next: () => {
        //this.notification.success('Company and area selected successfully.', 'Context Selected');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/erp/workspace';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: unknown) => {
        this.error = this.notification.extractErrorMessage(err);
        this.notification.error(err, 'Company Gateway Failed');
        this.saving = false;
      },
      complete: () => {
        this.saving = false;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.notification.info('You have been logged out.', 'Logged Out');
    this.router.navigateByUrl('/login');
  }
}
