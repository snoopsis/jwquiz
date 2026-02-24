"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuizStore, getDifficultyLabel, getDifficultyColor } from "@/lib/quiz-store";
import { Clock, Flame, BookOpen, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

const optionLetters = ["A", "B", "C", "D"];

export default function QuizGame() {
  const {
    questions,
    currentIndex,
    score,
    streak,
    selectedOption,
    isAnswered,
    timePerQuestion,
    timeLeft,
    setTimeLeft,
    answerQuestion,
    nextQuestion,
  } = useQuizStore();

  const question = questions[currentIndex];
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setTimeLeft(timePerQuestion);

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, timePerQuestion - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!useQuizStore.getState().isAnswered) {
          answerQuestion(-1, timePerQuestion * 1000);
        }
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, timePerQuestion, setTimeLeft, answerQuestion]);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    answerQuestion(index, elapsed);
    setAnimateScore(true);
    setTimeout(() => setAnimateScore(false), 600);
  };

  const handleNext = () => {
    nextQuestion();
  };

  if (!question) return null;

  const category = question.categories;
  const timerPercent = (timeLeft / timePerQuestion) * 100;
  const timerColor =
    timerPercent > 50 ? "bg-success" : timerPercent > 25 ? "bg-warning" : "bg-danger";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header bar */}
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
          <span
            className={`text-xs font-mono ${getDifficultyColor(question.difficulty)}`}
          >
            {getDifficultyLabel(question.difficulty)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-warning text-xs font-bold"
            >
              <Flame size={14} />
              {streak}x
            </motion.div>
          )}
          <motion.div
            animate={animateScore ? { scale: [1, 1.3, 1] } : {}}
            className="text-sm font-bold font-mono text-accent"
          >
            {score} pts
          </motion.div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 bg-card-border rounded-full overflow-hidden mb-6">
        <motion.div
          className={`h-full rounded-full ${timerColor}`}
          animate={{ width: `${timerPercent}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Timer number */}
      <div className="flex justify-center mb-6">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            timeLeft <= 5
              ? "border-danger/50 text-danger"
              : "border-card-border text-muted"
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
            <h2 className="text-xl font-semibold leading-relaxed">
              {question.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, i) => {
              const isCorrect = i === question.correct_index;
              const isSelected = selectedOption === i;
              let borderClass = "border-card-border hover:border-accent/40";
              let bgClass = "bg-card/30";

              if (isAnswered) {
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAnswer(i)}
                  disabled={isAnswered}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${borderClass} ${bgClass} ${
                    !isAnswered ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isAnswered && isCorrect
                        ? "bg-success text-white"
                        : isAnswered && isSelected && !isCorrect
                        ? "bg-danger text-white"
                        : "bg-card-border text-muted"
                    }`}
                  >
                    {isAnswered && isCorrect ? (
                      <CheckCircle2 size={16} />
                    ) : isAnswered && isSelected && !isCorrect ? (
                      <XCircle size={16} />
                    ) : (
                      optionLetters[i]
                    )}
                  </span>
                  <span className="flex-1 text-sm">{option}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation & reference */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <div className="p-4 rounded-xl border border-card-border bg-card/30">
                  <div className="flex items-center gap-2 text-xs text-accent mb-2">
                    <BookOpen size={14} />
                    {question.reference}
                  </div>
                  {question.explanation && (
                    <p className="text-sm text-muted leading-relaxed">
                      {question.explanation}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
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
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
