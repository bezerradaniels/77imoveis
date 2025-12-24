import { useState } from "react";
import { supabase } from "../../components/lib/supabase/client";
import Seo from "../../components/common/Seo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.signInWithPassword({ email, password });
  }

  return (
    <>
      <Seo title="77 Imóveis | Login" />
      <h1 className="text-xl font-bold mb-4">Entrar</h1>

      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          className="w-full rounded-md border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full rounded-md border p-2"
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full rounded-md border p-2 font-medium hover:bg-muted" type="submit">
          Entrar
        </button>
      </form>
    </>
  );
}
