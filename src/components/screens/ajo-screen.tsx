"use client";

import { useEffect, useState } from "react";
import { ScreenHeader, IconButton } from "@/components/ui/screen-header";
import { Plus, Trash2 } from "lucide-react";
import { getAjoGroups, addAjoGroup, recordAjoPayment, deleteAjoGroup } from "@/lib/supabase/database";
import { useCurrency } from "@/lib/currency";
import { Modal } from "@/components/ui/modal";
import { Field, SelectField, Button } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import type { AjoGroup } from "@/lib/types";

export function AjoScreen({ onBack }: { onBack: () => void }) {
  const [groups, setGroups] = useState<AjoGroup[]>([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState(""); const [amt, setAmt] = useState(""); const [freq, setFreq] = useState<"weekly" | "monthly">("monthly");
  const [members, setMembers] = useState("10"); const [pos, setPos] = useState("1");
  const { fmt } = useCurrency();
  const toast = useToast();

  const load = async () => setGroups(await getAjoGroups());
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name || !amt) return;
    try { await addAjoGroup({ name, contribution: parseFloat(amt), frequency: freq, members: parseInt(members), position: parseInt(pos) }); toast("Created"); setModal(false); setName(""); setAmt(""); load(); }
    catch { toast("Could not create", "err"); }
  };

  return (
    <div className="min-h-[100dvh] pb-32">
      <ScreenHeader title="Ajo Tracker" onBack={onBack} right={<IconButton label="Add" onClick={() => setModal(true)}><Plus size={18} /></IconButton>} />
      <div className="px-4 pt-6 space-y-4">
        {groups.map((g) => {
          const payout = g.contribution_minor * g.members;
          const targetPayoutDate = new Date(Date.now() + (g.my_position - 1) * (g.frequency === "weekly" ? 7 : 30) * 86400000);
          return (
            <div key={g.id} className="rounded-3xl bg-[var(--surface-2)] border border-[var(--line)] p-5">
              <div className="flex justify-between items-start mb-3">
                <div><p className="text-[16px] font-bold">{g.name}</p><p className="text-[12px] text-[var(--text-2)]">{g.members} members Â· {g.frequency}</p></div>
                <button onClick={async () => { if (confirm("Delete group?")) { await deleteAjoGroup(g.id); load(); } }} className="text-[var(--danger)]"><Trash2 size={16} /></button>
              </div>
              <div className="flex justify-between text-[13px] mb-3">
                <div><p className="text-[var(--text-3)]">Contribution</p><p className="font-semibold tabular">{fmt(g.contribution_minor / 100)}</p></div>
                <div className="text-right"><p className="text-[var(--text-3)]">My payout</p><p className="font-semibold tabular text-[var(--gain)]">{fmt(payout / 100)}</p></div>
              </div>
              <div className="flex justify-between text-[13px]">
                <div><p className="text-[var(--text-3)]">Turn #{g.my_position}</p><p className="font-semibold">{targetPayoutDate.toLocaleDateString("en-NG", { month: "short", year: "numeric" })}</p></div>
                <button onClick={async () => { await recordAjoPayment(g); toast("Payment recorded"); load(); }} className="text-[var(--brand)] text-[13px] font-semibold">+ Record payment</button>
              </div>
            </div>
          );
        })}
        {groups.length === 0 && <p className="text-center text-[14px] text-[var(--text-3)] py-16">No Ajo groups yet. Tap + to create one.</p>}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Ajo Group">
        <div className="space-y-3">
          <Field label="Group name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Contribution (â¦)" type="number" value={amt} onChange={(e) => setAmt(e.target.value)} />
          <SelectField label="Frequency" value={freq} onChange={(e) => setFreq(e.target.value as "weekly" | "monthly")}>
            <option value="weekly">Weekly</option><option value="monthly">Monthly</option>
          </SelectField>
          <Field label="Number of members" type="number" value={members} onChange={(e) => setMembers(e.target.value)} />
          <Field label="My position (1 = first)" type="number" value={pos} onChange={(e) => setPos(e.target.value)} />
          <Button onClick={add}>Create</Button>
        </div>
      </Modal>
    </div>
  );
}