"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dolna nawigacja — trzy pozycje w zasięgu kciuka, z marginesem na safe-area iOS.
 * Zgodnie z PLAN.md sekcja 4. Desktop dostaje ten sam bar wyśrodkowany.
 */
const ITEMS = [
  { href: "/today", label: "Dziś", icon: TowerIcon },
  { href: "/museum", label: "Muzeum", icon: GridIcon },
  { href: "/settings", label: "Ustawienia", icon: GearIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="border-border bg-surface/90 sticky bottom-0 z-10 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                  active ? "text-foundation" : "text-muted"
                }`}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TowerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="14" width="14" height="4" rx="1" fill="currentColor" />
      <rect
        x="7"
        y="9"
        width="10"
        height="4"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="9"
        y="4"
        width="6"
        height="4"
        rx="1"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect
        x="13"
        y="4"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="4"
        y="13"
        width="7"
        height="7"
        rx="1.5"
        fill="currentColor"
        opacity="0.6"
      />
      <rect x="13" y="13" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3.2" fill="currentColor" />
      <path
        d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
