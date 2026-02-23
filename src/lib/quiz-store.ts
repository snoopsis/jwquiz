import { create } from "zustand";
import { Question, getRandomQuestions, getPointsForDifficulty } from "@/data/questions";

export interface PlayerResult {
  questionId: number;
  correct: boolean;
  timeMs: number;
  points: number;
}

interface QuizState {
  // Config
  playerName: string;
  category: string | null;
  difficulty: (1 | 2 | 3) | null;
  questionCount: number;
  timePerQuestion: number;

  // Game state
  questions: Question[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  results: PlayerResult[];
  selectedOption: number | null;
  isAnswered: boolean;
  isFinished: boolean;
  timeLeft: number;

  // Actions
  setConfig: (config: {
    playerName?: string;
    category?: string | null;
    difficulty?: (1 | 2 | 3) | null;
    questionCount?: number;
    timePerQuestion?: number;
  }) => void;
  startQuiz: () => void;
  answerQuestion: (optionIndex: number, timeMs: number) => void;
  nextQuestion: () => void;
  setTimeLeft: (time: number) => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  playerName: "",
  category: null,
  difficulty: null,
  questionCount: 10,
  timePerQuestion: 20,

  questions: [],
  currentIndex: 0,
  score: 0,
  streak: 0,
  bestStreak: 0,
  results: [],
  selectedOption: null,
  isAnswered: false,
  isFinished: false,
  timeLeft: 20,

  setConfig: (config) => set((state) => ({ ...state, ...config })),

  startQuiz: () => {
    const { category, difficulty, questionCount, timePerQuestion } = get();
    const questions = getRandomQuestions(
      questionCount,
      category || undefined,
      difficulty || undefined
    );
    set({
      questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      results: [],
      selectedOption: null,
      isAnswered: false,
      isFinished: false,
      timeLeft: timePerQuestion,
    });
  },

  answerQuestion: (optionIndex, timeMs) => {
    const { questions, currentIndex, score, streak, bestStreak, results, timePerQuestion } = get();
    const question = questions[currentIndex];
    const correct = optionIndex === question.correctIndex;

    const timeBonus = Math.max(0, Math.floor(((timePerQuestion * 1000 - timeMs) / (timePerQuestion * 1000)) * 50));
    const basePoints = getPointsForDifficulty(question.difficulty);
    const streakBonus = correct ? Math.min(streak, 5) * 20 : 0;
    const points = correct ? basePoints + timeBonus + streakBonus : 0;

    const newStreak = correct ? streak + 1 : 0;
    const newBestStreak = Math.max(bestStreak, newStreak);

    set({
      selectedOption: optionIndex,
      isAnswered: true,
      score: score + points,
      streak: newStreak,
      bestStreak: newBestStreak,
      results: [
        ...results,
        { questionId: question.id, correct, timeMs, points },
      ],
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions, timePerQuestion } = get();
    if (currentIndex + 1 >= questions.length) {
      set({ isFinished: true });
    } else {
      set({
        currentIndex: currentIndex + 1,
        selectedOption: null,
        isAnswered: false,
        timeLeft: timePerQuestion,
      });
    }
  },

  setTimeLeft: (time) => set({ timeLeft: time }),

  resetQuiz: () =>
    set({
      questions: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      results: [],
      selectedOption: null,
      isAnswered: false,
      isFinished: false,
    }),
}));
