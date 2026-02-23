"use client";

import { useState } from "react";
import { useQuizStore } from "@/lib/quiz-store";
import QuizSetup from "@/components/QuizSetup";
import QuizGame from "@/components/QuizGame";
import QuizResults from "@/components/QuizResults";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function QuizPage() {
  const { questions, isFinished } = useQuizStore();
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {!started && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Voltar
          </Link>
        )}

        {!started ? (
          <QuizSetup onStart={() => setStarted(true)} />
        ) : isFinished ? (
          <QuizResults onRestart={() => setStarted(false)} />
        ) : questions.length > 0 ? (
          <QuizGame />
        ) : null}
      </div>
    </div>
  );
}
