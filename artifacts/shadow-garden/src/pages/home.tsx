import ParallaxHero from "@/components/ui/parallax-hero";
import StatsStrip from "@/components/ui/stats-strip";
import CardShowcase from "@/components/ui/card-showcase";
import BotsRail from "@/components/ui/bots-rail";
import Leaderboard from "@/components/ui/leaderboard";
import CTASection from "@/components/ui/cta-section";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <Header />
      <ParallaxHero />
      <StatsStrip />
      <CardShowcase />
      <BotsRail />
      <Leaderboard />
      <CTASection />
      <Footer />
    </main>
  );
}
