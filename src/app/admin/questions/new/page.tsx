"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { createQuestion } from "@/lib/services/question-service";
import { getAllCategories } from "@/lib/services/category-service";
import { DbCategory } from "@/lib/supabase";

export default function NewQuestionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [reference, setReference] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getAllCategories();
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
  }, []);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!question.trim() || !reference.trim() || options.some((o) => !o.trim())) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      await createQuestion({
        category_id: categoryId,
        difficulty,
        question: question.trim(),
        options: options.map((o) => o.trim()),
        correct_index: correctIndex,
        reference: reference.trim(),
        explanation: explanation.trim() || undefined,
      });
      router.push("/admin/questions");
    } catch (err) {
      console.error("Error creating question:", err);
      setError("Erro ao criar pergunta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/questions"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar às Perguntas
        </Link>

        <h1 className="text-3xl font-bold mb-8">Nova Pergunta</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category and Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted mb-2">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Dificuldade</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value) as 1 | 2 | 3)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50"
              >
                <option value={1}>Fácil</option>
                <option value={2}>Médio</option>
                <option value={3}>Difícil</option>
              </select>
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm text-muted mb-2">Pergunta *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50 resize-none"
              placeholder="Escreva a pergunta..."
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm text-muted mb-2">Opções * (marque a correta)</label>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCorrectIndex(i)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                      correctIndex === i
                        ? "bg-success text-white"
                        : "bg-card border border-card-border text-muted hover:border-accent/30"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </button>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50"
                    placeholder={`Opção ${String.fromCharCode(65 + i)}...`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              Clique na letra para marcar a resposta correta (atualmente: {String.fromCharCode(65 + correctIndex)})
            </p>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm text-muted mb-2">Referência Bíblica *</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50"
              placeholder="Ex: Génesis 1:1"
            />
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm text-muted mb-2">Explicação (opcional)</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50 resize-none"
              placeholder="Explicação adicional..."
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Guardar Pergunta
          </button>
        </form>
      </div>
    </div>
  );
}
