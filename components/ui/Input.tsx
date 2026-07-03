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
// Com `htmlFor`, o rótulo associa-se explicitamente a um único input pelo id —
// use quando houver mais de um elemento focável dentro do campo (ex.: input de
// senha + botão "mostrar senha"), para o label não capturar os dois.
export function Field({ label, htmlFor, children }: { label: React.ReactNode; htmlFor?: string; children: React.ReactNode }) {
  if (htmlFor) {
    return (
      <div className="space-y-1.5">
        <label htmlFor={htmlFor} className="block text-sm font-semibold">
          {label}
        </label>
        {children}
      </div>
    );
  }
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
