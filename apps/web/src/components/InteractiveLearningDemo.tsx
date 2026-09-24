import { motion } from "framer-motion";
import { useState } from "react";

type DemoTab = "telegram" | "quiz" | "progress";

export default function InteractiveLearningDemo() {
  const [activeTab, setActiveTab] = useState<DemoTab>("telegram");

  const telegramMessages = [
    { role: "user" as const, text: "I want to learn about calculus" },
    {
      role: "bot" as const,
      text: "Great! Let's start with the fundamentals. What's your current level?",
    },
    { role: "user" as const, text: "Beginner, but I know algebra" },
    {
      role: "bot" as const,
      text: "Perfect! Let me ask you a quick question to understand what you know.\n\nWhat is the derivative of x²?",
    },
    { role: "user" as const, text: "2x?" },
    {
      role: "bot" as const,
      text: "Excellent! You got it right. Your understanding of power rule is strong. Let me remember that.\n\nNext, let's tackle limits. Here's an interactive quiz...",
    },
  ];

  const quizSteps = [
    {
      question: "What is lim(x→0) sin(x)/x?",
      options: ["0", "1", "∞", "undefined"],
      correct: 1,
      explanation:
        "This is a fundamental limit in calculus. As x approaches 0, both sin(x) and x approach 0, but their ratio approaches 1.",
    },
    {
      question: "Which of these is a continuous function?",
      options: ["floor(x)", "1/x", "sin(x)", "step function"],
      correct: 2,
      explanation:
        "sin(x) is continuous everywhere. floor(x) has jumps, 1/x has a discontinuity at 0, and step functions by definition have discontinuities.",
    },
  ];

  const progressData = [
    { week: "Week 1", accuracy: 45, topics: 2 },
    { week: "Week 2", accuracy: 58, topics: 4 },
    { week: "Week 3", accuracy: 72, topics: 6 },
    { week: "Week 4", accuracy: 85, topics: 8 },
  ];

  return (
    <section className="py-24 px-6 border-t border-novera-soft">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Experience Novera
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-novera-blue via-novera-violet to-novera-cyan">
              in action
            </span>
          </h2>
          <p className="text-xl text-novera-muted max-w-2xl mx-auto">
            See how Novera personalizes learning, adapts to your pace, and builds your mastery.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex gap-2 mb-8 border-b border-novera-blue/20"
        >
          {(["telegram", "quiz", "progress"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
                activeTab === tab
                  ? "border-novera-blue text-novera-blue"
                  : "border-transparent text-novera-muted hover:text-novera-white"
              }`}
            >
              {tab === "telegram" && "📱 Chat Experience"}
              {tab === "quiz" && "🧠 Adaptive Quiz"}
              {tab === "progress" && "📈 Progress Tracking"}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="p-8 bg-novera-soft rounded-lg border border-novera-blue/20"
        >
          {activeTab === "telegram" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {telegramMessages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-novera-blue/30 border border-novera-blue/50 text-novera-white"
                        : "bg-novera-black/50 border border-novera-blue/20 text-novera-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "quiz" && (
            <div className="space-y-6">
              {quizSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="p-6 bg-novera-black/50 rounded border border-novera-violet/30"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-novera-violet font-bold">Q{idx + 1}.</span>
                    <h4 className="font-semibold text-lg">{step.question}</h4>
                  </div>

                  <div className="space-y-2 mb-6">
                    {step.options.map((option, optIdx) => (
                      <motion.button
                        key={optIdx}
                        whileHover={{ x: 4 }}
                        className={`w-full text-left px-4 py-3 rounded border transition-all ${
                          optIdx === step.correct
                            ? "bg-novera-cyan/20 border-novera-cyan/50 text-novera-cyan font-semibold"
                            : "bg-novera-black/30 border-novera-blue/20 hover:border-novera-blue/40 text-novera-white"
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {option}
                      </motion.button>
                    ))}
                  </div>

                  <div className="p-4 bg-novera-blue/10 rounded border border-novera-blue/30 text-sm text-novera-white">
                    <p className="font-semibold mb-2">💡 Explanation:</p>
                    <p>{step.explanation}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "progress" && (
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold mb-6 text-lg">Accuracy Over Time</h4>
                <div className="flex items-end gap-2 h-40">
                  {progressData.map((data, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.accuracy / 100) * 100}%` }}
                      transition={{ delay: idx * 0.15, duration: 0.6 }}
                      className="flex-1 bg-gradient-to-t from-novera-cyan to-novera-blue rounded-t hover:opacity-80 transition"
                      title={`${data.accuracy}% accuracy`}
                    >
                      <div className="h-full flex items-end justify-center pb-2">
                        <span className="text-xs font-bold text-novera-white">
                          {data.accuracy}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-sm text-novera-muted">
                  {progressData.map((data) => (
                    <span key={data.week}>{data.week}</span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-novera-black/50 rounded border border-novera-blue/20">
                  <p className="text-novera-muted text-sm mb-2">Total Sessions</p>
                  <p className="text-3xl font-bold text-novera-cyan">24</p>
                </div>
                <div className="p-4 bg-novera-black/50 rounded border border-novera-blue/20">
                  <p className="text-novera-muted text-sm mb-2">Avg. Accuracy</p>
                  <p className="text-3xl font-bold text-novera-violet">75%</p>
                </div>
                <div className="p-4 bg-novera-black/50 rounded border border-novera-blue/20">
                  <p className="text-novera-muted text-sm mb-2">Current Streak</p>
                  <p className="text-3xl font-bold text-novera-warm">8 days</p>
                </div>
              </div>

              <div className="p-4 bg-novera-cyan/10 rounded border border-novera-cyan/30">
                <p className="text-sm text-novera-cyan">
                  <span className="font-semibold">🎯 Next goal:</span> Reach 90% accuracy on
                  integration problems. You're on track—keep it up!
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-novera-muted mb-6">
            Ready to transform your learning?
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-novera-blue to-novera-cyan text-novera-black font-bold rounded-lg hover:shadow-lg hover:shadow-novera-blue/50 transition-all">
            Start Learning on Telegram
          </button>
        </motion.div>
      </div>
    </section>
  );
}
