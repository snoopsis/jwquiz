"use client";

import { motion } from "framer-motion";
import { Trophy, ArrowLeft, Medal, Star, Flame, Target } from "lucide-react";
import Link from "next/link";

// Local ranking stored in localStorage
// For now, show a static page that explains the feature
export default function RankingPage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
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
          <h1 className="text-3xl font-bold">Ranking</h1>
          <p className="text-muted mt-2">Os melhores jogadores</p>
        </motion.div>

        {/* Badges showcase */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-muted mb-3">Conquistas Disponíveis</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Medal, title: "Primeira Vitória", desc: "Complete o seu primeiro quiz", color: "text-gold" },
              { icon: Flame, title: "Em Chamas", desc: "Consiga 5 respostas seguidas", color: "text-warning" },
              { icon: Star, title: "Perfeição", desc: "100% de acerto num quiz", color: "text-accent-light" },
              { icon: Target, title: "Estudioso", desc: "Responda a 100 perguntas", color: "text-success" },
            ].map((badge, i) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="p-4 rounded-xl border border-card-border bg-card/30 text-center"
              >
                <badge.icon size={24} className={`${badge.color} mx-auto mb-2`} />
                <h4 className="text-sm font-semibold mb-1">{badge.title}</h4>
                <p className="text-[10px] text-muted">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Empty state */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center p-8 rounded-2xl border border-card-border bg-card/20"
        >
          <p className="text-muted mb-4">
            Jogue quizzes para aparecer no ranking!
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
          >
            Jogar Agora
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
