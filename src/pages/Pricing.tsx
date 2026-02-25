import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

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

export default function Pricing() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">UnitFix</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link to="/auth"><Button size="sm">Start Free Trial</Button></Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Simple, honest pricing.</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          One plan. Everything included. No hidden fees or upsells.
        </p>
      </section>

      <section className="container mx-auto px-4 pb-20 max-w-md">
        <Card className="border-primary/20 shadow-lg">
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
            <Link to="/auth" className="block">
              <Button className="w-full gap-2" size="lg">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center">No credit card required to start</p>
          </CardContent>
        </Card>
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
