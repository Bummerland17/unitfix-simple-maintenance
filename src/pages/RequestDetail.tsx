import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge, UrgencyBadge } from "@/components/StatusBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*, units(unit_name, properties(name))")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });

  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");

  // Sync form when data loads
  const isFormReady = request && !status;
  if (isFormReady) {
    setStatus(request.status);
    setNotes(request.internal_notes || "");
    setCost(request.estimated_cost?.toString() || "");
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updates: Record<string, any> = {
        status,
        internal_notes: notes || null,
        estimated_cost: cost ? parseFloat(cost) : null,
      };
      if (status === "Completed" && request?.status !== "Completed") {
        updates.completed_at = new Date().toISOString();
      }
      const { error } = await supabase.from("maintenance_requests").update(updates).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request", id] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({ title: "Request updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-muted-foreground text-center py-12">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!request) {
    return (
      <DashboardLayout>
        <div className="text-muted-foreground text-center py-12">Request not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate("/requests")} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Requests
        </Button>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Request Details</h1>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tenant Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium text-foreground">{request.tenant_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Contact:</span>{" "}
                <span className="font-medium text-foreground">{request.tenant_contact}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Property:</span>{" "}
                <span className="font-medium text-foreground">{(request as any).units?.properties?.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Unit:</span>{" "}
                <span className="font-medium text-foreground">{(request as any).units?.unit_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>{" "}
                <span className="font-medium text-foreground">{format(new Date(request.created_at), "MMM d, yyyy h:mm a")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Issue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Urgency:</span>
                <UrgencyBadge urgency={request.urgency} />
              </div>
              <div>
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1 text-foreground">{request.issue_description}</p>
              </div>
              {request.photo_url && (
                <div>
                  <span className="text-muted-foreground">Photo:</span>
                  <img src={request.photo_url} alt="Maintenance issue" className="mt-2 rounded-md max-h-48 object-cover" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Update Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Estimated Cost ($)</Label>
                  <Input id="cost" type="number" step="0.01" min="0" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes about this request..." rows={3} />
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
