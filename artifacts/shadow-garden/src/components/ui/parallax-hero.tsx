import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

export default function ParallaxHero() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const contentY = useTransform(scrollY, [0, 800], [0, -120]);
  const scrollCueOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <section className="relative h-[100dvh] min-h-[680px] w-full overflow-hidden bg-background flex items-center justify-center">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img
          src="/images/hero-bg.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-center opacity-80"
          loading="eager"
          decoding="async"
        />
        {/* Vignette + bottom fade so the next section blends in */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.85)_85%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
        {/* Subtle violet wash */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(138,43,226,0.18)_0%,transparent_60%)]" />
      </motion.div>

      {/* Floating embers */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute block w-1 h-1 rounded-full bg-amber-300/70 shadow-[0_0_8px_rgba(252,211,77,0.8)]"
            style={{ left: `${(i * 53) % 100}%`, bottom: `-${(i * 7) % 40}px` }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [-20, -800], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 12 + (i % 6),
              repeat: Infinity,
              delay: i * 0.6,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl mx-auto"
        style={{ y: contentY }}
      >
        <motion.img
          src="/images/sigil.png"
          alt="Shadow Garden Sigil"
          className="w-28 h-28 md:w-40 md:h-40 mb-6 drop-shadow-[0_0_30px_rgba(138,43,226,0.55)]"
          initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.4em] text-amber-200/70 mb-5"
        >
          <span className="h-px w-8 bg-amber-200/40" />
          <Sparkles className="w-3.5 h-3.5" />
          <span>Eminence in Shadow</span>
          <Sparkles className="w-3.5 h-3.5" />
          <span className="h-px w-8 bg-amber-200/40" />
        </motion.div>

        <motion.h1
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif mb-6 tracking-wider text-gradient-gold uppercase leading-[1.05]"
        >
          Shadow Garden
        </motion.h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="text-base md:text-xl text-zinc-300/80 max-w-2xl mx-auto font-light tracking-wide mb-10"
        >
          We lurk in the shadows, and hunt the shadows.
          <br className="hidden md:block" />
          An elite WhatsApp community &amp; collectible RPG experience.
        </motion.p>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="/signup"
            className="group relative inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-black font-semibold tracking-wider uppercase text-sm shadow-[0_0_30px_rgba(252,211,77,0.35)] hover:shadow-[0_0_40px_rgba(252,211,77,0.6)] transition-shadow"
          >
            Join the Order
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#bots"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-white/90 font-medium tracking-wider uppercase text-sm hover:bg-white/10 transition-colors"
          >
            Meet the Seven
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 z-20"
        style={{ opacity: scrollCueOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-amber-200/60"
        >
          <ChevronDown className="w-7 h-7" />
        </motion.div>
      </motion.div>
    </section>
  );
}
