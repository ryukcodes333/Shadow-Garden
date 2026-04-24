import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import imgShadow from "@/assets/characters/shadow.png";
import imgAlpha from "@/assets/characters/alpha.png";
import imgBeta from "@/assets/characters/beta.png";
import imgGamma from "@/assets/characters/gamma.png";
import imgDelta from "@/assets/characters/delta.png";
import imgEpsilon from "@/assets/characters/epsilon.png";
import imgZeta from "@/assets/characters/zeta.png";
import imgEta from "@/assets/characters/eta.png";

const cardData = [
  { id: "cid", name: "Cid Kagenou", role: "Hero of the Order", rarity: "Legendary", power: "9999", image: imgShadow, quote: "I am... atomic." },
  { id: "alpha", name: "Alpha", role: "First Member", rarity: "Legendary", power: "8500", image: imgAlpha, quote: "Everything is proceeding as planned." },
  { id: "beta", name: "Beta", role: "The Strategist", rarity: "Epic", power: "7200", image: imgBeta, quote: "I will chronicle your epic tale." },
  { id: "gamma", name: "Gamma", role: "The Genius", rarity: "Epic", power: "6800", image: imgGamma, quote: "I shall gather the world's wealth." },
  { id: "delta", name: "Delta", role: "The Wild Beast", rarity: "Epic", power: "8200", image: imgDelta, quote: "Hunt! Kill! Eat!" },
  { id: "epsilon", name: "Epsilon", role: "The Diva", rarity: "Epic", power: "7000", image: imgEpsilon, quote: "Behold my perfect technique." },
  { id: "zeta", name: "Zeta", role: "The Scout", rarity: "Rare", power: "6500", image: imgZeta, quote: "I move unseen in the shadows." },
  { id: "eta", name: "Eta", role: "The Inventor", rarity: "Rare", power: "6000", image: imgEta, quote: "Can I dissect this subject?" },
];

const rarityColors = {
  Mythic: "from-red-500 via-rose-400 to-red-600",
  Legendary: "from-yellow-400 via-amber-300 to-yellow-600",
  Epic: "from-purple-500 via-fuchsia-400 to-purple-600",
  Rare: "from-blue-400 via-cyan-300 to-blue-600",
  Common: "from-gray-400 via-slate-300 to-gray-500",
};

export default function CardShowcase() {
  return (
    <section className="py-32 bg-background relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif text-foreground mb-4 uppercase tracking-widest"
          >
            Collect The <span className="text-gradient-violet">Shadows</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto"
          >
            Summon, trade, and build your ultimate deck. Hundreds of unique cards with dynamic economies, exclusively on WhatsApp.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cardData.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.2 } }}
              className="relative group cursor-pointer perspective-1000"
            >
              {/* Rarity Glow */}
              <div className={`absolute -inset-1 rounded-xl bg-gradient-to-tr ${rarityColors[card.rarity as keyof typeof rarityColors]} opacity-20 group-hover:opacity-60 blur-md transition-opacity duration-500`} />
              
              <div className="relative bg-card rounded-xl overflow-hidden border border-white/10 h-[450px] flex flex-col">
                <div className="h-[70%] w-full relative">
                  <img src={card.image} alt={card.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 text-xs font-medium">
                    <span className="font-emoji">✨</span> {card.rarity}
                  </div>
                </div>
                
                <div className="p-5 h-[30%] flex flex-col justify-end">
                  <div className="text-sm text-primary mb-1 uppercase tracking-wider font-semibold">{card.role}</div>
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="font-serif text-xl font-bold">{card.name}</h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="font-emoji">⚔️</span> {card.power}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">&ldquo;{card.quote}&rdquo;</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
