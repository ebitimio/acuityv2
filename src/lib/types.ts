export interface Account {
  id: string;
  workspace_id: string;
  name: string;
  institution: string;
  type: "checking" | "savings" | "dom" | "wallet";
  balance_minor: number;       // balance at anchor
  balance_as_of: string;        // ISO date
  include_in_safe_to_spend?: boolean;
  current_minor?: number;       // anchor + posted txns after anchor
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
  source?: "manual" | "recurring" | "alert" | "adjustment";
  status?: "posted" | "pending";
  recurring_id?: string | null;
  notes?: string | null;
  account?: { name: string; institution: string } | null;
}

export interface Asset {
  id: string;
  name: string;
  type: "asset" | "liability";
  value_minor: number;
}

export interface RecurringItem {
  id: string;
  workspace_id: string;
  account_id: string | null;
  name: string;
  kind: "income" | "bill";
  amount_minor: number;
  frequency: "weekly" | "monthly";
  day: number;
  category: string | null;
  auto_post: boolean;
  last_posted_through: string | null;
  active: boolean;
}

export interface Budget {
  id: string;
  account_id: string | null;
  category: string;
  limit_minor: number;
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

export interface StatementBatch {
  id: string;
  account_id: string;
  file_name: string | null;
  period_start: string | null;
  period_end: string | null;
  line_count: number;
  created_at: string;
}

export interface StatementLine {
  id: string;
  batch_id: string;
  account_id: string;
  occurred_on: string;
  amount_minor: number;
  direction: "debit" | "credit";
  narration: string | null;
  bank_ref: string | null;
  category: string | null;
}