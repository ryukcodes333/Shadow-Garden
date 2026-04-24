import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Coins, Sparkles, ShoppingBag } from "lucide-react";
import Header from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  effect: string;
  category: string;
}
interface ShopCategory {
  name: string;
  items: ShopItem[];
}

export default function Shop() {
  const { data: user } = useCurrentUser();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [activeCat, setActiveCat] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/shop")
      .then((r) => r.json())
      .then((j) => {
        const cats: ShopCategory[] = j.categories || [];
        setCategories(cats);
        if (cats.length) setActiveCat(cats[0].name);
      })
      .catch(() => toast.error("Could not load the shop."))
      .finally(() => setLoading(false));
  }, []);

  const visibleItems = useMemo(() => {
    const cat = categories.find((c) => c.name === activeCat);
    return cat?.items || [];
  }, [categories, activeCat]);

  async function buy(item: ShopItem) {
    if (!user) {
      toast.info("Sign in to buy from the shop.");
      setLocation("/login");
      return;
    }
    setBusyItem(item.id);
    try {
      const res = await fetch("/api/v1/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ itemId: item.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Purchased.");
        queryClient.invalidateQueries({ queryKey: ["me"] });
      } else {
        toast.error(data.message || "Purchase failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusyItem(null);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 pb-20">
      <Header />
      <div className="pt-32 container mx-auto px-4 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-end justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient-gold uppercase tracking-widest mb-2">
              The Black Market
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              Spend your Gold on potions, gear and contraband. Your purchases
              show up instantly in the WhatsApp bot inventory.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-2 bg-card/50 border border-white/10 rounded-full px-4 py-2 backdrop-blur">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="font-mono text-sm">{user.balance.toLocaleString()} Gold</span>
            </div>
          )}
        </motion.div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setActiveCat(c.name)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest border transition-colors ${
                  activeCat === c.name
                    ? "bg-primary/20 border-primary/40 text-primary-foreground"
                    : "bg-card/40 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-20">Summoning wares…</div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 border border-white/5 rounded-2xl">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
            Shelves are empty. Check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleItems.map((item) => {
              const affordable = !user || (user.balance || 0) >= item.price;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -3 }}
                  className="bg-card/40 border border-white/10 rounded-2xl p-5 backdrop-blur flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-serif text-gradient-violet">{item.name}</h3>
                    <Sparkles className="w-4 h-4 text-primary/70 shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground/90 min-h-[2.5em]">
                    {item.description || "Unidentified relic."}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="flex items-center gap-1.5 font-mono text-sm">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      {item.price.toLocaleString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => buy(item)}
                      disabled={busyItem === item.id || !affordable}
                      className="uppercase tracking-widest text-[10px]"
                    >
                      {busyItem === item.id ? "…" : affordable ? "Buy" : "Too poor"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
