import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TokenStoreService } from '../../core/services/token-store.service';

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss'
})
export class UserProfilePage implements OnInit {
  user: any;
  context: any;
  loading = false;
  error = '';

  constructor(
    private readonly auth: AuthService,
    private readonly tokenStore: TokenStoreService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.tokenStore.getUser() || {};
    this.context = this.tokenStore.getContext();
    this.loading = true;
    this.auth.me().subscribe({
      next: (me: any) => {
        this.user = { ...this.user, ...(me || {}) };
        this.tokenStore.setUser(this.user);
      },
      error: (err: any) => this.error = err?.message || 'Profile could not be loaded.',
      complete: () => this.loading = false
    });
  }

  get displayName(): string { return this.user?.fullName || this.user?.username || 'User'; }
  get profileImageUrl(): string { return this.user?.profileImageUrl || this.user?.userImageUrl || this.user?.imageUrl || ''; }
  get signatureImageUrl(): string { return this.user?.signatureImageUrl || this.user?.userSignatureUrl || this.user?.signatureUrl || ''; }
  get avatarText(): string { return (this.displayName || 'U').trim().charAt(0).toUpperCase(); }

  back(): void { this.router.navigateByUrl('/erp/workspace'); }
}
