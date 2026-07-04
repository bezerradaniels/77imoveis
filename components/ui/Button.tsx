import { cn } from '@/lib/cn';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'whatsapp';
  rounded?: 'full' | 'lg';
};

// Botão padrão do site. primary é reservado para a ação principal da tela.
export function Button({ variant = 'primary', rounded = 'full', className, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-medium transition disabled:opacity-50',
        rounded === 'full' ? 'rounded-full' : 'rounded-lg',
        variant === 'primary' && 'bg-action text-on-action hover:bg-action-hover active:bg-action-active',
        variant === 'outline' && 'border border-border text-text hover:bg-surface',
        variant === 'ghost' && 'text-muted hover:text-text',
        variant === 'whatsapp' && 'bg-whatsapp text-on-primary hover:opacity-90',
        className,
      )}
      {...props}
    />
  );
}
