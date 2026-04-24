import { SiWhatsapp, SiGithub, SiDiscord } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/images/sigil.png" alt="Logo" className="w-8 h-8" />
              <span className="font-serif font-bold text-xl uppercase tracking-widest text-gradient-gold">Shadow Garden</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              An elite, exclusive WhatsApp bot collective. Superior technology, superior community. We don't compete; we dominate.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Navigation</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cards</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Leaderboard</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Meet the Bots</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-foreground">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                <SiWhatsapp className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                <SiDiscord className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
                <SiGithub className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 text-center text-sm text-muted-foreground/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>&copy; {new Date().getFullYear()} Shadow Garden. All rights reserved.</div>
          <div className="flex items-center gap-2">
            Made with <span className="font-emoji">💜</span> by Cidkid
          </div>
        </div>
      </div>
    </footer>
  );
}
