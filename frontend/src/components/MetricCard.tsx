import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "indigo" | "emerald" | "amber" | "rose";
}

const accents = {
  indigo: { icon: "bg-indigo-500/10 text-indigo-400", border: "border-indigo-500/20" },
  emerald: { icon: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/20" },
  amber: { icon: "bg-amber-500/10 text-amber-400", border: "border-amber-500/20" },
  rose: { icon: "bg-rose-500/10 text-rose-400", border: "border-rose-500/20" },
};

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, accent = "indigo" }: MetricCardProps) {
  const a = accents[accent];
  return (
    <div className={cn("card p-6 flex flex-col gap-4", `border ${a.border}`)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", a.icon)}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {trend && (
        <div className={cn(
          "text-xs font-medium flex items-center gap-1",
          trend.value >= 0 ? "text-emerald-400" : "text-rose-400"
        )}>
          <span>{trend.value >= 0 ? "+" : ""}{trend.value}%</span>
          <span className="text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
