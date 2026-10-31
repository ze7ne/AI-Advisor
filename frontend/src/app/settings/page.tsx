"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Profile } from "@/lib/types";

const CURRENCIES = [
  { code: "KZT", label: "Тенге (KZT)" },
  { code: "RUB", label: "Рубль (RUB)" },
  { code: "USD", label: "Доллар (USD)" },
  { code: "EUR", label: "Евро (EUR)" },
];

export default function SettingsPage() {
  const [form, setForm] = useState({
    monthly_salary: "",
    current_savings: "",
    monthly_savings_target: "",
    currency: "KZT",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.profile.get().then((p) => {
      const profile = p as Profile;
      setForm({
        monthly_salary: String(profile.monthly_salary),
        current_savings: String(profile.current_savings),
        monthly_savings_target: String(profile.monthly_savings_target),
        currency: profile.currency,
      });
      setLoading(false);
    });
  }, []);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    await api.profile.update({
      monthly_salary: parseFloat(form.monthly_salary) || 0,
      current_savings: parseFloat(form.current_savings) || 0,
      monthly_savings_target: parseFloat(form.monthly_savings_target) || 0,
      currency: form.currency,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const monthlySavable = parseFloat(form.monthly_salary || "0") - parseFloat(form.monthly_savings_target || "0");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Настройки</h1>
        <p className="text-slate-400 text-sm mt-1">Укажите ваш доход и финансовые цели</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-3">Доходы</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Ежемесячная зарплата</label>
                <input
                  className="input"
                  type="number"
                  placeholder="0"
                  value={form.monthly_salary}
                  onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Валюта</label>
                <select
                  className="input"
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-3">Накопления</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Текущие накопления</label>
                <input
                  className="input"
                  type="number"
                  placeholder="0"
                  value={form.current_savings}
                  onChange={(e) => setForm({ ...form, current_savings: e.target.value })}
                />
                <p className="text-xs text-slate-600 mt-1">Сколько денег у вас уже отложено</p>
              </div>
              <div>
                <label className="label">Цель накопления в месяц</label>
                <input
                  className="input"
                  type="number"
                  placeholder="0"
                  value={form.monthly_savings_target}
                  onChange={(e) => setForm({ ...form, monthly_savings_target: e.target.value })}
                />
                <p className="text-xs text-slate-600 mt-1">Сколько планируете откладывать</p>
              </div>
            </div>

            {form.monthly_salary && (
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Прогноз</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Зарплата</p>
                    <p className="text-sm font-semibold text-white">{parseFloat(form.monthly_salary || "0").toLocaleString()} {form.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Откладываете</p>
                    <p className="text-sm font-semibold text-emerald-400">{parseFloat(form.monthly_savings_target || "0").toLocaleString()} {form.currency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Доступно</p>
                    <p className={`text-sm font-semibold ${monthlySavable >= 0 ? "text-amber-400" : "text-rose-400"}`}>
                      {monthlySavable.toLocaleString()} {form.currency}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 w-full justify-center py-3">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle size={16} />
                Сохранено!
              </>
            ) : (
              <>
                <Save size={16} />
                Сохранить настройки
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
