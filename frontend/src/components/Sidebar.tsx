"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Target, Sparkles, Settings, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/expenses", label: "Расходы", icon: CreditCard },
  { href: "/goals", label: "Цели", icon: Target },
  { href: "/advisor", label: "ИИ-советник", icon: Sparkles },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">Finance</p>
            <p className="text-xs text-slate-500">Portfolio</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">Powered by</p>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-medium text-slate-300">Gemini AI</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
