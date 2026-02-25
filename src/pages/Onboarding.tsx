import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Building2, ArrowRight, Copy, Check, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { title: "Add Your First Property", description: "Give your property a name and address." },
  { title: "Create a Unit", description: "Add a unit to your property (e.g. Unit A, Suite 1)." },
  { title: "Share the Tenant Link", description: "Copy the unique request link and share it with your tenant." },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [createdPropertyId, setCreatedPropertyId] = useState("");
  const [unitName, setUnitName] = useState("");
  const [publicToken, setPublicToken] = useState("");
  const [copied, setCopied] = useState(false);

  const createPropertyMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .insert({ landlord_id: user!.id, name: propertyName, address: propertyAddress })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setCreatedPropertyId(data.id);
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      setStep(1);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .insert({ property_id: createdPropertyId, unit_name: unitName })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setPublicToken(data.public_request_token);
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setStep(2);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copyLink = () => {
    const url = `${window.location.origin}/request/${publicToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Link copied!", description: "Share this with your tenant." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-8 py-8">
        <div className="text-center">
          <Building2 className="h-10 w-10 mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Welcome to UnitFix</h1>
          <p className="text-muted-foreground mt-1">Let's get you set up in 3 quick steps.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i < step ? "bg-status-completed text-status-completed-foreground" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold text-foreground mb-1">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{steps[step].description}</p>

            {step === 0 && (
              <form onSubmit={(e) => { e.preventDefault(); createPropertyMutation.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ob-name">Property Name</Label>
                  <Input id="ob-name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder='e.g. "Maple Street Duplex"' required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-addr">Address</Label>
                  <Input id="ob-addr" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="123 Maple St, Springfield" required />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={createPropertyMutation.isPending}>
                  {createPropertyMutation.isPending ? "Creating..." : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); createUnitMutation.mutate(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ob-unit">Unit Name</Label>
                  <Input id="ob-unit" value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder='e.g. "Unit A" or "2B"' required />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={createUnitMutation.isPending}>
                  {createUnitMutation.isPending ? "Creating..." : <>Continue <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-muted rounded-md p-3">
                  <code className="text-xs text-foreground break-all flex-1">
                    {window.location.origin}/request/{publicToken}
                  </code>
                  <Button variant="outline" size="sm" onClick={copyLink} className="gap-1 shrink-0">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with your tenant. When they submit a maintenance request, it will appear in your dashboard.
                </p>
                <Button className="w-full gap-2" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {step < 2 && (
          <div className="text-center">
            <button onClick={() => navigate("/dashboard")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
