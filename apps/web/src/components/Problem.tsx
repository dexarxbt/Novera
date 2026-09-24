import { motion } from "framer-motion";

const problems = [
  {
    label: "01",
    title: "Every session starts over",
    body: "Generic AI tutors have no memory. You re-explain your level, your goals, your gaps — every single time.",
  },
  {
    label: "02",
    title: "Your data belongs to them",
    body: "Your learning history is locked inside company servers. When they pivot, raise prices, or shut down — it's gone.",
  },
  {
    label: "03",
    title: "No real personalization",
    body: "Without memory, there's no adaptation. You get the same explanation for the same concept whether it's your first or tenth time asking.",
  },
];

export default function Problem() {
  return (
    <section className="py-32 px-6 bg-white border-t border-n-border" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20 max-w-2xl"
        >
          <p className="text-xs font-semibold text-n-subtle uppercase tracking-widest mb-4">The Problem</p>
          <h2 className="font-serif text-[clamp(32px,5vw,56px)] leading-[1.15] tracking-tight text-n-text">
            Tutoring that forgets<br />
            <span className="italic">isn't tutoring.</span>
          </h2>
        </motion.div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-px bg-n-border rounded-2xl overflow-hidden border border-n-border">
          {problems.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 hover:bg-n-muted transition-colors group"
            >
              <span className="text-xs font-mono text-n-subtle mb-6 block">{p.label}</span>
              <h3 className="text-xl font-semibold text-n-text mb-3 tracking-tight">{p.title}</h3>
              <p className="text-sm text-n-body leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
