"use client";

import { motion } from "framer-motion";
import { useRoomStore } from "@/lib/room-store";
import { Trophy, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface RoomResultsProps {
  onRestart: () => void;
}

export default function RoomResults({ onRestart }: RoomResultsProps) {
  const { teams } = useRoomStore();

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];

  const medals = ["🥇", "🥈", "🥉", "4️⃣"];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Winner */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="mb-6"
          >
            <Trophy size={48} className="text-gold mx-auto mb-3" />
            <h1 className="text-3xl font-bold gradient-text mb-2">
              {winner?.name} Vence!
            </h1>
            <p className="text-5xl font-bold font-mono" style={{ color: winner?.color }}>
              {winner?.score} pts
            </p>
          </motion.div>

          {/* Rankings */}
          <div className="space-y-3 mb-8">
            {sortedTeams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  i === 0
                    ? "border-gold/30 bg-gold/5"
                    : "border-card-border bg-card/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{medals[i]}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="font-semibold">{team.name}</span>
                </div>
                <span
                  className="text-xl font-bold font-mono"
                  style={{ color: team.color }}
                >
                  {team.score}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
            >
              <RotateCcw size={18} />
              Nova Partida
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-card-border text-muted hover:text-foreground transition-colors"
            >
              <Home size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
