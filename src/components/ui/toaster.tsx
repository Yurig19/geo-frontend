import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className='toaster group'
      toastOptions={{
        classNames: {
          actionButton:
            'group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground',
          cancelButton:
            'group-[.toaster]:bg-muted group-[.toaster]:text-muted-foreground',
          description: 'group-[.toast]:text-muted-foreground',
          error:
            'group-[.toaster]:border-destructive/50 group-[.toaster]:text-destructive',
          success:
            'group-[.toaster]:border-emerald-600/40 group-[.toaster]:text-foreground',
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
