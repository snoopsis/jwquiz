import { create } from "zustand";
import { nanoid } from "nanoid";
import { Question, getRandomQuestions } from "@/data/questions";

export interface Team {
  id: string;
  name: string;
  color: string;
  players: string[];
  score: number;
}

export interface RoomPlayer {
  id: string;
  name: string;
  teamId: string | null;
  score: number;
  isHost: boolean;
}

interface RoomState {
  roomCode: string | null;
  isHost: boolean;
  playerId: string;
  playerName: string;
  players: RoomPlayer[];
  teams: Team[];
  questions: Question[];
  currentIndex: number;
  isStarted: boolean;
  isFinished: boolean;
  showingAnswer: boolean;
  questionCount: number;
  timePerQuestion: number;
  category: string | null;

  // Actions
  createRoom: (hostName: string) => void;
  setRoomConfig: (config: { questionCount?: number; timePerQuestion?: number; category?: string | null }) => void;
  addTeam: (name: string, color: string) => void;
  removeTeam: (teamId: string) => void;
  joinTeam: (playerId: string, teamId: string) => void;
  addPlayer: (name: string) => RoomPlayer;
  removePlayer: (playerId: string) => void;
  startGame: () => void;
  submitAnswer: (playerId: string, correct: boolean, points: number) => void;
  showAnswer: () => void;
  nextQuestion: () => void;
  resetRoom: () => void;
}

const teamColors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

export const useRoomStore = create<RoomState>((set, get) => ({
  roomCode: null,
  isHost: false,
  playerId: "",
  playerName: "",
  players: [],
  teams: [],
  questions: [],
  currentIndex: 0,
  isStarted: false,
  isFinished: false,
  showingAnswer: false,
  questionCount: 10,
  timePerQuestion: 20,
  category: null,

  createRoom: (hostName) => {
    const code = nanoid(6).toUpperCase();
    const hostId = nanoid(8);
    const defaultTeams: Team[] = [
      { id: nanoid(4), name: "Equipa A", color: teamColors[0], players: [], score: 0 },
      { id: nanoid(4), name: "Equipa B", color: teamColors[1], players: [], score: 0 },
    ];
    set({
      roomCode: code,
      isHost: true,
      playerId: hostId,
      playerName: hostName,
      players: [{ id: hostId, name: hostName, teamId: null, score: 0, isHost: true }],
      teams: defaultTeams,
      isStarted: false,
      isFinished: false,
      currentIndex: 0,
    });
  },

  setRoomConfig: (config) => set((state) => ({ ...state, ...config })),

  addTeam: (name, color) => {
    const { teams } = get();
    if (teams.length >= 4) return;
    set({
      teams: [...teams, { id: nanoid(4), name, color, players: [], score: 0 }],
    });
  },

  removeTeam: (teamId) => {
    const { teams, players } = get();
    set({
      teams: teams.filter((t) => t.id !== teamId),
      players: players.map((p) =>
        p.teamId === teamId ? { ...p, teamId: null } : p
      ),
    });
  },

  joinTeam: (playerId, teamId) => {
    const { players, teams } = get();
    set({
      players: players.map((p) =>
        p.id === playerId ? { ...p, teamId } : p
      ),
      teams: teams.map((t) => ({
        ...t,
        players:
          t.id === teamId
            ? [...t.players.filter((pid) => pid !== playerId), playerId]
            : t.players.filter((pid) => pid !== playerId),
      })),
    });
  },

  addPlayer: (name) => {
    const id = nanoid(8);
    const player: RoomPlayer = { id, name, teamId: null, score: 0, isHost: false };
    set((state) => ({ players: [...state.players, player] }));
    return player;
  },

  removePlayer: (playerId) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    }));
  },

  startGame: () => {
    const { questionCount, category } = get();
    const questions = getRandomQuestions(questionCount, category || undefined);
    set({
      questions,
      currentIndex: 0,
      isStarted: true,
      isFinished: false,
      showingAnswer: false,
      teams: get().teams.map((t) => ({ ...t, score: 0 })),
      players: get().players.map((p) => ({ ...p, score: 0 })),
    });
  },

  submitAnswer: (playerId, correct, points) => {
    const { players, teams } = get();
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    set({
      players: players.map((p) =>
        p.id === playerId ? { ...p, score: p.score + points } : p
      ),
      teams: player.teamId
        ? teams.map((t) =>
            t.id === player.teamId
              ? { ...t, score: t.score + points }
              : t
          )
        : teams,
    });
  },

  showAnswer: () => set({ showingAnswer: true }),

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex + 1 >= questions.length) {
      set({ isFinished: true });
    } else {
      set({
        currentIndex: currentIndex + 1,
        showingAnswer: false,
      });
    }
  },

  resetRoom: () =>
    set({
      roomCode: null,
      isHost: false,
      players: [],
      teams: [],
      questions: [],
      currentIndex: 0,
      isStarted: false,
      isFinished: false,
      showingAnswer: false,
    }),
}));
