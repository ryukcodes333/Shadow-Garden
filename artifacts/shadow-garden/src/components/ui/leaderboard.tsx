import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/use-stats";
import { Skeleton } from "@/components/ui/skeleton";

function avatarFor(user: LeaderboardEntry): string {
  if (user.avatarUrl) return user.avatarUrl;
  const phone = (user.userId || "").split("@")[0].split(":")[0];
  const seed = encodeURIComponent(phone || user.userId || user.name);
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundType=gradientLinear`;
}

export default function Leaderboard() {
  const { data, isLoading, isError } = useLeaderboard();
  const [, setLocation] = useLocation();

  const goToUser = (userId: string) => {
    setLocation(`/u/${encodeURIComponent(userId)}`);
  };

  return (
    <section className="py-32 bg-background relative" id="leaderboard">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif text-foreground mb-4 uppercase tracking-widest font-extrabold"
          >
            Hall of <span className="text-gradient-gold">Shadows</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            The most powerful entities in the garden. Click any member to view their full profile.
          </motion.p>
        </div>

        <div className="bg-card/50 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b border-white/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <div className="w-12 text-center">Rank</div>
            <div>Member</div>
            <div className="text-right pr-4">Level (XP)</div>
          </div>

          <div className="divide-y divide-white/5">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 items-center">
                  <Skeleton className="w-12 h-6 bg-primary/10 mx-auto" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full bg-primary/10" />
                    <div>
                      <Skeleton className="h-5 w-32 bg-primary/10 mb-1" />
                      <Skeleton className="h-3 w-16 bg-primary/10" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-24 bg-primary/10 ml-auto mr-4" />
                </div>
              ))
            ) : isError || !data?.entries?.length ? (
              <div className="p-8 text-center text-muted-foreground">
                No leaderboard data available
              </div>
            ) : (
              data.entries.map((user, i) => {
                const isTop = user.rank <= 3;
                return (
                  <motion.button
                    type="button"
                    key={user.userId + i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    whileHover={{ scale: 1.005 }}
                    onClick={() => goToUser(user.userId)}
                    className="w-full text-left grid grid-cols-[auto_1fr_auto] gap-4 p-4 items-center hover:bg-white/5 transition-colors group cursor-pointer focus:outline-none focus:bg-white/5"
                  >
                    <div className="w-12 text-center font-serif text-xl font-extrabold text-muted-foreground group-hover:text-primary transition-colors">
                      {user.rank === 1 ? <span className="font-emoji text-2xl">👑</span> :
                       user.rank === 2 ? <span className="font-emoji text-xl">🥈</span> :
                       user.rank === 3 ? <span className="font-emoji text-xl">🥉</span> :
                       `#${user.rank}`}
                    </div>

                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className={`relative shrink-0 ${isTop ? "p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-600" : "p-[2px] rounded-full bg-gradient-to-tr from-primary/40 to-secondary/40"}`}>
                        <img
                          src={avatarFor(user)}
                          alt={user.name}
                          loading="lazy"
                          className="w-12 h-12 rounded-full object-cover bg-background"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const seed = encodeURIComponent(user.name || user.userId);
                            if (!target.dataset.fallback) {
                              target.dataset.fallback = "1";
                              target.src = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`;
                            }
                          }}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-extrabold text-foreground text-base md:text-lg truncate">{user.name}</div>
                        {user.role && user.role !== "default" && user.role !== "Normal Player" && (
                          <div className="text-xs text-primary truncate font-semibold uppercase tracking-wide">{user.role}</div>
                        )}
                      </div>
                    </div>

                    <div className="text-right pr-2 flex items-center gap-2">
                      <div className="font-mono text-secondary font-semibold text-sm md:text-base">
                        Lvl {user.level} <span className="text-muted-foreground text-xs font-sans ml-1">({user.xp.toLocaleString()} xp)</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
