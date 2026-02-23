"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoomStore } from "@/lib/room-store";
import { getPointsForDifficulty, getDifficultyLabel, getDifficultyColor, categories } from "@/data/questions";
import { Clock, CheckCircle2, XCircle, ChevronRight, BookOpen } from "lucide-react";

const optionLetters = ["A", "B", "C", "D"];

export default function RoomGame() {
  const {
    questions,
    currentIndex,
    teams,
    players,
    isHost,
    playerId,
    timePerQuestion,
    showingAnswer,
    showAnswer,
    submitAnswer,
    nextQuestion,
  } = useRoomStore();

  const question = questions[currentIndex];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    setSelectedOption(null);
    setAnswered(false);
    startTimeRef.current = Date.now();
    setTimeLeft(timePerQuestion);

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, timePerQuestion - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (isHost) showAnswer();
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, timePerQuestion, isHost, showAnswer]);

  const handleAnswer = (index: number) => {
    if (answered || showingAnswer) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOption(index);
    setAnswered(true);

    const correct = index === question.correctIndex;
    const points = correct ? getPointsForDifficulty(question.difficulty) : 0;

    // All players in the room "answer" via the host
    players.forEach((p) => {
      if (p.teamId) {
        // In local mode, host submits for demonstration
      }
    });

    // Submit for the host player
    submitAnswer(playerId, correct, points);

    if (isHost) {
      setTimeout(() => showAnswer(), 500);
    }
  };

  const category = categories.find((c) => c.id === question.category);
  const timerPercent = (timeLeft / timePerQuestion) * 100;
  const timerColor =
    timerPercent > 50 ? "bg-success" : timerPercent > 25 ? "bg-warning" : "bg-danger";

  // Sort teams by score
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Scoreboard */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {sortedTeams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-card-border bg-card/30"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              <span className="text-sm font-semibold">{team.name}</span>
              <span className="text-sm font-mono font-bold ml-2" style={{ color: team.color }}>
                {team.score}
              </span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted">
              {currentIndex + 1}/{questions.length}
            </span>
            {category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-card-border text-muted">
                {category.icon} {category.label}
              </span>
            )}
            <span className={`text-xs font-mono ${getDifficultyColor(question.difficulty)}`}>
              {getDifficultyLabel(question.difficulty)}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="h-1.5 bg-card-border rounded-full overflow-hidden mb-4">
          <motion.div
            className={`h-full rounded-full ${timerColor}`}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex justify-center mb-6">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
              timeLeft <= 5 ? "border-danger/50 text-danger" : "border-card-border text-muted"
            }`}
          >
            <Clock size={16} />
            <span className="font-mono font-bold text-lg">{timeLeft}s</span>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 rounded-2xl border border-card-border bg-card/50 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold leading-relaxed text-center">
                {question.question}
              </h2>
            </div>

            {/* Options - 2x2 grid for room display */}
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option, i) => {
                const isCorrect = i === question.correctIndex;
                const isSelected = selectedOption === i;
                let borderClass = "border-card-border hover:border-accent/40";
                let bgClass = "bg-card/30";

                if (showingAnswer) {
                  if (isCorrect) {
                    borderClass = "border-success";
                    bgClass = "bg-success/10";
                  } else if (isSelected && !isCorrect) {
                    borderClass = "border-danger";
                    bgClass = "bg-danger/10";
                  } else {
                    borderClass = "border-card-border opacity-50";
                  }
                }

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleAnswer(i)}
                    disabled={answered || showingAnswer}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${borderClass} ${bgClass} ${
                      !answered && !showingAnswer ? "cursor-pointer" : "cursor-default"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        showingAnswer && isCorrect
                          ? "bg-success text-white"
                          : showingAnswer && isSelected && !isCorrect
                          ? "bg-danger text-white"
                          : "bg-card-border text-muted"
                      }`}
                    >
                      {showingAnswer && isCorrect ? (
                        <CheckCircle2 size={16} />
                      ) : showingAnswer && isSelected && !isCorrect ? (
                        <XCircle size={16} />
                      ) : (
                        optionLetters[i]
                      )}
                    </span>
                    <span className="text-sm">{option}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Reference & Next */}
            <AnimatePresence>
              {showingAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="p-4 rounded-xl border border-card-border bg-card/30 mb-4">
                    <div className="flex items-center gap-2 text-xs text-accent mb-1">
                      <BookOpen size={14} />
                      {question.reference}
                    </div>
                    {question.explanation && (
                      <p className="text-sm text-muted">{question.explanation}</p>
                    )}
                  </div>

                  {isHost && (
                    <button
                      onClick={nextQuestion}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
                    >
                      {currentIndex + 1 < questions.length ? (
                        <>
                          Próxima Pergunta
                          <ChevronRight size={18} />
                        </>
                      ) : (
                        "Ver Resultados"
                      )}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
