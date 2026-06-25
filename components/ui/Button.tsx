import { cn } from '@/lib/cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'whatsapp';
};

// Botão padrão do site. Variantes: primary (cyan), outline, ghost, whatsapp.
export function Button({ variant = 'primary', className, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-hover',
        variant === 'outline' && 'border border-border text-text hover:bg-surface',
        variant === 'ghost' && 'text-muted hover:text-text',
        variant === 'whatsapp' && 'bg-[#1FA855] text-white hover:opacity-90',
        className,
      )}
      {...props}
    />
  );
}
