import { supabase, DbWeeklyRanking } from "../supabase";

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

function getWeekEnd(): string {
  const start = new Date(getWeekStart());
  start.setDate(start.getDate() + 6);
  return start.toISOString().split("T")[0];
}

export async function saveQuizSession(data: {
  playerName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  bestStreak: number;
  categoryId?: string | null;
  difficulty?: number | null;
  timePerQuestion: number;
}): Promise<void> {
  // 1. Save quiz session
  const { error: sessionError } = await supabase.from("quiz_sessions").insert({
    player_name: data.playerName,
    score: data.score,
    correct_count: data.correctCount,
    total_questions: data.totalQuestions,
    best_streak: data.bestStreak,
    category_id: data.categoryId || null,
    difficulty: data.difficulty || null,
    time_per_question: data.timePerQuestion,
  });

  if (sessionError) throw sessionError;

  // 2. Upsert weekly ranking
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  // Try to get existing ranking for this player this week
  const { data: existing } = await supabase
    .from("weekly_rankings")
    .select("*")
    .eq("player_name", data.playerName)
    .eq("week_start", weekStart)
    .single();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("weekly_rankings")
      .update({
        total_score: existing.total_score + data.score,
        quizzes_completed: existing.quizzes_completed + 1,
        questions_answered: existing.questions_answered + data.totalQuestions,
        correct_answers: existing.correct_answers + data.correctCount,
        best_streak: Math.max(existing.best_streak, data.bestStreak),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw error;
  } else {
    // Insert new
    const { error } = await supabase.from("weekly_rankings").insert({
      player_name: data.playerName,
      total_score: data.score,
      quizzes_completed: 1,
      questions_answered: data.totalQuestions,
      correct_answers: data.correctCount,
      best_streak: data.bestStreak,
      week_start: weekStart,
      week_end: weekEnd,
    });

    if (error) throw error;
  }
}

export async function getCurrentWeekRankings(
  limit: number = 10
): Promise<DbWeeklyRanking[]> {
  const weekStart = getWeekStart();

  const { data, error } = await supabase
    .from("weekly_rankings")
    .select("*")
    .eq("week_start", weekStart)
    .order("total_score", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getWeekDates(): Promise<{
  start: string;
  end: string;
}> {
  return { start: getWeekStart(), end: getWeekEnd() };
}
