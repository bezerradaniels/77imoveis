import { cn } from '@/lib/cn';

// Campo de texto padrão (usado em login, cadastro e formulários).
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-[10px] border border-border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary',
        className,
      )}
      {...props}
    />
  );
}

// Rótulo + campo, para formularios verticais.
export function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
