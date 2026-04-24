import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Signup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(() => {
    try { return new URLSearchParams(window.location.search).get("phone") || ""; }
    catch { return ""; }
  });
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lookup, setLookup] = useState<{ exists: boolean; hasPassword?: boolean; name?: string; level?: number } | null>(null);

  // Look up the phone number whenever it changes (debounced) to detect existing
  // WhatsApp profiles and assure the user their progress will be preserved.
  useEffect(() => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) { setLookup(null); return; }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/v1/auth/lookup?phone=${encodeURIComponent(phone)}`);
        const d = await r.json();
        setLookup(d);
        if (d.exists && !d.hasPassword && !name && d.name) setName(d.name);
      } catch { /* ignore */ }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [phone]);
  const [, setLocation] = useLocation();
  const { data: user, refetch } = useCurrentUser();
  const queryClient = useQueryClient();

  if (user) {
    setLocation("/profile");
    return null;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !password) return toast.error("All fields are required");
    if (password.length < 4) return toast.error("Password must be at least 4 characters");
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, phone, password }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Welcome to the Garden.");
        queryClient.setQueryData(["me"], data.user);
        await refetch();
        setLocation("/profile");
      } else {
        toast.error(data.message || "Signup failed");
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
          <h1 className="text-3xl font-serif font-bold text-gradient-violet mb-2 uppercase tracking-widest">Join the Order</h1>
          <p className="text-muted-foreground text-sm">Step into the shadows.</p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground uppercase tracking-widest text-xs">Codename</Label>
              <Input
                id="name"
                placeholder="Shadow"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-muted-foreground uppercase tracking-widest text-xs">WhatsApp Number</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-12"
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
                className="bg-background/50 border-white/10 focus-visible:ring-primary h-12"
              />
            </div>
            {lookup?.exists && !lookup.hasPassword && (
              <div className="text-xs text-emerald-300/90 bg-emerald-500/10 border border-emerald-400/30 rounded-lg px-3 py-2">
                We found your WhatsApp profile{lookup.name ? ` — welcome back, ${lookup.name}` : ""}
                {typeof lookup.level === "number" ? ` (Level ${lookup.level})` : ""}.
                Setting a password will link your existing progress to your web account.
              </div>
            )}
            {lookup?.exists && lookup.hasPassword && (
              <div className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-400/30 rounded-lg px-3 py-2">
                An account with this number already has a password. <a href="/login" className="underline">Sign in instead</a>.
              </div>
            )}
            <Button type="submit" className="w-full h-12 bg-primary/20 hover:bg-primary/40 text-primary-foreground border border-primary/30 uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(138,43,226,0.2)]" disabled={isLoading}>
              {isLoading ? "Creating..." : lookup?.exists && !lookup.hasPassword ? "Claim Account" : "Pledge Allegiance"}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              Already in? <a href="/login" className="text-primary underline">Return</a>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
