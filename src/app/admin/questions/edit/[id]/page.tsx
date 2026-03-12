"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { getQuestionById, updateQuestion } from "@/lib/services/question-service";
import { getAllCategories } from "@/lib/services/category-service";
import { DbCategory } from "@/lib/supabase";

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [reference, setReference] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, q] = await Promise.all([
          getAllCategories(),
          getQuestionById(id),
        ]);
        setCategories(cats);

        if (q) {
          setCategoryId(q.category_id);
          setDifficulty(q.difficulty);
          setQuestion(q.question ?? "");
          setOptions(Array.isArray(q.options) ? q.options : ["", "", "", ""]);
          setCorrectIndex(q.correct_index ?? 0);
          setReference(q.reference ?? "");
          setExplanation(q.explanation || "");
          setIsActive(q.is_active ?? true);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Erro ao carregar pergunta");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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

    setSaving(true);
    try {
      await updateQuestion(id, {
        category_id: categoryId,
        difficulty,
        question: question.trim(),
        options: options.map((o) => o.trim()),
        correct_index: correctIndex,
        reference: reference.trim(),
        explanation: explanation.trim() || null,
        is_active: isActive,
      });
      router.push("/admin/questions");
    } catch (err) {
      console.error("Error updating question:", err);
      setError("Erro ao atualizar pergunta");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted" />
      </div>
    );
  }

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

        <h1 className="text-3xl font-bold mb-8">Editar Pergunta</h1>

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

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isActive ? "bg-success" : "bg-card-border"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-muted">
              {isActive ? "Pergunta ativa" : "Pergunta inativa"}
            </span>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm text-muted mb-2">Pergunta *</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm text-muted mb-2">Opções *</label>
            <div className="space-y-3">
              {(options || []).map((opt, i) => (
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
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              Resposta correta: {String.fromCharCode(65 + correctIndex)}
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
            />
          </div>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Guardar Alterações
          </button>
        </form>
      </div>
    </div>
  );
}
