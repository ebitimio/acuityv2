export interface ScreenObserverData {
  metrics?: {
    net_worth_minor?: number;
    total_income_minor?: number;
    total_expenses_minor?: number;
    budget_limit_minor?: number;
    budget_spent_minor?: number;
    unreviewed_count?: number;
    cash_flow_minor?: number;
  } | null;
  safeToSpend?: {
    safe_today_minor?: number;
    safe_this_week_minor?: number;
    days_until_next_income?: number;
    burn_rate_daily_minor?: number;
  } | null;
  accounts?: Array<{
    id: string;
    name: string;
    bank_name?: string | null;
    type?: string | null;
    balance_minor?: number;
  }>;
  transactions?: Array<{
    id: string;
    amount_minor: number;
    direction: "debit" | "credit";
    category_name?: string | null;
    description?: string | null;
    date: string;
  }>;
  categoryRows?: Array<{
    category: string;
    total_minor: number;
  }>;
  formatCurrency?: (major: number) => string;
}

export interface QuickAction {
  label: string;
  prompt: string;
}

export interface ScreenObservation {
  screen: string;
  badge: string;
  chipInMessage: string;
  observations: string[];
  quickActions: QuickAction[];
}

export function getScreenObservation(
  screen: string,
  data: ScreenObserverData = {}
): ScreenObservation {
  // Format minor currency units (kobo/cents) into major units (Naira/Dollars)
  const fmt = (minor: number) => {
    const major = (minor || 0) / 100;
    if (data.formatCurrency) {
      return data.formatCurrency(major);
    }
    return `₦${major.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const accounts = data.accounts || [];
  const transactions = data.transactions || [];
  const categoryRows = data.categoryRows || [];
  const metrics = data.metrics || {};
  const safe = data.safeToSpend || {};

  switch (screen) {
    case "accounts": {
      const count = accounts.length;
      const totalBalance = accounts.reduce((acc, a) => acc + (a.balance_minor || 0), 0);
      const sorted = [...accounts].sort((a, b) => (b.balance_minor || 0) - (a.balance_minor || 0));
      const highest = sorted[0];

      const chipIn = count === 0
        ? "No accounts connected yet. Link Mono or add a wallet to start real-time tracking."
        : highest
        ? `Observing ${count} account${count > 1 ? "s" : ""}. ${highest.name} holds your highest liquidity at ${fmt(highest.balance_minor || 0)}.`
        : `Monitoring ${count} connected liquidity account${count > 1 ? "s" : ""}.`;

      return {
        screen,
        badge: "Observing Accounts",
        chipInMessage: chipIn,
        observations: [
          `Total liquid balance across all accounts: ${fmt(totalBalance)}`,
          highest ? `${highest.name} represents ${totalBalance > 0 ? Math.round(((highest.balance_minor || 0) / totalBalance) * 100) : 0}% of your total cash` : "Synchronizing balances across commercial banks",
          "Real-time ledger feeds continuously check for duplicate transactions",
        ],
        quickActions: [
          { label: "Rebalance liquidity", prompt: "How should I rebalance my funds across my accounts for safety and daily spending?" },
          { label: "Check idle cash", prompt: "Do I have idle cash sitting in low-yield checking accounts that could be working harder?" },
          { label: "Account runway", prompt: "Based on my current account balances and burn rate, what is my cash runway?" },
        ],
      };
    }

    case "budget": {
      const limit = metrics.budget_limit_minor || 0;
      const spent = metrics.budget_spent_minor || 0;
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const remaining = Math.max(0, limit - spent);
      const topCat = categoryRows[0];

      const chipIn = limit === 0
        ? "No budget cap set yet. Setting one ensures accurate Safe-to-Spend runway."
        : pct >= 90
        ? `Attention: You've used ${pct}% of your monthly budget envelope.`
        : pct >= 70
        ? `Budget is pacing at ${pct}% utilized. Safe-to-spend is adjusting accordingly.`
        : `Healthy budget pacing: only ${pct}% used so far with ${fmt(remaining)} left.`;

      return {
        screen,
        badge: "Observing Budget",
        chipInMessage: chipIn,
        observations: [
          limit > 0 ? `Spent ${fmt(spent)} of ${fmt(limit)} envelope (${pct}% utilized)` : "Set a monthly target to unlock pacing automation",
          topCat ? `${topCat.category} is currently your largest spending category` : "Discretionary spend is pacing within target parameters",
          safe.burn_rate_daily_minor ? `Daily burn rate is pacing at ~${fmt(safe.burn_rate_daily_minor)} / day` : "Safe-to-Spend is protecting your fixed commitments",
        ],
        quickActions: [
          { label: "Optimize limits", prompt: "Which budget categories am I overspending on and how can I adjust them?" },
          { label: "Pacing forecast", prompt: "Will I exceed my budget before the month ends at my current burn rate?" },
          { label: "Trim discretionary spend", prompt: "Where are 3 realistic places I can trim discretionary spending this week?" },
        ],
      };
    }

    case "analytics": {
      const income = metrics.total_income_minor || 0;
      const expenses = metrics.total_expenses_minor || 0;
      const netCashFlow = income - expenses;
      const topCat = categoryRows[0];
      const topAmount = topCat ? topCat.total_minor : 0;

      const chipIn = topCat
        ? `Outflow analysis: ${topCat.category} is your highest expense area this cycle.`
        : netCashFlow >= 0
        ? `Positive cash velocity: retaining ${fmt(netCashFlow)} in net cash flow.`
        : `Negative cash velocity: outflows exceed inflows by ${fmt(Math.abs(netCashFlow))}.`;

      return {
        screen,
        badge: "Observing Analytics",
        chipInMessage: chipIn,
        observations: [
          `Net cash flow: ${netCashFlow > 0 ? "+" : ""}${fmt(netCashFlow)} for this tracking period`,
          topCat ? `Largest category outflow: ${topCat.category} (${fmt(topAmount)})` : "Tracking income vs expenditure distribution",
          income > 0 ? `Savings retention rate: ${Math.max(0, Math.round(((income - expenses) / income) * 100))}% of inbound cash` : "Tracking inflow velocity",
        ],
        quickActions: [
          { label: "Deep dive spending", prompt: "Break down where my money is going this month and highlight any anomalies." },
          { label: "Income vs Expense", prompt: "Evaluate my income vs expense ratio and compare it to standard healthy benchmarks." },
          { label: "Detect spending leaks", prompt: "Identify any recurring micro-transactions or subtle spending leaks in my analytics." },
        ],
      };
    }

    case "transactions": {
      const count = transactions.length;
      const debits = transactions.filter((t) => t.direction === "debit");
      const credits = transactions.filter((t) => t.direction === "credit");
      const totalDebits = debits.reduce((acc, t) => acc + t.amount_minor, 0);

      const chipIn = count > 0
        ? `Auditing ${count} transactions (${debits.length} debits totaling ${fmt(totalDebits)}).`
        : "Viewing your transaction ledger. Waiting for incoming records.";

      return {
        screen,
        badge: "Observing Transactions",
        chipInMessage: chipIn,
        observations: [
          `${count} transaction records visible in current ledger view`,
          `${debits.length} outflows (${fmt(totalDebits)}) vs ${credits.length} inflows recorded`,
          "Checking merchant descriptions against recurring charge patterns",
        ],
        quickActions: [
          { label: "Flag unusual charges", prompt: "Scan my recent transactions and flag any unusual or duplicate charges." },
          { label: "Audit largest expenses", prompt: "List my top 5 largest debit transactions and check if they were expected." },
          { label: "Categorization check", prompt: "Are all my recent transactions properly categorized or do any need adjustment?" },
        ],
      };
    }

    case "commitments": {
      return {
        screen,
        badge: "Observing Commitments",
        chipInMessage: "Auditing recurring bills, subscriptions, and scheduled obligations.",
        observations: [
          "Fixed subscriptions and obligations are reserved before calculating daily Safe-to-Spend",
          "Automated tracking guards against unexpected card renewals and overdrafts",
          "Upcoming due dates are prioritized against your estimated income day",
        ],
        quickActions: [
          { label: "Audit subscriptions", prompt: "Which subscriptions or recurring commitments can I cancel or pause to save money?" },
          { label: "Upcoming due dates", prompt: "What recurring bills and commitments are due before my next payday?" },
          { label: "Fixed cost ratio", prompt: "What percentage of my fixed income is tied up in non-negotiable commitments?" },
        ],
      };
    }

    case "tax": {
      return {
        screen,
        badge: "Observing Tax & Deductions",
        chipInMessage: "Evaluating deductible expenses and estimated tax liabilities for this period.",
        observations: [
          "Tracking allowable business deductions and statutory reliefs",
          "Monitoring gross revenues against taxable thresholds",
          "Tax schedules formatted for audit preparation and filing exports",
        ],
        quickActions: [
          { label: "Maximize deductions", prompt: "What tax deductions or allowances am I currently eligible for based on my spending?" },
          { label: "Estimate tax owed", prompt: "Estimate my tax liability based on my recorded income and business expenses." },
          { label: "Tax audit prep", prompt: "Generate a clean tax audit preparation summary of deductible expenses." },
        ],
      };
    }

    case "needs-review": {
      const count = metrics.unreviewed_count || 0;
      return {
        screen,
        badge: "Observing Review Queue",
        chipInMessage: count > 0
          ? `You have ${count} transaction${count === 1 ? "" : "s"} waiting for category confirmation.`
          : "All transactions are reviewed and verified. Your ledger is clean!",
        observations: [
          count > 0 ? `${count} items pending merchant categorization` : "Zero unreviewed items in queue",
          "Uncategorized entries blur Safe-to-Spend runway accuracy",
          "Instant smart tagging suggests matching categories for each merchant",
        ],
        quickActions: [
          { label: "Auto-categorize all", prompt: "Analyze and categorize all my unreviewed transactions based on merchant names." },
          { label: "Explain uncertain items", prompt: "Explain why these unreviewed transactions couldn't be auto-categorized." },
          { label: "Impact on Safe-to-Spend", prompt: "How much will resolving these unreviewed transactions alter my Safe-to-Spend?" },
        ],
      };
    }

    case "bank-charge": {
      return {
        screen,
        badge: "Observing Bank Charges",
        chipInMessage: "Auditing SMS fees, transfer levies, and card maintenance charges across your accounts.",
        observations: [
          "Tracking cumulative electronic transfer levies and SMS alert charges",
          "Comparing fee drag across connected commercial banks",
          "Flagging excessive micro-deductions that erode monthly savings",
        ],
        quickActions: [
          { label: "Audit bank fees", prompt: "How much have I spent on bank maintenance fees, SMS alerts, and transfer charges this month?" },
          { label: "Find lowest fee bank", prompt: "Based on my transaction volume, which bank is costing me the most in hidden charges?" },
          { label: "Avoid excess levies", prompt: "How can I structure my transfers and accounts to legally minimize bank charges?" },
        ],
      };
    }

    case "ajo": {
      return {
        screen,
        badge: "Observing Ajo Savings",
        chipInMessage: "Tracking rotational savings pool cycles, payout timelines, and contribution pacing.",
        observations: [
          "Peer contribution schedules verified against incoming cash flow",
          "Expected lump-sum payouts mapped into forward liquidity projections",
          "Contribution obligations protected from discretionary overspending",
        ],
        quickActions: [
          { label: "Payout deployment", prompt: "When I receive my Ajo payout, what is the most optimal way to deploy it?" },
          { label: "Contribution health", prompt: "Are my upcoming Ajo contributions safely covered by my projected cash flow?" },
          { label: "Ajo vs High-Yield", prompt: "Compare the benefits of this Ajo group vs saving in an automated high-yield vault." },
        ],
      };
    }

    default: {
      return {
        screen,
        badge: "Acuity AI Observing",
        chipInMessage: "Observing this screen. Tap me if you need financial insights or calculations.",
        observations: [
          "Acuity AI continuously monitors your financial health",
          "Screen data analyzed in real time with private local encryption",
          "Ask questions or run scenario models anytime",
        ],
        quickActions: [
          { label: "Ask about this page", prompt: "What should I know about the financial numbers on this screen?" },
          { label: "Safe-to-Spend check", prompt: "How does this screen's data affect my daily Safe-to-Spend?" },
          { label: "CFO recommendation", prompt: "What is your top recommendation for me right now?" },
        ],
      };
    }
  }
}
