import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-n-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <img src="/novera-logo.png" alt="Novera" className="h-7 w-auto" />
        </a>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-n-body hover:text-n-text transition-colors font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-n-body hover:text-n-text transition-colors font-medium">
            How it works
          </a>
          <a href="#memory" className="text-sm text-n-body hover:text-n-text transition-colors font-medium">
            Memory
          </a>
        </div>

        {/* CTA */}
        <a
          href="https://t.me/noveraa_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-n-text text-white text-sm font-medium rounded-lg hover:bg-n-indigo transition-colors"
        >
          Open in Telegram
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 11.5L11.5 2.5M11.5 2.5H5.5M11.5 2.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        {/* Mobile CTA */}
        <a
          href="https://t.me/noveraa_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden px-3.5 py-1.5 bg-n-text text-white text-sm font-medium rounded-lg"
        >
          Open
        </a>
      </div>
    </motion.nav>
  );
}
