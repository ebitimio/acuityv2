import { ShoppingBag, Car, Briefcase, Tv, Fuel, Utensils, Zap, House, User, Heart, ArrowLeftRight, Landmark, CircleHelp, type LucideIcon } from "lucide-react";

export interface Category {
  name: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: Category[] = [
  { name: "Groceries", icon: ShoppingBag, color: "#a3e635" },
  { name: "Food & Dining", icon: Utensils, color: "#ff8a65" },
  { name: "Transport", icon: Car, color: "#7cc8ff" },
  { name: "Fuel", icon: Fuel, color: "#ff6b5e" },
  { name: "Bills & Utilities", icon: Zap, color: "#ffd60a" },
  { name: "Subscriptions", icon: Tv, color: "#ff9f0a" },
  { name: "Household", icon: House, color: "#c9a66b" },
  { name: "Personal", icon: User, color: "#bf8cf2" },
  { name: "Family Support", icon: Heart, color: "#ff7aa2" },
  { name: "Bank Charges", icon: Landmark, color: "#9aa5a0" },
  { name: "Transfers", icon: ArrowLeftRight, color: "#8fb3a3" },
  { name: "Income", icon: Briefcase, color: "#5bdc8c" },
];

const UNCATEGORIZED: Category = { name: "Uncategorized", icon: CircleHelp, color: "#8a948f" };

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);
export const getCategory = (name?: string | null): Category =>
  CATEGORIES.find((c) => c.name === name) ?? UNCATEGORIZED;