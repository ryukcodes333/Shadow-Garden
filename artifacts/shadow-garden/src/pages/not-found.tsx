import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden text-foreground">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-10 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
      
      <motion.div 
        className="relative z-10 text-center max-w-md px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <img src="/images/sigil.png" alt="Sigil" className="w-24 h-24 mx-auto opacity-50 grayscale" />
        </div>
        
        <h1 className="text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/20 mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-serif text-muted-foreground mb-6 uppercase tracking-widest">
          Lost in the <span className="text-gradient-violet">Shadows</span>
        </h2>
        
        <p className="text-sm text-muted-foreground/60 mb-8 leading-relaxed">
          The sanctuary you are looking for does not exist, or has been erased from the archives. Turn back before the darkness consumes you.
        </p>
        
        <Link href="/">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-primary transition-colors text-xs uppercase tracking-widest px-6 py-5 rounded-full">
            <ArrowLeft className="mr-2 w-4 h-4" /> Return to the Garden
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
