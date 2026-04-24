import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useCommunityStats } from "@/hooks/use-stats";
import { Skeleton } from "@/components/ui/skeleton";

function Counter({ value, suffix = "" }: { value: number, suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-serif font-bold text-4xl md:text-5xl text-gradient-gold">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function StatsStrip() {
  const { data, isLoading, isError } = useCommunityStats();

  const stats = [
    { label: "Shadows", value: data?.members || 0 },
    { label: "Whispers Cast", value: data?.messages || 0 },
    { label: "Cards Forged", value: data?.uniqueCards || data?.totalCards || 0 },
    { label: "Dungeons Cleared", value: data?.dungeonsCleared || 0 },
  ];

  return (
    <section className="py-20 bg-background border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 mix-blend-screen" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center gap-2"
            >
              {isLoading ? (
                <Skeleton className="h-10 md:h-12 w-24 bg-primary/10" />
              ) : isError ? (
                <span className="font-serif font-bold text-4xl md:text-5xl text-muted-foreground">—</span>
              ) : (
                <Counter value={stat.value} />
              )}
              <span className="text-sm md:text-base text-muted-foreground uppercase tracking-widest">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
