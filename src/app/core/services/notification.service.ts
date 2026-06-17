import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly messageService: MessageService) {}

  success(detail: string, summary = 'Success'): void {
    this.messageService.add({ severity: 'success', summary, detail, life: 4500, closable: true });
  }

  info(detail: string, summary = 'Info'): void {
    this.messageService.add({ severity: 'info', summary, detail, life: 5000, closable: true });
  }

  warning(detail: string, summary = 'Warning'): void {
    this.messageService.add({ severity: 'warn', summary, detail, life: 6500, closable: true });
  }

  warn(detail: string, summary = 'Warning'): void {
    this.warning(detail, summary);
  }

  error(error: unknown, summary = 'Error'): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail: this.extractErrorMessage(error),
      life: 9000,
      closable: true,
    });
  }

  clear(): void {
    this.messageService.clear();
  }

  extractErrorMessage(error: unknown): string {
    if (!error) return 'Something went wrong.';
    if (typeof error === 'string') return error;
    if (error instanceof Error && error.message) return error.message;

    const err = error as any;
    const payload = err?.error ?? err;
    if (typeof payload === 'string' && payload.trim()) return payload;

    const directMessage =
      payload?.message || payload?.Message ||
      payload?.title || payload?.Title ||
      payload?.detail || payload?.Detail ||
      payload?.error || payload?.Error ||
      err?.message;

    if (directMessage) return String(directMessage);

    const validationMessage = this.extractValidationErrors(payload?.errors || payload?.Errors);
    if (validationMessage) return validationMessage;

    return 'Something went wrong.';
  }

  private extractValidationErrors(errors: unknown): string | null {
    if (!errors) return null;
    if (Array.isArray(errors)) return errors.filter(Boolean).join(' | ') || null;
    if (typeof errors === 'object') {
      return Object.entries(errors as Record<string, string[] | string>)
        .map(([key, value]) => {
          const message = Array.isArray(value) ? value.filter(Boolean).join(', ') : value;
          return message ? `${key}: ${message}` : '';
        })
        .filter(Boolean)
        .join(' | ') || null;
    }
    return null;
  }
}
