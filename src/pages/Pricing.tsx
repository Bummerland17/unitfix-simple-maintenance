import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const included = [
  "Up to 5 units",
  "Unlimited maintenance requests",
  "Email notifications",
  "Secure landlord dashboard",
  "Public tenant request links",
  "Request status tracking",
  "Internal notes & cost tracking",
  "Mobile responsive",
];

const freeFeatures = [
  "1 unit included",
  "Unlimited maintenance requests",
  "Public tenant request link",
  "Request status tracking",
];

export default function Pricing() {
  const { user, loading, subscription } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error || data?.error) {
        // If auth issue, redirect to sign in
        if (data?.error?.includes("authenticated") || data?.error?.includes("expired")) {
          navigate("/auth");
          return;
        }
        throw new Error(data?.error || error?.message);
      }
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      console.error("Checkout error:", err);
    }
    setCheckoutLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">UnitFix</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
            ) : (
              <>
                <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/auth"><Button size="sm">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Simple, honest pricing.</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start free with 1 unit. Upgrade when you're ready.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-20 max-w-2xl">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Free tier */}
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">Free</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Perfect for getting started</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {freeFeatures.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              {user ? (
                subscription.plan === "free" ? (
                  <div className="text-center text-sm text-muted-foreground font-medium py-2 bg-muted rounded-md">
                    Your Current Plan
                  </div>
                ) : null
              ) : (
                <Link to="/auth" className="block">
                  <Button variant="outline" className="w-full">Sign Up Free</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Paid tier */}
          <Card className="border-primary/20 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
              Most Popular
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">Landlord Plan</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold text-foreground">$15</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">14-day free trial · Cancel anytime</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-status-completed shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              {subscription.subscribed ? (
                <div className="text-center text-sm text-primary font-medium py-2 bg-primary/10 rounded-md">
                  ✓ Your Current Plan
                </div>
              ) : (
                <Button className="w-full gap-2" size="lg" onClick={handleCheckout} disabled={checkoutLoading}>
                  {checkoutLoading ? "Loading..." : <>Start Free Trial <ArrowRight className="h-4 w-4" /></>}
                </Button>
              )}
              {!subscription.subscribed && (
                <p className="text-xs text-muted-foreground text-center">No credit card required to start</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">UnitFix</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="mailto:support@unitfix.app" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
