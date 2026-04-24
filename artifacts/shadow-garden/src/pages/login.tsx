import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lookup, setLookup] = useState<{ exists: boolean; hasPassword?: boolean; name?: string; level?: number } | null>(null);
  const [, setLocation] = useLocation();
  const { data: user, refetch } = useCurrentUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) { setLookup(null); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/v1/auth/lookup?phone=${encodeURIComponent(phone)}`);
        setLookup(await r.json());
      } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(t);
  }, [phone]);

  if (user) {
    setLocation("/profile");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error("Phone and password are required");
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Welcome back to the Garden.");
        queryClient.setQueryData(["me"], data.user);
        await refetch();
        setLocation("/profile");
      } else if (res.status === 401 && /no password/i.test(data.message || "")) {
        toast.info("Your WhatsApp progress is here — set a password to claim your account.");
        setLocation(`/signup?phone=${encodeURIComponent(phone)}`);
      } else if (res.status === 404) {
        toast.info("No account yet — let's create one.");
        setLocation(`/signup?phone=${encodeURIComponent(phone)}`);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden text-foreground">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-10 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />

      <motion.div
        className="relative z-10 w-full max-w-md px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8 text-center">
          <img src="/images/sigil.png" alt="Sigil" className="w-20 h-20 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(138,43,226,0.5)]" />
          <h1 className="text-3xl font-serif font-bold text-gradient-gold mb-2 uppercase tracking-widest">Return to Shadows</h1>
          <p className="text-muted-foreground text-sm">Enter your number and password.</p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-muted-foreground uppercase tracking-widest text-xs">WhatsApp Number</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-12 text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-muted-foreground uppercase tracking-widest text-xs">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-12 text-lg"
              />
            </div>
            {lookup?.exists && lookup.hasPassword && (
              <div className="text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-400/30 rounded-lg px-3 py-2">
                Welcome back{lookup.name ? `, ${lookup.name}` : ""}
                {typeof lookup.level === "number" ? ` — Level ${lookup.level} on the WhatsApp bot` : ""}.
              </div>
            )}
            {lookup?.exists && !lookup.hasPassword && (
              <div className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-400/30 rounded-lg px-3 py-2">
                We found your WhatsApp profile{lookup.name ? ` (${lookup.name})` : ""} but no web password is set yet.{" "}
                <a href={`/signup?phone=${encodeURIComponent(phone)}`} className="underline">Claim it here</a>.
              </div>
            )}
            <Button type="submit" className="w-full h-12 bg-primary/20 hover:bg-primary/40 text-primary-foreground border border-primary/30 uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(138,43,226,0.2)]" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Enter"}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              No account? <a href="/signup" className="text-primary underline">Pledge allegiance</a>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
