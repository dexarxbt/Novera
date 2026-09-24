import { motion } from "framer-motion";

const dimensions = [
  { title: "Learning goals", desc: "What you're working toward, always in context." },
  { title: "Knowledge gaps", desc: "Topics you've struggled with, surfaced again at the right moment." },
  { title: "Learning style", desc: "Whether you learn better from examples, theory, or questions." },
  { title: "Progress over time", desc: "A cumulative picture of how far you've come in every subject." },
  { title: "Past misconceptions", desc: "Things you got wrong before — addressed before they calcify." },
  { title: "Session history", desc: "The full arc of every conversation, always in context." },
];

export default function Memory() {
  return (
    <section className="py-32 px-6 bg-n-bg border-t border-n-border" id="memory">
      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <div className="grid md:grid-cols-2 gap-16 mb-20 items-end">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-semibold text-n-subtle uppercase tracking-widest mb-4">Persistent Memory</p>
            <h2 className="font-serif text-[clamp(32px,5vw,56px)] leading-[1.15] tracking-tight text-n-text">
              Novera builds a model<br />
              <span className="italic">of you.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-base text-n-body leading-relaxed"
          >
            Every interaction teaches Novera something about how you learn. That knowledge is captured, encrypted, and stored on Walrus Memory — a permanent decentralized store on Sui blockchain. It travels with you, not with us.
          </motion.p>
        </div>

        {/* Dimensions grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-n-border rounded-2xl overflow-hidden border border-n-border">
          {dimensions.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              viewport={{ once: true }}
              className="bg-n-bg p-7 hover:bg-white transition-colors"
            >
              <div className="w-8 h-px bg-n-indigo mb-5" />
              <h3 className="text-sm font-semibold text-n-text mb-2">{d.title}</h3>
              <p className="text-sm text-n-body leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
