import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Open Novera on Telegram",
    body: "No sign-up, no app install. Just open the bot and tell it what you're studying or what you don't understand.",
  },
  {
    n: "02",
    title: "Get real tutoring",
    body: "Novera responds with personalized explanations — not generic answers. It asks follow-up questions and adjusts to your level.",
  },
  {
    n: "03",
    title: "Memory is written to Walrus",
    body: "After each session, Novera encrypts and stores what it learned about you on Walrus Memory. Permanent, decentralized, yours.",
  },
  {
    n: "04",
    title: "Every session picks up where you left off",
    body: "Next time you open it, Novera recalls your profile. No re-explaining. Just learning.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-32 px-6 bg-white border-t border-n-border" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p className="text-xs font-semibold text-n-subtle uppercase tracking-widest mb-4">How it works</p>
          <h2 className="font-serif text-[clamp(32px,5vw,56px)] leading-[1.15] tracking-tight text-n-text max-w-xl">
            Simple by design,<br />
            <span className="italic">powerful by default.</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-0 divide-y divide-n-border border-y border-n-border">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="group grid md:grid-cols-[80px_1fr_1fr] gap-6 py-8 hover:bg-n-muted transition-colors px-4 -mx-4 rounded-xl"
            >
              <span className="font-mono text-xs text-n-subtle pt-1">{s.n}</span>
              <h3 className="text-lg font-semibold text-n-text tracking-tight">{s.title}</h3>
              <p className="text-sm text-n-body leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
