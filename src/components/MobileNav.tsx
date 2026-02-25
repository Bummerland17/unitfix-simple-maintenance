import { LayoutDashboard, Building2, DoorOpen, Wrench, Settings, Menu, X, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/units", label: "Units", icon: DoorOpen },
  { to: "/requests", label: "Requests", icon: Wrench },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold text-foreground">UnitFix</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-2 text-muted-foreground">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-b border-border bg-card px-4 py-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            );
          })}
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </nav>
      )}
    </div>
  );
}
