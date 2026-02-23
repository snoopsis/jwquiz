"use client";

import { motion } from "framer-motion";
import { BookOpen, Settings, Play } from "lucide-react";
import { useQuizStore } from "@/lib/quiz-store";
import { categories } from "@/data/questions";
import { useState } from "react";

interface QuizSetupProps {
  onStart: () => void;
}

export default function QuizSetup({ onStart }: QuizSetupProps) {
  const { setConfig, startQuiz, playerName } = useQuizStore();
  const [name, setName] = useState(playerName);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(20);

  const handleStart = () => {
    if (!name.trim()) return;
    setConfig({
      playerName: name.trim(),
      category: selectedCategory,
      difficulty: selectedDifficulty,
      questionCount,
      timePerQuestion,
    });
    startQuiz();
    onStart();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <BookOpen size={36} className="text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Modo Individual</h1>
        <p className="text-muted mt-2">Configure o seu quiz</p>
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="block text-sm text-muted mb-2">Seu nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o seu nome..."
          className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <label className="block text-sm text-muted mb-3">
          Categoria{" "}
          <span className="text-muted/50">(deixe vazio para todas)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
              className={`p-3 rounded-xl border text-sm text-center transition-all duration-200 ${
                selectedCategory === cat.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-card-border bg-card/30 text-muted hover:border-accent/30"
              }`}
            >
              <span className="text-lg block mb-1">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <label className="block text-sm text-muted mb-3">Dificuldade</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: null as (1 | 2 | 3 | null), label: "Todas", color: "text-foreground" },
            { value: 1 as (1 | 2 | 3 | null), label: "Fácil", color: "text-success" },
            { value: 2 as (1 | 2 | 3 | null), label: "Médio", color: "text-warning" },
            { value: 3 as (1 | 2 | 3 | null), label: "Difícil", color: "text-danger" },
          ].map((d) => (
            <button
              key={String(d.value)}
              onClick={() => setSelectedDifficulty(d.value)}
              className={`p-3 rounded-xl border text-sm transition-all duration-200 ${
                selectedDifficulty === d.value
                  ? "border-accent bg-accent/10"
                  : "border-card-border bg-card/30 hover:border-accent/30"
              } ${d.color}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="mb-8 p-4 rounded-xl border border-card-border bg-card/30">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-muted" />
          <span className="text-sm text-muted">Configurações</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted mb-1">
              N.º de perguntas
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-card border border-card-border text-sm text-foreground focus:outline-none focus:border-accent/50"
            >
              <option value={5}>5 perguntas</option>
              <option value={10}>10 perguntas</option>
              <option value={15}>15 perguntas</option>
              <option value={20}>20 perguntas</option>
              <option value={30}>30 perguntas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">
              Tempo por pergunta
            </label>
            <select
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-card border border-card-border text-sm text-foreground focus:outline-none focus:border-accent/50"
            >
              <option value={10}>10 segundos</option>
              <option value={15}>15 segundos</option>
              <option value={20}>20 segundos</option>
              <option value={30}>30 segundos</option>
              <option value={60}>60 segundos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!name.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent text-white font-semibold text-lg hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <Play size={20} />
        Começar Quiz
      </button>
    </motion.div>
  );
}
