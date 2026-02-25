import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { user, subscription, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [portalLoading, setPortalLoading] = useState(false);

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      console.error("Portal error:", err);
    }
    setPortalLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Account and subscription</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span>{" "}
              <span className="font-medium text-foreground">{user?.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Account created:</span>{" "}
              <span className="font-medium text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Subscription</CardTitle>
            <Badge variant={subscription.subscribed ? "default" : "secondary"}>
              {subscription.subscribed ? "Landlord Plan" : "Free Plan"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.subscribed ? (
              <>
                <div className="text-sm space-y-1">
                  <p className="text-foreground">You have full access to all features (up to 5 units).</p>
                  {subscription.subscriptionEnd && (
                    <p className="text-muted-foreground">
                      Current period ends: {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={openPortal} disabled={portalLoading} className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  {portalLoading ? "Loading..." : "Manage Subscription"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  You're on the free plan (1 unit). Upgrade to manage up to 5 units with email notifications.
                </p>
                <Button size="sm" className="gap-2" onClick={() => navigate("/pricing")}>
                  Upgrade to Landlord Plan <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
