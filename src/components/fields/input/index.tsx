import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { InputHTMLAttributes } from 'react';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';

interface InputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  rules?: RegisterOptions<T>;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
  defaultValue?: string | number | readonly string[] | undefined;
  mask?: string;
}

export function InputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  rules,
  type,
  mask,
}: InputFieldProps<T>) {
  const isValidDate = (val: unknown): val is Date =>
    val instanceof Date && !Number.isNaN(val.getTime());
  const isMasked = Boolean(mask);

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              type={type ?? 'text'}
              inputMode={isMasked ? 'numeric' : undefined}
              value={
                type === 'date'
                  ? (() => {
                      const date = new Date(field.value);
                      return isValidDate(date)
                        ? date.toISOString().split('T')[0]
                        : '';
                    })()
                  : (field.value ?? '')
              }
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(type === 'date' ? new Date(value) : value);
              }}
            />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
