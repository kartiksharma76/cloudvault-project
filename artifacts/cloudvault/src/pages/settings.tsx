import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as UserIcon } from "lucide-react";

export function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-muted border text-muted-foreground">
                <UserIcon className="w-10 h-10" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                <p className="font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground mt-2">Authenticated via JWT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how CloudVault looks on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-xs">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(val: any) => setTheme(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
