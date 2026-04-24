import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { LogOut, Diamond, Shield, Wallet, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/auth";
import Header from "@/components/ui/header";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/");
  };

  const maskedPhone = user.phone.replace(/(\+\d{1,3})(\d+)(\d{4})/, "$1****$3");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 pb-20">
      <Header />
      
      <div className="pt-32 container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary/40 to-secondary/40 p-1 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl font-serif text-gradient-gold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-serif font-bold text-gradient-violet mb-2">{user.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  WhatsApp: {maskedPhone}
                </span>
                <span className="uppercase tracking-widest">{user.role}</span>
              </div>
              <p className="text-muted-foreground/80 text-sm max-w-md italic">{user.bio || "No bio set."}</p>
            </div>
            
            <Button variant="outline" onClick={handleLogout} className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-muted-foreground uppercase tracking-widest text-xs">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Shield className="text-blue-400" />} label="Level" value={user.level} />
            <StatCard icon={<Wallet className="text-green-400" />} label="Wallet" value={`$${user.balance.toLocaleString()}`} />
            <StatCard icon={<Diamond className="text-cyan-400" />} label="Gems" value={user.gems.toLocaleString()} />
            <StatCard icon={<Crown className="text-yellow-400" />} label="Premium" value={user.premium ? "Active" : "None"} />
          </div>

          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <div className="flex justify-between text-sm mb-2 uppercase tracking-widest">
              <span className="text-muted-foreground">Experience</span>
              <span className="text-primary">{user.xp.toLocaleString()} XP</span>
            </div>
            <div className="h-2 w-full bg-background rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary w-[65%]" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-black/30 border border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center group hover:bg-black/50 transition-colors">
      <div className="mb-3 p-3 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xl font-serif font-bold text-foreground">{value}</div>
    </div>
  );
}