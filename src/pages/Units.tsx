import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Plus, DoorOpen, Copy, Trash2, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Units() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [propertyId, setPropertyId] = useState("");

  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("*, properties(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("units").insert({
        property_id: propertyId,
        unit_name: unitName,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setOpen(false);
      setUnitName("");
      setPropertyId("");
      toast({ title: "Unit added" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast({ title: "Unit deleted" });
    },
  });

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/request/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Units</h1>
            <p className="text-muted-foreground">Manage units and share public request links</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Unit</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Unit</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select value={propertyId} onValueChange={setPropertyId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-name">Unit Name</Label>
                  <Input id="unit-name" value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder='e.g. "Unit A" or "2B"' required />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || !propertyId}>
                  {createMutation.isPending ? "Adding..." : "Add Unit"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground text-center py-12">Loading...</div>
        ) : units.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <DoorOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No units yet. Add a property first, then create units.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Unit</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Property</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Public Link</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit: any) => (
                  <tr key={unit.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-3 font-medium text-foreground">{unit.unit_name}</td>
                    <td className="py-3 px-3 text-muted-foreground">{unit.properties?.name}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Link className="h-3.5 w-3.5 text-muted-foreground" />
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded max-w-[200px] truncate block">
                          /request/{unit.public_request_token}
                        </code>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyLink(unit.public_request_token)} title="Copy public link">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(unit.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
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
