import { motion, useScroll } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/");
  };

  return (
    <motion.header 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-white/5 py-4" : "bg-transparent py-6"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <img src="/images/sigil.png" alt="Shadow Garden" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-serif font-bold text-lg tracking-widest uppercase text-gradient-gold hidden sm:block">
              Shadow Garden
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground uppercase tracking-widest">
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <a href="/#cards" className="hover:text-primary transition-colors">Cards</a>
            <a href="/#leaderboard" className="hover:text-primary transition-colors">Leaderboard</a>
          </nav>
          
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none group bg-black/20 hover:bg-black/40 border border-white/5 rounded-full pr-4 pl-1 py-1 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-background font-serif font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-serif text-foreground group-hover:text-primary transition-colors">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-white/10 mt-2 rounded-xl">
                  <DropdownMenuItem asChild className="cursor-pointer font-serif py-3 hover:bg-primary/20">
                    <Link href="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer font-serif py-3 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest text-xs h-10 px-4 hidden sm:inline-flex">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary/20 hover:bg-primary/40 text-primary-foreground border border-primary/30 rounded-full px-6 uppercase tracking-widest text-xs h-10 transition-all shadow-[0_0_15px_rgba(138,43,226,0.2)] hover:shadow-[0_0_25px_rgba(138,43,226,0.4)]">
                    Join the Order
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
