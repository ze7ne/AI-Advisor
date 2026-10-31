"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingDown, PiggyBank, Target, ArrowRight, Clock } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { TrendChart, CategoryChart } from "@/components/charts/ExpenseChart";
import { api } from "@/lib/api";
import { DashboardData } from "@/lib/types";
import { formatCurrency, formatDate, daysUntil, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";
import Link from "next/link";
import { getGoalIcon } from "@/lib/icons";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.get().then((d) => {
      setData(d as DashboardData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-slate-400">Не удалось загрузить данные.</p>
        <Link href="/settings" className="btn-primary">Настроить профиль</Link>
      </div>
    );
  }

  const available = data.monthly_salary - data.total_expenses_this_month;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Обзор финансов</h1>
        <p className="text-slate-400 text-sm mt-1">
          {new Date().toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Зарплата"
          value={formatCurrency(data.monthly_salary, data.currency)}
          subtitle="в месяц"
          icon={Wallet}
          accent="indigo"
        />
        <MetricCard
          title="Расходы"
          value={formatCurrency(data.total_expenses_this_month, data.currency)}
          subtitle="за этот месяц"
          icon={TrendingDown}
          accent="rose"
        />
        <MetricCard
          title="Накопления"
          value={formatCurrency(data.current_savings, data.currency)}
          subtitle={`цель: ${formatCurrency(data.monthly_savings_target, data.currency)}/мес`}
          icon={PiggyBank}
          accent="emerald"
        />
        <MetricCard
          title="Доступно"
          value={formatCurrency(available, data.currency)}
          subtitle={`${data.savings_rate}% от дохода`}
          icon={Target}
          accent="amber"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Динамика расходов</h2>
          {data.monthly_trend.length > 0 ? (
            <TrendChart data={data.monthly_trend} currency={data.currency} />
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
              Нет данных для отображения
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">По категориям</h2>
          {Object.keys(data.expenses_by_category).length > 0 ? (
            <CategoryChart data={data.expenses_by_category} currency={data.currency} />
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
              Нет расходов в этом месяце
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Последние расходы</h2>
            <Link href="/expenses" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Все <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_expenses.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-6">Расходов нет</p>
            )}
            {data.recent_expenses.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium">{e.category}</p>
                  <p className="text-xs text-slate-500">{e.description || formatDate(e.date)}</p>
                </div>
                <span className="text-sm font-semibold text-rose-400">
                  -{formatCurrency(e.amount, data.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Финансовые цели</h2>
            <Link href="/goals" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Все <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {data.goals.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-6">Целей нет — создайте первую</p>
            )}
            {data.goals.slice(0, 4).map((g) => {
              const days = daysUntil(g.deadline);
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {(() => { const Icon = getGoalIcon(g.icon); return <Icon size={15} className="text-indigo-400 flex-shrink-0" />; })()}
                      <span className="text-sm text-white font-medium">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={11} />
                      <span>{days > 0 ? `${days} дн.` : "Срок истёк"}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${Math.min(g.progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs font-medium ${PRIORITY_COLORS[g.priority]}`}>
                      {PRIORITY_LABELS[g.priority]}
                    </span>
                    <span className="text-xs text-slate-500">{g.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
