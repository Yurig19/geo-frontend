import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';

interface DatePickerFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  rules?: RegisterOptions<T>;
  disabled?: boolean;
}

export function DatePickerField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Selecionar data',
  rules,
  disabled,
}: DatePickerFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  disabled={disabled}
                  className={cn(
                    ' justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {field.value ? (
                    dayjs(field.value).format('DD/MM/YYYY')
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(
                      date ? new Date(date).toISOString() : undefined
                    );
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
