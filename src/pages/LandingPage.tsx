import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Shield, Clock, LinkIcon, ArrowRight, Building2, Share2, LayoutDashboard, CheckCircle2, Mail } from "lucide-react";
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

const steps = [
  { icon: Building2, title: "Add Your Property", desc: "Create your properties and units in under a minute." },
  { icon: Share2, title: "Share the Tenant Link", desc: "Each unit gets a unique link. Share it via text, email, or post it on-site." },
  { icon: LayoutDashboard, title: "Track & Resolve", desc: "See all requests in one dashboard. Update status, add notes, mark complete." },
];

const benefits = [
  "Centralized maintenance tracking — everything in one place",
  "Automatic documentation of every request",
  "Clear status visibility for you and your tenants",
  "No lost messages or scattered notes",
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
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold text-foreground">UnitFix</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/pricing">
              <Button variant="ghost" size="sm">Pricing</Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-28 text-center">
        <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
          Built for Small Landlords
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight max-w-2xl mx-auto leading-tight">
          Your tenant texts you a problem.
          <br />
          <span className="text-primary">They should text this link instead.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
          One link per unit. Tenants submit. You track. No more scattered texts, missed voicemails, or 11pm calls. Built for landlords with 1–5 units.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">14-day free trial · No credit card required</p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border hover:shadow-md transition-shadow">
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
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">How It Works</h2>
          <p className="text-muted-foreground text-center mb-10">Get started in minutes, not hours.</p>
          <div className="grid gap-8 md:grid-cols-3 max-w-3xl mx-auto">
            {steps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Step {i + 1}</div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">No More Late-Night Texts.</h2>
          <p className="text-muted-foreground mb-8">
            Stop juggling texts, voicemails, and sticky notes. UnitFix gives you one calm place to manage it all.
          </p>
          <div className="grid gap-3 text-left max-w-md mx-auto">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-status-completed mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Ready to simplify maintenance?</h2>
          <p className="text-primary-foreground/70 mb-6">Join landlords who have stopped drowning in tenant texts.</p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2">
              Start Your Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="mt-3 text-sm text-primary-foreground/50">14 days free · Then $29/month</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">UnitFix</span>
              <span className="text-sm text-muted-foreground ml-2">Built for independent landlords</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="mailto:support@unitfix.app" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> Contact
              </a>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} UnitFix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
