import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="border-t border-n-border bg-n-bg px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <img src="/novera-logo.png" alt="Novera" className="h-6 w-auto mb-4" />
            <p className="text-sm text-n-body leading-relaxed max-w-xs">
              AI tutoring with persistent memory. Your learning profile lives on Walrus — encrypted, immutable, permanently yours.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-n-subtle uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-3 text-sm text-n-body">
              <li><a href="https://t.me/noveraa_bot" target="_blank" rel="noopener noreferrer" className="hover:text-n-text transition-colors">Launch App</a></li>
              <li><a href="#features" className="hover:text-n-text transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-n-text transition-colors">How it works</a></li>
              <li><a href="#memory" className="hover:text-n-text transition-colors">Memory</a></li>
            </ul>
          </motion.div>

          {/* Tech */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-n-subtle uppercase tracking-widest mb-4">Technology</p>
            <ul className="space-y-3 text-sm text-n-body">
              <li><a href="https://memory.walrus.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-n-text transition-colors">Walrus Memory</a></li>
              <li><a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-n-text transition-colors">Sui Blockchain</a></li>
              <li><a href="https://deepmind.google/gemini" target="_blank" rel="noopener noreferrer" className="hover:text-n-text transition-colors">Gemini AI</a></li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-n-subtle uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-3 text-sm text-n-body">
              <li><a href="#" className="hover:text-n-text transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-n-text transition-colors">Terms</a></li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-n-border pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-n-subtle">© 2026 Novera. All rights reserved.</p>
          <p className="text-xs text-n-subtle">Built on Walrus Memory · Sui Blockchain</p>
        </div>
      </div>
    </footer>
  );
}
