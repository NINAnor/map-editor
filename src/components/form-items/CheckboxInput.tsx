import type { FieldValues } from 'react-hook-form';
import type { FormFieldProps } from './types';

interface CheckboxInputProps<T extends FieldValues = FieldValues> extends Omit<FormFieldProps<T>, 'required'> {
  disabled?: boolean;
  description?: string;
}

/**
 * Checkbox input component
 */
export function CheckboxInput<T extends FieldValues = FieldValues>({
  form,
  name,
  label,
  className = '',
  disabled = false,
  description,
}: CheckboxInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = form;
  const error = errors[name];

  return (
    <div className={`form-control ${className}`}>
      <label className={`label justify-start gap-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input type="checkbox" className="checkbox" disabled={disabled} {...register(name)} />
        <span className="label-text">{label}</span>
      </label>
      {description && <span className="text-base-content/70 text-sm">{description}</span>}
      {error?.message && typeof error.message === 'string' && (
        <span className="text-error text-sm mt-1">{error.message}</span>
      )}
    </div>
  );
}
