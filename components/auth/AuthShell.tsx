type AuthShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthShell({ eyebrow, title, description, children }: AuthShellProps) {
  return (
    <main className="flex min-h-[calc(100vh-185px)] w-full items-center justify-center bg-internal px-4 py-10 dark:bg-bg sm:py-14">
      <section className="auth-form w-full max-w-sm rounded-lg border border-border bg-surface p-6 sm:p-7">
        <div className="mb-6">
          {eyebrow && (
            <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-primary">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold leading-tight text-text">{title}</h1>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-muted">{description}</p>
        </div>

        {children}
      </section>
    </main>
  );
}
