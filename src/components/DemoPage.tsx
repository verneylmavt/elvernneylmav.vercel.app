"use client";

import { FilterableCollection } from "@/components/FilterableCollection";
import { Section } from "@/components/Section";
import { SiteHeader } from "@/components/SiteHeader";
import { ThreeBackground } from "@/components/ThreeBackground";
import type { CollectionItem, NavItem } from "@/lib/types";
import { useActiveSection } from "@/lib/useActiveSection";

const NAV: NavItem[] = [
  { id: "home", label: "Home", href: "#home" },
  { id: "collection", label: "Collection", href: "#collection" },
  { id: "about", label: "About", href: "#about" },
];

const SECTION_IDS = NAV.map((item) => item.id).filter(
  (id): id is string => Boolean(id),
);

const ITEMS: CollectionItem[] = [
  {
    id: "1",
    title: "Example Item One",
    description: "A generic card that could represent anything.",
    tags: ["demo", "design", "web"],
  },
  {
    id: "2",
    title: "Example Item Two",
    description: "Searchable, filterable, paginated.",
    tags: ["demo", "tooling"],
  },
  {
    id: "3",
    title: "Example Item Three",
    description: "Tags are computed from items.",
    tags: ["content", "demo"],
  },
  {
    id: "4",
    title: "Example Item Four",
    description: "Add images if you want using the `image` field.",
    tags: ["media"],
  },
  {
    id: "5",
    title: "Example Item Five",
    description: "Click chips to filter, type to search, load more to paginate.",
    tags: ["demo", "ux"],
  },
];

export function DemoPage() {
  const activeId = useActiveSection(SECTION_IDS);

  return (
    <div className="relative min-h-screen text-foreground">
      <ThreeBackground />
      <SiteHeader brand="elvernneylmav" items={NAV} activeId={activeId} />

      <main className="relative">
        <Section id="home" title="Intersection Template">
          <div className="max-w-3xl text-muted">
            <p className="text-pretty text-lg leading-relaxed">
              This page demonstrates the shared primitives: sticky header navigation, active
              section tracking, a filterable collection, and a minimal three.js background.
            </p>
          </div>
        </Section>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-px w-full bg-[rgb(var(--border)/0.10)]" />
        </div>

        <Section id="collection" title="Filterable Collection">
          <FilterableCollection items={ITEMS} pageSize={6} searchPlaceholder="Search items..." />
        </Section>

        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="h-px w-full bg-[rgb(var(--border)/0.10)]" />
        </div>

        <Section id="about" title="How To Use">
          <div className="max-w-3xl text-muted">
            <p className="text-pretty text-lg leading-relaxed">
              Replace this demo page with your own sections. Keep the primitives in{" "}
              <code className="text-foreground/90">src/components</code> and tailor{" "}
              <code className="text-foreground/90">globals.css</code> tokens for your design.
            </p>
          </div>
        </Section>
      </main>
    </div>
  );
}
