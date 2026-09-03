import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Active: "border-success/20 bg-success/10 text-success",
  Confirmed: "border-success/20 bg-success/10 text-success",
  "Checked In": "border-success/20 bg-success/10 text-success",
  Available: "border-success/20 bg-success/10 text-success",
  Upcoming: "border-primary/20 bg-primary/10 text-primary",
  Draft: "border-border bg-muted text-text-secondary",
  Pending: "border-warning/25 bg-warning/10 text-amber-700 dark:text-amber-300",
  Inactive: "border-border bg-muted text-text-secondary",
  Completed: "border-border bg-muted text-text-secondary",
  Read: "border-border bg-muted text-text-secondary",
  Unread: "border-primary/20 bg-primary/10 text-primary",
  Cancelled: "border-danger/20 bg-danger/10 text-danger",
  Suspended: "border-danger/20 bg-danger/10 text-danger",
  Disabled: "border-danger/20 bg-danger/10 text-danger",
  "Not Checked In": "border-border bg-muted text-text-secondary",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return <Badge variant="outline" className={cn(styles[status] ?? styles.Inactive, className)}>{status}</Badge>;
}
