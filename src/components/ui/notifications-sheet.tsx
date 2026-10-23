"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, Calendar, TrendingDown, FileText, CheckCircle2 } from "lucide-react";
import { Modal } from "./modal";
import { 
  getSafeToSpend, getRecurringItems, getHomeMetrics, getTransactionsSince,
  getFamilySupport, createTransaction, getAccounts 
} from "@/lib/supabase/database";
import { useCurrency } from "@/lib/currency";
import { useToast } from "./toast";

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

export function NotificationsSheet({ isOpen, onClose, onDataChanged }: NotificationsSheetProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { fmt } = useCurrency();
  const toast = useToast();

  const confirmDueItem = async (item: any) => {
    try {
      const accounts = await getAccounts();
      if (accounts.length === 0) {
        toast("Please add an account first", "err");
        return;
      }
      const accountId = accounts[0].id;

      await createTransaction({
        account_id: accountId,
        amount: item.amount,
        direction: item.direction,
        description: item.name,
        category: item.category,
        date: new Date().toISOString(),
        status: "posted"
      });

      toast("Transaction logged successfully");
      setNotifications(prev => prev.filter(n => n.id !== item.id));
      onDataChanged();
    } catch (e: any) {
      toast(e.message || "Failed to log transaction", "err");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    
    const pushEnabled = localStorage.getItem("acuity:push_notifications") !== "0";
    const budgetAlerts = localStorage.getItem("acuity:budget_alerts") !== "0";
    const billReminders = localStorage.getItem("acuity:bill_reminders") !== "0";
    const weeklySummary = localStorage.getItem("acuity:weekly_summary") !== "0";
    const lastSummaryViewed = Number(localStorage.getItem("acuity:last_summary_viewed") || "0");

    if (!pushEnabled) {
      setNotifications([{ id: "disabled", type: "info", title: "Notifications are off", body: "Enable push notifications in Settings to receive alerts.", time: "" }]);
      setLoading(false);
      return;
    }

    async function loadNotifications() {
      setLoading(true);
      const list: any[] = [];

      // 1. DUE BILLS & INCOME (The Actionable Engine)
      try {
        const today = new Date().getDate();
        const items = await getRecurringItems();
        const txs = await getTransactionsSince(new Date(new Date().setHours(0,0,0,0)).toISOString());

        items.forEach(item => {
          if (item.day === today) {
            // Check if already logged
            const alreadyLogged = txs.some(t => 
              (t.description_clean?.includes(item.name) || t.description_raw?.includes(item.name)) &&
              Math.abs((t.amount_minor / 100) - (item.amount_minor / 100)) < 1
            );

            if (!alreadyLogged) {
              list.push({
                id: `rec-${item.id}`,
                type: "action",
                name: item.name,
                amount: item.amount_minor / 100,
                direction: item.kind === "income" ? "credit" : "debit",
                category: item.kind === "income" ? "Income" : "Bills & Utilities",
                title: `${item.name} is due today`,
                body: item.kind === "income" ? `Did you receive ${fmt(item.amount_minor / 100)}?` : `Did you pay ${fmt(item.amount_minor / 100)}?`,
                time: "Today",
              });
            }
          }
        });
      } catch (e) { console.error(e); }

      // 2. DUE FAMILY SUPPORT
      try {
        const today = new Date().getDate();
        const fam = await getFamilySupport();
        const txs = await getTransactionsSince(new Date(new Date().setHours(0,0,0,0)).toISOString());
        
        try {
          const parsed = JSON.parse(fam.label);
          if (Array.isArray(parsed)) {
            parsed.forEach((f: any, idx: number) => {
              if (f.day === today) {
                const alreadyLogged = txs.some(t => t.category_name === "Family Support" && Math.abs((t.amount_minor / 100) - f.amount) < 1);
                if (!alreadyLogged) {
                  list.push({
                    id: `fam-${idx}`,
                    type: "action",
                    name: f.name,
                    amount: f.amount,
                    direction: "debit",
                    category: "Family Support",
                    title: `Support for ${f.name} due today`,
                    body: `Did you send ${fmt(f.amount)}?`,
                    time: "Today",
                  });
                }
              }
            });
          }
        } catch {}
      } catch (e) { console.error(e); }

      // 3. UNCATEGORIZED
      try {
        const metrics = await getHomeMetrics();
        if (metrics.uncategorized_count > 0) {
          list.push({
            id: "uncategorized",
            type: "warning",
            title: `${metrics.uncategorized_count} transactions need review`,
            body: "Tap to categorize them.",
            time: "Just now",
          });
        }

        if (budgetAlerts) {
          const budgetLimit = metrics.budget_limit_minor / 100;
          const spent = metrics.total_spent_minor / 100;
          if (budgetLimit > 0) {
            const pct = (spent / budgetLimit) * 100;
            if (pct >= 90) {
              list.push({
                id: "budget-alert",
                type: "alert",
                title: "Budget almost used up",
                body: `You've used ${Math.round(pct)}% of your monthly budget.`,
                time: "Today",
              });
            }
          }
        }
      } catch (e) {}

      // 4. BILL REMINDERS (Upcoming)
      if (billReminders) {
        try {
          const items = await getRecurringItems();
          const today = new Date().getDate();
          items.filter(i => {
            const daysUntil = i.day - today;
            return daysUntil > 0 && daysUntil <= 3;
          }).forEach(i => {
            list.push({
              id: `bill-${i.id}`,
              type: "reminder",
              title: `${i.name} due in ${i.day - today} days`,
              body: `${i.kind === "bill" ? "Bill" : "Income"} of ${fmt(i.amount_minor / 100)}.`,
              time: "Upcoming",
            });
          });
        } catch (e) {}
      }

      // 5. PAYDAY SOON
      try {
        const sts = await getSafeToSpend();
        if (sts.has_income && sts.days_until_next_income <= 2) {
          list.push({
            id: "payday-soon",
            type: "info",
            title: "Payday is approaching",
            body: `${sts.days_until_next_income} days until your next income.`,
            time: "Info",
          });
        }
      } catch (e) {}

      if (list.length === 0) {
        list.push({
          id: "empty",
          type: "info",
          title: "You're all caught up",
          body: "No new notifications.",
          time: "",
        });
      }

      setNotifications(list);
      setLoading(false);
    }

    loadNotifications();
  }, [isOpen, fmt]);

  return (
    <Modal open={isOpen} onClose={onClose} title="Notifications">
      <div className="space-y-3 pb-6">
        {loading ? (
          <p className="text-center py-6 text-[13px] text-[var(--text-3)]">Loading...</p>
        ) : (
          notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DE3121]/10 text-[#DE3121]">
                  {n.type === "warning" ? <AlertTriangle size={16} /> :
                   n.type === "alert" ? <Bell size={16} /> :
                   n.type === "reminder" ? <Calendar size={16} /> :
                   n.type === "summary" ? <FileText size={16} /> :
                   n.type === "action" ? <CheckCircle2 size={16} /> :
                   <TrendingDown size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--text-1)]">{n.title}</p>
                  <p className="text-[12px] text-[var(--text-3)] mt-0.5">{n.body}</p>
                  {n.time && <p className="text-[10px] text-[var(--text-3)] mt-1">{n.time}</p>}
                </div>
              </div>

              {n.type === "action" && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => confirmDueItem(n)} className="flex-1 rounded-lg bg-[var(--brand)] py-2 text-[12px] font-bold text-white active:scale-95 transition-transform">
                    Yes, log it
                  </button>
                  <button onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} className="rounded-lg bg-[var(--fill-2)] px-3 py-2 text-[12px] font-bold text-[var(--text-1)] active:scale-95 transition-transform">
                    Dismiss
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </Modal>
  );
}