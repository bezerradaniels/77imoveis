'use client';
import { LogOut } from 'lucide-react';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';

export function LogoutButton() {
  return (
    <button
      type="submit"
      onClick={() => trackEvent(ANALYTICS_EVENTS.logout)}
      className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm font-semibold text-text transition hover:bg-primary-soft"
    >
      <LogOut size={18} className="text-primary" />
      Sair
    </button>
  );
}
