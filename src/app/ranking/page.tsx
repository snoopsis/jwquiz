"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Crown, Medal, Award, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getCurrentWeekRankings, getWeekDates } from "@/lib/services/ranking-service";
import { DbWeeklyRanking } from "@/lib/supabase";

export default function RankingPage() {
  const [rankings, setRankings] = useState<DbWeeklyRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekDates, setWeekDates] = useState({ start: "", end: "" });

  const loadRankings = async () => {
    setLoading(true);
    try {
      const [data, dates] = await Promise.all([
        getCurrentWeekRankings(10),
        getWeekDates(),
      ]);
      setRankings(data);
      setWeekDates(dates);
    } catch (error) {
      console.error("Error loading rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRankings();
  }, []);

  const getPositionDisplay = (position: number) => {
    if (position === 1) return <Crown size={20} className="text-gold" />;
    if (position === 2) return <Medal size={20} className="text-silver" />;
    if (position === 3) return <Award size={20} className="text-bronze" />;
    return <span className="text-sm font-mono text-muted">#{position}</span>;
  };

  const getRowStyle = (position: number) => {
    if (position === 1) return "border-gold/30 bg-gold/5";
    if (position === 2) return "border-silver/30 bg-silver/5";
    if (position === 3) return "border-bronze/30 bg-bronze/5";
    return "border-card-border bg-card/30";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Trophy size={36} className="text-gold mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Ranking Semanal</h1>
          <p className="text-muted mt-2">Top 10 jogadores desta semana</p>
          {weekDates.start && (
            <p className="text-xs text-muted/60 mt-1">
              {formatDate(weekDates.start)} - {formatDate(weekDates.end)}
            </p>
          )}
        </motion.div>

        {/* Refresh button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={loadRankings}
            disabled={loading}
            className="flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted">
            <Loader2 size={24} className="animate-spin mr-2" />
            Carregando ranking...
          </div>
        ) : rankings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 rounded-2xl border border-card-border bg-card/20"
          >
            <p className="text-muted mb-4">
              Seja o primeiro a aparecer no ranking esta semana!
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
            >
              Jogar Agora
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {rankings.map((ranking, index) => {
              const position = index + 1;
              const accuracy = ranking.questions_answered > 0
                ? Math.round((ranking.correct_answers / ranking.questions_answered) * 100)
                : 0;

              return (
                <motion.div
                  key={ranking.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border ${getRowStyle(position)}`}
                >
                  <div className="w-8 flex items-center justify-center">
                    {getPositionDisplay(position)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{ranking.player_name}</p>
                    <p className="text-xs text-muted">
                      {ranking.quizzes_completed} {ranking.quizzes_completed === 1 ? "quiz" : "quizzes"} &middot;{" "}
                      {ranking.correct_answers}/{ranking.questions_answered} corretas ({accuracy}%)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold gradient-text">{ranking.total_score.toLocaleString()}</p>
                    <p className="text-[10px] text-muted">pontos</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted mt-8"
        >
          O ranking reinicia todas as segundas-feiras
        </motion.p>
      </div>
    </div>
  );
}
