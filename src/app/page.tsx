"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, Trophy, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "Modo Individual",
    description: "Teste os seus conhecimentos bíblicos ao seu ritmo",
    href: "/quiz",
    color: "text-warning",
  },
  {
    icon: Users,
    title: "Modo Equipas",
    description: "Crie uma sala e desafie amigos em tempo real",
    href: "/sala",
    color: "text-accent-light",
  },
  {
    icon: Trophy,
    title: "Ranking",
    description: "Veja os melhores jogadores e conquistas",
    href: "/ranking",
    color: "text-gold",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <BookOpen size={40} className="text-accent" />
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
          <span className="gradient-text">JW Quiz</span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-muted max-w-md mx-auto">
          Quiz bíblico baseado na Tradução do Novo Mundo
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-14 grid sm:grid-cols-3 gap-4 max-w-3xl w-full relative z-10"
      >
        {features.map((feature, i) => (
          <Link key={feature.title} href={feature.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
              className="group p-6 rounded-2xl border border-card-border bg-card/50 hover:border-accent/40 hover:bg-card transition-all duration-300 cursor-pointer text-center"
            >
              <feature.icon
                size={32}
                className={`${feature.color} mx-auto mb-4 group-hover:scale-110 transition-transform`}
              />
              <h2 className="font-semibold text-lg mb-2">{feature.title}</h2>
              <p className="text-sm text-muted">{feature.description}</p>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mt-16 relative z-10"
      >
        <Link
          href="/quiz"
          className="px-8 py-4 rounded-xl bg-accent text-white font-semibold text-lg hover:bg-accent-light transition-colors duration-200 animate-pulse-glow"
        >
          Jogar Agora
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-12 text-xs text-muted/50 relative z-10"
      >
        200+ perguntas em 8 categorias
      </motion.p>
    </div>
  );
}
