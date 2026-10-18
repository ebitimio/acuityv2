"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Workspace {
  id: string;
  name: string;
  country?: string | null;
}

interface Ctx {
  workspaces: Workspace[];
  activeId: string | null;
  active: Workspace | null;
  setActive: (id: string) => void;
  refresh: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
}

const C = createContext<Ctx | null>(null);
const KEY = "acuity:activeWorkspace";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("workspaces")
      .select("id,name,country")
      .eq("owner_id", user.id)
      .order("created_at");

    let list: Workspace[] = (data ?? []).map((w: any) => ({ id: w.id, name: w.name, country: w.country ?? null }));

    if (list.length === 0) {
      const { data: created, error } = await supabase
        .from("workspaces")
        .insert({ owner_id: user.id, name: "Personal" })
        .select("id,name,country")
        .single();
      if (error) {
        console.error("Auto-create workspace failed:", error);
      } else if (created) {
        list = [{ id: created.id, name: created.name, country: created.country ?? null }];
      }
    }

    setWorkspaces(list);
    const stored = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    const valid = stored && list.some((w) => w.id === stored) ? stored : list[0]?.id ?? null;
    setActiveId(valid);
    if (valid && typeof window !== "undefined") localStorage.setItem(KEY, valid);
  }, [supabase]);

  useEffect(() => { refresh(); }, [refresh]);

  const setActive = useCallback((id: string) => {
    setActiveId(id);
    try { localStorage.setItem(KEY, id); } catch {}
    import("@/lib/supabase/database").then((m) => m.clearDataCache());
  }, []);

  const createWorkspace = useCallback(async (name: string): Promise<Workspace> => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Workspace name cannot be empty");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const { data, error } = await supabase
      .from("workspaces")
      .insert({ owner_id: user.id, name: trimmed })
      .select("id,name,country")
      .single();

    if (error) {
      console.error("createWorkspace failed:", error);
      throw new Error(error.message || "Could not create workspace");
    }
    if (!data) throw new Error("No data returned from workspace insert");

    const ws: Workspace = { id: data.id, name: data.name, country: data.country ?? null };
    setWorkspaces((p) => [...p, ws]);
    setActive(ws.id);
    return ws;
  }, [supabase, setActive]);

  return (
    <C.Provider value={{ workspaces, activeId, active: workspaces.find((w) => w.id === activeId) ?? null, setActive, refresh, createWorkspace }}>
      {children}
    </C.Provider>
  );
}

export function useWorkspace() {
  const v = useContext(C);
  if (!v) throw new Error("useWorkspace must be inside WorkspaceProvider");
  return v;
}