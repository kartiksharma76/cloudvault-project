import { AppRouter } from "@/router";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router as WouterRouter } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="cloudvault-theme">
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
