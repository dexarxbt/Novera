import { motion } from "framer-motion";

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Accounting",
  "Economics",
  "Languages",
];

export default function AnySubject() {
  return (
    <section className="py-24 px-6 border-t border-novera-soft">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-bold mb-4 leading-tight"
        >
          Your subject changes.
          <br />
          Your tutor remembers you.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-lg text-novera-muted mb-12"
        >
          Novera works for any subject, any level. One unified AI that adapts.
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.05 * index }}
              viewport={{ once: true }}
              className="p-6 bg-novera-soft rounded-lg border border-novera-muted/20 hover:border-novera-violet/50 transition text-center font-semibold"
            >
              {subject}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
