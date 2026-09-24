import { motion } from "framer-motion";

const pillars = [
  {
    label: "Encrypted at rest",
    title: "Nobody reads your data — not even us",
    body: "Your learning profile is encrypted before it ever leaves your session. Novera processes it, then stores a cipher. The key is yours.",
  },
  {
    label: "Decentralized storage",
    title: "Stored on Walrus, not on our servers",
    body: "Walrus is a decentralized blob storage network running on the Sui blockchain. Your profile lives there — not in a database we control.",
  },
  {
    label: "Immutable record",
    title: "Your progress exists permanently",
    body: "Walrus uses erasure-coded redundancy across independent storage nodes. Your learning history is permanent and tamper-proof.",
  },
];

export default function Walrus() {
  return (
    <section className="py-32 px-6 bg-n-bg border-t border-n-border">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="grid md:grid-cols-2 gap-16 mb-20 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-n-subtle uppercase tracking-widest mb-4">Infrastructure</p>
            <h2 className="font-serif text-[clamp(32px,5vw,56px)] leading-[1.15] tracking-tight text-n-text">
              Built on Walrus.<br />
              <span className="italic">Owned by you.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <p className="text-base text-n-body leading-relaxed mb-6">
              Most apps treat your data as a product. Walrus Memory flips that — your learning profile is stored in a decentralized network where only you hold the key.
            </p>
            <a
              href="https://walrus.site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-n-indigo hover:underline"
            >
              Learn about Walrus
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 10L10 2M10 2H5M10 2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white border border-n-border rounded-2xl p-8 hover:border-n-indigo/40 hover:shadow-sm transition-all"
            >
              <span className="inline-block px-2.5 py-1 bg-n-tag text-n-tag-text text-2xs font-semibold rounded-full tracking-wide uppercase mb-6">
                {p.label}
              </span>
              <h3 className="text-base font-semibold text-n-text mb-3 leading-snug">{p.title}</h3>
              <p className="text-sm text-n-body leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
