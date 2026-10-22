"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, Calendar, TrendingDown } from "lucide-react";
import { Modal } from "./modal";
import { getSafeToSpend, getRecurringItems, getHomeMetrics } from "@/lib/supabase/database";

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsSheet({ isOpen, onClose }: NotificationsSheetProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    
    const pushEnabled = localStorage.getItem("acuity:push_notifications") !== "0";
    const budgetAlerts = localStorage.getItem("acuity:budget_alerts") !== "0";
    const billReminders = localStorage.getItem("acuity:bill_reminders") !== "0";

    if (!pushEnabled) {
      setNotifications([{
        id: "disabled",
        type: "info",
        title: "Notifications are off",
        body: "Enable push notifications in Settings to receive alerts.",
        time: "",
      }]);
      setLoading(false);
      return;
    }

    async function loadNotifications() {
      setLoading(true);
      const list: any[] = [];

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
              body: `${i.kind === "bill" ? "Bill" : "Income"} of ₦${(i.amount_minor / 100).toLocaleString()}.`,
              time: "Upcoming",
            });
          });
        } catch (e) {}
      }

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
  }, [isOpen]);

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
              className="flex items-start gap-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--line)] p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DE3121]/10 text-[#DE3121]">
                {n.type === "warning" ? <AlertTriangle size={16} /> :
                 n.type === "alert" ? <Bell size={16} /> :
                 n.type === "reminder" ? <Calendar size={16} /> :
                 <TrendingDown size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--text-1)]">{n.title}</p>
                <p className="text-[12px] text-[var(--text-3)] mt-0.5">{n.body}</p>
                {n.time && <p className="text-[10px] text-[var(--text-3)] mt-1">{n.time}</p>}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Modal>
  );
}