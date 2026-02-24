import { supabase, DbQuestion } from "../supabase";

export async function getRandomQuestions(
  count: number,
  categorySlug?: string,
  difficulty?: 1 | 2 | 3
): Promise<DbQuestion[]> {
  let query = supabase
    .from("questions")
    .select("*, categories:category_id (slug, label, icon)")
    .eq("is_active", true);

  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  if (difficulty) {
    query = query.eq("difficulty", difficulty);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Shuffle and limit
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export async function getAllQuestions(): Promise<DbQuestion[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*, categories:category_id (slug, label, icon)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getQuestionById(id: string): Promise<DbQuestion | null> {
  const { data, error } = await supabase
    .from("questions")
    .select("*, categories:category_id (slug, label, icon)")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createQuestion(question: {
  category_id: string;
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[];
  correct_index: number;
  reference: string;
  explanation?: string;
  is_active?: boolean;
}): Promise<DbQuestion> {
  const { data, error } = await supabase
    .from("questions")
    .insert({ ...question, is_active: question.is_active ?? true })
    .select("*, categories:category_id (slug, label, icon)")
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuestion(
  id: string,
  updates: Partial<{
    category_id: string;
    difficulty: 1 | 2 | 3;
    question: string;
    options: string[];
    correct_index: number;
    reference: string;
    explanation: string | null;
    is_active: boolean;
  }>
): Promise<DbQuestion> {
  const { data, error } = await supabase
    .from("questions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, categories:category_id (slug, label, icon)")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
}

export async function getQuestionCount(): Promise<number> {
  const { count, error } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (error) throw error;
  return count || 0;
}
