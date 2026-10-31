export interface Profile {
  id: number;
  monthly_salary: number;
  current_savings: number;
  monthly_savings_target: number;
  currency: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  amount: number;
  category: string;
  description?: string;
  date: string;
  created_at: string;
}

export interface Goal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  priority: string;
  icon: string;
  progress?: number;
  created_at: string;
  updated_at?: string;
}

export interface DashboardData {
  monthly_salary: number;
  current_savings: number;
  monthly_savings_target: number;
  total_expenses_this_month: number;
  savings_rate: number;
  expenses_by_category: Record<string, number>;
  recent_expenses: Array<{
    id: number;
    amount: number;
    category: string;
    description?: string;
    date: string;
  }>;
  goals: Array<Goal & { progress: number }>;
  monthly_trend: Array<{ month: string; amount: number }>;
  currency: string;
}

export interface AdvisorResponse {
  recommendation: string;
  can_afford: boolean;
  impact_analysis: string;
  timeline_projection: string;
  advice_score: number;
}
