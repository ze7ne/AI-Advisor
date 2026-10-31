"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Clock, Target } from "lucide-react";
import { api } from "@/lib/api";
import { Goal } from "@/lib/types";
import { formatCurrency, formatDate, daysUntil, monthsUntil, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";
import { GOAL_ICON_KEYS, GOAL_ICON_LABELS, getGoalIcon } from "@/lib/icons";

const emptyForm = {
  name: "",
  target_amount: "",
  current_amount: "",
  deadline: "",
  priority: "medium",
  icon: "home",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [currency, setCurrency] = useState("KZT");
  const [profile, setProfile] = useState<{ monthly_salary: number; current_savings: number; monthly_savings_target: number } | null>(null);

  useEffect(() => {
    Promise.all([api.goals.list(), api.profile.get()]).then(([g, p]: [unknown, unknown]) => {
      setGoals(g as Goal[]);
      const prof = p as { currency: string; monthly_salary: number; current_savings: number; monthly_savings_target: number };
      setCurrency(prof.currency);
      setProfile(prof);
      setLoading(false);
    });
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(g: Goal) {
    setEditing(g);
    setForm({
      name: g.name,
      target_amount: String(g.target_amount),
      current_amount: String(g.current_amount),
      deadline: g.deadline,
      priority: g.priority,
      icon: g.icon,
    });
    setShowForm(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const payload = {
      ...form,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
    };
    if (editing) {
      const updated = await api.goals.update(editing.id, payload);
      setGoals(goals.map((g) => (g.id === editing.id ? (updated as Goal) : g)));
    } else {
      const created = await api.goals.create(payload);
      setGoals([...goals, created as Goal]);
    }
    setShowForm(false);
    setEditing(null);
  }

  async function handleDelete(id: number) {
    await api.goals.delete(id);
    setGoals(goals.filter((g) => g.id !== id));
  }

  function estimateMonthsNeeded(g: Goal): number | null {
    if (!profile) return null;
    const remaining = g.target_amount - g.current_amount;
    if (remaining <= 0) return 0;
    const monthlySavable = profile.monthly_salary - (profile.monthly_savings_target || 0);
    if (monthlySavable <= 0) return null;
    return Math.ceil(remaining / monthlySavable);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Финансовые цели</h1>
          <p className="text-slate-400 text-sm mt-1">{goals.length} активных целей</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Новая цель
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">{editing ? "Редактировать цель" : "Новая цель"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Название</label>
              <input
                className="input"
                placeholder="Квартира, машина..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Иконка</label>
              <div className="flex gap-2 flex-wrap bg-slate-800 border border-slate-700 rounded-xl p-3">
                {GOAL_ICON_KEYS.map((key) => {
                  const Icon = getGoalIcon(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      title={GOAL_ICON_LABELS[key]}
                      onClick={() => setForm({ ...form, icon: key })}
                      className={`p-2 rounded-lg transition-colors ${form.icon === key ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-white"}`}
                    >
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="label">Целевая сумма</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Уже накоплено</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={form.current_amount}
                onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Срок достижения</label>
              <input
                className="input"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Приоритет</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Отмена</button>
              <button type="submit" className="btn-primary">{editing ? "Сохранить" : "Создать"}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : goals.length === 0 ? (
        <div className="card p-12 text-center">
          <Target size={40} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Нет целей</p>
          <p className="text-slate-600 text-sm mt-1">Создайте первую финансовую цель</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {goals.map((g) => {
            const progress = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0;
            const remaining = g.target_amount - g.current_amount;
            const days = daysUntil(g.deadline);
            const months = estimateMonthsNeeded(g);
            const onTrack = months !== null && monthsUntil(g.deadline) >= months;

            return (
              <div key={g.id} className="card p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                      {(() => { const Icon = getGoalIcon(g.icon); return <Icon size={24} className="text-indigo-400" />; })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{g.name}</h3>
                      <span className={`text-xs font-medium ${PRIORITY_COLORS[g.priority]}`}>
                        {PRIORITY_LABELS[g.priority]} приоритет
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(g)} className="text-slate-600 hover:text-slate-300 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="text-slate-600 hover:text-rose-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Прогресс</span>
                    <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        background: progress >= 100 ? "#10b981" : progress >= 50 ? "#6366f1" : "#f59e0b"
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Накоплено</p>
                    <p className="text-sm font-semibold text-emerald-400">{formatCurrency(g.current_amount, currency)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Осталось</p>
                    <p className="text-sm font-semibold text-white">{formatCurrency(remaining, currency)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>{days > 0 ? `${days} дн. до срока` : "Срок истёк"}</span>
                  </div>
                  {months !== null && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${onTrack ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                      {onTrack ? "По графику" : `~${months} мес.`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
