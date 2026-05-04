"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { NavItem } from "@/lib/types";

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function SiteHeader({
  brand,
  items,
  activeId,
}: {
  brand: string;
  items: readonly NavItem[];
  activeId?: string | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const sectionItems = useMemo(
    () => items.filter((item) => Boolean(item.id)),
    [items],
  );

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function renderNavItem(item: NavItem, mode: "desktop" | "mobile") {
    const isActive = Boolean(item.id && activeId === item.id);
    const common =
      mode === "desktop"
        ? [
            "rounded-full px-3 py-2 text-sm transition",
            "text-muted hover:text-foreground",
            isActive ? "bg-[rgb(var(--foreground)/0.06)] text-foreground" : "",
          ].join(" ")
        : [
            "flex items-center justify-between rounded-xl px-3 py-3 text-sm transition",
            "text-muted hover:bg-[rgb(var(--foreground)/0.06)] hover:text-foreground",
            isActive ? "bg-[rgb(var(--foreground)/0.06)] text-foreground" : "",
          ].join(" ");

    if (isHttpUrl(item.href)) {
      return (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={common}
          onClick={() => setMobileOpen(false)}
        >
          <span>{item.label}</span>
          {mode === "mobile" ? <span className="text-muted/70">-&gt;</span> : null}
        </a>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={common}
        aria-current={isActive ? "page" : undefined}
        onClick={() => setMobileOpen(false)}
      >
        <span>{item.label}</span>
        {mode === "mobile" ? <span className="text-muted/70">-&gt;</span> : null}
      </Link>
    );
  }

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full",
        scrolled
          ? "bg-[rgb(var(--background)/0.6)] backdrop-blur-xl"
          : "bg-[rgb(var(--background)/0.15)] backdrop-blur-md",
      ].join(" ")}
    >
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href={sectionItems[0]?.href ?? "#"}
          className="min-w-0 truncate justify-self-start text-sm font-semibold tracking-tight text-foreground/90 hover:text-foreground"
          aria-label="Home"
        >
          {brand}
        </Link>

        <nav className="hidden items-center justify-self-center md:flex" aria-label="Sections">
          <div className="glass flex items-center gap-1 rounded-full p-1">
            {items.map((item) => renderNavItem(item, "desktop"))}
          </div>
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <button
            type="button"
            className={[
              "glass inline-flex h-10 w-10 items-center justify-center rounded-full transition md:hidden",
              "hover:bg-[rgb(var(--foreground)/0.06)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            ].join(" ")}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={[
          "md:hidden",
          mobileOpen ? "block" : "hidden",
          "border-t border-[rgb(var(--border)/0.10)]",
        ].join(" ")}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="grid gap-1" aria-label="Sections">
            {items.map((item) => renderNavItem(item, "mobile"))}
          </nav>
        </div>
      </div>
    </header>
  );
}

