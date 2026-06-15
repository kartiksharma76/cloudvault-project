import { useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

import { Home } from "@/pages/home";
import { AppLayout } from "@/components/layout/app-layout";
import { Dashboard } from "@/pages/dashboard";
import { Files } from "@/pages/files";
import { FileDetail } from "@/pages/file-detail";
import { Folders } from "@/pages/folders";
import { Notes } from "@/pages/notes";
import { Starred } from "@/pages/starred";
import { Settings } from "@/pages/settings";
import { SignInPage, SignUpPage } from "@/pages/auth";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function HomeRedirect() {
  const { token, isLoading } = useAuth();
  
  if (isLoading) return null;

  if (token) {
    return <Redirect to="/dashboard" />;
  }
  return <Home />;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token) {
    return <Redirect to="/" />;
  }

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function QueryClientCacheInvalidator() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      queryClient.clear();
    }
  }, [token, queryClient]);

  return null;
}

export function AppRouter() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <QueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />

          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/files" component={() => <ProtectedRoute component={Files} />} />
          <Route path="/files/:id" component={() => <ProtectedRoute component={FileDetail} />} />
          <Route path="/folders" component={() => <ProtectedRoute component={Folders} />} />
          <Route path="/notes" component={() => <ProtectedRoute component={Notes} />} />
          <Route path="/starred" component={() => <ProtectedRoute component={Starred} />} />
          <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />

          <Route>
            <div className="flex items-center justify-center min-h-[100dvh]">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground">Page not found</p>
              </div>
            </div>
          </Route>
        </Switch>
      </QueryClientProvider>
    </AuthProvider>
  );
}
