import { cn } from '@/lib/cn';

// Campo de texto padrão (usado em login, cadastro e formulários).
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition focus:border-primary',
        className,
      )}
      {...props}
    />
  );
}

// Rótulo + campo, para formularios verticais.
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
