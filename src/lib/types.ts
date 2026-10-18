export interface Account {
  id: string;
  workspace_id: string;
  name: string;
  institution: string;
  type: "checking" | "savings" | "dom" | "wallet";
  balance_minor: number;
  current_minor?: number;
  currency?: string;
  created_at?: string;
}

export interface Txn {
  id: string;
  amount_minor: number;
  direction: "debit" | "credit";
  description_clean: string | null;
  description_raw: string | null;
  category_name: string | null;
  date: string;
  parent_id?: string | null;
  account_id: string;
  account?: { name: string; institution: string } | null;
}

export interface Asset {
  id: string;
  name: string;
  type: "asset" | "liability";
  value_minor: number;
}

export interface Bill {
  id: string;
  name: string;
  amount_minor: number;
  due_day: number;
  last_paid_at: string | null;
}

export interface Fund {
  id: string;
  name: string;
  target_minor: number;
  saved_minor: number;
  target_date: string | null;
}

export interface AjoGroup {
  id: string;
  name: string;
  contribution_minor: number;
  frequency: "weekly" | "monthly";
  members: number;
  my_position: number;
  paid_cycles: number;
}

export interface HomeMetrics {
  net_worth_minor: number;
  total_spent_minor: number;
  total_income_minor: number;
  budget_limit_minor: number;
  uncategorized_count: number;
}