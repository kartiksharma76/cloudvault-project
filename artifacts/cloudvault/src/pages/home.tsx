import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Cloud, Shield, Zap, Smartphone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function Home() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Cloud className="w-6 h-6" />
          CloudVault
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 lg:px-12 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-foreground mb-6">
              Your digital life, <br className="hidden md:block" />
              <span className="text-primary">beautifully organized.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              CloudVault is your private, secure personal cloud drive. A calm, capable space where everything you care about lives safely.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8">
                  Create your vault <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 lg:px-12 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <FeatureCard 
                icon={Shield}
                title="Private & Secure"
                description="Your files are encrypted and private by default. Only you control who has access to your digital vault."
              />
              <FeatureCard 
                icon={Zap}
                title="Lightning Fast"
                description="Upload, download, and organize files in milliseconds. Built for speed so you can get things done."
              />
              <FeatureCard 
                icon={Smartphone}
                title="Everywhere You Are"
                description="Access your files from any device, anywhere in the world. Your vault syncs instantly across all screens."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center border-t text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} CloudVault. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-card border shadow-sm flex flex-col items-center text-center"
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
