import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = '';
  password = '';
  remember = true;
  showPassword = false;
  loading = false;
  error = '';

  modules = ['HRM', 'Payroll', 'Merchandising', 'General Store', 'Yarn Store', 'Production', 'Quality', 'Accounts', 'Procurement'];

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly notification: NotificationService
  ) {}

  submit(): void {
    this.error = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.notification.warning('Please enter username and password.', 'Login Required');
      return;
    }

    this.loading = true;
    this.auth.login({ username: this.username.trim(), password: this.password, rememberMe: this.remember }).subscribe({
      next: () => {
        //this.notification.success('Login successful. Please select your company and area.', 'Login Success');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/erp/workspace';
        this.router.navigate(['/company-gateway'], { queryParams: { returnUrl } });
      },
      error: (err: unknown) => {
        this.error = this.notification.extractErrorMessage(err);
        this.notification.error(err, 'Login Failed');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
