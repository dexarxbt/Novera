import { motion } from "framer-motion";

export default function Final() {
  return (
    <section className="py-32 px-6 bg-white border-t border-n-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-n-subtle uppercase tracking-widest mb-4">Get started</p>
            <h2 className="font-serif text-[clamp(32px,5vw,52px)] leading-[1.15] tracking-tight text-n-text mb-6">
              Your learning profile<br />
              <span className="italic">starts now.</span>
            </h2>
            <p className="text-base text-n-body leading-relaxed mb-8 max-w-md">
              Open Novera on Telegram. Ask it anything. It will remember — and get better at teaching you — every single session.
            </p>
            <a
              href="https://t.me/noveraa_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-n-text text-white text-sm font-semibold rounded-xl hover:bg-n-indigo transition-colors"
            >
              Open @noveraa_bot
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 11.5L11.5 2.5M11.5 2.5H5.5M11.5 2.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>

          {/* Right — stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { value: "Persistent", label: "Memory across sessions" },
              { value: "Encrypted", label: "End-to-end on Walrus" },
              { value: "Adaptive", label: "Personalized to your pace" },
              { value: "Permanent", label: "Your data, forever" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 bg-n-bg border border-n-border rounded-2xl"
              >
                <p className="text-xl font-bold text-n-text tracking-tight mb-1">{stat.value}</p>
                <p className="text-xs text-n-subtle leading-snug">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
