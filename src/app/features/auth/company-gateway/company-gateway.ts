import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CompanyContextArea, CompanyContextCompany } from '../../../core/auth/auth.models';
import { NotificationService } from '../../../core/services/notification.service';
import { TokenStoreService } from '../../../core/services/token-store.service';

@Component({
  standalone: true,
  selector: 'app-company-gateway',
  imports: [CommonModule, FormsModule],
  templateUrl: './company-gateway.html',
  styleUrl: './company-gateway.scss',
})
export class CompanyGateway implements OnInit {
  existingContext: any = null;

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
    private readonly notification: NotificationService,
    private readonly tokenStore: TokenStoreService
  ) {}

  get selectedCompanyName(): string {
    return this.companies.find((company) => String(company.companyId) === String(this.companyId))?.companyName || 'Selected company';
  }

  ngOnInit(): void {
    this.existingContext = this.tokenStore.getContext();
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.loading = true;
    this.error = '';

    this.auth.companies().subscribe({
      next: (items) => {
        this.companies = items || [];

        const defaultCompanyId = String(this.existingContext?.companyId || '');

        if (defaultCompanyId && this.companies.some((x) => String(x.companyId) === defaultCompanyId)) {
          this.companyId = defaultCompanyId;
          this.loadAreas(true);
          return;
        }

        if (this.companies.length === 1) {
          this.companyId = String(this.companies[0].companyId);
          this.loadAreas(true);
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

  loadAreas(keepDefault = false): void {
    this.areas = [];

    const previousAreaId = keepDefault
      ? String(this.existingContext?.areaId || this.areaId || '')
      : '';

    this.areaId = '';

    if (!this.companyId) {
      return;
    }

    this.areaLoading = true;
    this.error = '';

    this.auth.areas(this.companyId).subscribe({
      next: (items) => {
        this.areas = items || [];

        const hasPrevious =
          previousAreaId &&
          this.areas.some((x) => String(x.areaId) === previousAreaId);

        if (hasPrevious) {
          this.areaId = previousAreaId;
          return;
        }

        if (this.areas.length === 1) {
          this.areaId = String(this.areas[0].areaId);
        } else if (this.areas.length > 0) {
          this.areaId = String(this.areas[0].areaId);
        }
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