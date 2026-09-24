import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 pt-16 pb-24 bg-white relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#E8E8E8 1px, transparent 1px), linear-gradient(to right, #E8E8E8 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.35,
        }}
      />
      {/* Radial fade over grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0) 0%, #ffffff 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto w-full">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-n-tag text-n-tag-text text-xs font-semibold rounded-full tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-n-indigo inline-block" />
            Powered by Walrus Memory on Sui
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[clamp(42px,7vw,80px)] font-serif leading-[1.1] tracking-tighter text-n-text mb-6"
        >
          The AI tutor that<br />
          <span className="italic text-n-indigo">actually remembers you.</span>
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-n-body max-w-xl leading-relaxed mb-10 font-light"
        >
          Novera learns how you think, tracks what you struggle with, and adapts every session. Your profile is encrypted and stored permanently on Walrus — not a database we own.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <a
            href="https://t.me/noveraa_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-n-text text-white text-sm font-semibold rounded-xl hover:bg-n-indigo transition-colors shadow-sm"
          >
            Start learning free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 11.5L11.5 2.5M11.5 2.5H5.5M11.5 2.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3 bg-n-muted text-n-text text-sm font-semibold rounded-xl hover:bg-n-border transition-colors"
          >
            See how it works
          </a>
        </motion.div>


      </div>
    </section>
  );
}
