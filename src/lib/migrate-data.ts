import { supabase } from "./supabase";
import { categories as localCategories, questions as localQuestions } from "@/data/questions";

export async function migrateCategories(): Promise<Map<string, string>> {
  const categoryMap = new Map<string, string>();

  for (const cat of localCategories) {
    const { data, error } = await supabase
      .from("categories")
      .upsert({ slug: cat.id, label: cat.label, icon: cat.icon }, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (error) throw new Error(`Erro ao migrar categoria ${cat.id}: ${error.message}`);
    categoryMap.set(data.slug, data.id);
  }

  return categoryMap;
}

export async function migrateQuestions(categoryMap: Map<string, string>): Promise<number> {
  let count = 0;

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < localQuestions.length; i += batchSize) {
    const batch = localQuestions.slice(i, i + batchSize).map((q) => ({
      category_id: categoryMap.get(q.category)!,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      correct_index: q.correctIndex,
      reference: q.reference,
      explanation: q.explanation || null,
      is_active: true,
    }));

    const { data, error } = await supabase.from("questions").insert(batch).select("id");

    if (error) throw new Error(`Erro ao migrar perguntas (batch ${i}): ${error.message}`);
    count += (data?.length || 0);
  }

  return count;
}

export async function runFullMigration(): Promise<{ categories: number; questions: number }> {
  const categoryMap = await migrateCategories();
  const questionsCount = await migrateQuestions(categoryMap);
  return { categories: categoryMap.size, questions: questionsCount };
}
