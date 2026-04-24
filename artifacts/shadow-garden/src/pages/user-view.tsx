import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Sparkles, Crown } from "lucide-react";
import Header from "@/components/ui/header";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaderboardEntry } from "@/hooks/use-stats";

function avatarFor(user: { userId: string; name: string; avatarUrl?: string }): string {
  if (user.avatarUrl) return user.avatarUrl;
  const phone = (user.userId || "").split("@")[0].split(":")[0];
  const seed = encodeURIComponent(phone || user.userId || user.name);
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundType=gradientLinear`;
}

export default function UserView() {
  const [, params] = useRoute("/u/:id");
  const id = params?.id ? decodeURIComponent(params.id) : "";

  const [entry, setEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        // Pull a generous slice of the leaderboard and find this user.
        // The leaderboard endpoint is fully public and already returns
        // every field we need (rank, name, level, xp, avatar).
        const res = await fetch("/api/v1/stats/leaderboard?limit=50");
        const json = await res.json();
        const found = (json.entries || []).find(
          (e: LeaderboardEntry) => e.userId === id,
        );
        if (cancelled) return;
        if (!found) {
          setNotFound(true);
          setEntry(null);
        } else {
          setEntry(found);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      <Header />

      <div className="pt-32 container mx-auto px-4 max-w-3xl relative z-10">
        <Link
          href="/#leaderboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to leaderboard
        </Link>

        {loading ? (
          <div className="bg-card/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Skeleton className="w-32 h-32 rounded-full bg-primary/10" />
              <div className="flex-1 w-full">
                <Skeleton className="h-8 w-48 bg-primary/10 mb-3" />
                <Skeleton className="h-4 w-32 bg-primary/10" />
              </div>
            </div>
          </div>
        ) : notFound || !entry ? (
          <div className="bg-card/40 border border-white/5 rounded-3xl p-12 backdrop-blur-xl text-center">
            <div className="text-6xl font-emoji mb-4">🌫️</div>
            <h1 className="text-2xl font-serif font-extrabold mb-2">
              This shadow has not yet emerged
            </h1>
            <p className="text-muted-foreground">
              We could not find this member in the public leaderboard.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative flex flex-col md:flex-row items-center gap-8 mb-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-600 blur-md opacity-70" />
                <div className="relative w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-600">
                  <img
                    src={avatarFor(entry)}
                    alt={entry.name}
                    className="w-full h-full rounded-full object-cover bg-background"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-background border border-white/10 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  #{entry.rank}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-serif font-extrabold text-gradient-violet mb-2">
                  {entry.name}
                </h1>
                {entry.role && entry.role !== "Normal Player" && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20">
                    <Sparkles className="w-3 h-3" />
                    {entry.role}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              <Stat label="Rank" value={`#${entry.rank}`} icon={<Trophy className="w-5 h-5" />} />
              <Stat label="Level" value={entry.level.toLocaleString()} icon={<Sparkles className="w-5 h-5" />} />
              <Stat label="Experience" value={entry.xp.toLocaleString()} icon={<Crown className="w-5 h-5" />} />
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8 relative">
              Public profile — only leaderboard data is shown.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-black/30 border border-white/5 rounded-2xl p-5 backdrop-blur-md hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-serif font-extrabold text-foreground">{value}</div>
    </div>
  );
}
