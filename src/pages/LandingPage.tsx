import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Shield, Clock, LinkIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const features = [
  {
    icon: Wrench,
    title: "Centralized Tracking",
    description: "All maintenance requests in one place. No more scattered texts, emails, and voicemails.",
  },
  {
    icon: LinkIcon,
    title: "Public Request Links",
    description: "Give each unit a unique link. Tenants submit requests without needing an account.",
  },
  {
    icon: Clock,
    title: "Status Management",
    description: "Track requests from Open to In Progress to Completed. Stay on top of every issue.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is isolated. Only you can see your properties, units, and requests.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">UnitFix</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight max-w-2xl mx-auto leading-tight">
          Maintenance requests,
          <br />
          <span className="text-primary">without the chaos.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
          UnitFix helps small landlords track tenant maintenance requests in one simple dashboard. No more late-night texts or lost messages.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">No credit card required</p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border">
              <CardContent className="pt-6">
                <feature.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Add Your Properties", desc: "Create properties and units in your dashboard." },
              { step: "2", title: "Share the Link", desc: "Give each unit's unique request link to your tenants." },
              { step: "3", title: "Track & Resolve", desc: "Manage requests, update status, and add notes — all in one place." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-3">Ready to simplify maintenance?</h2>
        <p className="text-muted-foreground mb-6">Join landlords who have stopped drowning in tenant texts.</p>
        <Link to="/auth">
          <Button size="lg" className="gap-2">
            Create Your Account <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span>UnitFix</span>
          </div>
          <span>© {new Date().getFullYear()} UnitFix. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
