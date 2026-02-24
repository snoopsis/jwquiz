import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types

export interface DbCategory {
  id: string;
  slug: string;
  label: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface DbQuestion {
  id: string;
  category_id: string;
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[];
  correct_index: number;
  reference: string;
  explanation: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  categories?: { slug: string; label: string; icon: string };
}

export interface DbQuizSession {
  id: string;
  player_name: string;
  score: number;
  correct_count: number;
  total_questions: number;
  best_streak: number;
  category_id: string | null;
  difficulty: number | null;
  time_per_question: number;
  completed_at: string;
}

export interface DbWeeklyRanking {
  id: string;
  player_name: string;
  total_score: number;
  quizzes_completed: number;
  questions_answered: number;
  correct_answers: number;
  best_streak: number;
  week_start: string;
  week_end: string;
  created_at: string;
  updated_at: string;
}
