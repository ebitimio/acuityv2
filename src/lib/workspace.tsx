"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clearDataCache } from "@/lib/supabase/database";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at?: string;
}

interface Ctx {
  workspaces: Workspace[];
  active: Workspace | null;
  setActive: (id: string) => void;
  createWorkspace: (name: string) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

const C = createContext<Ctx | null>(null);
const KEY = "acuity:activeWorkspace";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [active, setActiveState] = useState<Workspace | null>(null);
  const supabase = createClient();

  const reload = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true });

    const list = (data ?? []) as Workspace[];
    setWorkspaces(list);

    if (list.length === 0) {
      setActiveState(null);
      return;
    }

    // Try to restore from localStorage
    let storedId: string | null = null;
    try { storedId = localStorage.getItem(KEY); } catch {}
    
    const stored = list.find(w => w.id === storedId);
    if (stored) {
      setActiveState(stored);
      return;
    }

    // Fall back to first workspace
    setActiveState(list[0]);
    try { localStorage.setItem(KEY, list[0].id); } catch {}
  }, [supabase]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setActive = useCallback((id: string) => {
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return;
    setActiveState(ws);
    try { localStorage.setItem(KEY, id); } catch {}
    clearDataCache();
  }, [workspaces]);

  const createWorkspace = useCallback(async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not logged in");

    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name: name.trim(), owner_id: user.id })
      .select()
      .single();

    if (error) throw error;
    const ws = data as Workspace;
    setWorkspaces(prev => [...prev, ws]);
    setActiveState(ws);
    try { localStorage.setItem(KEY, ws.id); } catch {}
    clearDataCache();
    return ws;
  }, [supabase]);

  const deleteWorkspace = useCallback(async (id: string) => {
    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) throw error;

    setWorkspaces(prev => {
      const next = prev.filter(w => w.id !== id);
      if (active?.id === id) {
        if (next.length > 0) {
          setActiveState(next[0]);
          try { localStorage.setItem(KEY, next[0].id); } catch {}
        } else {
          setActiveState(null);
        }
      }
      return next;
    });
    clearDataCache();
  }, [supabase, active?.id]);

  const value = useMemo(() => ({
    workspaces,
    active,
    setActive,
    createWorkspace,
    deleteWorkspace,
    reload,
  }), [workspaces, active, setActive, createWorkspace, deleteWorkspace, reload]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useWorkspace() {
  const v = useContext(C);
  if (!v) throw new Error("useWorkspace must be inside WorkspaceProvider");
  return v;
}