import React, { createContext, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../components/lib/supabase/client";
import { FavoritesProvider } from "../favorites/FavoritesProvider";

type Role = "imobiliaria" | "corretor" | "usuario";

type AuthState = {
  user: User | null;
  role: Role | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => { },
});

// Helper para buscar role do banco
async function fetchUserRole(user: User | null): Promise<Role | null> {
  if (!user) return null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (data?.role) return data.role as Role;
  } catch (error) {
    console.warn("Error fetching user role:", error);
  }

  // Fallback para lógica antiga (retrocompatibilidade)
  const email = user.email || "";
  if (email.includes("+imob")) return "imobiliaria";
  if (email.includes("+cor")) return "corretor";

  return "usuario";
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;

    const stopLoading = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const initSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user ?? null;
        const role = await fetchUserRole(user);

        if (active) {
          setState({ user, role, loading: false });
        }
        stopLoading();
      } catch (error) {
        console.error("Erro na inicialização da sessão:", error);
        if (active) {
          setState({ user: null, role: null, loading: false });
        }
        stopLoading();
      }
    };

    timeoutId = window.setTimeout(() => {
      if (active) {
        console.warn("Timeout ao inicializar sessão de autenticação");
        setState({ user: null, role: null, loading: false });
      }
    }, 8000);

    initSession();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') return; // Ignore token refreshes, user/role state remains valid

      try {
        const user = session?.user ?? null;
        const role = await fetchUserRole(user);

        if (active) {
          setState({ user, role, loading: false });
        }
      } catch (error) {
        console.error("Erro na mudança de estado da autenticação:", error);
        if (active) {
          setState({ user: null, role: null, loading: false });
        }
      }
    });

    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [state]
  );

  return (
    <FavoritesProvider>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </FavoritesProvider>
  );
}
