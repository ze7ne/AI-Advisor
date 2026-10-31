import {
  UtensilsCrossed, Car, Home, Film, ShoppingBag, HeartPulse,
  BookOpen, Smartphone, Plane, Package, Laptop, GraduationCap,
  Heart, Sun, Dumbbell, Music, Anchor, type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  "Еда и напитки": UtensilsCrossed,
  "Транспорт": Car,
  "Жильё": Home,
  "Развлечения": Film,
  "Одежда": ShoppingBag,
  "Здоровье": HeartPulse,
  "Образование": BookOpen,
  "Связь": Smartphone,
  "Путешествия": Plane,
  "Прочее": Package,
};

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON_MAP[category] || Package;
}

export const GOAL_ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  car: Car,
  plane: Plane,
  laptop: Laptop,
  smartphone: Smartphone,
  graduation: GraduationCap,
  heart: Heart,
  sun: Sun,
  dumbbell: Dumbbell,
  music: Music,
  anchor: Anchor,
  package: Package,
};

export const GOAL_ICON_LABELS: Record<string, string> = {
  home: "Дом",
  car: "Машина",
  plane: "Путешествие",
  laptop: "Ноутбук",
  smartphone: "Телефон",
  graduation: "Образование",
  heart: "Здоровье",
  sun: "Отдых",
  dumbbell: "Фитнес",
  music: "Музыка",
  anchor: "Яхта",
  package: "Прочее",
};

export const GOAL_ICON_KEYS = Object.keys(GOAL_ICON_MAP);

export function getGoalIcon(key: string): LucideIcon {
  return GOAL_ICON_MAP[key] || Home;
}
