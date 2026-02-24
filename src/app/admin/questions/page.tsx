"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getAllQuestions, deleteQuestion } from "@/lib/services/question-service";
import { getAllCategories } from "@/lib/services/category-service";
import { DbQuestion, DbCategory } from "@/lib/supabase";
import { getDifficultyLabel, getDifficultyColor } from "@/data/questions";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<number | "">("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [qs, cats] = await Promise.all([getAllQuestions(), getAllCategories()]);
      setQuestions(qs);
      setCategories(cats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem a certeza que deseja eliminar esta pergunta?")) return;
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Erro ao eliminar pergunta");
    }
  }

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || q.category_id === filterCategory;
    const matchesDifficulty = filterDifficulty === "" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Perguntas</h1>
            <p className="text-muted mt-1">
              {filteredQuestions.length} de {questions.length} perguntas
            </p>
          </div>
          <Link
            href="/admin/questions/new"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
          >
            <Plus size={18} />
            Nova Pergunta
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar perguntas..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50"
          >
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value ? Number(e.target.value) : "")}
            className="px-4 py-3 rounded-xl bg-card border border-card-border text-foreground focus:outline-none focus:border-accent/50"
          >
            <option value="">Todas</option>
            <option value="1">Fácil</option>
            <option value="2">Médio</option>
            <option value="3">Difícil</option>
          </select>
        </div>

        {/* Questions list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted">
            <Loader2 size={24} className="animate-spin mr-2" />
            Carregando perguntas...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-16 text-muted">
            {questions.length === 0
              ? "Nenhuma pergunta encontrada. Migre os dados ou crie novas perguntas."
              : "Nenhuma pergunta corresponde aos filtros selecionados."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-card-border bg-card/30 hover:border-accent/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold mb-2 leading-relaxed">{q.question}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span>{q.categories?.icon} {q.categories?.label}</span>
                      <span
                        className={getDifficultyColor(q.difficulty)}
                      >
                        {getDifficultyLabel(q.difficulty)}
                      </span>
                      <span>{q.reference}</span>
                      {!q.is_active && (
                        <span className="text-danger">Inativa</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/admin/questions/edit/${q.id}`}
                      className="p-2 rounded-lg border border-card-border hover:border-accent/30 transition-colors"
                    >
                      <Edit size={16} className="text-accent" />
                    </Link>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 rounded-lg border border-card-border hover:border-danger/30 transition-colors"
                    >
                      <Trash2 size={16} className="text-danger" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
