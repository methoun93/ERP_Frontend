import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErpFormField, ErpFormSection } from './erp-form-master.types';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-erp-form-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, MultiSelectModule],
  templateUrl: './erp-form-master.component.html',
  styleUrls: ['./erp-form-master.component.scss']
})
export class ErpFormMasterComponent<TForm = any> {
  @Input() title = '';
  @Input() subtitle = '';
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() sections: ErpFormSection<TForm>[] = [];
  @Input() saving = false;
  @Input() showActions = true;
  @Input() backLabel = 'Back to list';

  @Output() back = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() resetForm = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<{ key: string; file: File | null }>();

  fileNames: Record<string, string> = {};
  imagePreviews: Record<string, string> = {};

  getColumnStyle(columns = 3): string {
    return `repeat(${columns}, minmax(0, 1fr))`;
  }

  trackSection = (_: number, section: ErpFormSection<TForm>) => section.title;
  trackField = (_: number, field: ErpFormField<TForm>) => field.key;

  isInvalid(key: string): boolean {
    const control = this.formGroup.get(key);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  onFileChange(event: Event, field: ErpFormField<TForm>): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const key = String(field.key);

    this.fileNames[key] = file?.name ?? '';

    const control = this.formGroup.get(key);
    control?.setValue(file?.name ?? '');
    control?.markAsDirty();
    control?.markAsTouched();

    this.fileSelected.emit({ key, file });

    if (field.preview && file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => (this.imagePreviews[key] = String(reader.result || ''));
      reader.readAsDataURL(file);
    } else {
      delete this.imagePreviews[key];
    }
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.save.emit();
  }
}
