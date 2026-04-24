import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background with blur and gradient */}
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-20 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img src="/images/sigil.png" alt="Sigil" className="w-24 h-24 mx-auto mb-8 opacity-80" />
          
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-wide text-gradient-gold">
            Embrace The Shadows
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 font-light">
            Stop pretending. Your rival communities are playing with toys. 
            Join the absolute apex of WhatsApp bot gaming. The garden awaits.
          </p>
          
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/80 text-primary-foreground text-lg px-8 py-6 rounded-full font-serif tracking-widest uppercase transition-all duration-300 shadow-[0_0_40px_rgba(138,43,226,0.4)] hover:shadow-[0_0_60px_rgba(138,43,226,0.6)] hover:scale-105"
          >
            Join via WhatsApp <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <p className="mt-6 text-sm text-muted-foreground/60 flex items-center justify-center gap-2">
            <span className="font-emoji">🔒</span> Elite access only.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
