import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private messageService: MessageService) {}

  success(message: string, title = 'Success') {
    this.messageService.add({ severity: 'success', summary: title, detail: message, life: 3000 });
  }

  error(message: string, title = 'Error') {
    this.messageService.add({ severity: 'error', summary: title, detail: message, life: 4000 });
  }

  info(message: string, title = 'Info') {
    this.messageService.add({ severity: 'info', summary: title, detail: message, life: 3000 });
  }

  warn(message: string, title = 'Warning') {
    this.messageService.add({ severity: 'warn', summary: title, detail: message, life: 3000 });
  }
}
