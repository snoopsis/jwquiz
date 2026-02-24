"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuizStore, getDifficultyLabel, getDifficultyColor } from "@/lib/quiz-store";
import { Trophy, RotateCcw, Home, Flame, Target, Clock, CheckCircle2, XCircle, Save } from "lucide-react";
import Link from "next/link";

interface QuizResultsProps {
  onRestart: () => void;
}

export default function QuizResults({ onRestart }: QuizResultsProps) {
  const { playerName, score, results, questions, bestStreak, resetQuiz, saveResults } = useQuizStore();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const didSave = useRef(false);

  const correctCount = results.filter((r) => r.correct).length;
  const totalQuestions = results.length;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const avgTime = totalQuestions > 0
    ? Math.round(results.reduce((sum, r) => sum + r.timeMs, 0) / totalQuestions / 1000)
    : 0;

  useEffect(() => {
    if (didSave.current || totalQuestions === 0) return;
    didSave.current = true;

    async function save() {
      setSaving(true);
      try {
        await saveResults();
        setSaved(true);
      } catch (error) {
        console.error("Error saving results:", error);
      } finally {
        setSaving(false);
      }
    }
    save();
  }, [totalQuestions, saveResults]);

  const getGrade = () => {
    if (percentage >= 90) return { label: "Excelente!", emoji: "🏆", color: "text-gold" };
    if (percentage >= 70) return { label: "Muito Bom!", emoji: "⭐", color: "text-success" };
    if (percentage >= 50) return { label: "Bom!", emoji: "👍", color: "text-warning" };
    return { label: "Continue a estudar!", emoji: "📖", color: "text-muted" };
  };

  const grade = getGrade();

  const handleRestart = () => {
    resetQuiz();
    onRestart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-6xl mb-4"
        >
          {grade.emoji}
        </motion.div>
        <h1 className={`text-3xl font-bold ${grade.color}`}>{grade.label}</h1>
        <p className="text-muted mt-2">{playerName}</p>
      </div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl border border-card-border bg-card/50 mb-6"
      >
        <div className="text-center mb-6">
          <div className="text-5xl font-bold gradient-text mb-1">{score}</div>
          <div className="text-sm text-muted">pontos</div>
          {/* Save status */}
          <div className="mt-2 flex items-center justify-center gap-1 text-xs">
            {saving ? (
              <span className="text-muted">Guardando pontuação...</span>
            ) : saved ? (
              <span className="text-success flex items-center gap-1">
                <Save size={12} />
                Pontuação guardada no ranking!
              </span>
            ) : (
              <span className="text-muted/50">Offline - pontuação não guardada</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target size={14} className="text-success" />
            </div>
            <div className="text-lg font-bold">{correctCount}/{totalQuestions}</div>
            <div className="text-[10px] text-muted">Corretas</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy size={14} className="text-gold" />
            </div>
            <div className="text-lg font-bold">{percentage}%</div>
            <div className="text-[10px] text-muted">Acerto</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={14} className="text-warning" />
            </div>
            <div className="text-lg font-bold">{bestStreak}</div>
            <div className="text-[10px] text-muted">Melhor Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} className="text-accent" />
            </div>
            <div className="text-lg font-bold">{avgTime}s</div>
            <div className="text-[10px] text-muted">Tempo Médio</div>
          </div>
        </div>
      </motion.div>

      {/* Answers review */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-sm font-semibold text-muted mb-3">Resumo das respostas</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {results.map((result, i) => {
            const q = questions[i];
            if (!q) return null;
            const cat = q.categories;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                  result.correct
                    ? "border-success/20 bg-success/5"
                    : "border-danger/20 bg-danger/5"
                }`}
              >
                {result.correct ? (
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                ) : (
                  <XCircle size={16} className="text-danger shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate">{q.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted">{cat?.icon} {cat?.label}</span>
                    <span className={`text-[10px] ${getDifficultyColor(q.difficulty)}`}>
                      {getDifficultyLabel(q.difficulty)}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold shrink-0">
                  {result.correct ? (
                    <span className="text-success">+{result.points}</span>
                  ) : (
                    <span className="text-danger">0</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleRestart}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
        >
          <RotateCcw size={18} />
          Jogar Novamente
        </button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-card-border text-muted hover:text-foreground hover:border-accent/30 transition-colors"
        >
          <Home size={18} />
        </Link>
      </div>
    </motion.div>
  );
}
