import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export interface StatItem {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
}

export function StatCards({ items }: { items: StatItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="py-0 shadow-none">
            <CardContent className="flex items-start justify-between gap-3 p-4">
              <div>
                <p className="text-xs font-medium text-text-secondary">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">{item.value}</p>
                {item.detail && <p className="mt-1 text-xs text-text-secondary">{item.detail}</p>}
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
