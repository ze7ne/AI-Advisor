export function formatCurrency(amount: number, currency = "KZT"): string {
  if (currency === "KZT") {
    return new Intl.NumberFormat("ru-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function monthsUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const PRIORITY_COLORS: Record<string, string> = {
  high: "text-rose-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};

export const PRIORITY_LABELS: Record<string, string> = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
};

export const CATEGORY_COLORS: Record<string, string> = {
  "Еда и напитки": "#6366f1",
  "Транспорт": "#10b981",
  "Жильё": "#f59e0b",
  "Развлечения": "#ec4899",
  "Одежда": "#8b5cf6",
  "Здоровье": "#ef4444",
  "Образование": "#06b6d4",
  "Связь": "#84cc16",
  "Путешествия": "#f97316",
  "Прочее": "#6b7280",
};
