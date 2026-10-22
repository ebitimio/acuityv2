"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at?: string;
}

interface Ctx {
  workspaces: Workspace[];
  active: Workspace | null;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const reload = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setWorkspaces([]);
      setActiveState(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true });

    const list = (data ?? []) as Workspace[];
    setWorkspaces(list);

    if (list.length === 0) {
      setActiveState(null);
      setLoading(false);
      return;
    }

    let storedId: string | null = null;
    try { storedId = localStorage.getItem(KEY); } catch {}
    
    const stored = list.find(w => w.id === storedId);
    if (stored) {
      setActiveState(stored);
    } else {
      setActiveState(list[0]);
      try { localStorage.setItem(KEY, list[0].id); } catch {}
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setActive = useCallback((id: string) => {
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return;
    setActiveState(ws);
    try { localStorage.setItem(KEY, id); } catch {}
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
          try { localStorage.removeItem(KEY); } catch {}
        }
      }
      return next;
    });
  }, [supabase, active?.id]);

  const value = useMemo(() => ({
    workspaces,
    active,
    loading,
    setActive,
    createWorkspace,
    deleteWorkspace,
    reload,
  }), [workspaces, active, loading, setActive, createWorkspace, deleteWorkspace, reload]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useWorkspace() {
  const v = useContext(C);
  if (!v) throw new Error("useWorkspace must be inside WorkspaceProvider");
  return v;
}