"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { Expense } from "@/lib/types";
import { formatCurrency, formatDate, CATEGORY_COLORS } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/icons";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [currency, setCurrency] = useState("KZT");

  const now = new Date();
  const [form, setForm] = useState({
    amount: "",
    category: "Еда и напитки",
    description: "",
    date: now.toISOString().slice(0, 10),
  });

  useEffect(() => {
    Promise.all([
      api.expenses.list({ month: now.getMonth() + 1, year: now.getFullYear() }),
      api.expenses.categories(),
      api.profile.get(),
    ]).then(([exp, cats, profile]: [unknown, unknown, unknown]) => {
      setExpenses(exp as Expense[]);
      setCategories(cats as string[]);
      setCurrency((profile as { currency: string }).currency);
      setLoading(false);
    });
  }, []);

  const totalMonth = expenses.reduce((s, e) => s + e.amount, 0);

  const filtered = filterCat ? expenses.filter((e) => e.category === filterCat) : expenses;

  async function handleAdd(ev: React.FormEvent) {
    ev.preventDefault();
    const created = await api.expenses.create({
      ...form,
      amount: parseFloat(form.amount),
    });
    setExpenses([created as Expense, ...expenses]);
    setForm({ amount: "", category: "Еда и напитки", description: "", date: now.toISOString().slice(0, 10) });
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    await api.expenses.delete(id);
    setExpenses(expenses.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Расходы</h1>
          <p className="text-slate-400 text-sm mt-1">
            Итого за месяц:{" "}
            <span className="text-rose-400 font-semibold">{formatCurrency(totalMonth, currency)}</span>
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Добавить расход
        </button>
      </div>

      {showForm && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Новый расход</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Сумма</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Категория</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Описание</label>
              <input
                className="input"
                placeholder="Описание (необязательно)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Дата</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Отмена</button>
              <button type="submit" className="btn-primary">Сохранить</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-4 flex items-center gap-3">
        <Filter size={16} className="text-slate-500" />
        <span className="text-sm text-slate-400">Категория:</span>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCat("")}
            className={`text-xs px-3 py-1 rounded-lg transition-colors ${!filterCat ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            Все
          </button>
          {categories.map((c) => {
            const Icon = getCategoryIcon(c);
            return (
              <button
                key={c}
                onClick={() => setFilterCat(c === filterCat ? "" : c)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${filterCat === c ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                <Icon size={12} />
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            <p>Расходов нет. Добавьте первый расход!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Категория</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Описание</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Дата</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Сумма</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      {(() => {
                        const Icon = getCategoryIcon(e.category);
                        const color = CATEGORY_COLORS[e.category] || "#6b7280";
                        return (
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: color + "22" }}
                          >
                            <Icon size={15} style={{ color }} />
                          </div>
                        );
                      })()}
                      <span className="text-sm text-white">{e.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{e.description || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDate(e.date)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-rose-400">
                      -{formatCurrency(e.amount, currency)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
