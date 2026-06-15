import { createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Files,
  FolderOpen,
  StickyNote,
  Star,
  Settings,
  LogOut,
  Menu,
  Sun,
  Moon,
  Cloud,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const NavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Files, label: "All Files", href: "/files" },
  { icon: FolderOpen, label: "Folders", href: "/folders" },
  { icon: Star, label: "Starred", href: "/starred" },
  { icon: StickyNote, label: "Notes", href: "/notes" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar({ className }: { className?: string }) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className={cn("flex h-full flex-col bg-card border-r", className)}>
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Cloud className="w-6 h-6" />
          CloudVault
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NavItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            title="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut className="w-4 h-4 text-destructive" />
          </Button>
        </div>
        
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-muted-foreground">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-medium truncate">{user.email.split("@")[0]}</span>
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar & Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Cloud className="w-5 h-5" />
            CloudVault
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
