"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, getUser, isLoggedIn } from "../lib/api";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState(false);
  const [initial, setInitial]   = useState("?");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoggedIn(isLoggedIn());
    const u = getUser();
    if (u) setInitial((u.name || u.email || "?")[0].toUpperCase());
  }, [pathname]);

  const linkClass = (href) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 ${
      pathname === href
        ? "bg-white/20 text-white"
        : "text-white/80 hover:bg-white/15 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-brand-600 shadow-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link href="/items" className="font-display text-white text-xl tracking-wide">
          🛒 SBD Store
        </Link>

        <div className="flex items-center gap-1">
          {loggedIn ? (
            <>
              <Link href="/items"   className={linkClass("/items")}>Items</Link>
              <Link href="/history" className={linkClass("/history")}>History</Link>
              <div className="flex items-center gap-2 ml-2">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initial}
                </div>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-white/80 hover:text-white hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login"    className={linkClass("/login")}>Login</Link>
              <Link href="/register" className={linkClass("/register")}>Register</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}