import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, UrgencyBadge } from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wrench } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Requests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, units(unit_name, property_id, properties(id, name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filtered = requests.filter((r: any) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (propertyFilter !== "all" && r.units?.properties?.id !== propertyFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Requests</h1>
          <p className="text-muted-foreground">All maintenance requests across your properties</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground text-center py-12">Loading...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Tenant</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Property / Unit</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Issue</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Urgency</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req: any) => (
                  <tr
                    key={req.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/requests/${req.id}`)}
                  >
                    <td className="py-3 px-3 font-medium text-foreground">{req.tenant_name}</td>
                    <td className="py-3 px-3 text-muted-foreground">
                      {req.units?.properties?.name} — {req.units?.unit_name}
                    </td>
                    <td className="py-3 px-3 text-foreground max-w-[250px] truncate">{req.issue_description}</td>
                    <td className="py-3 px-3"><UrgencyBadge urgency={req.urgency} /></td>
                    <td className="py-3 px-3"><StatusBadge status={req.status} /></td>
                    <td className="py-3 px-3 text-muted-foreground">{format(new Date(req.created_at), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
