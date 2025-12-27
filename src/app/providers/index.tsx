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
  signOut: async () => {},
});

function inferRoleFromEmail(email?: string | null): Role | null {
  // placeholder: depois você liga com tabela profiles/roles no Supabase
  if (!email) return null;
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

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const user = data.session?.user ?? null;
      setState({
        user,
        role: inferRoleFromEmail(user?.email),
        loading: false,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setState({
        user,
        role: inferRoleFromEmail(user?.email),
        loading: false,
      });
    });

    return () => {
      active = false;
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
