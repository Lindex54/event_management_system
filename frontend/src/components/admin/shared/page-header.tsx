import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm text-text-secondary">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
