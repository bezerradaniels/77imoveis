'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Alterna entre claro e escuro e guarda a escolha. O tema inicial é
// definido por um script no layout (evita "piscar" na carga).
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {}
  };

  return (
    <button onClick={toggle} aria-label="Alternar tema" className="text-muted hover:text-text">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
