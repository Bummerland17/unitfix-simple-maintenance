import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Open: "bg-status-open text-status-open-foreground",
  "In Progress": "bg-status-in-progress text-status-in-progress-foreground",
  Completed: "bg-status-completed text-status-completed-foreground",
};

const urgencyStyles: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-urgency-medium/15 text-urgency-medium",
  High: "bg-urgency-high/15 text-urgency-high",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[status] || "bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", urgencyStyles[urgency] || "bg-muted text-muted-foreground")}>
      {urgency}
    </span>
  );
}
