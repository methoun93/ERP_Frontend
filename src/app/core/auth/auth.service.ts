import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { ApiClientService } from '../services/api-client.service';
import { TokenStoreService } from '../services/token-store.service';
import { apiRoutes } from './api-routes';
import {
  ChangePasswordRequest,
  CompanyContextArea,
  CompanyContextCompany,
  CompanyContextResponse,
  LoginRequest,
  LoginResponse,
  SelectCompanyContextRequest,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly api: ApiClientService, private readonly tokenStore: TokenStoreService) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(apiRoutes.auth.login, { username: payload.username, password: payload.password }, true).pipe(
      tap((res) => {
        const access = res.accessToken || res.token;
        if (!access) throw new Error('Login succeeded but access token was not returned by API.');
        this.tokenStore.setAccess(access);
        if (res.refreshToken) this.tokenStore.setRefresh(res.refreshToken);
        this.tokenStore.setUser({
          id: String(res.userId ?? res.user?.userId ?? res.user?.id ?? res.id ?? ''),
          userId: String(res.userId ?? res.user?.userId ?? res.user?.id ?? res.id ?? ''),
          username: res.username ?? res.user?.username ?? payload.username,
          fullName: res.fullName ?? res.user?.fullName ?? res.username ?? res.user?.username ?? payload.username,
          email: res.email ?? res.user?.email ?? '',
          role: String(res.role ?? res.user?.role ?? ''),
          roleName: res.roleName ?? res.user?.roleName ?? res.primaryRoleName ?? res.user?.primaryRoleName ?? undefined,
          primaryRoleName: res.primaryRoleName ?? res.user?.primaryRoleName ?? undefined,
          profileImageUrl: res.profileImageUrl ?? res.user?.profileImageUrl ?? undefined,
          signatureImageUrl: res.signatureImageUrl ?? res.user?.signatureImageUrl ?? undefined,
          areaId: res.areaId ? String(res.areaId) : undefined,
        });
        this.tokenStore.clearContext();
      })
    );
  }

  companies(): Observable<CompanyContextCompany[]> {
    return this.api.get<CompanyContextCompany[]>(apiRoutes.auth.companies).pipe(map((items) => items ?? []));
  }

  areas(companyId: string | number): Observable<CompanyContextArea[]> {
    return this.api.get<CompanyContextArea[]>(apiRoutes.auth.companyAreas(companyId)).pipe(map((items) => items ?? []));
  }

  selectContext(payload: SelectCompanyContextRequest): Observable<CompanyContextResponse> {
    return this.api.post<CompanyContextResponse>(apiRoutes.auth.selectContext, payload).pipe(
      tap((context) => {
        const access = context.accessToken || context.token;
        if (access) this.tokenStore.setAccess(access);
        this.tokenStore.setContext({
          companyId: String(context.companyId),
          companyName: context.companyName,
          areaId: String(context.areaId),
          areaName: context.areaName,
        });
      })
    );
  }

  me(): Observable<unknown> {
    return this.api.get(apiRoutes.auth.me);
  }

  changePassword(payload: ChangePasswordRequest): Observable<unknown> {
    return this.api.post(apiRoutes.auth.changePassword, payload);
  }

  logout(): void { this.tokenStore.clear(); }
  isLoggedIn(): boolean { return !!this.tokenStore.getAccess(); }
  hasContext(): boolean { return !!this.tokenStore.getContext(); }
}
