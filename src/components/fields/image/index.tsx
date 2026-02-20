import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type {
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { useState } from 'react';

interface ImageFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  rules?: RegisterOptions<T>;
}

export function ImageField<T extends FieldValues>({
  control,
  name,
  label,
  rules,
}: ImageFieldProps<T>) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem className='space-y-2'>
          <FormLabel>{label}</FormLabel>
          <div className='flex items-center space-x-4'>
            <Avatar className='h-20 w-20'>
              <AvatarImage
                src={
                  preview ||
                  (typeof field.value === 'string' ? field.value : '')
                }
                alt='Avatar'
              />
              <AvatarFallback>IMG</AvatarFallback>
            </Avatar>

            <div className='space-y-1'>
              <Input
                type='file'
                accept='image/*'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreview(url);
                    field.onChange(file);
                  }
                }}
              />
            </div>
          </div>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
