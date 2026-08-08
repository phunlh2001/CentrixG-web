import { EventItem } from "@/shared";
import { Newspaper, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import MainLayout from "../components/MainLayout";
import NeonBadge from "../components/neon/NeonBadge";
import SectionHeader from "../components/neon/SectionHeader";
import EventCard from "../components/ui/EventCard";

export default function BlogPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const blogPosts: EventItem[] = [
    {
      id: "blog-1",
      category: t("desktop.blogPage.categories.guide", { defaultValue: "Guide" }),
      date: "28/07/2026",
      readingTime: "4 min read",
      title: t("desktop.blogPage.items.blog1.title", {
        defaultValue: "Preparing Your CentrixG Library for Major 2026 Release Weeks",
      }),
      description: t("desktop.blogPage.items.blog1.description", {
        defaultValue:
          "Practical checklist for accounts, pre-downloads, storage optimization, and setup notes prior to official launch day.",
      }),
      imageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg?t=1760601605",
      badge: "GUIDE",
    },
    {
      id: "blog-2",
      category: t("desktop.blogPage.categories.updates", { defaultValue: "Updates" }),
      date: "20/07/2026",
      readingTime: "3 min read",
      title: t("desktop.blogPage.items.blog2.title", {
        defaultValue: "CentrixG Desktop App v1.2 Release: Auto-Sync & Instant Key Activation",
      }),
      description: t("desktop.blogPage.items.blog2.description", {
        defaultValue:
          "Explore the latest performance upgrades, automated library syncing, and one-click key activation in our official desktop launcher.",
      }),
      imageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/ss_86c4b7462bba219a0d0b89931a35812b9f188976.1920x1080.jpg?t=1760601605",
      badge: "NEW RELEASE",
    },
    {
      id: "blog-3",
      category: t("desktop.blogPage.categories.news", { defaultValue: "News" }),
      date: "12/07/2026",
      readingTime: "5 min read",
      title: t("desktop.blogPage.items.blog3.title", {
        defaultValue: "Top AAA Game Releases Expected in Q3 2026 on CentrixG Store",
      }),
      description: t("desktop.blogPage.items.blog3.description", {
        defaultValue:
          "A comprehensive roundup of upcoming blockbuster titles, pre-order bonuses, and exclusive activation discounts for members.",
      }),
      imageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
      badge: "HOT NEWS",
    },
    {
      id: "blog-4",
      category: t("desktop.blogPage.categories.tech", { defaultValue: "Tech" }),
      date: "02/07/2026",
      readingTime: "6 min read",
      title: t("desktop.blogPage.items.blog4.title", {
        defaultValue: "Understanding Local Save & Achievement Sync on CentrixG",
      }),
      description: t("desktop.blogPage.items.blog4.description", {
        defaultValue:
          "How our offline data sync engine preserves your game saves locally while ensuring zero risk to your original gaming profiles.",
      }),
      imageUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
      badge: "TECH INSIGHT",
    },
  ];

  const categories = [
    { id: "all", label: t("desktop.blogPage.filterAll", { defaultValue: "All Articles" }) },
    { id: "news", label: t("desktop.blogPage.filterNews", { defaultValue: "Product News" }) },
    { id: "updates", label: t("desktop.blogPage.filterUpdates", { defaultValue: "App Updates" }) },
    { id: "guide", label: t("desktop.blogPage.filterGuide", { defaultValue: "Gaming Guides" }) },
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? blogPosts
      : blogPosts.filter(
          (post) =>
            post.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            (selectedCategory === "news" && post.badge?.includes("NEWS")) ||
            (selectedCategory === "updates" && post.badge?.includes("RELEASE")),
        );

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 animate-fade-in-up">
        {/* Page Header */}
        <section
          className="rounded-2xl p-6 md:p-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #00D4FF0D 0%, #7B2FBE0D 100%)",
            border: "1px solid #00D4FF26",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-80 h-40 pointer-events-none"
            style={{
              background: "radial-gradient(circle, #00D4FF1F, transparent 70%)",
              filter: "blur(32px)",
            }}
          />

          <div className="relative z-10 max-w-3xl">
            <NeonBadge color="cyan" dot className="mb-3">
              <Newspaper size={12} className="mr-1" />
              {t("desktop.blogPage.eyebrow")}
            </NeonBadge>

            <h1
              className="font-black text-3xl md:text-5xl tracking-tight leading-tight mb-3"
              style={{ color: "var(--system-color-mist-lavender)" }}
            >
              {t("desktop.blogPage.title")}
            </h1>

            <p className="text-sm text-text-primary/70 leading-relaxed">
              {t("desktop.blogPage.subtitle")}
            </p>
          </div>
        </section>

        {/* Category Filters & Article Count */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan shadow-[0_0_14px_#00D4FF40]"
                    : "bg-bg-dark/60 border border-text-primary/10 text-text-primary/60 hover:text-text-primary hover:border-text-primary/25"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <NeonBadge color="purple">
              <Sparkles size={11} className="mr-1" />
              {t("desktop.blogPage.articlesCount", { count: filteredPosts.length })}
            </NeonBadge>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <SectionHeader title={t("desktop.blogPage.latestPosts")} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((item) => (
              <EventCard key={item.id} event={item} />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
