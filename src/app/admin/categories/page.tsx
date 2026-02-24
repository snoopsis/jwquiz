"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/services/category-service";
import { DbCategory } from "@/lib/supabase";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  // Form state
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const cats = await getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setSlug("");
    setLabel("");
    setIcon("");
    setFormError("");
    setEditingId(null);
    setShowNew(false);
  };

  const startEdit = (cat: DbCategory) => {
    setEditingId(cat.id);
    setSlug(cat.slug);
    setLabel(cat.label);
    setIcon(cat.icon);
    setShowNew(false);
    setFormError("");
  };

  const startNew = () => {
    resetForm();
    setShowNew(true);
  };

  const handleSave = async () => {
    if (!slug.trim() || !label.trim() || !icon.trim()) {
      setFormError("Preencha todos os campos");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      if (editingId) {
        await updateCategory(editingId, {
          slug: slug.trim(),
          label: label.trim(),
          icon: icon.trim(),
        });
      } else {
        await createCategory({
          slug: slug.trim(),
          label: label.trim(),
          icon: icon.trim(),
        });
      }
      resetForm();
      await loadCategories();
    } catch (err) {
      console.error("Error saving category:", err);
      setFormError("Erro ao guardar categoria");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta categoria irá eliminar TODAS as perguntas associadas. Continuar?")) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Erro ao eliminar categoria");
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Categorias</h1>
            <p className="text-muted mt-1">{categories.length} categorias</p>
          </div>
          <button
            onClick={startNew}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-colors"
          >
            <Plus size={18} />
            Nova Categoria
          </button>
        </div>

        {/* New/Edit form */}
        {(showNew || editingId) && (
          <div className="mb-8 p-6 rounded-2xl border border-accent/30 bg-accent/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{editingId ? "Editar Categoria" : "Nova Categoria"}</h3>
              <button onClick={resetForm} className="text-muted hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-muted mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, "-"))}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-card-border text-foreground text-sm focus:outline-none focus:border-accent/50"
                  placeholder="ex: genesis"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Nome</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-card-border text-foreground text-sm focus:outline-none focus:border-accent/50"
                  placeholder="ex: Génesis"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">Ícone (emoji)</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-card-border text-foreground text-sm focus:outline-none focus:border-accent/50"
                  placeholder="ex: 🌍"
                />
              </div>
            </div>
            {formError && <p className="text-danger text-xs mb-3">{formError}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-light disabled:opacity-40 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar
            </button>
          </div>
        )}

        {/* Categories list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted">
            <Loader2 size={24} className="animate-spin mr-2" />
            Carregando...
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-card-border bg-card/30"
              >
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{cat.label}</p>
                  <p className="text-xs text-muted font-mono">{cat.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-2 rounded-lg border border-card-border hover:border-accent/30 transition-colors"
                  >
                    <Edit size={16} className="text-accent" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-lg border border-card-border hover:border-danger/30 transition-colors"
                  >
                    <Trash2 size={16} className="text-danger" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
