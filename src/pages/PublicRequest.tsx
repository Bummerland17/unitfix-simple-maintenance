import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, CheckCircle2, AlertTriangle } from "lucide-react";

export default function PublicRequest() {
  const { token } = useParams<{ token: string }>();
  const [tenantName, setTenantName] = useState("");
  const [tenantContact, setTenantContact] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: unit, isLoading, error } = useQuery({
    queryKey: ["public-unit", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id, unit_name, properties(name)")
        .eq("public_request_token", token!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      let photoUrl: string | null = null;

      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("maintenance-photos")
          .upload(path, photo);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("maintenance-photos").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const requestData = {
        unit_id: unit!.id,
        tenant_name: tenantName,
        tenant_contact: tenantContact,
        issue_description: description,
        urgency,
        photo_url: photoUrl,
      };

      const { error } = await supabase.from("maintenance_requests").insert(requestData);
      if (error) throw error;

      // Fire-and-forget email notification
      supabase.functions.invoke("notify-landlord", {
        body: { record: requestData },
      }).catch(console.error);
    },
    onSuccess: () => setSubmitted(true),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto text-destructive mb-3" />
            <p className="text-foreground font-medium">Invalid request link</p>
            <p className="text-sm text-muted-foreground mt-1">This link is not valid. Please contact your landlord for the correct link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-10 w-10 mx-auto text-status-completed mb-3" />
            <p className="text-foreground font-medium text-lg">Request Submitted</p>
            <p className="text-sm text-muted-foreground mt-2">Your maintenance request has been sent to your landlord. They will follow up with you soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Maintenance Request</CardTitle>
          <CardDescription>
            {(unit as any).properties?.name} — {unit.unit_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="tenant-name">Your Name</Label>
              <Input id="tenant-name" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-contact">Contact (Phone or Email)</Label>
              <Input id="tenant-contact" value={tenantContact} onChange={(e) => setTenantContact(e.target.value)} placeholder="john@example.com or (555) 123-4567" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Issue Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the maintenance issue..." rows={4} required />
            </div>
            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low — Can wait</SelectItem>
                  <SelectItem value="Medium">Medium — Needs attention soon</SelectItem>
                  <SelectItem value="High">High — Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Photo (optional)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
            {submitMutation.isError && (
              <p className="text-sm text-destructive text-center">Something went wrong. Please try again.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
