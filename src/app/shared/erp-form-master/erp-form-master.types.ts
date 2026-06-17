import { ValidatorFn } from '@angular/forms';

export type ErpFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'email'
  | 'textarea'
  | 'checkbox'
  | 'select'
  | 'searchSelect'
  | 'file'
  | 'hidden';

export interface ErpSelectOption<T = any> {
  value: T;
  label: string;
}

export interface ErpFormField<TForm = any> {
  key: keyof TForm & string;
  label: string;
  type?: ErpFieldType;
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  options?: ErpSelectOption[];
  lookupApi?: string;
  optionValueKey?: string;
  optionLabelKey?: string;
  colSpan?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  validators?: ValidatorFn[];
  hint?: string;
  accept?: string;
  preview?: boolean;
}

export interface ErpFormSection<TForm = any> {
  title: string;
  description?: string;
  icon?: string;
  columns?: number;
  fields: ErpFormField<TForm>[];
}
