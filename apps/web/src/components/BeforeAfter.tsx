import { motion } from "framer-motion";

export default function BeforeAfter() {
  return (
    <section className="py-24 px-6 border-t border-novera-soft">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold mb-16 text-center"
        >
          Without memory vs with Novera
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Without */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-8 bg-novera-soft rounded-lg border border-novera-muted/30"
          >
            <h3 className="text-xl font-bold mb-6 text-novera-muted">Without Memory</h3>
            <div className="space-y-4">
              <div>
                <p className="text-novera-muted text-sm mb-2">Student:</p>
                <p className="text-white">"What should I study?"</p>
              </div>
              <div>
                <p className="text-novera-muted text-sm mb-2">AI:</p>
                <p className="text-white">"What are you currently studying?"</p>
              </div>
            </div>
          </motion.div>

          {/* With Novera */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="p-8 bg-novera-soft rounded-lg border border-novera-blue/50"
          >
            <h3 className="text-xl font-bold mb-6 text-novera-blue">With Novera</h3>
            <div className="space-y-4">
              <div>
                <p className="text-novera-muted text-sm mb-2">Student:</p>
                <p className="text-white">"What should I study?"</p>
              </div>
              <div>
                <p className="text-novera-muted text-sm mb-2">Novera:</p>
                <p className="text-white">
                  "Let's revisit the concept you've been struggling with, then test it again."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
