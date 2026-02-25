import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://unitfix.netlify.app";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset" | "update-password">(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);

    if (hashParams.get("type") === "recovery" || searchParams.get("mode") === "update-password") {
      return "update-password";
    }

    if (searchParams.get("mode") === "reset") {
      return "reset";
    }

    return "signin";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Detect recovery event (user clicked password reset link)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const isRecovery = hashParams.get("type") === "recovery";

      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && isRecovery)) {
        setMode("update-password");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isRecoveryFromUrl = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("type") === "recovery";
  if (user && mode !== "update-password" && !isRecoveryFromUrl) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (mode === "update-password") {
      const { error } = await supabase.auth.updateUser({ password });
      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Password updated", description: "You can now sign in with your new password." });
        setMode("signin");
      }
      return;
    }

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: SITE_URL + "/auth",
      });
      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a password reset link." });
        setMode("signin");
      }
      return;
    }
    const { error } = mode === "signup" ? await signUp(email, password) : await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">UnitFix</span>
            </div>
          </div>
          <CardTitle className="text-xl">
            {mode === "update-password" ? "Set New Password" : mode === "reset" ? "Reset Password" : mode === "signup" ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {mode === "update-password" ? "Enter your new password below" : mode === "reset" ? "Enter your email to receive a reset link" : mode === "signup" ? "Start managing your properties" : "Sign in to your dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== "update-password" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="password">{mode === "update-password" ? "New Password" : "Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Please wait..." : mode === "update-password" ? "Update Password" : mode === "reset" ? "Send Reset Link" : mode === "signup" ? "Create Account" : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center space-y-2">
            {mode === "signin" && (
              <button type="button" onClick={() => setMode("reset")} className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                Forgot your password?
              </button>
            )}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
