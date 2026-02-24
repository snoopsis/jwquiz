"use client";

import { useEffect, useState } from "react";
import { BookOpen, FolderOpen, BarChart3, LogOut, ArrowLeft, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getQuestionCount } from "@/lib/services/question-service";
import { getAllCategories } from "@/lib/services/category-service";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ questions: 0, categories: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [qCount, cats] = await Promise.all([
          getQuestionCount(),
          getAllCategories(),
        ]);
        setStats({ questions: qCount, categories: cats.length });
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    }
    loadStats();
  }, []);

  const handleLogout = () => {
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin");
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Voltar ao Quiz
            </Link>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted mt-1">Gestão do JW Quiz</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-card-border hover:border-danger/30 text-danger transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-card-border bg-card/30 text-center">
            <p className="text-3xl font-bold gradient-text">{stats.questions}</p>
            <p className="text-xs text-muted">Perguntas ativas</p>
          </div>
          <div className="p-4 rounded-xl border border-card-border bg-card/30 text-center">
            <p className="text-3xl font-bold gradient-text">{stats.categories}</p>
            <p className="text-xs text-muted">Categorias</p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/admin/questions">
            <div className="p-6 rounded-2xl border border-card-border bg-card/50 hover:border-accent/30 transition-all cursor-pointer">
              <BookOpen size={32} className="text-accent mb-4" />
              <h2 className="text-xl font-bold mb-2">Perguntas</h2>
              <p className="text-sm text-muted">Criar, editar e eliminar perguntas do quiz</p>
            </div>
          </Link>

          <Link href="/admin/categories">
            <div className="p-6 rounded-2xl border border-card-border bg-card/50 hover:border-accent/30 transition-all cursor-pointer">
              <FolderOpen size={32} className="text-gold mb-4" />
              <h2 className="text-xl font-bold mb-2">Categorias</h2>
              <p className="text-sm text-muted">Gerir categorias das perguntas</p>
            </div>
          </Link>

          <Link href="/admin/migrate">
            <div className="p-6 rounded-2xl border border-card-border bg-card/50 hover:border-accent/30 transition-all cursor-pointer">
              <Database size={32} className="text-success mb-4" />
              <h2 className="text-xl font-bold mb-2">Migração</h2>
              <p className="text-sm text-muted">Migrar dados locais para Supabase</p>
            </div>
          </Link>

          <Link href="/ranking">
            <div className="p-6 rounded-2xl border border-card-border bg-card/50 hover:border-accent/30 transition-all cursor-pointer">
              <BarChart3 size={32} className="text-warning mb-4" />
              <h2 className="text-xl font-bold mb-2">Ranking</h2>
              <p className="text-sm text-muted">Ver ranking semanal dos jogadores</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
