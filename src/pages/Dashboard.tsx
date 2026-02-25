import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, UrgencyBadge } from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle, Clock, CheckCircle2, Wrench, Copy, Plus } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, units(unit_name, property_id, properties(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*, properties(name)")
        .order("unit_name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const [selectedUnit, setSelectedUnit] = useState<string>("");

  const copyLink = (token?: string) => {
    const t = token || (units.length === 1 ? units[0].public_request_token : selectedUnit);
    if (!t) return;
    const url = `${window.location.origin}/request/${t}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share this with your tenant." });
  };

  const openCount = requests.filter((r) => r.status === "Open").length;
  const inProgressCount = requests.filter((r) => r.status === "In Progress").length;
  const completedThisMonth = requests.filter((r) => {
    if (r.status !== "Completed" || !r.completed_at) return false;
    const now = new Date();
    const completed = new Date(r.completed_at);
    return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear();
  }).length;

  const recentRequests = requests.slice(0, 5);

  const stats = [
    { label: "Open Requests", value: openCount, icon: AlertCircle, className: "text-status-open" },
    { label: "In Progress", value: inProgressCount, icon: Clock, className: "text-status-in-progress" },
    { label: "Completed This Month", value: completedThisMonth, icon: CheckCircle2, className: "text-status-completed" },
    { label: "Total Requests", value: requests.length, icon: Wrench, className: "text-muted-foreground" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your maintenance requests</p>
          </div>
          {units.length > 0 && (
            <div className="flex items-center gap-2">
              {units.length === 1 ? (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => copyLink(units[0].public_request_token)}>
                  <Copy className="h-4 w-4" /> Copy Tenant Link
                </Button>
              ) : (
                <>
                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Select unit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u: any) => (
                        <SelectItem key={u.id} value={u.public_request_token}>
                          {u.properties?.name} — {u.unit_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => copyLink()} disabled={!selectedUnit}>
                    <Copy className="h-4 w-4" /> Copy Link
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.className}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? "—" : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground py-8 text-center">Loading...</div>
            ) : recentRequests.length === 0 ? (
              <div className="py-12 text-center">
                <Wrench className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-foreground font-medium mb-1">No maintenance requests yet</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start by adding a property and sharing the tenant request link. Once tenants submit requests, they'll appear here.
                </p>
                <Button onClick={() => navigate("/properties")} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Property
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tenant</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Property / Unit</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Issue</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Urgency</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRequests.map((req: any) => (
                      <tr
                        key={req.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/requests/${req.id}`)}
                      >
                        <td className="py-3 px-2 font-medium text-foreground">{req.tenant_name}</td>
                        <td className="py-3 px-2 text-muted-foreground">
                          {req.units?.properties?.name} — {req.units?.unit_name}
                        </td>
                        <td className="py-3 px-2 text-foreground max-w-[200px] truncate">{req.issue_description}</td>
                        <td className="py-3 px-2"><UrgencyBadge urgency={req.urgency} /></td>
                        <td className="py-3 px-2"><StatusBadge status={req.status} /></td>
                        <td className="py-3 px-2 text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
