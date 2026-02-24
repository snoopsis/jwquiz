"use client";

import { useState } from "react";
import { ArrowLeft, Database, Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { runFullMigration } from "@/lib/migrate-data";

export default function MigratePage() {
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [result, setResult] = useState<{ categories: number; questions: number } | null>(null);
  const [error, setError] = useState("");

  const handleMigrate = async () => {
    setStatus("running");
    setError("");
    setResult(null);

    try {
      const res = await runFullMigration();
      setResult(res);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido na migração");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar ao Dashboard
        </Link>

        <div className="text-center mb-8">
          <Database size={36} className="text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Migração de Dados</h1>
          <p className="text-muted mt-2">
            Migrar perguntas e categorias locais para o Supabase
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-card-border bg-card/50 mb-8">
          <h3 className="font-semibold mb-3">O que será migrado:</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>- 8 categorias (Génesis, Êxodo, Evangelhos, Profecias, Personagens, Cronologia, Leis, Geral)</li>
            <li>- Todas as perguntas do ficheiro local</li>
          </ul>
          <div className="mt-4 p-3 rounded-xl border border-warning/30 bg-warning/5">
            <p className="text-xs text-warning">
              Atenção: Execute apenas uma vez. Se executar novamente, serão criadas perguntas duplicadas.
            </p>
          </div>
        </div>

        {/* Status */}
        {status === "success" && result && (
          <div className="mb-6 p-4 rounded-xl border border-success/30 bg-success/5 flex items-start gap-3">
            <CheckCircle2 size={20} className="text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-success">Migração concluída com sucesso!</p>
              <p className="text-sm text-muted mt-1">
                {result.categories} categorias e {result.questions} perguntas migradas.
              </p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="mb-6 p-4 rounded-xl border border-danger/30 bg-danger/5 flex items-start gap-3">
            <XCircle size={20} className="text-danger shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-danger">Erro na migração</p>
              <p className="text-sm text-muted mt-1">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleMigrate}
          disabled={status === "running"}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === "running" ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Migrando dados...
            </>
          ) : (
            <>
              <Database size={20} />
              Executar Migração
            </>
          )}
        </button>
      </div>
    </div>
  );
}
