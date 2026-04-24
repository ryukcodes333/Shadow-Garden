import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useBots } from "@/hooks/use-stats";
import { Skeleton } from "@/components/ui/skeleton";
import imgAlpha from "@/assets/characters/alpha.png";
import imgBeta from "@/assets/characters/beta.png";
import imgGamma from "@/assets/characters/gamma.png";
import imgDelta from "@/assets/characters/delta.png";
import imgEpsilon from "@/assets/characters/epsilon.png";
import imgZeta from "@/assets/characters/zeta.png";
import imgEta from "@/assets/characters/eta.png";
import imgShadow from "@/assets/characters/shadow.png";

const CHIBI: Record<string, string> = {
  alpha: imgAlpha,
  beta: imgBeta,
  gamma: imgGamma,
  delta: imgDelta,
  epsilon: imgEpsilon,
  zeta: imgZeta,
  eta: imgEta,
  shadow: imgShadow,
  cid: imgShadow,
};

const FALLBACK_ORDER = [imgAlpha, imgBeta, imgGamma, imgDelta, imgEpsilon, imgZeta, imgEta];

function chibiFor(id: string, idx: number): string {
  const key = (id || "").toLowerCase();
  if (CHIBI[key]) return CHIBI[key];
  for (const k of Object.keys(CHIBI)) {
    if (key.includes(k)) return CHIBI[k];
  }
  return FALLBACK_ORDER[idx % FALLBACK_ORDER.length];
}

const SEVEN_SHADES = [
  { id: "alpha", name: "Alpha", status: "DORMANT", description: "The absolute ruler of the Seven Shades.", role: "Leader" },
  { id: "beta", name: "Beta", status: "DORMANT", description: "The strategist who chronicles his epic tales.", role: "Strategist" },
  { id: "gamma", name: "Gamma", status: "AWAKENING", description: "The genius intellect behind Mitsugoshi.", role: "Genius" },
  { id: "delta", name: "Delta", status: "DORMANT", description: "The ultimate hunting weapon.", role: "Wild Beast" },
  { id: "epsilon", name: "Epsilon", status: "DORMANT", description: "The master of precise magic control.", role: "Diva" },
  { id: "zeta", name: "Zeta", status: "DORMANT", description: "The stealthy scout of the shadows.", role: "Scout" },
  { id: "eta", name: "Eta", status: "AWAKENING", description: "The brilliant architect and inventor.", role: "Inventor" },
];

export default function BotsRail() {
  const { data, isLoading, isError } = useBots();

  const bots = (!isError && data?.bots && data.bots.length > 0)
    ? data.bots.map((b, i) => ({
        id: b.id || `bot-${i}`,
        name: b.name,
        status: b.status,
        description: `Operating node +${(b.phone || "").toString().slice(0, 4) || "????"}...`,
        role: "Live Node",
      }))
    : SEVEN_SHADES;

  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,20,100,0.1)_0%,transparent_70%)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-serif text-foreground mb-4 uppercase tracking-widest"
            >
              The <span className="text-gradient-gold">Seven</span> Shades
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground"
            >
              Our custom Baileys bots power the entire ecosystem. Zero latency, rich features, and a seamlessly integrated RPG experience across thousands of groups.
            </motion.p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-6 bg-card/80 border border-white/5 h-[280px]">
                <div className="flex justify-between mb-6">
                  <Skeleton className="w-20 h-20 rounded-2xl bg-primary/10" />
                  <Skeleton className="w-20 h-6 rounded-full bg-primary/10" />
                </div>
                <Skeleton className="w-32 h-8 bg-primary/10 mb-2" />
                <Skeleton className="w-full h-12 bg-primary/10 mb-6" />
              </div>
            ))
          ) : (
            bots.map((bot, i) => {
              const chibi = chibiFor(bot.id || bot.name, i);
              const live = bot.status === "Online" || bot.status === "AWAKENING";
              return (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="group p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-white/0 hover:from-primary/50 hover:to-primary/0 transition-colors duration-500"
                >
                  <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-6 h-full border border-white/5 group-hover:border-primary/20 transition-colors flex flex-col relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex items-start justify-between mb-5 relative">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/40 to-secondary/30 blur-xl opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/20 via-background to-background ring-2 ring-white/10 overflow-hidden flex items-end justify-center">
                          <img
                            src={chibi}
                            alt={bot.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${live ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                        <span className="font-emoji mr-1">{live ? "🟢" : "🌙"}</span>
                        {bot.status}
                      </div>
                    </div>

                    <h3 className="text-2xl font-serif font-extrabold mb-1 flex items-center gap-2">
                      {bot.name}
                      {(bot.id === "alpha" || /alpha/i.test(bot.name)) && <span className="font-emoji text-lg">👑</span>}
                    </h3>
                    <div className="text-xs text-primary mb-2 tracking-wider uppercase font-bold">{bot.role}</div>
                    <p className="text-muted-foreground text-sm mb-4 flex-grow">
                      {bot.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-white/5">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <Bot className="w-4 h-4" />
                        {bot.role === "Live Node" ? "Active Relay" : "System Node"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
