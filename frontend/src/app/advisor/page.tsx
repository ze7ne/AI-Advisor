"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Send } from "lucide-react";
import { api } from "@/lib/api";
import { AdvisorResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

const EXAMPLE_QUESTIONS = [
  "Могу ли я сейчас взять кредит на машину?",
  "Стоит ли купить iPhone за 500 000 тенге прямо сейчас?",
  "Когда смогу накопить на первоначальный взнос для ипотеки?",
  "Можно ли позволить себе отпуск за 200 000 тенге в этом месяце?",
];

export default function AdvisorPage() {
  const [question, setQuestion] = useState("");
  const [purchaseName, setPurchaseName] = useState("");
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [result, setResult] = useState<AdvisorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await api.advisor.analyze({
        question,
        purchase_name: purchaseName || undefined,
        purchase_amount: purchaseAmount ? parseFloat(purchaseAmount) : undefined,
      });
      setResult(res as AdvisorResponse);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (s: number) => {
    if (s >= 7) return "text-emerald-400";
    if (s >= 4) return "text-amber-400";
    return "text-rose-400";
  };

  const scoreLabel = (s: number) => {
    if (s >= 8) return "Отличное время";
    if (s >= 6) return "Можно рассмотреть";
    if (s >= 4) return "Рискованно";
    return "Не рекомендуется";
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <Sparkles size={18} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">ИИ-советник</h1>
        </div>
        <p className="text-slate-400 text-sm">
          Задайте вопрос о финансах — Gemini проанализирует вашу ситуацию и даст персонализированный совет
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">Примеры вопросов</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => setQuestion(q)}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Ваш вопрос</label>
            <textarea
              className="input resize-none h-28"
              placeholder="Спросите у ИИ о вашей финансовой ситуации..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Название покупки (если есть)</label>
              <input
                className="input"
                placeholder="Напр. Toyota Camry"
                value={purchaseName}
                onChange={(e) => setPurchaseName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Стоимость покупки</label>
              <input
                className="input"
                type="number"
                placeholder="0"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 w-full justify-center py-3">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gemini анализирует...
              </>
            ) : (
              <>
                <Send size={16} />
                Получить совет
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="card p-4 border-rose-500/20 flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-rose-400">Ошибка</p>
            <p className="text-sm text-slate-400 mt-0.5">{error}</p>
            {error.includes("key not configured") && (
              <p className="text-xs text-slate-500 mt-2">
                Добавьте GEMINI_API_KEY в файл backend/.env
              </p>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={cn(
            "card p-6 flex items-start gap-4",
            result.can_afford ? "border-emerald-500/20" : "border-rose-500/20"
          )}>
            {result.can_afford ? (
              <CheckCircle size={24} className="text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle size={24} className="text-rose-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <p className={`font-semibold ${result.can_afford ? "text-emerald-400" : "text-rose-400"}`}>
                  {result.can_afford ? "Можно позволить" : "Не рекомендуется"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Оценка:</span>
                  <span className={`text-lg font-bold ${scoreColor(result.advice_score)}`}>
                    {result.advice_score}/10
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-800 ${scoreColor(result.advice_score)}`}>
                    {scoreLabel(result.advice_score)}
                  </span>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{result.recommendation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-300">Влияние на бюджет</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{result.impact_analysis}</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-300">Прогноз по целям</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{result.timeline_projection}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
