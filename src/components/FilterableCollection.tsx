"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { CollectionItem } from "@/lib/types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function formatTag(tag: string): string {
  return tag
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}

function joinText(item: CollectionItem): string {
  const tags = (item.tags ?? []).join(" ");
  return `${item.title} ${item.description ?? ""} ${tags}`.toLowerCase();
}

export function FilterableCollection({
  items,
  pageSize = 9,
  searchPlaceholder = "Search...",
  renderItem,
}: {
  items: readonly CollectionItem[];
  pageSize?: number;
  searchPlaceholder?: string;
  renderItem?: (item: CollectionItem) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [visible, setVisible] = useState(pageSize);

  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const t of new Set(item.tags ?? [])) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([t]) => t);
  }, [items]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return items.filter((item) => {
      if (tag && !(item.tags ?? []).includes(tag)) return false;
      if (!q) return true;
      return joinText(item).includes(q);
    });
  }, [items, query, tag]);

  const visibleItems = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="w-full">
      <div className="grid gap-4">
        <label className="sr-only" htmlFor="collection-search">
          Search
        </label>
        <input
          id="collection-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(pageSize);
          }}
          placeholder={searchPlaceholder}
          className={[
            "glass w-full rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          ].join(" ")}
        />

        {tagOptions.length ? (
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
            <button
              type="button"
              onClick={() => {
                setTag(null);
                setVisible(pageSize);
              }}
              aria-pressed={!tag}
              className={[
                "glass shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition",
                !tag
                  ? "bg-[rgb(var(--foreground)/0.06)] text-foreground"
                  : "text-foreground/85 hover:text-foreground",
              ].join(" ")}
            >
              All
            </button>
            {tagOptions.map((t) => {
              const active = tag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTag(t);
                    setVisible(pageSize);
                  }}
                  aria-pressed={active}
                  className={[
                    "glass shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition",
                    active
                      ? "bg-[rgb(var(--foreground)/0.06)] text-foreground"
                      : "text-foreground/85 hover:text-foreground",
                  ].join(" ")}
                >
                  {formatTag(t)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {visibleItems.length === 0 ? (
        <div className="mt-10 glass rounded-2xl px-5 py-6 text-sm text-muted">
          No results. Try a different search or filter.
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => {
            if (renderItem) return <div key={item.id}>{renderItem(item)}</div>;

            return (
              <article
                key={item.id}
                className="glass group overflow-hidden rounded-3xl transition hover:bg-[rgb(var(--foreground)/0.05)]"
              >
                {item.image ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                ) : null}

                <div className="p-5">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  ) : null}

                  {item.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="glass inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-foreground/80"
                        >
                          {formatTag(t)}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((count) => Math.min(count + pageSize, filtered.length))}
            className={[
              "glass inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm transition",
              "text-foreground/90 hover:text-foreground hover:bg-[rgb(var(--foreground)/0.06)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            ].join(" ")}
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  );
}
