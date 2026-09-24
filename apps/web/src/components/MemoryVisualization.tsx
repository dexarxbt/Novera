import { motion } from "framer-motion";
import { useState } from "react";

interface StrengthArea {
  subject: string;
  strength: number;
  trend: "up" | "down" | "stable";
  color: string;
}

export default function MemoryVisualization() {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const strengths: StrengthArea[] = [
    { subject: "Calculus", strength: 85, trend: "up", color: "novera-cyan" },
    { subject: "Algebra", strength: 72, trend: "stable", color: "novera-blue" },
    { subject: "Geometry", strength: 60, trend: "down", color: "novera-warm" },
    { subject: "Physics", strength: 78, trend: "up", color: "novera-violet" },
    { subject: "Chemistry", strength: 65, trend: "up", color: "novera-purple" },
    { subject: "Biology", strength: 55, trend: "stable", color: "novera-cyan" },
  ];

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "↗";
      case "down":
        return "↘";
      case "stable":
        return "→";
    }
  };

  return (
    <section className="py-24 px-6 border-t border-novera-soft bg-gradient-to-b from-transparent to-novera-black/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your learning profile,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-novera-blue via-novera-violet to-novera-cyan">
              visualized in real-time
            </span>
          </h2>
          <p className="text-xl text-novera-muted max-w-2xl">
            Watch as Novera learns your strengths, identifies gaps, and adapts your learning path. Every interaction makes the profile richer.
          </p>
        </motion.div>

        {/* Brain-like visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-12 p-8 bg-novera-soft rounded-2xl border border-novera-blue/20"
        >
          <svg
            viewBox="0 0 500 350"
            className="w-full h-auto"
            style={{ filter: "drop-shadow(0 0 20px rgba(24, 168, 255, 0.2))" }}
          >
            {/* Simplified brain outline */}
            <circle cx="250" cy="180" r="120" fill="none" stroke="#18A8FF" strokeWidth="2" opacity="0.3" />

            {/* Subject nodes positioned around the brain */}
            {strengths.map((s, idx) => {
              const angle = (idx / strengths.length) * Math.PI * 2;
              const radius = 100;
              const x = 250 + Math.cos(angle) * radius;
              const y = 180 + Math.sin(angle) * radius;
              const colorMap: Record<string, string> = {
                "novera-cyan": "#28D7FF",
                "novera-blue": "#18A8FF",
                "novera-warm": "#FFB84D",
                "novera-violet": "#6C4DFF",
                "novera-purple": "#9B6CFF",
              };
              const color = colorMap[s.color as keyof typeof colorMap];
              const size = (s.strength / 100) * 30 + 15;

              return (
                <g key={s.subject}>
                  <line
                    x1="250"
                    y1="180"
                    x2={x}
                    y2={y}
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={size}
                    fill={color}
                    opacity={0.3 + (s.strength / 100) * 0.7}
                    style={{
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={() => setActiveSubject(s.subject)}
                    onMouseLeave={() => setActiveSubject(null)}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dy="0.3em"
                    className="text-xs font-bold fill-novera-white pointer-events-none"
                    fontSize="10"
                  >
                    {s.strength}%
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Center label */}
          <div className="text-center mt-6">
            <p className="text-novera-muted text-sm">
              Hover or tap to explore. Larger nodes = stronger mastery.
            </p>
          </div>
        </motion.div>

        {/* Subject breakdown cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {strengths.map((subject, index) => (
            <motion.div
              key={subject.subject}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 * index }}
              viewport={{ once: true }}
              onMouseEnter={() => setActiveSubject(subject.subject)}
              onMouseLeave={() => setActiveSubject(null)}
              className={`p-5 rounded-lg border transition-all duration-300 cursor-pointer ${
                activeSubject === subject.subject
                  ? `bg-novera-soft border-${subject.color}`
                  : "bg-novera-black/50 border-novera-blue/10 hover:border-novera-blue/30"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{subject.subject}</h3>
                <span className="text-novera-muted text-xs">
                  {getTrendIcon(subject.trend)}
                </span>
              </div>

              <div className="mb-3">
                <div className="w-full bg-novera-black rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${subject.strength}%` }}
                    transition={{ duration: 1, delay: 0.2 + 0.05 * index }}
                    viewport={{ once: true }}
                    className={`h-full bg-gradient-to-r from-${subject.color} to-${subject.color}`}
                    style={{
                      backgroundImage: `linear-gradient(90deg, var(--color-${subject.color}), var(--color-${subject.color}))`,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-novera-muted">{subject.strength}% Mastery</span>
                <span className={`text-xs font-semibold ${
                  subject.trend === "up"
                    ? "text-novera-cyan"
                    : subject.trend === "down"
                      ? "text-novera-warm"
                      : "text-novera-muted"
                }`}>
                  {subject.trend === "up"
                    ? "+5% this week"
                    : subject.trend === "down"
                      ? "-2% this week"
                      : "Steady"}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Key metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 p-8 bg-gradient-to-r from-novera-blue/10 to-novera-violet/10 rounded-lg border border-novera-blue/20"
        >
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-novera-cyan">6</div>
              <p className="text-novera-muted text-sm mt-2">Active Subjects</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-novera-blue">72</div>
              <p className="text-novera-muted text-sm mt-2">Average Mastery</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-novera-warm">248</div>
              <p className="text-novera-muted text-sm mt-2">Memories Stored</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-novera-purple">↗ 8%</div>
              <p className="text-novera-muted text-sm mt-2">Week-over-week Growth</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
