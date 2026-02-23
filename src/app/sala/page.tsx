"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRoomStore } from "@/lib/room-store";
import { categories } from "@/data/questions";
import { ArrowLeft, Copy, Play, Users, Plus, Trash2, Check } from "lucide-react";
import Link from "next/link";
import RoomGame from "@/components/RoomGame";
import RoomResults from "@/components/RoomResults";

export default function SalaPage() {
  const {
    roomCode,
    isHost,
    isStarted,
    isFinished,
    players,
    teams,
    questionCount,
    timePerQuestion,
    category,
    createRoom,
    setRoomConfig,
    addTeam,
    removeTeam,
    joinTeam,
    addPlayer,
    startGame,
    playerId,
    resetRoom,
  } = useRoomStore();

  const [hostName, setHostName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [copied, setCopied] = useState(false);

  const teamColors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

  const handleCreateRoom = () => {
    if (!hostName.trim()) return;
    createRoom(hostName.trim());
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim());
    setNewPlayerName("");
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim() || teams.length >= 4) return;
    addTeam(newTeamName.trim(), teamColors[teams.length]);
    setNewTeamName("");
  };

  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    const teamsWithPlayers = teams.filter((t) =>
      players.some((p) => p.teamId === t.id)
    );
    if (teamsWithPlayers.length < 2) {
      alert("Precisa de pelo menos 2 equipas com jogadores!");
      return;
    }
    startGame();
  };

  // Room not created yet
  if (!roomCode) {
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
          >
            <div className="text-center mb-8">
              <Users size={36} className="text-accent mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Modo Equipas</h1>
              <p className="text-muted mt-2">Crie uma sala e adicione jogadores</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-muted mb-2">
                Seu nome (Host)
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Nome do apresentador..."
                className="w-full px-4 py-3 rounded-xl bg-card border border-card-border text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50"
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!hostName.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent text-white font-semibold text-lg hover:bg-accent-light disabled:opacity-40 transition-colors"
            >
              <Users size={20} />
              Criar Sala
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Game started
  if (isStarted && !isFinished) {
    return <RoomGame />;
  }

  // Game finished
  if (isFinished) {
    return <RoomResults onRestart={() => resetRoom()} />;
  }

  // Lobby
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Room code */}
          <div className="text-center mb-8">
            <p className="text-sm text-muted mb-2">Codigo da Sala</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-bold font-mono tracking-widest gradient-text">
                {roomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-lg border border-card-border hover:border-accent/30 text-muted hover:text-accent transition-colors"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Teams */}
            <div>
              <h3 className="text-sm font-semibold text-muted mb-3">
                Equipas ({teams.length}/4)
              </h3>
              <div className="space-y-2 mb-3">
                {teams.map((team) => {
                  const teamPlayers = players.filter(
                    (p) => p.teamId === team.id
                  );
                  return (
                    <div
                      key={team.id}
                      className="p-3 rounded-xl border border-card-border bg-card/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="font-semibold text-sm">
                            {team.name}
                          </span>
                        </div>
                        {isHost && teams.length > 2 && (
                          <button
                            onClick={() => removeTeam(team.id)}
                            className="text-muted hover:text-danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {teamPlayers.length === 0 ? (
                          <span className="text-xs text-muted/50">
                            Nenhum jogador
                          </span>
                        ) : (
                          teamPlayers.map((p) => (
                            <span
                              key={p.id}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: team.color + "20",
                                color: team.color,
                              }}
                            >
                              {p.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {teams.length < 4 && isHost && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Nome da equipa..."
                    className="flex-1 px-3 py-2 rounded-lg bg-card border border-card-border text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50"
                  />
                  <button
                    onClick={handleAddTeam}
                    className="px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Players */}
            <div>
              <h3 className="text-sm font-semibold text-muted mb-3">
                Jogadores ({players.length})
              </h3>
              <div className="space-y-2 mb-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-card-border bg-card/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {player.name}
                        {player.isHost && (
                          <span className="text-[10px] ml-1 text-accent">
                            (Host)
                          </span>
                        )}
                      </span>
                    </div>
                    <select
                      value={player.teamId || ""}
                      onChange={(e) =>
                        joinTeam(player.id, e.target.value)
                      }
                      className="text-xs px-2 py-1 rounded-lg bg-card border border-card-border text-foreground focus:outline-none"
                    >
                      <option value="">Sem equipa</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Add player */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Adicionar jogador..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                  className="flex-1 px-3 py-2 rounded-lg bg-card border border-card-border text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/50"
                />
                <button
                  onClick={handleAddPlayer}
                  className="px-3 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Config */}
          {isHost && (
            <div className="mt-6 p-4 rounded-xl border border-card-border bg-card/30">
              <h3 className="text-sm font-semibold text-muted mb-3">
                Configurações
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1">
                    Categoria
                  </label>
                  <select
                    value={category || ""}
                    onChange={(e) =>
                      setRoomConfig({
                        category: e.target.value || null,
                      })
                    }
                    className="w-full px-2 py-2 rounded-lg bg-card border border-card-border text-xs text-foreground focus:outline-none"
                  >
                    <option value="">Todas</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">
                    Perguntas
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) =>
                      setRoomConfig({ questionCount: Number(e.target.value) })
                    }
                    className="w-full px-2 py-2 rounded-lg bg-card border border-card-border text-xs text-foreground focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1">
                    Tempo (seg)
                  </label>
                  <select
                    value={timePerQuestion}
                    onChange={(e) =>
                      setRoomConfig({
                        timePerQuestion: Number(e.target.value),
                      })
                    }
                    className="w-full px-2 py-2 rounded-lg bg-card border border-card-border text-xs text-foreground focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Start button */}
          {isHost && (
            <button
              onClick={handleStart}
              className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-accent text-white font-semibold text-lg hover:bg-accent-light transition-colors"
            >
              <Play size={20} />
              Iniciar Jogo
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
